"""
OpenAI service for handling API calls and function definitions.
"""
from tenacity import retry, wait_random_exponential, stop_after_attempt, retry_if_exception_type
from openai import OpenAI, RateLimitError, APIError

from ..config import settings

# OpenAI client configuration
client = OpenAI(
    base_url=settings.azure_endpoint,
    api_key=settings.azure_api_key
)

# Function definitions for OpenAI
functions = [
    {
        "name": "generate_itinerary",
        "description": "Generate a travel itinerary for a given destination and duration.",
        "parameters": {
            "type": "object",
            "properties": {
                "destination": {"type": "string", "description": "Travel destination city or country"},
                "days": {"type": "integer", "description": "Number of days to plan for"}
            },
            "required": ["destination", "days"],
        },
    }
]

@retry(
    retry=retry_if_exception_type((RateLimitError, APIError)),
    wait=wait_random_exponential(min=1, max=10),
    stop=stop_after_attempt(5),
    reraise=True
)
def call_openai_function(prompt: str, destination: str, days: int):
    """
    Call OpenAI API with function calling for itinerary generation.
    
    Args:
        prompt: The user prompt for generating the itinerary
        destination: Travel destination
        days: Number of days for the trip
        
    Returns:
        OpenAI API response
    """
    response = client.chat.completions.create(
        model=settings.azure_deployment_name,
        messages=[
            {"role": "user", "content": prompt}
        ],
        functions=functions,
        function_call={
            "name": "generate_itinerary",
            "arguments": f'{{"destination": "{destination}", "days": {days}}}'
        }
    )
    return response