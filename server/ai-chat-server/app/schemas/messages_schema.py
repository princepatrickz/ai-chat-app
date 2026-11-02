from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID

class MessageBase(BaseModel):
    conversation_id: UUID
    role: str | None = None
    content: str | None = None
    model: str | None = None

class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    model: str | None = None

    model_config = ConfigDict(
        from_attributes=True
    )