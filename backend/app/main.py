import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.exceptions import validation_exception_handler, generic_exception_handler
from app.config import get_settings
from app.routers import auth, matches, messages, notifications, offers, users, wants

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# --- Rate limiter ---
limiter = Limiter(key_func=get_remote_address)

# --- FastAPI app ---
app = FastAPI(
    title="Swap",
    description="Skill-trading web app - trade what you know for what you want to learn.",
    version="0.1.0",
)
app.state.limiter = limiter

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Exception handlers ---
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# --- Routers ---
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(offers.router)
app.include_router(wants.router)
app.include_router(matches.router)
app.include_router(messages.router)
app.include_router(notifications.router)


# --- Health check ---
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint for monitoring and CORS verification."""
    return {"status": "healthy", "app": "Swap", "version": "0.1.0"}


@app.get("/", tags=["root"])
async def root():
    """Root endpoint."""
    return {"message": "Welcome to Swap API", "docs": "/docs"}
