from app.db import Base
from sqlalchemy import String, Uuid, DateTime, Boolean, Integer, Column, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from uuid import UUID, uuid4
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.document_chunks import DocumentChunk

class Documents(Base):
    __tablename__ = "documents"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )
    
    original_filename: Mapped[str] = mapped_column(
        String, 
        nullable=False
    )

    extension: Mapped[str] = mapped_column(
        String, 
        nullable=True)

    filename: Mapped[str] = mapped_column(
        String, 
        nullable=False
    )

    filesize: Mapped[str] = mapped_column(
        BigInteger, 
        nullable=False
    )

    version: Mapped[int] = mapped_column(
        Integer, 
        nullable=False, 
        default=1
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        nullable=False,
        default=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # # 1-to-Many relationship pointing to DocumentChunk
    chunks: Mapped[list["DocumentChunk"]] = relationship(
        "DocumentChunk",
        back_populates="document",
        cascade="all, delete-orphan",
    )