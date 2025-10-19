"""
Configuration settings for the application.
"""
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    azure_endpoint: str = 'https://aiportalapi.stu-platform.live/jpe'
    azure_api_key: str = 'sk-uX_Ax09Iv6XY-28-M_uYVg'
    azure_deployment_name: str = 'GPT-4o'
    
    model_config = {
        "env_file": ".env",
        "env_prefix": "AIAPI_",
        "extra": "ignore"  # Ignore extra fields from .env file
    }

settings = Settings()