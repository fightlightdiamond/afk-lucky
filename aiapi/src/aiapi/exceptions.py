"""
Custom exceptions for the AI Story Word Insertion system.

This module defines custom exception classes for better error handling
and more specific error messages throughout the application.
"""


class AIAPIException(Exception):
    """Base exception for all AI API errors."""
    
    def __init__(self, message: str, error_code: str = "AIAPI_ERROR", details: dict = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self):
        """Convert exception to dictionary for API responses."""
        return {
            "error": self.message,
            "error_code": self.error_code,
            "error_type": self.__class__.__name__,
            "details": self.details
        }


class VocabularyError(AIAPIException):
    """Exception raised for vocabulary-related errors."""
    
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, "VOCABULARY_ERROR", details)


class VocabularyNotFoundError(VocabularyError):
    """Exception raised when vocabulary is not found."""
    
    def __init__(self, topic: str = None, difficulty: str = None, details: dict = None):
        message = "No suitable vocabulary found"
        if topic or difficulty:
            message += f" for topic='{topic}', difficulty='{difficulty}'"
        super().__init__(message, details)


class WordInsertionError(AIAPIException):
    """Exception raised for word insertion errors."""
    
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, "WORD_INSERTION_ERROR", details)


class PositionDetectionError(WordInsertionError):
    """Exception raised when insertion position detection fails."""
    
    def __init__(self, message: str = "Failed to detect insertion positions", details: dict = None):
        super().__init__(message, details)


class GrammarValidationError(WordInsertionError):
    """Exception raised when grammar validation fails."""
    
    def __init__(self, message: str = "Grammar validation failed", details: dict = None):
        super().__init__(message, details)


class StoryGenerationError(AIAPIException):
    """Exception raised for story generation errors."""
    
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, "STORY_GENERATION_ERROR", details)


class ReadabilityError(StoryGenerationError):
    """Exception raised when story readability is below threshold."""
    
    def __init__(self, score: int, threshold: int, details: dict = None):
        message = f"Story readability score ({score}) is below threshold ({threshold})"
        if details is None:
            details = {}
        details.update({"score": score, "threshold": threshold})
        super().__init__(message, details)


class ChromaDBError(AIAPIException):
    """Exception raised for ChromaDB-related errors."""
    
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, "CHROMADB_ERROR", details)


class EmbeddingError(ChromaDBError):
    """Exception raised when embedding generation fails."""
    
    def __init__(self, message: str = "Failed to generate embedding", details: dict = None):
        super().__init__(message, details)


class AzureOpenAIError(AIAPIException):
    """Exception raised for Azure OpenAI API errors."""
    
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, "AZURE_OPENAI_ERROR", details)


class RateLimitExceededError(AzureOpenAIError):
    """Exception raised when Azure OpenAI rate limit is exceeded."""
    
    def __init__(self, message: str = "Azure OpenAI rate limit exceeded", retry_after: int = None, details: dict = None):
        if details is None:
            details = {}
        if retry_after:
            details["retry_after"] = retry_after
            message += f". Retry after {retry_after} seconds."
        super().__init__(message, details)


class APIQuotaExceededError(AzureOpenAIError):
    """Exception raised when Azure OpenAI API quota is exceeded."""
    
    def __init__(self, message: str = "Azure OpenAI API quota exceeded", details: dict = None):
        super().__init__(message, details)


class ValidationError(AIAPIException):
    """Exception raised for validation errors."""
    
    def __init__(self, message: str, field: str = None, details: dict = None):
        if details is None:
            details = {}
        if field:
            details["field"] = field
        super().__init__(message, "VALIDATION_ERROR", details)


class BatchProcessingError(AIAPIException):
    """Exception raised for batch processing errors."""
    
    def __init__(self, message: str, partial_results: list = None, details: dict = None):
        if details is None:
            details = {}
        if partial_results:
            details["partial_results"] = partial_results
        super().__init__(message, "BATCH_PROCESSING_ERROR", details)


class ConfigurationError(AIAPIException):
    """Exception raised for configuration errors."""
    
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, "CONFIGURATION_ERROR", details)
