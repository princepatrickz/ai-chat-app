from pydantic import BaseModel, ConfigDict
from sqlalchemy import Column, String, Uuid, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from uuid import uuid4, UUID
from app.db import Base

class Transaction(Base):
    __tablename__ = "transaction"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
        index=True,
    )

    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        nullable=True,
        index=True
    )

    amount: Mapped[str] = mapped_column(
        String, 
        index=True
    )

    currency: Mapped[str] = mapped_column(
        String, 
        nullable=True
    )
    
    status: Mapped[str] = mapped_column(
        String, 
        nullable=True
    )

    transaction_type: Mapped[str] = mapped_column(
        String, 
        nullable=True
    )

    payment_method: Mapped[str] = mapped_column(
        String, 
        nullable=True
    )

    reference_code: Mapped[str] = mapped_column(
        String, 
        nullable=True
    )

    created_at : Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=lambda: datetime.now(timezone.utc))
    
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
