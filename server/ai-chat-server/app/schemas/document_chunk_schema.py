from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class DocumentChunkBase(BaseModel):
    document_id: UUID
    document_name: str
    chunk_index: int
    content: str
    created_at : datetime    

class DocumentChunkCreate(DocumentChunkBase):
    pass

class DocumentChunkResponse(DocumentChunkBase):
    id: UUID
    chunk_count: int = 0
    model_config= ConfigDict(from_attributes=True)
