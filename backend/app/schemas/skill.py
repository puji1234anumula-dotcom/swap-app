from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class SkillPostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    tags: list[str] = Field(..., min_length=1, max_length=20)
    description: str | None = Field(default=None, max_length=2000)

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, tags: list[str]) -> list[str]:
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
    title: str | None = Field(default=None, min_length=1, max_length=200)
    tags: list[str] | None = Field(default=None, min_length=1, max_length=20)
    description: str | None = Field(default=None, max_length=2000)

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, tags: list[str] | None) -> list[str] | None:
        if tags is None:
            return None
        return SkillPostBase.normalize_tags(tags)


class SkillPostResponse(BaseModel):
    id: str
    user_id: str
    title: str
    tags: list[str]
    description: str | None
    created_at: datetime


class PaginatedSkillPostsResponse(BaseModel):
    items: list[SkillPostResponse]
    total: int
    limit: int
    offset: int
