"""
Main FastAPI application for AI services.
"""
import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pathlib import Path
from dotenv import load_dotenv
import os

# Load .env file from project root
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(env_path)

from .routers import itinerary, story, chat, tts, story_search, word_insertion
from .config import settings
from .middleware import RateLimitMiddleware
from .logging_config import setup_logging, get_logger
from .exceptions import AIAPIException
from .models import ErrorResponse

# Initialize logging
logger = setup_logging(level="INFO", log_to_file=True, log_to_console=True)
logger.info("Starting AI Services API...")

app = FastAPI(
    title="AI Services API",
    description="API for AI-powered services including travel itineraries, story generation, and chat",
    version="1.0.0"
)


# Global exception handlers
@app.exception_handler(AIAPIException)
async def aiapi_exception_handler(request: Request, exc: AIAPIException):
    """Handle custom AI API exceptions."""
    logger.error(f"AIAPIException: {exc.message} | Path: {request.url.path}")
    error_response = ErrorResponse.from_exception(exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump()
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.error(f"Validation error: {exc} | Path: {request.url.path}")
    from datetime import datetime
    error_response = ErrorResponse(
        error="Request validation failed",
        error_code="VALIDATION_ERROR",
        error_type="RequestValidationError",
        details={"errors": exc.errors()},
        timestamp=datetime.utcnow().isoformat()
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions."""
    logger.error(f"Unhandled exception: {exc} | Path: {request.url.path}", exc_info=True)
    error_response = ErrorResponse.from_exception(exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump()
    )

# Add rate limiting middleware
app.add_middleware(RateLimitMiddleware)

# Add CORS middleware for frontend integration
# Allow all origins for development (hackathon demo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Create static directory for audio files
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)
(static_dir / "audio").mkdir(exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(itinerary.router, prefix="/api/v1", tags=["itinerary"])
app.include_router(story.router, prefix="/api/v1", tags=["story"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(tts.router, prefix="/api/v1", tags=["tts"])
app.include_router(story_search.router, prefix="/api/v1", tags=["story-search"])
app.include_router(word_insertion.router, prefix="/api/v1", tags=["word-insertion"])

@app.get("/")
def read_root():
    logger.info("Root endpoint accessed")
    return {"message": "AI Services API is running"}


@app.get("/health")
def health_check():
    logger.debug("Health check endpoint accessed")
    return {"status": "healthy"}


@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info("AI Services API started successfully")
    logger.info(f"Rate limiting: {'enabled' if settings.rate_limit_enabled else 'disabled'}")
    logger.info(f"ChromaDB path: {settings.chromadb_path}")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger.info("AI Services API shutting down...")

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle OPTIONS requests for CORS preflight"""
    return {"message": "OK"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)