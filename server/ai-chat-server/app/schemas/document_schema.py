from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    original_filename: str
    extension: str
    filesize: int
    version: int
    is_active: bool
    created_at : datetime    
    updated_at : datetime | None = None

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: UUID
    chunk_count: int = 0
    model_config= ConfigDict(from_attributes=True)

