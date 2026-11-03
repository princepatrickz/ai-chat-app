from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlalchemy.orm import Session
from pathlib import Path
from app.db import get_db
from app.schemas.paginated_schema import PaginatedResponse
from app.services.ai_services import get_documents, ingest_document, get_document_summary, delete_document
from app.auth.auth import get_current_user
from uuid import UUID
from typing import Annotated
from app.auth.auth import require_roles
from app.models.user import User


router = APIRouter(prefix="/rag", tags=["rag"], dependencies=[Depends(get_current_user)])

AdminUser = Annotated[
    User,
    Depends(require_roles("Admin")),
]

DOCUMENTS_PATH = (
    Path(__file__).resolve().parent.parent
    / "rag_files"
)

@router.post("/ingest-document")
async def ingest_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_name = file.filename or ""

    if not file_name or not file_name.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Only .txt files are allowed.")

    content = await file.read()
    content_str = content.decode("utf-8")

    file_size = len(content)

    await ingest_document(db, file_name, content_str, file_size, True)

    return {"message": f"File '{file_name}' ingested successfully."}


@router.get('/documents', response_model=PaginatedResponse)
async def get_all_documents(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100), search_param: str = Query(default=""), db: Session = Depends(get_db)):
    return await get_documents(db, page=page, page_size=page_size, search_param=search_param)


@router.get("/summary")
async def summary(db: Session = Depends(get_db)):
    return await get_document_summary(db)



@router.delete("/delete-document/{document_id}")
async def delete(document_id: UUID,  db: Session = Depends(get_db)):
    return await delete_document(db, document_id)

