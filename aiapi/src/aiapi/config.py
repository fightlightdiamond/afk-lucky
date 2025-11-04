"""
Configuration settings for the application.
"""
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    azure_endpoint: str = 'https://aiportalapi.stu-platform.live/jpe'
    azure_api_key: str = 'sk-uX_Ax09Iv6XY-28-M_uYVg'
    azure_deployment_name: str = 'GPT-4o'
    
    # Vocabulary settings
    default_vocabulary_topic: str = "general"
    default_insertion_count: int = 10
    max_insertion_count: int = 20
    min_position_score: float = 0.7
    
    # ChromaDB settings
    vocabulary_collection_name: str = "vocabulary"
    chromadb_path: str = "./chroma_data"
    
    # Rate limiting settings
    rate_limit_enabled: bool = True
    rate_limit_requests_per_minute: int = 60
    rate_limit_burst_size: int = 10
    
    # Retry settings
    retry_max_attempts: int = 5
    retry_min_wait_seconds: int = 1
    retry_max_wait_seconds: int = 10
    
    # Batch processing settings
    batch_max_workers: int = 3
    batch_embedding_size: int = 10
    
    model_config = {
        "env_file": ".env",
        "env_prefix": "AIAPI_",
        "extra": "ignore"  # Ignore extra fields from .env file
    }

settings = Settings()