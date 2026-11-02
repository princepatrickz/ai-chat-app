from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, or_
from app.schemas.document_schema import DocumentResponse
from app.schemas.paginated_schema import PaginatedResponse
from app.models.documents import Documents
from app.schemas.summary_schema import SummaryResponse
from app.schemas.document_chunk_schema import DocumentChunkResponse
from app.models.document_chunks import DocumentChunk
from pathlib import Path
from datetime import datetime, timezone
from uuid import uuid4, UUID
from app.openai_services.rag_service import split_by_sections
from app.openai_services.llm_service import create_embedding
from fastapi import HTTPException

DOCUMENTS_PATH = (
    Path(__file__).resolve().parent.parent
    / "rag_files"
)


async def get_document_summary(db: Session):
    chunks_stmt = (
        select(func.count(DocumentChunk.id))
        .join(Documents, 
              DocumentChunk.document_id == Documents.id)
        .where(Documents.is_active.is_(True))
    )

    chunk_count = db.execute(chunks_stmt).scalar_one()

    stmt = (
           select(
                Documents,
                func.count(DocumentChunk.id).label("chunk_count")
            )
            .join(
                Documents,
                Documents.id == DocumentChunk.document_id
            )
            .group_by(Documents.id)
        )
   
    result = db.execute(stmt).all()

    documents = db.query(Documents).all()

    return SummaryResponse(
            total_documents=len(documents),
            indexed_document=len(result),
            total_chunks=chunk_count
        )


async def get_documents(db: Session, page: int=1, page_size: int=10, search_param: str="") -> PaginatedResponse:
    offset = (page - 1) * page_size
    print(search_param)
    # Build the search filter
    filters = []

    search = search_param.strip()

    if search:
        search_pattern = f"%{search}%"

        filters.append(
            or_(
                Documents.filename.ilike(search_pattern),
                Documents.original_filename.ilike(search_pattern),
            )
        )

    # Count only matching documents
    total_stmt = select(
        func.count(Documents.id)
    ).where(*filters)

    total = db.execute(total_stmt).scalar_one()

    # Get matching documents and their chunk counts
    stmt = (
        select(
            Documents,
            func.count(DocumentChunk.id).label("chunk_count"),
        )
        .outerjoin(
            DocumentChunk,
            Documents.id == DocumentChunk.document_id,
        )
        .where(*filters)
        .group_by(Documents.id)
        .order_by(Documents.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )

    results = db.execute(stmt).all()

    documents = [
        DocumentResponse.model_validate({
            **{
                column.name: getattr(document, column.name)
                for column in Documents.__table__.columns
            },
            "chunk_count": chunk_count,
        })
        for document, chunk_count in results
    ]

    return PaginatedResponse(
        items= documents,
        total= total,
        page= page,
        page_size= page_size,
        total_pages= (total + page_size - 1)
    )

async def delete_document(db: Session, document_id: UUID):
    document = db.scalar(
        select(Documents)
        .where(Documents.id == document_id)
    )

    if document is None:
        return False
   
    document_dir = Path(DOCUMENTS_PATH).resolve()
    file_path = (
        document_dir / document.filename
    ).resolve()

    if file_path.parent != document_dir:
        raise HTTPException(
            status_code=404,
            detail="Invalid document path"
        )
    
  
    try:
        db.execute(
            delete(DocumentChunk).where(
                DocumentChunk.document_id == document_id
            )
        )

        db.delete(document)

        db.commit()
    
    except:
        db.rollback()
        raise Exception

    
    try:
        if file_path.is_file():
            file_path.unlink()


    except OSError as exc:
        print('ERROR')
        raise HTTPException(
            status_code=500,
            detail=(
                "Document records were deleted, "
                "but the physical file could not be removed."
            )
        ) from exc  
    print('HAPPY')
    return True


async def ingest_document(
    db: Session,
    file_name: str,
    content: str,
    filesize: int,
    copy_to_directory: bool,
    chunk_size: int = 500,
    overlap: int = 100,
):   
  
    document = await create_document(db, file_name, filesize, copy_to_directory)
    file_path = DOCUMENTS_PATH / document.filename

    # Save the document content to a file in the RAG documents directory
    if copy_to_directory:
        with open(file_path, "w", encoding="utf-8") as file:
            file.write(document.filename)

    chunks = split_by_sections(content)

    for chunk in chunks:
        # Include the topic/title in the text that gets embedded
        chunk_text = f"""
            Topic: {chunk["title"]}

            {chunk["content"]}
            """.strip()

        embedding = await create_embedding(chunk_text)

        document_chunk = DocumentChunk(
            id=uuid4(),
            document_id=document.id,
            document_name=file_name,
            chunk_index=chunk["chunk_index"],
            content=chunk_text,
            embedding=embedding,
        )

        db.add(document_chunk)

    db.commit()

    return document.id


async def ingest_all_documents(db: Session):
    """
    Ingest all .txt files from the RAG documents directory.
    """

    if not DOCUMENTS_PATH.exists():
        raise FileNotFoundError(
            f"RAG documents directory not found: {DOCUMENTS_PATH}"
        )

    document_ids = []
    file_name = None

    for file_path in DOCUMENTS_PATH.glob("*.txt"):
        file_name = file_path.name
        file_size = file_path.stat().st_size

        content = file_path.read_text(
                encoding="utf-8"
            ).strip()

        if not content:
            return None

        document_id = await ingest_document(
            db=db,
            file_name=file_name,
            content=content,
            filesize=file_size,
            copy_to_directory=False
        )

        if document_id:
            document_ids.append(document_id)

    return document_ids


## PRIVATE FUNCTIONS

def _get_unique_filename(folder: Path, original_filename: str, copy_to_directory: bool) -> tuple[str, int, str]:
    path = Path(original_filename)

    stem = path.stem
    extension = path.suffix
    filename = original_filename
    version = 1

    if copy_to_directory:
        while (folder / filename).exists():
            version += 1
            filename = f"{stem} ({version}){extension}"

    return filename, version, extension

async def create_document(db: Session, file_name: str, filesize: int, copy_to_directory: bool) -> Documents:

    document = db.query(Documents).filter(Documents.original_filename == file_name, Documents.is_active == True).first()
    
    filename, version, extension = _get_unique_filename(
        DOCUMENTS_PATH,
        file_name,
        copy_to_directory
    )

    original_filename = file_name
     
    if document:
        document.is_active = False
        document.updated_at = datetime.now(timezone.utc)
        original_filename = document.original_filename

    document_new = Documents(
        original_filename=original_filename,
        filename=filename,
        extension=extension,
        filesize=filesize,
        version=version,
        is_active=True
    )

    db.add(document_new)
    db.commit()
    db.refresh(document_new)

    return document_new