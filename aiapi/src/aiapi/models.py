"""
Pydantic models for request and response schemas.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from enum import Enum

# Itinerary models
class ItineraryRequest(BaseModel):
    prompt: str = Field(..., description="The prompt for generating the itinerary")
    destination: str = Field(..., description="Travel destination city or country")
    days: int = Field(..., gt=0, description="Number of days to plan for")

class BatchRequest(BaseModel):
    inputs: List[ItineraryRequest] = Field(..., description="List of itinerary requests")

class ItineraryResponse(BaseModel):
    destination: str = Field(..., description="The destination for the itinerary")
    result: Optional[dict] = Field(None, description="The generated itinerary result")
    error: Optional[str] = Field(None, description="Error message if any")

# Story models
class LanguageMix(BaseModel):
    ratio: int = Field(50, ge=0, le=100, description="Percentage of Vietnamese (0-100)")
    base_language: Literal["vi", "en"] = Field("vi", description="Base language")
    target_language: Literal["vi", "en"] = Field("en", description="Target language")

class StoryStyle(BaseModel):
    storytelling: Literal["narrative", "dialogue", "descriptive", "mixed"] = Field("narrative")
    tone: Literal["friendly", "formal", "casual", "educational", "entertaining"] = Field("friendly")
    readability_level: Literal["beginner", "intermediate", "advanced"] = Field("intermediate")

class StoryFormat(BaseModel):
    bold_english: bool = Field(False, description="Make English words bold")

class StoryStructure(BaseModel):
    sections: List[str] = Field(["story"], description="Story sections to include")
    include_quiz: bool = Field(False, description="Include quiz questions")
    include_glossary: bool = Field(False, description="Include glossary")

class StoryPreferences(BaseModel):
    length: Literal["short", "medium", "long"] = Field("medium")
    language_mix: Optional[LanguageMix] = None
    style: Optional[StoryStyle] = None
    format: Optional[StoryFormat] = None
    structure: Optional[StoryStructure] = None

class StoryConfig(BaseModel):
    vocab_focus: Optional[List[str]] = Field(None, description="Key vocabulary to focus on")
    core_topic: Optional[str] = Field(None, description="Core topic for the story")

class SimpleStoryRequest(BaseModel):
    prompt: str = Field(..., description="The story prompt")

class AdvancedStoryRequest(BaseModel):
    prompt: str = Field(..., description="The story prompt")
    config: Optional[StoryConfig] = None
    preferences: Optional[StoryPreferences] = None
    template_id: Optional[str] = None

class StorySection(BaseModel):
    story: str
    moral: Optional[str] = None
    quiz: Optional[List[Dict[str, Any]]] = None
    glossary: Optional[List[Dict[str, str]]] = None

class StoryMetadata(BaseModel):
    word_count: int
    language_ratio: Dict[str, int]
    generation_time: int
    readability_score: int

class StoryResponse(BaseModel):
    title: str
    content: str
    sections: Optional[StorySection] = None
    metadata: Optional[StoryMetadata] = None
    error: Optional[str] = None

class ChatMessage(BaseModel):
    content: str = Field(..., description="Message content")
    context: Optional[str] = Field(None, description="Additional context for the AI")

class ChatResponse(BaseModel):
    response: str = Field(..., description="AI response")
    error: Optional[str] = Field(None, description="Error message if any")