from uuid import uuid4

from app.models.document_chunks import DocumentChunk


def test_document_chunks_model_can_be_constructed():
    chunk = DocumentChunk(
        id=uuid4(),
        document_id=uuid4(),
        chunk_index=0,
        content="sample content",
        embedding=[0.1, 0.2, 0.3],
    )

    assert chunk.__tablename__ == "document_chunks"
    assert chunk.content == "sample content"
