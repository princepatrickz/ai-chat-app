from pydantic import BaseModel, ConfigDict
from sqlalchemy import Column, String, Uuid, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from uuid import uuid4, UUID
from app.db import Base

class TransactionHistory(Base):
    __tablename__ = "transaction_history"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )
    
    transaction_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )
    
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
    )
    
    status: Mapped[str] = mapped_column(
        String, 
        nullable=True
    )

    amount: Mapped[str] = mapped_column(
        String, 
        nullable=True
    )

    currency: Mapped[str] = mapped_column(
        String, 
        nullable=True
    )

    notes: Mapped[str] = mapped_column(
        String, 
        nullable=True
    )
    
    created_at : Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=lambda: datetime.now(timezone.utc))
