from pathlib import Path
import re
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.documents import Documents
from app.models.document_chunks import DocumentChunk
from app.openai_services.llm_service import create_embedding
import logging
import hashlib
import time
import json
from app.openai_services.cache_service import (
    get_cache,
    set_cache,
    redis_client
)

logger = logging.getLogger(__name__)

RETRIEVAL_CACHE_TTL = 300  # 5 minutes
INDEX_VERSION_KEY = "rag:index_version"
_INDEX_VERSION_CACHE = {"version": "1", "expires_at": 0}

DOCUMENTS_PATH = (
    Path(__file__).resolve().parent.parent
    / "rag_files"
)

# Split text into overlapping chunks.
def split_text(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 200,
) -> list[str]:
  
    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0")

    if overlap < 0:
        raise ValueError("overlap cannot be negative")

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks = []

    start = 0
    step = chunk_size - overlap

    while start < len(text):
        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += step

    return chunks

# Split text into sections based on headings. Headings are defined as lines starting with "## "
def split_by_sections(text: str):
   
    pattern = r"(?m)^##\s+(.+)$"

    matches = list(re.finditer(pattern, text))

    chunks = []

    for index, match in enumerate(matches):
        title = match.group(1).strip()

        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)

        content = text[start:end].strip()

        chunks.append({
            "chunk_index": index,
            "title": title,
            "content": content,
        })

    return chunks

async def vector_search(
    db: Session,
    query: str,
    top_k: int = 10
):
    # Create embedding for the search query
    query_embedding = await create_embedding(query)

    # Calculate cosine distance
    distance = DocumentChunk.embedding.cosine_distance(
        query_embedding
    )

    # Convert cosine distance to similarity
    similarity = (1 - distance).label("similarity")

    # Retrieve the most similar chunks
    results = (
        db.query(
            DocumentChunk,
            similarity
        )
        .join(
            Documents,
            DocumentChunk.document_id == Documents.id
        )
        .filter(
            Documents.is_active.is_(True)
        )
        .order_by(distance)
        .limit(top_k)
        .all()
    )

    return [
        {
            "chunk": chunk,
            "similarity": float(similarity_score)
        }
        for chunk, similarity_score in results
    ]

def keyword_search(
    db: Session,
    query: str,
    top_k: int = 10
):
    
    search_vector = func.to_tsvector(
        "english",
        DocumentChunk.content
    )

    search_query = func.plainto_tsquery(
        "english",
        query
    )

    rank = func.ts_rank(
        search_vector,
        search_query
    ).label("rank")

    results = (
        db.query(
            DocumentChunk,
            rank
        )
        .join(
            Documents,
            DocumentChunk.document_id == Documents.id
        )
        .filter(
            Documents.is_active.is_(True),
            search_vector.op("@@")(search_query)
        )
        .order_by(
            rank.desc()
        )
        .limit(top_k)
        .all()
    )

    return [
        {
            "chunk": chunk,
            "keyword_score": float(score)
        }
        for chunk, score in results
    ]


def reciprocal_rank_fusion(
    vector_results: list,
    keyword_results: list,
    k: int = 60
):
    results = {}

    # Process vector results
    for rank, result in enumerate(vector_results, start=1):

        chunk = result["chunk"]
        chunk_id = chunk.id

        if chunk_id not in results:
            results[chunk_id] = {
                "chunk": chunk,
                "rrf_score": 0.0,
                "vector_score": None,
                "vector_rank": None,
                "keyword_rank": None
            }

        results[chunk_id]["rrf_score"] += 1 / (k + rank)
        results[chunk_id]["vector_score"] = result["similarity"]
        results[chunk_id]["vector_rank"] = rank


    # Process keyword results
    for rank, result in enumerate(keyword_results, start=1):

        chunk = result["chunk"]
        chunk_id = chunk.id

        if chunk_id not in results:
            results[chunk_id] = {
                "chunk": chunk,
                "rrf_score": 0.0,
                "vector_score": None,
                "vector_rank": None,
                "keyword_rank": None
            }

        results[chunk_id]["rrf_score"] += 1 / (k + rank)
        results[chunk_id]["keyword_rank"] = rank

    # Sort by RRF score
    return sorted(
        results.values(),
        key=lambda x: x["rrf_score"],
        reverse=True
    )


async def retrieve_context(
    db: Session,
    question: str,
    top_k: int = 5,
):
    # Fetch knowledge-base version
    index_version = await get_index_version()
    cache_key = None

    # Attempt cache retrieval
    if index_version is not None:
        cache_key = build_retrieval_cache_key(
            question=question,
            top_k=top_k,
            index_version=index_version,
        )

        cached_results = await get_retrieval_cache(cache_key)

        if cached_results is not None:
            return cached_results

    # Run hybrid database retrieval
    vector_results = await vector_search(
        db=db,
        query=question,
        top_k=10,
    )

    keyword_results = keyword_search(
        db=db,
        query=question,
        top_k=10,
    )

    combined_results = reciprocal_rank_fusion(
        vector_results=vector_results,
        keyword_results=keyword_results,
    )

    final_results = combined_results[:top_k]

    # Normalize results into dictionaries
    normalized_results = [
        {
            "chunk": {
                "id": str(item["chunk"].id),
                "document_id": str(item["chunk"].document_id),
                "document_name": item["chunk"].document_name,
                "chunk_index": item["chunk"].chunk_index,
                "content": item["chunk"].content,
            },
            "rrf_score": item["rrf_score"],
            "vector_score": item["vector_score"],
            "vector_rank": item["vector_rank"],
            "keyword_rank": item["keyword_rank"],
        }
        for item in final_results
    ]

    # Store normalized results in Redis
    if cache_key is not None:
        await set_retrieval_cache(
            cache_key,
            normalized_results,
        )

    return normalized_results



async def get_index_version() -> str | None:
    
    now = time.time()

    # Read from local memory if unexpired (0 Redis network overhead)
    if now < _INDEX_VERSION_CACHE["expires_at"]:
        return _INDEX_VERSION_CACHE["version"]

    try:
        version = await redis_client.get(INDEX_VERSION_KEY)
        if version is None:
            await redis_client.set(INDEX_VERSION_KEY, "1", nx=True)
            version = "1"
        else:
            version = version.decode("utf-8") if isinstance(version, bytes) else version

        # Cache locally in RAM for 5 seconds
        _INDEX_VERSION_CACHE["version"] = version
        _INDEX_VERSION_CACHE["expires_at"] = now + 5
        return version
    except Exception:
        logger.warning("Failed to get RAG index version", exc_info=True)
        return None


def build_retrieval_cache_key(
    question: str,
    top_k: int,
    index_version: str,
) -> str:
    normalized_question = " ".join(question.strip().split())

    key_data = {
        "question": normalized_question,
        "top_k": top_k,
        "vector_top_k": 10,
        "keyword_top_k": 10,
        "rrf_k": 60,
        "index_version": index_version,
        "retrieval_version": "hybrid-rrf-v1",
    }

    key_hash = hashlib.sha256(
        json.dumps(
            key_data,
            sort_keys=True,
            ensure_ascii=False,
        ).encode("utf-8")
    ).hexdigest()

    return f"rag:retrieval:{key_hash}"


async def get_retrieval_cache(cache_key: str):
    cached = await get_cache(cache_key)

    if cached is not None:
        logger.info("Retrieval cache HIT")

    return cached


async def set_retrieval_cache(
    cache_key: str,
    results,
) -> None:
    await set_cache(
        cache_key,
        results,
        ttl_seconds=RETRIEVAL_CACHE_TTL,
    )


async def bump_index_version() -> None:
    try:
        await redis_client.incr(INDEX_VERSION_KEY)

        logger.info("RAG retrieval cache invalidated")

    except Exception:
        logger.warning(
            "Could not invalidate retrieval cache by version",
            exc_info=True,
        )