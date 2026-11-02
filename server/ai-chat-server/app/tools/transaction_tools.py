from app.models.user import User
from app.models.transaction import Transaction
from app.models.transaction_history import TransactionHistory
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.transaction import Transaction
from app.models.user import User


ALLOWED_STATUSES = {
    "pending",
    "completed",
    "failed",
    "cancelled",
    "processing",
}


def serialize_transaction(transaction: Transaction) -> dict[str, Any]:
    """
    Return an explicit allowlist of safe fields.
    Never serialize the entire ORM object.
    """

    return {
        "reference": str(transaction.reference_code),
        "amount": str(transaction.amount),
        "currency": str(transaction.currency),
        "status": str(transaction.status),
        "transaction_type": str(transaction.transaction_type),
        "created_at": transaction.created_at.isoformat(),
    }


def get_my_transactions(
    db: Session,
    current_user: User,
    limit: int = 5,
    status: str | None = None,
) -> dict[str, Any]:

    limit = max(1, min(int(limit), 10))

    stmt = (
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .limit(limit)
    )

    if status is not None:
        normalized_status = status.strip().lower()

        if normalized_status not in ALLOWED_STATUSES:
            return {
                "success": False,
                "message": "The requested transaction status is invalid.",
                "transactions": [],
            }

        stmt = stmt.where(Transaction.status == normalized_status)

    transactions = db.execute(stmt).scalars().all()

    return {
        "success": True,
        "count": len(transactions),
        "transactions": [
            serialize_transaction(transaction)
            for transaction in transactions
        ],
    }


def get_my_transaction_status(
    db: Session,
    current_user: User,
    transaction_reference: str,
) -> dict[str, Any]:

    transaction_reference = transaction_reference.strip()

    if not transaction_reference:
        return {
            "success": False,
            "message": "A transaction reference is required.",
        }

    stmt = (
        select(Transaction)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.reference_code == transaction_reference,
        )
        .limit(1)
    )

    transaction = db.execute(stmt).scalar_one_or_none()

    if transaction is None:
        return {
            "success": False,
            "message": (
                "No matching transaction was found "
                "in your accessible records."
            ),
        }

    return {
        "success": True,
        "transaction": serialize_transaction(transaction),
    }
