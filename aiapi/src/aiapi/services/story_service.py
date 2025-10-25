"""
Story generation service using OpenAI with function calling and structured output.
"""
import re
import time
import json
from typing import Dict, Any, List
from tenacity import retry, wait_random_exponential, stop_after_attempt, retry_if_exception_type
from openai import OpenAI, RateLimitError, APIError
from pydantic import BaseModel

from ..config import settings
from ..models import (
    AdvancedStoryRequest, 
    StoryResponse, 
    StorySection, 
    StoryMetadata,
    StoryPreferences
)

# OpenAI client configuration
client = OpenAI(
    base_url=settings.azure_endpoint,
    api_key=settings.azure_api_key
)

# Structured output models for OpenAI
class StructuredStoryOutput(BaseModel):
    title: str
    story_content: str
    moral: str = None
    quiz_questions: List[Dict[str, Any]] = None
    glossary: List[Dict[str, str]] = None
    
# Function calling tools definition
story_generation_tool = {
    "type": "function",
    "function": {
        "name": "create_story",
        "description": "Generate a structured story with title, content, and optional sections",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "The story title"
                },
                "story_content": {
                    "type": "string", 
                    "description": "The main story content"
                },
                "moral": {
                    "type": "string",
                    "description": "Optional moral or lesson from the story"
                },
                "quiz_questions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "question": {"type": "string"},
                            "options": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "correct_answer": {"type": "string"}
                        }
                    },
                    "description": "Optional quiz questions about the story"
                },
                "glossary": {
                    "type": "array",
                    "items": {
                        "type": "object", 
                        "properties": {
                            "term": {"type": "string"},
                            "definition": {"type": "string"}
                        }
                    },
                    "description": "Optional glossary of key terms"
                }
            },
            "required": ["title", "story_content"]
        }
    }
}

@retry(
    retry=retry_if_exception_type((RateLimitError, APIError)),
    wait=wait_random_exponential(min=1, max=10),
    stop=stop_after_attempt(5),
    reraise=True
)
def generate_story_content_with_tools(prompt: str, include_sections: bool = False) -> Dict[str, Any]:
    """
    Generate story content using OpenAI API with function calling and structured output.
    
    Args:
        prompt: The enhanced prompt for story generation
        include_sections: Whether to include quiz and glossary sections
        
    Returns:
        Structured story data from function calling
    """
    messages = [
        {
            "role": "system",
            "content": "You are a creative story writer. Use the create_story function to generate structured stories with proper sections."
        },
        {
            "role": "user", 
            "content": prompt
        }
    ]
    
    tools = [story_generation_tool]
    
    response = client.chat.completions.create(
        model=settings.azure_deployment_name,
        messages=messages,
        tools=tools,
        tool_choice={"type": "function", "function": {"name": "create_story"}},
        max_tokens=1500
    )
    
    # Extract function call result
    if response.choices[0].message.tool_calls:
        tool_call = response.choices[0].message.tool_calls[0]
        if tool_call.function.name == "create_story":
            return json.loads(tool_call.function.arguments)
    
    # Fallback if no function call
    return {
        "title": "Generated Story",
        "story_content": response.choices[0].message.content or "No content generated.",
        "moral": None,
        "quiz_questions": None,
        "glossary": None
    }

def build_enhanced_prompt(request: AdvancedStoryRequest) -> str:
    """
    Build enhanced prompt based on story configuration and preferences.
    
    Args:
        request: Advanced story request with config and preferences
        
    Returns:
        Enhanced prompt string
    """
    prompt = request.prompt
    config = request.config
    preferences = request.preferences or StoryPreferences()
    
    enhanced_prompt = f'Create a story based on this prompt: "{prompt}"\n\n'
    
    # Add language mixing instructions
    if preferences.language_mix:
        enhanced_prompt += f"""Language Requirements:
- Use {preferences.language_mix.ratio}% Vietnamese and {100 - preferences.language_mix.ratio}% English
- Base language: {preferences.language_mix.base_language}
- Target language: {preferences.language_mix.target_language}
"""
        if preferences.format and preferences.format.bold_english:
            enhanced_prompt += "- Make English words bold using **word** format\n"
        enhanced_prompt += "\n"
    
    # Add style instructions
    if preferences.style:
        enhanced_prompt += f"""Style Requirements:
- Storytelling style: {preferences.style.storytelling}
- Tone: {preferences.style.tone}
- Readability level: {preferences.style.readability_level}

"""
    
    # Add length requirements
    length_map = {
        "short": "150-250 words",
        "medium": "250-400 words", 
        "long": "400-600 words"
    }
    enhanced_prompt += f"Length: {length_map.get(preferences.length, '250-400 words')}\n\n"
    
    # Add vocabulary focus
    if config and config.vocab_focus:
        enhanced_prompt += f"Key vocabulary to include: {', '.join(config.vocab_focus)}\n\n"
    
    # Add structure requirements
    if preferences.structure:
        enhanced_prompt += f"""Structure Requirements:
- Include these sections: {', '.join(preferences.structure.sections)}
"""
        if preferences.structure.include_quiz:
            enhanced_prompt += "- Add a mini quiz with 3 multiple choice questions using the quiz_questions field\n"
        if preferences.structure.include_glossary:
            enhanced_prompt += "- Include a glossary of key terms using the glossary field\n"
        enhanced_prompt += "\n"
    
    # Add core topic if available
    if config and config.core_topic:
        enhanced_prompt += f"Core topic focus: {config.core_topic}\n\n"
    
    enhanced_prompt += """Please create an engaging story that follows all these requirements. 
Use the create_story function to provide structured output with proper title, story content, and any requested additional sections like quiz or glossary."""
    
    return enhanced_prompt

def create_story_sections_from_structured_output(structured_data: Dict[str, Any]) -> StorySection:
    """
    Create StorySection from structured output data.
    
    Args:
        structured_data: Structured data from function calling
        
    Returns:
        StorySection object with parsed content
    """
    return StorySection(
        story=structured_data.get("story_content", ""),
        moral=structured_data.get("moral"),
        quiz=structured_data.get("quiz_questions"),
        glossary=structured_data.get("glossary")
    )

def calculate_language_ratio(content: str) -> Dict[str, int]:
    """
    Calculate language ratio in the content.
    
    Args:
        content: Story content to analyze
        
    Returns:
        Dictionary with Vietnamese and English percentages
    """
    english_pattern = re.compile(r'[a-zA-Z]')
    vietnamese_pattern = re.compile(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]', re.IGNORECASE)
    
    english_matches = len(english_pattern.findall(content))
    vietnamese_matches = len(vietnamese_pattern.findall(content))
    
    total = english_matches + vietnamese_matches
    if total == 0:
        return {"vi": 50, "en": 50}
    
    return {
        "vi": round((vietnamese_matches / total) * 100),
        "en": round((english_matches / total) * 100)
    }

def calculate_readability_score(content: str) -> int:
    """
    Calculate readability score (simplified).
    
    Args:
        content: Story content to analyze
        
    Returns:
        Readability score (higher is easier)
    """
    words = len(content.split())
    sentences = len(re.split(r'[.!?]+', content))
    
    if sentences == 0:
        return 70
    
    avg_words_per_sentence = words / sentences
    
    # Simple readability score (higher is easier)
    if avg_words_per_sentence < 10:
        return 85  # Easy
    elif avg_words_per_sentence < 15:
        return 70  # Medium
    elif avg_words_per_sentence < 20:
        return 55  # Hard
    else:
        return 40  # Very hard

def generate_simple_story(prompt: str) -> StoryResponse:
    """
    Generate a simple story with basic configuration using structured output.
    
    Args:
        prompt: Story prompt
        
    Returns:
        StoryResponse with generated content
    """
    try:
        start_time = time.time()
        
        # Generate structured content using function calling
        structured_data = generate_story_content_with_tools(prompt, include_sections=False)
        generation_time = int((time.time() - start_time) * 1000)
        
        # Create sections from structured data
        sections = create_story_sections_from_structured_output(structured_data)
        
        # Get content for metadata calculation
        content = structured_data.get("story_content", "")
        
        # Calculate metadata
        word_count = len(content.split())
        language_ratio = calculate_language_ratio(content)
        readability_score = calculate_readability_score(content)
        
        metadata = StoryMetadata(
            word_count=word_count,
            language_ratio=language_ratio,
            generation_time=generation_time,
            readability_score=readability_score
        )
        
        return StoryResponse(
            title=structured_data.get("title", "Generated Story"),
            content=content,
            sections=sections,
            metadata=metadata
        )
    except Exception as e:
        return StoryResponse(
            title="Error",
            content="",
            error=str(e)
        )

def generate_advanced_story(request: AdvancedStoryRequest) -> StoryResponse:
    """
    Generate an advanced story with full configuration using structured output.
    
    Args:
        request: Advanced story request
        
    Returns:
        StoryResponse with generated content
    """
    try:
        start_time = time.time()
        
        # Build enhanced prompt
        enhanced_prompt = build_enhanced_prompt(request)
        
        # Check if we need additional sections
        preferences = request.preferences or StoryPreferences()
        include_sections = (
            preferences.structure and 
            (preferences.structure.include_quiz or preferences.structure.include_glossary)
        )
        
        # Generate structured content using function calling
        structured_data = generate_story_content_with_tools(enhanced_prompt, include_sections)
        generation_time = int((time.time() - start_time) * 1000)
        
        # Create sections from structured data
        sections = create_story_sections_from_structured_output(structured_data)
        
        # Get content for metadata calculation
        content = structured_data.get("story_content", "")
        
        # Calculate metadata
        word_count = len(content.split())
        language_ratio = calculate_language_ratio(content)
        readability_score = calculate_readability_score(content)
        
        metadata = StoryMetadata(
            word_count=word_count,
            language_ratio=language_ratio,
            generation_time=generation_time,
            readability_score=readability_score
        )
        
        return StoryResponse(
            title=structured_data.get("title", "Generated Story"),
            content=content,
            sections=sections,
            metadata=metadata
        )
    except Exception as e:
        return StoryResponse(
            title="Error",
            content="",
            error=str(e)
        )