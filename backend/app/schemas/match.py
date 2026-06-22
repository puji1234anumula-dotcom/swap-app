from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.models.match import MatchStatus


class MatchResponse(BaseModel):
    id: str
    offer_id: str
    want_id: str
    offer_user_id: str
    want_user_id: str
    offer_title: str
    want_title: str
    mutual: bool
    status: MatchStatus
    created_at: datetime


class PaginatedMatchesResponse(BaseModel):
    matches: list[MatchResponse]
    total: int
    limit: int
    offset: int


class MatchStatusUpdate(BaseModel):
    status: Literal[MatchStatus.accepted, MatchStatus.completed, MatchStatus.declined]
