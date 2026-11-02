from app.models.user import User
from sqlalchemy.orm import Session
from app.tools.transaction_tools import get_my_transactions, get_my_transaction_status
from typing import Any
from openai.types.responses import  ToolParam
from sqlalchemy.orm import Session
from app.models.user import User
from app.tools.transaction_tools import (
    get_my_transactions,
    get_my_transaction_status,
)


GET_MY_TRANSACTIONS_TOOL: ToolParam = {
    "type": "function",
    "name": "get_my_transactions",
    "description": "Get the authenticated user's recent transactions.",
    "parameters": {
        "type": "object",
        "properties": {
            "limit": {
                "type": "integer",
                "description": "Maximum number of transactions to return.",
            },
            "status": {
                "type": ["string", "null"],
                "description": "Optional transaction status filter.",
            },
        },
        "required": ["limit", "status"],
        "additionalProperties": False,
    },
    "strict": True,
}

GET_MY_TRANSACTION_STATUS_TOOL: ToolParam = {
    "type": "function",
    "name": "get_my_transaction_status",
    "description": "Get the status of one of the authenticated user's transactions.",
    "parameters": {
        "type": "object",
        "properties": {
            "transaction_reference": {
                "type": "string",
                "description": "The transaction reference to look up.",
            },
        },
        "required": ["transaction_reference"],
        "additionalProperties": False,
    },
    "strict": True,
}


def get_available_tools(current_user: Any) -> list[ToolParam]:
    if current_user is None:
        return []

    return [
        GET_MY_TRANSACTIONS_TOOL,
        GET_MY_TRANSACTION_STATUS_TOOL,
    ]

def execute_tool(
    name: str,
    arguments: dict[str, Any],
    current_user: User | None,
    db: Session,
) -> dict[str, Any]:
    """
    Execute a tool through a fixed allowlist.

    Never accept current_user or user_id from model arguments.
    """

    if current_user is None:
        raise PermissionError("Authentication is required for this tool.")

    if name == "get_my_transactions":
        return get_my_transactions(
            db=db,
            current_user=current_user,
            limit=arguments["limit"],
            status=arguments["status"],
        )

    if name == "get_my_transaction_status":
        return get_my_transaction_status(
            db=db,
            current_user=current_user,
            transaction_reference=arguments[
                "transaction_reference"
            ],
        )

    raise ValueError(f"Unsupported tool: {name}")
