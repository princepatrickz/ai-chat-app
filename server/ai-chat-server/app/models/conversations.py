from app.db import Base
from sqlalchemy import Column, DateTime, String, Uuid, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from uuid import uuid4, UUID

class Conversations(Base):
    __tablename__ = "conversations"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )

    session_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
        index=True
    )
    
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
        index=True
    )
    
    title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        default=None,
    )

    status: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
        default=None,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
    )