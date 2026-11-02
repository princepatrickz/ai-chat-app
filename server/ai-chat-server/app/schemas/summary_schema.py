from pydantic import BaseModel, ConfigDict

class Summary(BaseModel):
    total_documents: int
    indexed_document: int
    total_chunks: int
    
    model_config = ConfigDict(
        from_attributes=True
    )


class SummaryResponse(BaseModel):
    total_documents: int
    indexed_document: int
    total_chunks: int
    
    model_config = ConfigDict(
        from_attributes=True
    )