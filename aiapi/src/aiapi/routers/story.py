"""
Story generation API routes.
"""
from fastapi import APIRouter, HTTPException

from ..models import SimpleStoryRequest, AdvancedStoryRequest, StoryResponse
from ..services.story_service import generate_simple_story, generate_advanced_story

router = APIRouter()

@router.post("/generate-story", response_model=StoryResponse)
def generate_story_api(req: SimpleStoryRequest):
    """
    Generate a simple story from a prompt.
    
    Args:
        req: Simple story request with prompt
        
    Returns:
        StoryResponse with generated story
    """
    result = generate_simple_story(req.prompt)
    
    if result.error:
        raise HTTPException(status_code=500, detail=result.error)
    
    return result

@router.post("/generate-advanced-story", response_model=StoryResponse)
def generate_advanced_story_api(req: AdvancedStoryRequest):
    """
    Generate an advanced story with full configuration.
    
    Args:
        req: Advanced story request with config and preferences
        
    Returns:
        StoryResponse with generated story
    """
    result = generate_advanced_story(req)
    
    if result.error:
        raise HTTPException(status_code=500, detail=result.error)
    
    return result