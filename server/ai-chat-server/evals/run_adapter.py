# from __future__ import annotations
import asyncio
import time
from typing import Any
from app.openai_services.rag_service import retrieve_context
from app.openai_services.llm_service import generate_ai_response
from app.services.chat_services import build_rag_context, NO_CONTEXT_RESPONSE
from app.db import SessionLocal

async def _run_question(
    question: str,
) -> dict[str, Any]:
    start = time.perf_counter()
    db = SessionLocal()

    try:
        # 1. Retrieve chunks using the hybrid RAG pipeline.
        retrieved_results = await retrieve_context(
            db=db,
            question=question,
            top_k=5,
        )

        # 2. Extract the ORM chunks.
        chunks = [
            result["chunk"]
            for result in retrieved_results
        ]

        # 3. Generate an answer only when context is available.
        if not chunks:
            answer = NO_CONTEXT_RESPONSE
        else:
            context = build_rag_context(retrieved_results)

            answer_parts: list[str] = []

            async for delta in generate_ai_response(
                question=question,
                history=[],
                context=context,
            ):
                answer_parts.append(delta)

            answer = "".join(answer_parts)

        # 4. Return the answer and retrieval evidence.
        return {
            "answer": answer,
            "retrieved_contexts": [
                chunk.content
                for chunk in chunks
            ],
            "retrieved_sources": [
                {
                    "document_name": result["chunk"].document_name,
                    "chunk_id": str(result["chunk"].id),
                    "score": result["rrf_score"],
                }
                for result in retrieved_results
            ],
            "latency_ms": round(
                (time.perf_counter() - start) * 1000,
                2,
            ),
        }

    finally:
        db.close()

def run_question(question: str) -> dict[str, Any]:
    """Synchronous entry point for the evaluation runner."""
    return asyncio.run(_run_question(question))

async def run_question_async(question: str) -> dict:
    return await _run_question(question)