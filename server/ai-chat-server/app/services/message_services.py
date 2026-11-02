from sqlalchemy.orm import Session

from app.models.conversations import Conversations
from app.models.messages import Messages
from app.schemas.messages_schema import MessageCreate
from app.models.message_retrievals import MessageRetrievals
from app.openai_services.llm_service import generate_conversation_title


async def create_messages(db: Session, data: MessageCreate) -> Messages:
    conversation = db.query(Conversations).filter(Conversations.id == data.conversation_id).first()

    if conversation is None:
        raise ValueError(f"Conversation {data.conversation_id} not found.")

    message_instance = Messages(**data.model_dump())

    db.add(message_instance)

    if not conversation.title and data.role == "user":

        title = await generate_conversation_title(data.content)

        if title:
            conversation.title = title


    db.commit()
    db.refresh(message_instance)

    return message_instance


async def retrieve_messages(db: Session, conversation_id, limit: int = 10) -> list[Messages]:

    messages = (
        db.query(Messages)
        .filter(Messages.conversation_id == conversation_id)
        .order_by(Messages.created_at.desc())
        .limit(limit)
        .all()
    )   

    return list(reversed(messages))


async def save_message_retrievals(db: Session, message_id, retrieved_results: list):
    retrievals = []

    for rank, result in enumerate(retrieved_results,start=1):

        retrieval = MessageRetrievals(
            message_id=message_id,
            chunk_id=result["chunk"].id,
            rank=rank,
            rrf_score=result["rrf_score"],
            vector_score=result.get("vector_score"),
            vector_rank=result.get("vector_rank"),
            keyword_rank=result.get("keyword_rank")
        )

        retrievals.append(retrieval)

    if retrievals:
        db.add_all(retrievals)
        db.commit()

    db.commit()