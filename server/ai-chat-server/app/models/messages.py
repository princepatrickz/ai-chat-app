from app.db import Base
from sqlalchemy import Column, String, DateTime, Uuid, Text
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from uuid import uuid4, UUID 

class Messages(Base):
    __tablename__ = "messages"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )

    conversation_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String, 
        nullable=False
    )
    
    content: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )
   
    model: Mapped[str] = mapped_column(
            Text, 
            nullable=False
    )
    
    created_at : Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=lambda: datetime.now(timezone.utc))