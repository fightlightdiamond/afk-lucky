"""
Error handling utilities for the AI Story Word Insertion system.

This module provides utilities for handling errors, retrying failed operations,
and converting exceptions to API responses.
"""
import functools
import time
from typing import Callable, Any, Optional, Type, Tuple
from openai import RateLimitError, APIError, APITimeoutError, APIConnectionError
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
    after_log
)

from ..config import settings
from ..exceptions import (
    AIAPIException,
    AzureOpenAIError,
    RateLimitExceededError,
    APIQuotaExceededError,
    EmbeddingError,
    ChromaDBError
)
from ..logging_config import get_logger

logger = get_logger(__name__)


def create_retry_decorator(
    max_attempts: int = None,
    min_wait: int = None,
    max_wait: int = None,
    retry_on: Tuple[Type[Exception], ...] = (RateLimitError, APIError, APITimeoutError, APIConnectionError)
):
    """
    Create a retry decorator with exponential backoff for Azure OpenAI API calls.
    
    Args:
        max_attempts: Maximum number of retry attempts (default: from settings)
        min_wait: Minimum wait time in seconds (default: from settings)
        max_wait: Maximum wait time in seconds (default: from settings)
        retry_on: Tuple of exception types to retry on
        
    Returns:
        Retry decorator
    """
    max_attempts = max_attempts or settings.retry_max_attempts
    min_wait = min_wait or settings.retry_min_wait_seconds
    max_wait = max_wait or settings.retry_max_wait_seconds
    
    return retry(
        retry=retry_if_exception_type(retry_on),
        stop=stop_after_attempt(max_attempts),
        wait=wait_exponential(multiplier=1, min=min_wait, max=max_wait),
        before_sleep=before_sleep_log(logger, "WARNING"),
        after=after_log(logger, "INFO"),
        reraise=True
    )


# Default retry decorator for Azure OpenAI calls
retry_on_api_error = create_retry_decorator()


def handle_azure_openai_error(func: Callable) -> Callable:
    """
    Decorator to handle Azure OpenAI API errors and convert them to custom exceptions.
    
    Usage:
        @handle_azure_openai_error
        def call_azure_api():
            ...
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except RateLimitError as e:
            logger.error(f"Azure OpenAI rate limit exceeded: {str(e)}")
            # Extract retry-after header if available
            retry_after = getattr(e, 'retry_after', None)
            raise RateLimitExceededError(
                message=f"Azure OpenAI rate limit exceeded: {str(e)}",
                retry_after=retry_after,
                details={"original_error": str(e)}
            )
        except APITimeoutError as e:
            logger.error(f"Azure OpenAI API timeout: {str(e)}")
            raise AzureOpenAIError(
                message=f"Azure OpenAI API timeout: {str(e)}",
                details={"original_error": str(e), "timeout": True}
            )
        except APIConnectionError as e:
            logger.error(f"Azure OpenAI API connection error: {str(e)}")
            raise AzureOpenAIError(
                message=f"Failed to connect to Azure OpenAI: {str(e)}",
                details={"original_error": str(e), "connection_error": True}
            )
        except APIError as e:
            logger.error(f"Azure OpenAI API error: {str(e)}")
            # Check if it's a quota error
            error_message = str(e).lower()
            if "quota" in error_message or "insufficient" in error_message:
                raise APIQuotaExceededError(
                    message=f"Azure OpenAI API quota exceeded: {str(e)}",
                    details={"original_error": str(e)}
                )
            raise AzureOpenAIError(
                message=f"Azure OpenAI API error: {str(e)}",
                details={"original_error": str(e)}
            )
        except Exception as e:
            logger.error(f"Unexpected error in Azure OpenAI call: {str(e)}")
            raise
    
    return wrapper


def handle_chromadb_error(func: Callable) -> Callable:
    """
    Decorator to handle ChromaDB errors and convert them to custom exceptions.
    
    Usage:
        @handle_chromadb_error
        def query_chromadb():
            ...
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            error_message = str(e).lower()
            
            # Check for specific ChromaDB errors
            if "connection" in error_message or "connect" in error_message:
                logger.error(f"ChromaDB connection error: {str(e)}")
                raise ChromaDBError(
                    message=f"Failed to connect to ChromaDB: {str(e)}",
                    details={"original_error": str(e), "connection_error": True}
                )
            elif "collection" in error_message:
                logger.error(f"ChromaDB collection error: {str(e)}")
                raise ChromaDBError(
                    message=f"ChromaDB collection error: {str(e)}",
                    details={"original_error": str(e), "collection_error": True}
                )
            else:
                logger.error(f"ChromaDB error: {str(e)}")
                raise ChromaDBError(
                    message=f"ChromaDB error: {str(e)}",
                    details={"original_error": str(e)}
                )
    
    return wrapper


def safe_execute(
    func: Callable,
    default_return: Any = None,
    log_error: bool = True,
    error_message: str = None
) -> Any:
    """
    Safely execute a function and return a default value on error.
    
    Args:
        func: Function to execute
        default_return: Value to return on error
        log_error: Whether to log the error
        error_message: Custom error message to log
        
    Returns:
        Function result or default_return on error
    """
    try:
        return func()
    except Exception as e:
        if log_error:
            msg = error_message or f"Error executing {func.__name__}"
            logger.error(f"{msg}: {str(e)}")
        return default_return


def with_fallback(primary_func: Callable, fallback_func: Callable, log_fallback: bool = True) -> Any:
    """
    Execute primary function, fall back to fallback function on error.
    
    Args:
        primary_func: Primary function to try
        fallback_func: Fallback function to use on error
        log_fallback: Whether to log when fallback is used
        
    Returns:
        Result from primary or fallback function
    """
    try:
        return primary_func()
    except Exception as e:
        if log_fallback:
            logger.warning(f"Primary function failed, using fallback: {str(e)}")
        return fallback_func()


class ErrorContext:
    """
    Context manager for error handling with automatic logging and conversion.
    
    Usage:
        with ErrorContext("story_generation", raise_on_error=True):
            # Your code here
            generate_story()
    """
    
    def __init__(
        self,
        operation: str,
        raise_on_error: bool = True,
        default_return: Any = None,
        error_type: Type[AIAPIException] = AIAPIException
    ):
        self.operation = operation
        self.raise_on_error = raise_on_error
        self.default_return = default_return
        self.error_type = error_type
        self.logger = get_logger("error_context")
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            return False
        
        # Log the error
        self.logger.error(f"Error in {self.operation}: {exc_val}")
        
        # Convert to custom exception if needed
        if not isinstance(exc_val, AIAPIException):
            custom_exc = self.error_type(
                message=f"Error in {self.operation}: {str(exc_val)}",
                details={"original_error": str(exc_val), "operation": self.operation}
            )
            
            if self.raise_on_error:
                raise custom_exc from exc_val
        
        # Suppress exception if not raising
        return not self.raise_on_error


def validate_and_handle_errors(validation_func: Callable[[Any], Tuple[bool, str]]):
    """
    Decorator to validate input and handle validation errors.
    
    Args:
        validation_func: Function that takes input and returns (is_valid, error_message)
        
    Usage:
        def validate_topic(topic):
            if topic not in VALID_TOPICS:
                return False, f"Invalid topic: {topic}"
            return True, ""
        
        @validate_and_handle_errors(validate_topic)
        def get_vocabulary(topic):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Get the first argument (assuming it's the input to validate)
            if args:
                input_value = args[0]
            elif kwargs:
                input_value = next(iter(kwargs.values()))
            else:
                input_value = None
            
            # Validate
            is_valid, error_message = validation_func(input_value)
            
            if not is_valid:
                from ..exceptions import ValidationError
                logger.error(f"Validation failed: {error_message}")
                raise ValidationError(error_message)
            
            # Execute function
            return func(*args, **kwargs)
        
        return wrapper
    return decorator


def log_and_suppress_error(func: Callable) -> Callable:
    """
    Decorator to log errors and suppress them (return None).
    Useful for non-critical operations.
    
    Usage:
        @log_and_suppress_error
        def optional_operation():
            ...
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.warning(f"Non-critical error in {func.__name__}: {str(e)}")
            return None
    
    return wrapper


def retry_with_backoff(
    max_retries: int = 3,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0,
    max_delay: float = 60.0
):
    """
    Simple retry decorator with exponential backoff.
    
    Args:
        max_retries: Maximum number of retries
        initial_delay: Initial delay in seconds
        backoff_factor: Multiplier for delay after each retry
        max_delay: Maximum delay in seconds
        
    Usage:
        @retry_with_backoff(max_retries=3)
        def unstable_operation():
            ...
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            delay = initial_delay
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    
                    if attempt < max_retries:
                        logger.warning(
                            f"Attempt {attempt + 1}/{max_retries + 1} failed for {func.__name__}: {str(e)}. "
                            f"Retrying in {delay:.1f}s..."
                        )
                        time.sleep(delay)
                        delay = min(delay * backoff_factor, max_delay)
                    else:
                        logger.error(f"All {max_retries + 1} attempts failed for {func.__name__}")
            
            # Raise the last exception if all retries failed
            raise last_exception
        
        return wrapper
    return decorator
