from datetime import datetime

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=5000)


class MessageResponse(BaseModel):
    id: str
    match_id: str
    sender_id: str
    body: str
    timestamp: datetime


class PaginatedMessagesResponse(BaseModel):
    messages: list[MessageResponse]
    total: int
    limit: int
    offset: int
