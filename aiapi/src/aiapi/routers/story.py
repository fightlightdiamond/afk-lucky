"""
Story generation API routes.
"""
from fastapi import APIRouter, HTTPException

from ..models import (
    SimpleStoryRequest, AdvancedStoryRequest, StoryResponse,
    StoryWithTTSRequest, StoryWithTTSResponse, TTSResponse
)
from ..services.story_service import generate_simple_story, generate_advanced_story
from ..services.tts_service import generate_tts_audio, is_tts_available

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

@router.post("/generate-story-with-tts", response_model=StoryWithTTSResponse)
def generate_story_with_tts_api(req: StoryWithTTSRequest):
    """
    Generate a story with optional TTS audio.
    
    Args:
        req: Story request with TTS options
        
    Returns:
        StoryWithTTSResponse with generated story and optional audio
    """
    # Convert to AdvancedStoryRequest for story generation
    story_req = AdvancedStoryRequest(
        prompt=req.prompt,
        config=req.config,
        preferences=req.preferences,
        template_id=req.template_id
    )
    
    # Generate story
    story_result = generate_advanced_story(story_req)
    
    if story_result.error:
        raise HTTPException(status_code=500, detail=story_result.error)
    
    # Generate TTS if requested
    audio_result = None
    if req.generate_audio and story_result.content:
        if not is_tts_available():
            # Don't fail the whole request if TTS is not available
            audio_result = TTSResponse(
                format="wav",
                sampling_rate=22050,
                duration=0.0,
                error="TTS service is not available"
            )
        else:
            tts_data = generate_tts_audio(story_result.content, req.audio_format)
            if tts_data:
                audio_result = TTSResponse(**tts_data)
            else:
                audio_result = TTSResponse(
                    format="wav",
                    sampling_rate=22050,
                    duration=0.0,
                    error="Failed to generate TTS audio"
                )
    
    return StoryWithTTSResponse(
        title=story_result.title,
        content=story_result.content,
        sections=story_result.sections,
        metadata=story_result.metadata,
        audio=audio_result
    )