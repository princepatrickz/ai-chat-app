from sqlalchemy.orm import Session
from datetime import datetime, timezone
from uuid import UUID, uuid4
import json
from fastapi import Depends
from app.models.conversations import Conversations
from app.models.messages import Messages
from app.schemas.messages_schema import MessageCreate
from app.schemas.chat_schema import ChatRequest
from app.services.message_services import create_messages, retrieve_messages, save_message_retrievals
from app.openai_services.llm_service import generate_ai_response, rewrite_question
from app.openai_services.rag_service import retrieve_context
from fastapi.responses import StreamingResponse
from app.models.user import User
from app.auth.auth import get_current_user
from collections.abc import Sequence


NO_CONTEXT_RESPONSE = (
    "I don't have enough information in my knowledge base "
    "to answer that accurately."
)


async def start_conversation(db: Session):

    conversation = Conversations(
        id=uuid4(),
        session_id=uuid4(),
        title=None,
        status=True,
        created_at=datetime.now(timezone.utc),
    )

    try:
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    except Exception:
        db.rollback()
        raise



async def process_message(
    db: Session,
    data: ChatRequest,
    current_user: User | None,
):
    # 1. Validate the user message.

    user_text = (data.message or "").strip()

    if not user_text:
        return {
            "conversation_id": data.conversation_id,
            "message": "Please enter a message before sending.",
        }


    # 2. Retrieve previous conversation history.

    message_history = await retrieve_messages(
        db=db,
        conversation_id=data.conversation_id,
        limit=10,
    )

    # 3. Save the user's message.

    user_message = MessageCreate(
        conversation_id=data.conversation_id,
        role="user",
        content=user_text,
    )

    message = await create_messages(
        db=db,
        data=user_message,
    )

    # 4. Rewrite the question for RAG retrieval.

    search_query = await rewrite_question(
        user_message=user_text,
        message_history=message_history,
    )

    # 5. Retrieve relevant knowledge-base chunks.

    retrieved_chunks = await retrieve_context(
        db=db,
        question=search_query,
        top_k=5,
    )

    # Saving an empty retrieval list should be supported by this helper.
    await save_message_retrievals(
        db,
        message.id,
        retrieved_chunks,
    )

    # 6. Build context, including the empty-context case.

    if retrieved_chunks:
        context = build_rag_context(retrieved_chunks)
    else:
        context = ""

    # Do not return NO_CONTEXT_RESPONSE here.
    # The LLM may still be able to answer with an authorized database tool.

    # 7. Stream the response.

    async def generate():
        assistant_message = await save_assistant_message(
            db=db,
            conversation_id=data.conversation_id,
            content="",
        )

        yield f"data: {json.dumps({
            'type': 'start',
            'id': str(assistant_message.id),
            'conversation_id': str(data.conversation_id),
            'created_date': assistant_message.created_at.isoformat(),
        })}\n\n"

        full_response = ""

        try:
            history_data = [
                {
                    "role": message.role,
                    "content": message.content,
                }
                for message in message_history
            ]

            async for chunk in generate_ai_response(
                question=user_text,
                history=history_data,
                context=context,
                current_user=current_user,
                db=db,
            ):
                full_response += chunk

                yield f"data: {json.dumps({
                    'type': 'content',
                    'content': chunk,
                })}\n\n"

            # Save the final content to the same assistant message.

            stored_message = (
                db.query(Messages)
                .filter(Messages.id == assistant_message.id)
                .first()
            )
            
            if stored_message is None:
                raise RuntimeError(
                    "Assistant message disappeared before saving."
                )

            stored_message.content = full_response
            db.commit()

            yield f"data: {json.dumps({
                'type': 'complete',
            })}\n\n"

        except Exception:
            db.rollback()

            # Persist a generic error instead of exposing internal details.
            try:
                stored_message = (
                    db.query(Messages)
                    .filter(Messages.id == assistant_message.id)
                    .first()
                )

                if stored_message is not None:
                    stored_message.content = (
                        "Sorry, I couldn't complete your request. "
                        "Please try again."
                    )
                    db.commit()
            except Exception:
                db.rollback()

            yield f"data: {json.dumps({
                'type': 'error',
                'message': (
                    "Sorry, I couldn't complete your request. "
                    "Please try again."
                ),
            })}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# def build_rag_context(retrieved_chunks: list) -> str:

#     return "\n\n".join(
#         (
#             f"SOURCE DOCUMENT: {item['chunk'].document_name}\n"
#             f"CHUNK INDEX: {item['chunk'].chunk_index}\n\n"
#             f"{item['chunk'].content}"
#         )
#         for item in retrieved_chunks
#     )


def build_rag_context(retrieved_chunks: list) -> str:

    return "\n\n".join(
        (
            f"SOURCE DOCUMENT: {item['chunk']['document_name']}\n"
            f"CHUNK INDEX: {item['chunk']['chunk_index']}\n\n"
            f"{item['chunk']['content']}"
        )
        for item in retrieved_chunks
    )


async def save_assistant_message(db: Session,conversation_id: UUID,content: str) -> Messages:

    assistant_message = MessageCreate(
        conversation_id=conversation_id,
        role="assistant",
        content=content,
        model="your-model"
    )

    message = await create_messages(
        db=db,
        data=assistant_message
    )

    return message




async def get_messages_conversation_id(db: Session,id: UUID):

    return (
        db.query(Messages)
        .filter(Messages.conversation_id == id)
        .order_by(Messages.created_at.asc())
        .all()
    )


async def get_conversation(db: Session, id: UUID):

    return (
        db.query(Conversations)
        .filter(Conversations.id == id)
        .first()
    )