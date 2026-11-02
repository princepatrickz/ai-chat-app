from pydantic import BaseModel
from app.schemas.document_schema import DocumentResponse

class PaginatedResponse(BaseModel):
    items: list[DocumentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int