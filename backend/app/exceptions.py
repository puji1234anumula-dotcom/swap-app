import logging

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

logger = logging.getLogger(__name__)


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors — return 400 with consistent shape."""
    errors = exc.errors()
    # Build a human-readable message from the validation errors
    messages = []
    for err in errors:
        loc = " -> ".join(str(l) for l in err["loc"] if l != "body")
        messages.append(f"{loc}: {err['msg']}")
    detail = "; ".join(messages) if messages else "Invalid request data"
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": detail},
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all handler — return 500 with consistent shape, never leak stack traces."""
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
