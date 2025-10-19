"""
Story generation service using OpenAI.
"""
import re
import time
from typing import Dict, Any
from tenacity import retry, wait_random_exponential, stop_after_attempt, retry_if_exception_type
from openai import OpenAI, RateLimitError, APIError

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

@retry(
    retry=retry_if_exception_type((RateLimitError, APIError)),
    wait=wait_random_exponential(min=1, max=10),
    stop=stop_after_attempt(5),
    reraise=True
)
def generate_story_content(prompt: str) -> str:
    """
    Generate story content using OpenAI API.
    
    Args:
        prompt: The enhanced prompt for story generation
        
    Returns:
        Generated story content
    """
    response = client.chat.completions.create(
        model=settings.azure_deployment_name,
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=1024
    )
    return response.choices[0].message.content or "No content generated."

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
            enhanced_prompt += "- Add a mini quiz with 3 multiple choice questions\n"
        if preferences.structure.include_glossary:
            enhanced_prompt += "- Include a glossary of key terms\n"
        enhanced_prompt += "\n"
    
    # Add core topic if available
    if config and config.core_topic:
        enhanced_prompt += f"Core topic focus: {config.core_topic}\n\n"
    
    enhanced_prompt += "Please create an engaging story that follows all these requirements."
    
    return enhanced_prompt

def parse_story_content(content: str, preferences: StoryPreferences) -> Dict[str, Any]:
    """
    Parse story content into structured sections.
    
    Args:
        content: Raw story content
        preferences: Story preferences for parsing guidance
        
    Returns:
        Parsed story data with title, content, and sections
    """
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    
    # Extract title (first line or line starting with #)
    title = "Untitled Story"
    for line in lines:
        if line.startswith('#'):
            title = line.replace('#', '').strip()
            break
        elif lines.index(line) == 0 and len(line) < 100:
            title = line
            break
    
    # For now, treat the entire content as story content
    # In a real implementation, you would parse sections more intelligently
    sections = StorySection(
        story=content,
        moral=None,
        quiz=None,
        glossary=None
    )
    
    return {
        "title": title,
        "content": content,
        "sections": sections
    }

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
    Generate a simple story with basic configuration.
    
    Args:
        prompt: Story prompt
        
    Returns:
        StoryResponse with generated content
    """
    try:
        start_time = time.time()
        content = generate_story_content(prompt)
        generation_time = int((time.time() - start_time) * 1000)
        
        # Parse content
        parsed = parse_story_content(content, StoryPreferences())
        
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
            title=parsed["title"],
            content=parsed["content"],
            sections=parsed["sections"],
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
    Generate an advanced story with full configuration.
    
    Args:
        request: Advanced story request
        
    Returns:
        StoryResponse with generated content
    """
    try:
        start_time = time.time()
        
        # Build enhanced prompt
        enhanced_prompt = build_enhanced_prompt(request)
        
        # Generate content
        content = generate_story_content(enhanced_prompt)
        generation_time = int((time.time() - start_time) * 1000)
        
        # Parse content
        preferences = request.preferences or StoryPreferences()
        parsed = parse_story_content(content, preferences)
        
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
            title=parsed["title"],
            content=parsed["content"],
            sections=parsed["sections"],
            metadata=metadata
        )
    except Exception as e:
        return StoryResponse(
            title="Error",
            content="",
            error=str(e)
        )