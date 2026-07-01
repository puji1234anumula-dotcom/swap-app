from typing import List
from datetime import datetime
from pydantic import BaseModel, Field


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    verified: bool
    average_rating: float = 0.0
    review_count: int = 0
    badges: List[str] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedUsersResponse(BaseModel):
    users: List[UserResponse]
    total: int
    limit: int
    offset: int
