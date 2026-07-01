from typing import List, Optional
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class SkillPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    category: Optional[str] = Field(default=None, max_length=100)
    tags: List[str] = Field(..., min_length=1, max_length=20)
    description: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, tags: List[str]) -> List[str]:
        normalized = []
        seen = set()
        for tag in tags:
            value = tag.strip().lower()
            if not value:
                continue
            if value not in seen:
                seen.add(value)
                normalized.append(value)
        if not normalized:
            raise ValueError("At least one non-empty tag is required")
        return normalized


class SkillPostCreate(SkillPostBase):
    pass


class SkillPostUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    category: Optional[str] = Field(default=None, max_length=100)
    tags: Optional[List[str]] = Field(default=None, min_length=1, max_length=20)
    description: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, tags: Optional[List[str]]) -> Optional[List[str]]:
        if tags is None:
            return None
        return SkillPostBase.normalize_tags(tags)


class SkillPostResponse(BaseModel):
    id: str
    user_id: str
    title: str
    category: Optional[str] = None
    tags: List[str]
    description: Optional[str]
    created_at: datetime


class PaginatedSkillPostsResponse(BaseModel):
    items: List[SkillPostResponse]
    total: int
    limit: int
    offset: int
