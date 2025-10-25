"""
Chat service for general AI conversations with modern OpenAI API.
"""
from tenacity import retry, wait_random_exponential, stop_after_attempt, retry_if_exception_type
from openai import OpenAI, RateLimitError, APIError

from ..config import settings
from ..models import ChatMessage, ChatResponse

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
def generate_chat_response(message: ChatMessage) -> ChatResponse:
    """
    Generate AI response for chat messages using modern OpenAI API.
    
    Args:
        message: Chat message with content and optional context
        
    Returns:
        ChatResponse with AI-generated response
    """
    try:
        # Build messages array
        messages = []
        
        # Add context if provided
        if message.context:
            messages.append({
                "role": "system",
                "content": f"Context: {message.context}"
            })
        
        # Add user message
        messages.append({
            "role": "user", 
            "content": message.content
        })
        
        # Use updated API call without deprecated parameters
        response = client.chat.completions.create(
            model=settings.azure_deployment_name,
            messages=messages,
            max_tokens=1024,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content or "I couldn't generate a response."
        
        return ChatResponse(response=ai_response)
        
    except Exception as e:
        return ChatResponse(
            response="Sorry, I encountered an error while processing your message.",
            error=str(e)
        )