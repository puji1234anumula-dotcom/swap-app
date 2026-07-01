from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    DATABASE_URL: str
    DATABASE_URL_SYNC: str | None = None
    JWT_SECRET: str
    JWT_EXPIRY_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"

    @property
    def async_database_url(self) -> str:
        # Render provides postgres:// but asyncpg needs postgresql+asyncpg://
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    @property
    def sync_database_url(self) -> str:
        url = self.DATABASE_URL_SYNC or self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        elif url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
        return url

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
