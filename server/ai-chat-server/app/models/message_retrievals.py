from app.db import Base
from sqlalchemy import Column, String, DateTime, Uuid, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from uuid import uuid4, UUID

class MessageRetrievals(Base):
    __tablename__= "message_retrievals"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )

    message_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        index=True
    ) 

    chunk_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=False,
        index=True
    ) 

    rank: Mapped[int] = mapped_column(
        Integer, 
        nullable=False, 
    )

    rrf_score: Mapped[float] = mapped_column(
        Float, 
        nullable=True, 
    )

    vector_score: Mapped[float] = mapped_column(
        Float, 
        nullable=True, 
    )

    vector_rank: Mapped[int] = mapped_column(
        Integer, 
        nullable=True, 
    )

    keyword_rank: Mapped[int] = mapped_column(
        Integer, 
        nullable=True, 
    )

    created_at : Mapped[datetime | None] = mapped_column(
            DateTime(timezone=True),
            nullable=True,
            default=lambda: datetime.now(timezone.utc))
