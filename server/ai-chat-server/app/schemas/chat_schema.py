from uuid import UUID
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime


class ChatResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    message: str
    created_date: datetime


class ChatRequest(BaseModel):

    model_config = ConfigDict(extra="forbid")

    conversation_id: UUID

    message: str = Field(
        min_length=1,
        max_length=4000
    )

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:

        value = value.strip()

        if not value:
            raise ValueError("Message cannot be empty.")

        return value
    
class AssistantResponse(BaseModel):

    answer: str = Field(
        min_length=1,
        max_length=8000
    )

    @field_validator("answer")
    @classmethod
    def validate_answer(cls, value: str) -> str:

        value = value.strip()

        if not value:
            raise ValueError("Response cannot be empty.")

        return value 