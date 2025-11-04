# Error Handling and Logging Guide

## Overview

This document describes the comprehensive error handling and logging system implemented for the AI Story Word Insertion feature.

## Components

### 1. Custom Exceptions (`exceptions.py`)

Custom exception hierarchy for better error handling:

```python
AIAPIException (base)
├── VocabularyError
│   └── VocabularyNotFoundError
├── WordInsertionError
│   ├── PositionDetectionError
│   └── GrammarValidationError
├── StoryGenerationError
│   └── ReadabilityError
├── ChromaDBError
│   └── EmbeddingError
├── AzureOpenAIError
│   ├── RateLimitExceededError
│   └── APIQuotaExceededError
├── ValidationError
├── BatchProcessingError
└── ConfigurationError
```

**Usage:**

```python
from aiapi.exceptions import VocabularyNotFoundError

if not vocabulary:
    raise VocabularyNotFoundError(
        topic="technology",
        difficulty="intermediate",
        details={"query": "machine learning"}
    )
```

### 2. Logging Configuration (`logging_config.py`)

Structured logging with file and console handlers:

**Features:**

- Colored console output for better readability
- File logging with daily rotation
- Different log levels for different components
- Performance monitoring utilities
- Context managers for operation tracking

**Setup:**

```python
from aiapi.logging_config import setup_logging, get_logger

# Initialize logging (done in main.py)
logger = setup_logging(level="INFO", log_to_file=True, log_to_console=True)

# Get logger for specific module
logger = get_logger(__name__)
```

**Usage:**

```python
logger.debug("Detailed debug information")
logger.info("General information")
logger.warning("Warning message")
logger.error("Error message", exc_info=True)  # Include stack trace
logger.critical("Critical error")
```

**Performance Monitoring:**

```python
from aiapi.logging_config import PerformanceMonitor

with PerformanceMonitor("story_generation"):
    # Your code here
    result = generate_story()
# Automatically logs execution time
```

**Context Logging:**

```python
from aiapi.logging_config import LogContext

with LogContext("vocabulary_search", topic="technology", difficulty="intermediate"):
    # Your code here
    results = search_vocabulary()
# Automatically logs start, end, and duration
```

### 3. Error Handling Utilities (`utils/error_handler.py`)

Utilities for handling errors and retrying operations:

**Retry Decorator:**

```python
from aiapi.utils import retry_on_api_error

@retry_on_api_error
def call_azure_api():
    # This will automatically retry on RateLimitError, APIError, etc.
    response = client.chat.completions.create(...)
    return response
```

**Custom Retry:**

```python
from aiapi.utils import create_retry_decorator

# Create custom retry with specific settings
custom_retry = create_retry_decorator(
    max_attempts=3,
    min_wait=2,
    max_wait=30
)

@custom_retry
def unstable_operation():
    # Your code here
    pass
```

**Error Handling Decorators:**

```python
from aiapi.utils import handle_azure_openai_error, handle_chromadb_error

@handle_azure_openai_error
def call_openai():
    # Automatically converts OpenAI errors to custom exceptions
    pass

@handle_chromadb_error
def query_chromadb():
    # Automatically converts ChromaDB errors to custom exceptions
    pass
```

**Safe Execution:**

```python
from aiapi.utils import safe_execute, with_fallback

# Execute with default return on error
result = safe_execute(
    lambda: risky_operation(),
    default_return=[],
    log_error=True
)

# Execute with fallback function
result = with_fallback(
    primary_func=lambda: primary_operation(),
    fallback_func=lambda: fallback_operation()
)
```

**Error Context:**

```python
from aiapi.utils import ErrorContext

with ErrorContext("story_generation", raise_on_error=True):
    # Your code here
    # Errors will be automatically logged and converted to custom exceptions
    generate_story()
```

### 4. Error Response Models (`models.py`)

Standardized error response format for API endpoints:

```python
{
    "error": "Error message",
    "error_code": "VOCABULARY_ERROR",
    "error_type": "VocabularyNotFoundError",
    "details": {
        "topic": "technology",
        "difficulty": "intermediate"
    },
    "timestamp": "2025-01-15T10:30:00.000Z",
    "partial_result": null
}
```

**Usage in API endpoints:**

```python
from aiapi.models import ErrorResponse
from aiapi.exceptions import AIAPIException

try:
    result = generate_story(request)
    return result
except AIAPIException as e:
    error_response = ErrorResponse.from_exception(e)
    return JSONResponse(
        status_code=500,
        content=error_response.model_dump()
    )
```

## Retry Logic for Azure OpenAI

### Configuration

Retry settings in `config.py`:

```python
retry_max_attempts: int = 5
retry_min_wait_seconds: int = 1
retry_max_wait_seconds: int = 10
```

### Implementation

All Azure OpenAI API calls use exponential backoff retry:

1. **Automatic Retry**: Functions decorated with `@retry_on_api_error` automatically retry on:

   - `RateLimitError`
   - `APIError`
   - `APITimeoutError`
   - `APIConnectionError`

2. **Exponential Backoff**: Wait time increases exponentially:

   - Attempt 1: 1-2 seconds
   - Attempt 2: 2-4 seconds
   - Attempt 3: 4-8 seconds
   - Attempt 4: 8-10 seconds (capped at max_wait)
   - Attempt 5: 10 seconds

3. **Error Conversion**: After max attempts, errors are converted to custom exceptions:
   - `RateLimitError` → `RateLimitExceededError`
   - `APIError` (quota) → `APIQuotaExceededError`
   - Other `APIError` → `AzureOpenAIError`

### Example

```python
from aiapi.utils import retry_on_api_error, handle_azure_openai_error

@retry_on_api_error
@handle_azure_openai_error
def analyze_sentence(sentence: str):
    response = client.chat.completions.create(
        model=settings.azure_deployment_name,
        messages=[...],
        max_tokens=800
    )
    return response
```

## Logging Best Practices

### Log Levels

- **DEBUG**: Detailed information for debugging (function parameters, intermediate values)
- **INFO**: General information about application flow (operation start/end, success messages)
- **WARNING**: Warning messages (fallback used, quality issues, retries)
- **ERROR**: Error messages (operation failures, exceptions)
- **CRITICAL**: Critical errors (system failures, unrecoverable errors)

### What to Log

**DO Log:**

- Function entry/exit for important operations
- API calls and responses (summary, not full content)
- Performance metrics (execution time, counts)
- Error details with context
- Retry attempts and outcomes
- Configuration changes
- User actions (API endpoint calls)

**DON'T Log:**

- Sensitive data (API keys, passwords, personal information)
- Full request/response bodies (use summaries)
- Excessive debug information in production
- Redundant information

### Examples

```python
# Good logging
logger.info(f"Generating story with insertion: prompt='{prompt[:50]}...', topic={topic}")
logger.debug(f"Found {len(positions)} insertion positions")
logger.warning(f"Readability score {score} below threshold {threshold}, regenerating...")
logger.error(f"Failed to generate story: {error}", exc_info=True)

# Bad logging
logger.info(f"Starting function")  # Too vague
logger.debug(f"Full API response: {response}")  # Too much data
logger.error(f"Error: {e}")  # Missing context
```

## Error Handling in Services

### Vocabulary Service

```python
from aiapi.exceptions import VocabularyError, EmbeddingError
from aiapi.logging_config import get_logger, PerformanceMonitor

logger = get_logger(__name__)

def add_vocabulary(word: str, ...):
    try:
        logger.debug(f"Adding vocabulary word: {word}")

        with PerformanceMonitor(f"add_vocabulary_{word}"):
            embedding = get_embedding(text)
            if not embedding:
                raise EmbeddingError(f"Failed to create embedding for: {word}")

            collection.add(...)
            logger.info(f"Added vocabulary word: {word}")
            return True

    except (EmbeddingError, ChromaDBError):
        raise  # Re-raise custom exceptions
    except Exception as e:
        logger.error(f"Error adding vocabulary: {e}", exc_info=True)
        raise VocabularyError(f"Failed to add vocabulary: {word}")
```

### Word Insertion Service

```python
from aiapi.exceptions import PositionDetectionError, AzureOpenAIError
from aiapi.utils import retry_on_api_error, handle_azure_openai_error

@retry_on_api_error
@handle_azure_openai_error
def analyze_sentence_structure(sentence: str):
    try:
        logger.debug(f"Analyzing sentence: {sentence[:50]}...")

        with PerformanceMonitor("analyze_sentence"):
            response = client.chat.completions.create(...)
            positions = parse_response(response)

            logger.info(f"Found {len(positions)} insertion positions")
            return positions

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse response: {e}")
        raise PositionDetectionError("Failed to parse position detection response")
    except (RateLimitError, APIError, AzureOpenAIError):
        raise  # Re-raise API errors (handled by decorators)
    except Exception as e:
        logger.error(f"Error analyzing sentence: {e}", exc_info=True)
        raise PositionDetectionError(f"Failed to analyze sentence: {e}")
```

### Story Enhancement Service

```python
from aiapi.exceptions import StoryGenerationError, ReadabilityError
from aiapi.logging_config import LogContext

def generate_story_with_insertion(request):
    with LogContext("generate_story_with_insertion", prompt=request.prompt[:50]):
        try:
            logger.info("Starting story generation with insertion")

            # Generate base story
            story_response = generate_advanced_story(request)
            if story_response.error:
                raise StoryGenerationError(story_response.error)

            # Validate readability
            if readability_score < threshold:
                logger.warning(f"Low readability: {readability_score}")
                # Regenerate or adjust

            logger.info(f"Story enhancement complete: {len(vocabulary)} words inserted")
            return response

        except Exception as e:
            logger.error(f"Error generating story: {e}", exc_info=True)
            raise StoryGenerationError(f"Failed to generate story: {e}")
```

## API Error Handling

### Global Exception Handlers (main.py)

```python
@app.exception_handler(AIAPIException)
async def aiapi_exception_handler(request: Request, exc: AIAPIException):
    logger.error(f"AIAPIException: {exc.message} | Path: {request.url.path}")
    error_response = ErrorResponse.from_exception(exc)
    return JSONResponse(
        status_code=500,
        content=error_response.model_dump()
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc} | Path: {request.url.path}")
    # Return structured validation error response
    ...
```

### Endpoint Error Handling

```python
from fastapi import HTTPException
from aiapi.logging_config import log_api_call

@router.post("/generate-story-with-insertion")
@log_api_call("/api/v1/generate-story-with-insertion", "POST")
def generate_story_api(req: StoryInsertionRequest):
    try:
        result = generate_story_with_insertion(req)

        if result.error and not result.enhanced_content:
            raise HTTPException(status_code=500, detail=result.error)

        return result

    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        logger.error(f"API error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
```

## Batch Processing Error Handling

Batch operations handle errors gracefully and return partial results:

```python
def generate_batch_stories(batch_request):
    results = []
    success_count = 0
    failed_count = 0

    for index, request in enumerate(batch_request.requests):
        try:
            result = generate_story_with_insertion(request)
            success_count += 1
            results.append(BatchStoryInsertionResult(
                index=index,
                success=True,
                result=result
            ))

        except RateLimitError as e:
            # Stop processing on rate limit
            logger.warning(f"Rate limit hit at story {index + 1}")
            failed_count += 1
            results.append(BatchStoryInsertionResult(
                index=index,
                success=False,
                error=f"Rate limit exceeded: {e}"
            ))
            break  # Stop processing remaining stories

        except Exception as e:
            # Continue processing other stories
            logger.error(f"Story {index + 1} failed: {e}")
            failed_count += 1
            results.append(BatchStoryInsertionResult(
                index=index,
                success=False,
                error=str(e)
            ))

    return BatchStoryInsertionResponse(
        total=len(batch_request.requests),
        success_count=success_count,
        failed_count=failed_count,
        results=results
    )
```

## Log Files

Logs are stored in the `logs/` directory:

- **File naming**: `aiapi_YYYYMMDD.log` (daily rotation)
- **Format**: `YYYY-MM-DD HH:MM:SS | LEVEL | module | function:line | message`
- **Retention**: Manual cleanup (consider implementing log rotation)

Example log entry:

```
2025-01-15 10:30:45 | INFO     | aiapi.services.story_enhancement_service | generate_story_with_insertion:245 | Starting story generation with insertion: prompt='Write a story about...'
2025-01-15 10:30:46 | DEBUG    | aiapi.services.word_insertion_service | analyze_sentence_structure:78 | Analyzing sentence: Một ngày nọ, có một cô gái...
2025-01-15 10:30:47 | INFO     | aiapi.services.word_insertion_service | analyze_sentence_structure:95 | Found 5 insertion positions for sentence
2025-01-15 10:30:50 | INFO     | aiapi.services.story_enhancement_service | generate_story_with_insertion:503 | Story enhancement complete: 10 words inserted
```

## Testing Error Handling

### Unit Tests

```python
import pytest
from aiapi.exceptions import VocabularyNotFoundError

def test_vocabulary_not_found():
    with pytest.raises(VocabularyNotFoundError) as exc_info:
        get_vocabulary_by_topic("invalid_topic", "beginner")

    assert "No suitable vocabulary found" in str(exc_info.value)
    assert exc_info.value.error_code == "VOCABULARY_ERROR"
```

### Integration Tests

```python
def test_api_error_response():
    response = client.post("/api/v1/generate-story-with-insertion", json={
        "prompt": "test",
        "insertion_config": {"topic": "invalid"}
    })

    assert response.status_code == 500
    error_data = response.json()
    assert "error" in error_data
    assert "error_code" in error_data
    assert "timestamp" in error_data
```

## Monitoring and Debugging

### Check Logs

```bash
# View today's logs
tail -f logs/aiapi_$(date +%Y%m%d).log

# Search for errors
grep "ERROR" logs/aiapi_*.log

# Search for specific operation
grep "generate_story_with_insertion" logs/aiapi_*.log
```

### Performance Monitoring

Performance metrics are automatically logged:

```
2025-01-15 10:30:50 | INFO     | aiapi.performance | story_generation: 4.523s
2025-01-15 10:30:50 | INFO     | aiapi.performance | analyze_sentence_structure: 0.234s
2025-01-15 10:30:50 | INFO     | aiapi.performance | select_vocabulary: 0.156s
```

## Configuration

### Environment Variables

```bash
# Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
AIAPI_LOG_LEVEL=INFO

# Retry settings
AIAPI_RETRY_MAX_ATTEMPTS=5
AIAPI_RETRY_MIN_WAIT_SECONDS=1
AIAPI_RETRY_MAX_WAIT_SECONDS=10
```

### Code Configuration

```python
# In config.py
class Settings(BaseSettings):
    # Retry settings
    retry_max_attempts: int = 5
    retry_min_wait_seconds: int = 1
    retry_max_wait_seconds: int = 10
```

## Troubleshooting

### Common Issues

**Issue**: Too many retry attempts

- **Solution**: Adjust `retry_max_attempts` in config
- **Check**: Azure OpenAI API status and quotas

**Issue**: Rate limit errors

- **Solution**: Implement rate limiting middleware
- **Check**: `rate_limit_requests_per_minute` setting

**Issue**: Large log files

- **Solution**: Implement log rotation
- **Check**: Log level (use INFO in production, not DEBUG)

**Issue**: Missing error context

- **Solution**: Use `exc_info=True` in logger.error()
- **Check**: Error details in exception

## Requirements Addressed

This implementation addresses the following requirements from task 9:

✅ **Comprehensive error handling for all services**

- Custom exception hierarchy
- Error handling decorators
- Try-catch blocks with proper error conversion

✅ **Logging for debugging and monitoring**

- Structured logging with file and console handlers
- Performance monitoring
- Context managers for operation tracking

✅ **Error response models**

- Standardized `ErrorResponse` model
- Conversion from exceptions to API responses
- Partial results support

✅ **Azure OpenAI API error handling with retry logic**

- Exponential backoff retry decorator
- Automatic retry on rate limits and API errors
- Error conversion to custom exceptions
- Graceful degradation in batch processing

## Requirements: 8.1, 9.2

- **8.1**: RESTful API endpoints with proper error handling
- **9.2**: Retry logic with exponential backoff for API failures
