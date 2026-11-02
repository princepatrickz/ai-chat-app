import os
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.db import get_db
from app.schemas.conversations_schema import Conversations, ConversationsCreate
from app.schemas.messages_schema import Message
from app.services import chat_services
from app.schemas.chat_schema import ChatRequest
from app.auth.auth import get_optional_current_user, get_current_user
from app.models.user import User

router = APIRouter(prefix='/chat', tags=['chat'])


@router.get("/", response_class=PlainTextResponse)
def test():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not found in environment or .env file")
    return api_key


@router.post('/start_converstation', response_model=Conversations)
async def start_converstation(db: Session = Depends(get_db)):
    return await chat_services.start_conversation(db)

@router.post('/send_message')
async def send_message(message: ChatRequest, db: Session = Depends(get_db), current_user: User | None = Depends(get_optional_current_user)):
    return await chat_services.process_message(db, message, current_user)

@router.get('/conversation/{id}', response_model=Conversations)
async def get_conversation(id: UUID, db: Session = Depends(get_db)):
    return await chat_services.get_conversation(db, id)


@router.get('/messages/{id}', response_model=list[Message])
async def get_messages(id: UUID, db: Session = Depends(get_db)):
    return await chat_services.get_messages_conversation_id(db, id)