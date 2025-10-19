"""
Main FastAPI application for AI services.
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import itinerary, story, chat
from .config import settings

app = FastAPI(
    title="AI Services API",
    description="API for AI-powered services including travel itineraries, story generation, and chat",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(itinerary.router, prefix="/api/v1", tags=["itinerary"])
app.include_router(story.router, prefix="/api/v1", tags=["story"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])

@app.get("/")
def read_root():
    return {"message": "AI Services API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)