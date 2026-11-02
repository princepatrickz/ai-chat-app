from app.db import Base
from sqlalchemy import Column, String, Integer, DateTime, Uuid, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from uuid import uuid4, UUID
from pgvector.sqlalchemy import Vector
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.documents import Documents

class DocumentChunk(Base):
    __tablename__ = "document_chunk"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )

    document_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("documents.id"), 
        index=True
    ) 

    document_name: Mapped[str] = mapped_column(
        String, 
        nullable=False
    )

    chunk_index: Mapped[int] = mapped_column(
        Integer, 
        nullable=False,
        default=0
    )
    
    content: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )

    embedding: Mapped[list[float]] = mapped_column(
        Vector(1536)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    #Scalar relationship pointing back to Documents
    document: Mapped["Documents"] = relationship(
        "Documents",
        back_populates="chunks",
    )