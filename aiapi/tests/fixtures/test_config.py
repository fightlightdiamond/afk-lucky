"""Test configuration and constants."""

import os
from pathlib import Path


# Test directories
TEST_DIR = Path(__file__).parent.parent
FIXTURES_DIR = TEST_DIR / "fixtures"
DATA_DIR = Path(__file__).parent.parent.parent / "data"

# Test data files
SAMPLE_VOCABULARY_FILE = DATA_DIR / "sample_vocabulary.json"
SAMPLE_STORIES_FILE = DATA_DIR / "sample_stories.json"

# Test ChromaDB settings
TEST_CHROMADB_PATH = TEST_DIR / "test_chroma_data"
TEST_VOCABULARY_COLLECTION = "test_vocabulary"
TEST_STORIES_COLLECTION = "test_stories"

# Test Azure OpenAI settings
TEST_AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT", "https://test.openai.azure.com/")
TEST_AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY", "test-key")
TEST_AZURE_OPENAI_DEPLOYMENT = "gpt-4o"
TEST_AZURE_OPENAI_EMBEDDING_DEPLOYMENT = "text-embedding-3-small"

# Test API settings
TEST_API_BASE_URL = "http://localhost:8000"
TEST_API_VERSION = "v1"

# Test insertion settings
TEST_MIN_INSERTION_COUNT = 5
TEST_MAX_INSERTION_COUNT = 20
TEST_DEFAULT_INSERTION_COUNT = 10
TEST_MIN_POSITION_SCORE = 0.7
TEST_MIN_RELEVANCE_SCORE = 0.8
TEST_MIN_READABILITY_SCORE = 60

# Test topics and difficulties
TEST_TOPICS = ["technology", "business", "education", "daily life", "travel"]
TEST_DIFFICULTIES = ["beginner", "intermediate", "advanced"]
TEST_PARTS_OF_SPEECH = ["noun", "verb", "adjective", "adverb", "phrase"]

# Test story lengths
TEST_STORY_LENGTHS = {
    "short": 50,
    "medium": 150,
    "long": 300
}

# Test timeouts (in seconds)
TEST_API_TIMEOUT = 30
TEST_EMBEDDING_TIMEOUT = 10
TEST_STORY_GENERATION_TIMEOUT = 60

# Test batch processing
TEST_MAX_BATCH_SIZE = 10
TEST_BATCH_TIMEOUT = 300

# Test rate limiting
TEST_RATE_LIMIT_PER_MINUTE = 60
TEST_RATE_LIMIT_PER_HOUR = 1000

# Mock data settings
MOCK_EMBEDDING_DIMENSION = 1536
MOCK_SIMILARITY_THRESHOLD = 0.7

# Test validation thresholds
VALIDATION_THRESHOLDS = {
    "readability_score": 60,
    "relevance_score": 0.8,
    "grammar_score": 0.7,
    "position_score": 0.7
}

# Test error messages
ERROR_MESSAGES = {
    "rate_limit": "Rate limit exceeded",
    "timeout": "Request timeout",
    "invalid_input": "Invalid input parameters",
    "generation_failed": "Failed to generate story",
    "vocabulary_not_found": "Vocabulary not found",
    "chromadb_error": "ChromaDB operation failed"
}

# Test user agents
TEST_USER_AGENT = "AIStoryWordInsertion-Test/1.0"

# Test request headers
TEST_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": TEST_USER_AGENT
}

# Test retry settings
TEST_MAX_RETRIES = 3
TEST_RETRY_DELAY = 1  # seconds
TEST_RETRY_BACKOFF = 2  # exponential backoff multiplier

# Test cache settings
TEST_CACHE_TTL = 3600  # 1 hour
TEST_CACHE_MAX_SIZE = 1000

# Performance test targets
PERFORMANCE_TARGETS = {
    "story_generation": 5.0,  # seconds
    "vocabulary_search": 0.1,  # seconds
    "batch_processing": 30.0,  # seconds for 10 stories
    "chromadb_query": 0.05  # seconds
}

# Test data counts
TEST_DATA_COUNTS = {
    "vocabulary_words": 100,
    "sample_stories": 10,
    "test_sentences": 20
}

# Feature flags for testing
FEATURE_FLAGS = {
    "enable_caching": True,
    "enable_retry": True,
    "enable_rate_limiting": True,
    "enable_validation": True,
    "enable_metrics": True
}

# Test environment
TEST_ENVIRONMENT = os.getenv("TEST_ENV", "test")
IS_CI = os.getenv("CI", "false").lower() == "true"

# Logging configuration for tests
TEST_LOG_LEVEL = os.getenv("TEST_LOG_LEVEL", "INFO")
TEST_LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


def get_test_config() -> dict:
    """Get complete test configuration as dictionary."""
    return {
        "directories": {
            "test_dir": str(TEST_DIR),
            "fixtures_dir": str(FIXTURES_DIR),
            "data_dir": str(DATA_DIR)
        },
        "files": {
            "vocabulary": str(SAMPLE_VOCABULARY_FILE),
            "stories": str(SAMPLE_STORIES_FILE)
        },
        "chromadb": {
            "path": str(TEST_CHROMADB_PATH),
            "vocabulary_collection": TEST_VOCABULARY_COLLECTION,
            "stories_collection": TEST_STORIES_COLLECTION
        },
        "azure_openai": {
            "endpoint": TEST_AZURE_OPENAI_ENDPOINT,
            "deployment": TEST_AZURE_OPENAI_DEPLOYMENT,
            "embedding_deployment": TEST_AZURE_OPENAI_EMBEDDING_DEPLOYMENT
        },
        "api": {
            "base_url": TEST_API_BASE_URL,
            "version": TEST_API_VERSION,
            "timeout": TEST_API_TIMEOUT
        },
        "insertion": {
            "min_count": TEST_MIN_INSERTION_COUNT,
            "max_count": TEST_MAX_INSERTION_COUNT,
            "default_count": TEST_DEFAULT_INSERTION_COUNT,
            "min_position_score": TEST_MIN_POSITION_SCORE,
            "min_relevance_score": TEST_MIN_RELEVANCE_SCORE,
            "min_readability_score": TEST_MIN_READABILITY_SCORE
        },
        "validation": VALIDATION_THRESHOLDS,
        "performance": PERFORMANCE_TARGETS,
        "features": FEATURE_FLAGS,
        "environment": {
            "name": TEST_ENVIRONMENT,
            "is_ci": IS_CI
        }
    }


def cleanup_test_data():
    """Clean up test data and temporary files."""
    import shutil
    
    # Remove test ChromaDB directory
    if TEST_CHROMADB_PATH.exists():
        shutil.rmtree(TEST_CHROMADB_PATH)
    
    # Remove any test cache files
    cache_dir = TEST_DIR / ".cache"
    if cache_dir.exists():
        shutil.rmtree(cache_dir)


def setup_test_environment():
    """Set up test environment."""
    # Create test directories if they don't exist
    TEST_CHROMADB_PATH.mkdir(parents=True, exist_ok=True)
    
    # Set environment variables for testing
    os.environ["TESTING"] = "true"
    os.environ["CHROMADB_PATH"] = str(TEST_CHROMADB_PATH)
