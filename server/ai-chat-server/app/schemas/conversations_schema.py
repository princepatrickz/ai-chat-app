from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class ConversationsBase(BaseModel):
    session_id: UUID | None = None
    user_id: UUID | None = None
    title: str | None = None
    status: bool
    created_at: datetime
    updated_at: datetime | None = None

class ConversationsCreate(ConversationsBase):
    pass

class Conversations(ConversationsBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
    