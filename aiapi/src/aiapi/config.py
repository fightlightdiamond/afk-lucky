"""
Configuration settings for the application.
Loads from environment variables for security.
"""
import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Azure OpenAI settings
    azure_endpoint: str = os.getenv('AZURE_OPENAI_ENDPOINT', 'https://aiportalapi.stu-platform.live/jpe')
    
    # Separate API keys for different operations (loaded from .env)
    azure_chat_api_key: str = os.getenv('AZURE_CHAT_API_KEY', '')
    azure_embedding_api_key: str = os.getenv('AZURE_EMBEDDING_API_KEY', '')
    
    # Separate deployment names for different operations
    azure_chat_deployment: str = os.getenv('AZURE_CHAT_DEPLOYMENT', 'GPT-4o')
    azure_embedding_deployment: str = os.getenv('AZURE_EMBEDDING_DEPLOYMENT', 'text-embedding-3-small')
    
    # Vocabulary settings
    default_vocabulary_topic: str = os.getenv('DEFAULT_VOCABULARY_TOPIC', 'general')
    default_insertion_count: int = int(os.getenv('DEFAULT_INSERTION_COUNT', '10'))
    max_insertion_count: int = int(os.getenv('MAX_INSERTION_COUNT', '20'))
    min_position_score: float = float(os.getenv('MIN_POSITION_SCORE', '0.5'))
    
    # ChromaDB settings
    vocabulary_collection_name: str = os.getenv('VOCABULARY_COLLECTION_NAME', 'vocabulary')
    chromadb_path: str = os.getenv('CHROMADB_PATH', './chroma_data')
    
    # Rate limiting settings
    rate_limit_enabled: bool = os.getenv('RATE_LIMIT_ENABLED', 'true').lower() == 'true'
    rate_limit_requests_per_minute: int = int(os.getenv('RATE_LIMIT_REQUESTS_PER_MINUTE', '60'))
    rate_limit_burst_size: int = int(os.getenv('RATE_LIMIT_BURST_SIZE', '10'))
    
    # Retry settings
    retry_max_attempts: int = int(os.getenv('RETRY_MAX_ATTEMPTS', '5'))
    retry_min_wait_seconds: int = int(os.getenv('RETRY_MIN_WAIT_SECONDS', '1'))
    retry_max_wait_seconds: int = int(os.getenv('RETRY_MAX_WAIT_SECONDS', '10'))
    
    # Batch processing settings
    batch_max_workers: int = int(os.getenv('BATCH_MAX_WORKERS', '3'))
    batch_embedding_size: int = int(os.getenv('BATCH_EMBEDDING_SIZE', '10'))
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"  # Ignore extra fields from .env file
    }

settings = Settings()