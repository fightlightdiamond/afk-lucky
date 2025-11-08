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

# TTS models
class TTSRequest(BaseModel):
    text: str = Field(..., description="Text to convert to speech")
    output_format: Literal["wav", "base64", "bytes", "file"] = Field("base64", description="Output format")

class TTSResponse(BaseModel):
    audio_base64: Optional[str] = Field(None, description="Base64 encoded audio data")
    audio_data: Optional[List[float]] = Field(None, description="Raw audio data as list")
    format: str = Field(..., description="Audio format")
    sampling_rate: int = Field(..., description="Audio sampling rate")
    duration: float = Field(..., description="Audio duration in seconds")
    size_bytes: Optional[int] = Field(None, description="Audio size in bytes")
    file_path: Optional[str] = Field(None, description="Server file path (if saved)")
    file_url: Optional[str] = Field(None, description="URL to access the audio file")
    error: Optional[str] = Field(None, description="Error message if any")

class StoryWithTTSRequest(BaseModel):
    prompt: str = Field(..., description="The story prompt")
    config: Optional[StoryConfig] = None
    preferences: Optional[StoryPreferences] = None
    template_id: Optional[str] = None
    generate_audio: bool = Field(False, description="Generate TTS audio for the story")
    audio_format: Literal["wav", "base64", "bytes", "file"] = Field("base64", description="Audio output format")

class StoryWithTTSResponse(BaseModel):
    title: str
    content: str
    sections: Optional[StorySection] = None
    metadata: Optional[StoryMetadata] = None
    audio: Optional[TTSResponse] = None
    error: Optional[str] = None

# Vocabulary and Word Insertion models
class VocabularyWord(BaseModel):
    word: str = Field(..., description="English word")
    definition: str = Field(..., description="English definition")
    vietnamese_translation: str = Field(..., description="Vietnamese translation")
    part_of_speech: Literal["noun", "verb", "adjective", "adverb", "phrase"] = Field(..., description="Part of speech")
    topic: str = Field(..., description="Topic category (e.g., technology, business)")
    difficulty: Literal["beginner", "intermediate", "advanced"] = Field(..., description="Difficulty level")
    example: str = Field(..., description="Example sentence using the word")
    ipa: Optional[str] = Field(None, description="IPA pronunciation notation")

class InsertionPosition(BaseModel):
    sentence_index: int = Field(..., description="Index of the sentence in the story")
    word_index: int = Field(..., description="Index of the word position in the sentence")
    position_type: Literal["noun", "verb", "adjective", "adverb", "phrase"] = Field(..., description="Type of position")
    score: float = Field(..., ge=0.0, le=1.0, description="Quality score for this position (0-1)")
    context: str = Field(..., description="Context around the insertion position")

class InsertionConfig(BaseModel):
    topic: str = Field("general", description="Vocabulary topic to focus on")
    difficulty: Literal["beginner", "intermediate", "advanced"] = Field("intermediate", description="Vocabulary difficulty level")
    insertion_count: int = Field(10, ge=5, le=20, description="Number of words to insert")
    bold_format: bool = Field(True, description="Format inserted words in bold")
    show_translation: bool = Field(True, description="Show Vietnamese translation after inserted words")

class InsertionMetrics(BaseModel):
    total_insertions: int = Field(..., description="Total number of words inserted")
    insertion_density: float = Field(..., description="Insertions per 100 words")
    avg_position_score: float = Field(..., description="Average quality score of insertion positions")
    readability_score: int = Field(..., description="Readability score after insertion")
    language_ratio: Dict[str, int] = Field(..., description="Ratio of Vietnamese to English words")

class StoryInsertionRequest(BaseModel):
    prompt: str = Field(..., description="The story prompt")
    config: Optional[StoryConfig] = None
    preferences: Optional[StoryPreferences] = None
    insertion_config: InsertionConfig = Field(default_factory=InsertionConfig, description="Word insertion configuration")

class StoryInsertionResponse(BaseModel):
    title: str = Field(..., description="Story title")
    original_content: str = Field(..., description="Original story without insertions")
    enhanced_content: str = Field(..., description="Story with English word insertions")
    inserted_words: List[VocabularyWord] = Field(..., description="List of inserted vocabulary words")
    glossary: List[Dict[str, str]] = Field(..., description="Glossary of inserted words")
    metrics: InsertionMetrics = Field(..., description="Insertion quality metrics")
    metadata: StoryMetadata = Field(..., description="Story metadata")
    error: Optional[str] = Field(None, description="Error message if any")

class VocabularySearchRequest(BaseModel):
    query: str = Field(..., description="Search query for semantic search")
    n_results: int = Field(10, ge=1, le=50, description="Number of results to return")
    topic: Optional[str] = Field(None, description="Filter by topic")
    difficulty: Optional[Literal["beginner", "intermediate", "advanced"]] = Field(None, description="Filter by difficulty")

class BatchVocabularyRequest(BaseModel):
    words: List[VocabularyWord] = Field(..., description="List of vocabulary words to add")

class BatchVocabularyResponse(BaseModel):
    success_count: int = Field(..., description="Number of successfully added words")
    failed_count: int = Field(..., description="Number of failed additions")
    errors: List[str] = Field(default_factory=list, description="List of error messages")

class StoryEnhancementRequest(BaseModel):
    story_id: str = Field(..., description="ID of existing story to enhance")
    insertion_config: InsertionConfig = Field(default_factory=InsertionConfig, description="Word insertion configuration")

class BatchStoryInsertionRequest(BaseModel):
    requests: List[StoryInsertionRequest] = Field(..., min_length=1, max_length=10, description="List of story insertion requests (max 10)")

class BatchStoryInsertionResult(BaseModel):
    index: int = Field(..., description="Index of the request in the batch")
    success: bool = Field(..., description="Whether the story generation succeeded")
    result: Optional[StoryInsertionResponse] = Field(None, description="Story insertion response if successful")
    error: Optional[str] = Field(None, description="Error message if failed")

class BatchStoryInsertionResponse(BaseModel):
    total: int = Field(..., description="Total number of requests")
    success_count: int = Field(..., description="Number of successful generations")
    failed_count: int = Field(..., description="Number of failed generations")
    results: List[BatchStoryInsertionResult] = Field(..., description="List of results for each request")
    total_time_ms: int = Field(..., description="Total processing time in milliseconds")



# Error response models
class ErrorDetail(BaseModel):
    """Detailed error information."""
    field: Optional[str] = Field(None, description="Field that caused the error")
    message: str = Field(..., description="Detailed error message")
    value: Optional[Any] = Field(None, description="Invalid value that caused the error")


class ErrorResponse(BaseModel):
    """Standard error response model."""
    error: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Error code for programmatic handling")
    error_type: str = Field(..., description="Type of error (exception class name)")
    details: Dict[str, Any] = Field(default_factory=dict, description="Additional error details")
    timestamp: str = Field(..., description="ISO timestamp when error occurred")
    partial_result: Optional[Any] = Field(None, description="Partial result if available")
    
    @classmethod
    def from_exception(cls, exc: Exception, partial_result: Any = None):
        """Create ErrorResponse from an exception."""
        from datetime import datetime
        from .exceptions import AIAPIException
        
        if isinstance(exc, AIAPIException):
            return cls(
                error=exc.message,
                error_code=exc.error_code,
                error_type=exc.__class__.__name__,
                details=exc.details,
                timestamp=datetime.utcnow().isoformat(),
                partial_result=partial_result
            )
        else:
            return cls(
                error=str(exc),
                error_code="INTERNAL_ERROR",
                error_type=exc.__class__.__name__,
                details={},
                timestamp=datetime.utcnow().isoformat(),
                partial_result=partial_result
            )


class ValidationErrorResponse(ErrorResponse):
    """Error response for validation errors."""
    validation_errors: List[ErrorDetail] = Field(default_factory=list, description="List of validation errors")
