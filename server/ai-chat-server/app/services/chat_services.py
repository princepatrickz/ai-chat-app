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
from app.openai_services.moderation_service import moderate_content
from openai import APIError
from fastapi import HTTPException

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


# async def process_message(
#     db: Session,
#     data: ChatRequest,
#     current_user: User | None,
# ):
#     # Validate the user message.

#     user_text = (data.message or "").strip()

#     if not user_text:
#         return {
#             "conversation_id": data.conversation_id,
#             "message": "Please enter a message before sending.",
#         }

#     try:
#         moderation_result = await moderate_user_input(user_text)

#     except APIError:
#         raise HTTPException(
#             status_code=503,
#             detail="Content safety verification is temporarily unavailable. Please try again.",
#         )

#     if moderation_result["flagged"]:
#         raise HTTPException(
#             status_code=400,
#             detail="Your message cannot be processed because it violates our content safety guidelines.",
#         )

#     # Retrieve previous conversation history.
#     message_history = await retrieve_messages(
#         db=db,
#         conversation_id=data.conversation_id,
#         limit=10,
#     )

#     # Save the user's message.
#     user_message = MessageCreate(
#         conversation_id=data.conversation_id,
#         role="user",
#         content=user_text,
#     )

#     message = await create_messages(
#         db=db,
#         data=user_message,
#     )

#     # Rewrite the question for RAG retrieval.
#     search_query = await rewrite_question(
#         user_message=user_text,
#         message_history=message_history,
#     )

#     # Retrieve relevant knowledge-base chunks.
#     retrieved_chunks = await retrieve_context(
#         db=db,
#         question=search_query,
#         top_k=5,
#     )

#     await save_message_retrievals(
#         db,
#         message.id,
#         retrieved_chunks,
#     )

#     # Build context, including the empty-context case.

#     if retrieved_chunks:
#         context = _build_rag_context(retrieved_chunks)
#     else:
#         context = ""


#     # Stream the response.
#     async def generate():
#         assistant_message = await _save_assistant_message(
#             db=db,
#             conversation_id=data.conversation_id,
#             content="",
#         )

#         yield f"data: {json.dumps({
#             'type': 'start',
#             'id': str(assistant_message.id),
#             'conversation_id': str(data.conversation_id),
#             'created_date': assistant_message.created_at.isoformat(),
#         })}\n\n"

#         full_response = ""

#         try:
#             history_data = [
#                 {
#                     "role": message.role,
#                     "content": message.content,
#                 }
#                 for message in message_history
#             ]

#             async for chunk in generate_ai_response(
#                 question=user_text,
#                 history=history_data,
#                 context=context,
#                 current_user=current_user,
#                 db=db,
#             ):
#                 full_response += chunk

#                 yield f"data: {json.dumps({
#                     'type': 'content',
#                     'content': chunk,
#                 })}\n\n"

#             # Save the final content to the same assistant message.
#             stored_message = (
#                 db.query(Messages)
#                 .filter(Messages.id == assistant_message.id)
#                 .first()
#             )
            
#             if stored_message is None:
#                 raise RuntimeError(
#                     "Assistant message disappeared before saving."
#                 )

#             stored_message.content = full_response
#             db.commit()

#             yield f"data: {json.dumps({
#                 'type': 'complete',
#             })}\n\n"

#         except Exception:
#             db.rollback()

#             # Persist a generic error instead of exposing internal details.
#             try:
#                 stored_message = (
#                     db.query(Messages)
#                     .filter(Messages.id == assistant_message.id)
#                     .first()
#                 )

#                 if stored_message is not None:
#                     stored_message.content = (
#                         "Sorry, I couldn't complete your request. "
#                         "Please try again."
#                     )
#                     db.commit()
#             except Exception:
#                 db.rollback()

#             yield f"data: {json.dumps({
#                 'type': 'error',
#                 'message': (
#                     "Sorry, I couldn't complete your request. "
#                     "Please try again."
#                 ),
#             })}\n\n"

#     return StreamingResponse(
#         generate(),
#         media_type="text/event-stream",
#         headers={
#             "Cache-Control": "no-cache",
#             "Connection": "keep-alive",
#             "X-Accel-Buffering": "no",
#         },
#     )


async def process_message(
    db: Session,
    data: ChatRequest,
    current_user: User | None,
):
    # ==========================================
    # 1. VALIDATE USER MESSAGE
    # ==========================================

    user_text = (data.message or "").strip()

    if not user_text:
        return {
            "conversation_id": data.conversation_id,
            "message": "Please enter a message before sending.",
        }

    # ==========================================
    # 2. INPUT MODERATION
    # ==========================================

    try:
        moderation_result = await moderate_content(user_text)

    except APIError:
        raise HTTPException(
            status_code=503,
            detail=(
                "Content safety verification is temporarily "
                "unavailable. Please try again."
            ),
        )

    if moderation_result["flagged"]:
        raise HTTPException(
            status_code=400,
            detail=(
                "Your message cannot be processed because it "
                "violates our content safety guidelines."
            ),
        )

    # ==========================================
    # 3. RETRIEVE CONVERSATION HISTORY
    # ==========================================

    message_history = await retrieve_messages(
        db=db,
        conversation_id=data.conversation_id,
        limit=10,
    )

    # ==========================================
    # 4. SAVE USER MESSAGE
    # ==========================================

    user_message = MessageCreate(
        conversation_id=data.conversation_id,
        role="user",
        content=user_text,
    )

    message = await create_messages(
        db=db,
        data=user_message,
    )

    # ==========================================
    # 5. REWRITE QUESTION FOR RAG
    # ==========================================

    search_query = await rewrite_question(
        user_message=user_text,
        message_history=message_history,
    )

    # ==========================================
    # 6. RETRIEVE RAG CONTEXT
    # ==========================================

    retrieved_chunks = await retrieve_context(
        db=db,
        question=search_query,
        top_k=5,
    )

    await save_message_retrievals(
        db,
        message.id,
        retrieved_chunks,
    )

    # ==========================================
    # 7. BUILD RAG CONTEXT
    # ==========================================

    if retrieved_chunks:
        context = build_rag_context(retrieved_chunks)
    else:
        context = ""

    # ==========================================
    # 8. GENERATE AND STREAM RESPONSE
    # ==========================================

    async def generate():

        assistant_message = None

        try:
            assistant_message = await _save_assistant_message(
                db=db,
                conversation_id=data.conversation_id,
                content="",
            )

            # Send SSE start event.
            yield f"data: {json.dumps({
                'type': 'start',
                'id': str(assistant_message.id),
                'conversation_id': str(data.conversation_id),
                'created_date': assistant_message.created_at.isoformat(),
            })}\n\n"

            full_response = ""

            history_data = [
                {
                    "role": message.role,
                    "content": message.content,
                }
                for message in message_history
            ]

            # ==========================================
            # 9. GENERATE COMPLETE AI RESPONSE
            # ==========================================

            async for chunk in generate_ai_response(
                question=user_text,
                history=history_data,
                context=context,
                current_user=current_user,
                db=db,
            ):
                full_response += chunk

            # ==========================================
            # 10. OUTPUT MODERATION
            # ==========================================

            try:
                moderation_result = await moderate_content(
                    full_response
                )

            except APIError:
                raise RuntimeError(
                    "Output safety verification is temporarily unavailable."
                )

            # ==========================================
            # 11. HANDLE FLAGGED OUTPUT
            # ==========================================

            if moderation_result["flagged"]:
                full_response = (
                    "I'm sorry, but I cannot provide that response. "
                    "Please try rephrasing your question."
                )

            # ==========================================
            # 12. SAVE APPROVED RESPONSE
            # ==========================================

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

            # ==========================================
            # 13. SEND APPROVED RESPONSE THROUGH SSE
            # ==========================================

            yield f"data: {json.dumps({
                'type': 'content',
                'content': full_response,
            })}\n\n"

            yield f"data: {json.dumps({
                'type': 'complete',
            })}\n\n"

        except Exception:
            db.rollback()

            # ==========================================
            # 14. HANDLE ERRORS
            # ==========================================

            try:
                if assistant_message is not None:

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


def build_rag_context(retrieved_chunks: list) -> str:

    return "\n\n".join(
        (
            f"SOURCE DOCUMENT: {item['chunk']['document_name']}\n"
            f"CHUNK INDEX: {item['chunk']['chunk_index']}\n\n"
            f"{item['chunk']['content']}"
        )
        for item in retrieved_chunks
    )




async def _save_assistant_message(db: Session,conversation_id: UUID,content: str) -> Messages:

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