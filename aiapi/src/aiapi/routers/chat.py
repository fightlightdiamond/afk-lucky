"""
Chat API routes for general AI conversations.
"""
from fastapi import APIRouter, HTTPException

from ..models import ChatMessage, ChatResponse
from ..services.chat_service import generate_chat_response

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat_api(message: ChatMessage):
    """
    Generate AI response for chat messages.
    
    Args:
        message: Chat message with content and optional context
        
    Returns:
        ChatResponse with AI-generated response
    """
    result = generate_chat_response(message)
    
    if result.error:
        raise HTTPException(status_code=500, detail=result.error)
    
    return result