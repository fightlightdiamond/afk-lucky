# Batch Processing Guide

## Overview

The batch processing feature allows you to generate multiple stories with English word insertion in a single API call. This is optimized for performance with parallel processing, retry logic, and rate limiting.

## Features Implemented

### 1. Batch Story Generation Endpoint

**Endpoint:** `POST /api/v1/batch-generate-stories`

**Parameters:**

- `requests`: List of story insertion requests (max 10)
- `parallel`: Enable parallel processing (default: true)
- `max_workers`: Number of concurrent workers (default: 3, max: 5)

**Request Example:**

```json
{
  "requests": [
    {
      "prompt": "Viết một câu chuyện về công nghệ AI",
      "insertion_config": {
        "topic": "technology",
        "difficulty": "intermediate",
        "insertion_count": 5
      }
    },
    {
      "prompt": "Viết một câu chuyện về kinh doanh",
      "insertion_config": {
        "topic": "business",
        "difficulty": "beginner",
        "insertion_count": 5
      }
    }
  ]
}
```

**Response:**

```json
{
  "total": 2,
  "success_count": 2,
  "failed_count": 0,
  "results": [
    {
      "index": 0,
      "success": true,
      "result": {
        "title": "...",
        "enhanced_content": "...",
        "metrics": {...}
      },
      "error": null
    }
  ],
  "total_time_ms": 15000
}
```

### 2. Retry Logic with Exponential Backoff

All Azure OpenAI API calls now include:

- **Automatic retry** on rate limit and API errors
- **Exponential backoff** (1-10 seconds)
- **Maximum 5 retry attempts**
- **Configurable** via settings

**Configuration:**

```python
# In config.py
retry_max_attempts: int = 5
retry_min_wait_seconds: int = 1
retry_max_wait_seconds: int = 10
```

### 3. Rate Limiting Middleware

**Features:**

- Token bucket algorithm
- 60 requests per minute (configurable)
- Burst capacity of 10 requests
- Per-client IP tracking
- Graceful error handling with retry-after headers

**Configuration:**

```python
# In config.py
rate_limit_enabled: bool = True
rate_limit_requests_per_minute: int = 60
rate_limit_burst_size: int = 10
```

**Rate Limit Response:**

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 5 seconds.",
  "retry_after": 5
}
```

**Response Headers:**

- `X-RateLimit-Limit`: Maximum requests per minute
- `X-RateLimit-Remaining`: Remaining requests in current window
- `Retry-After`: Seconds to wait before retrying (on 429 errors)

### 4. Performance Optimizations

#### Parallel Processing

- Uses `ThreadPoolExecutor` for concurrent story generation
- Configurable worker count (default: 3, max: 5)
- Independent error handling per story
- Performance metrics tracking

#### Batch Embedding Generation

- Generates embeddings for multiple texts in single API call
- Reduces API overhead
- Fallback to individual generation on errors

**Functions:**

```python
# Batch embedding generation
get_embeddings_batch(texts: List[str]) -> List[List[float]]

# Batch ChromaDB insertion
add_stories_to_chromadb_batch(stories: List[Dict]) -> Dict
```

#### Performance Monitoring

- Tracks processing time per story
- Reports average, min, and max times
- Total batch processing time

## Usage Examples

### Sequential Processing

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/batch-generate-stories?parallel=false",
    json={"requests": [...]},
    timeout=120
)
```

### Parallel Processing (Recommended)

```python
response = requests.post(
    "http://localhost:8000/api/v1/batch-generate-stories?parallel=true&max_workers=3",
    json={"requests": [...]},
    timeout=120
)
```

### Error Handling

```python
result = response.json()

for story_result in result['results']:
    if story_result['success']:
        story = story_result['result']
        print(f"Success: {story['title']}")
    else:
        print(f"Failed: {story_result['error']}")
```

## Testing

Run the test script to verify batch processing:

```bash
cd aiapi
python test_batch_processing.py
```

The test script includes:

1. Sequential batch processing test
2. Parallel batch processing test
3. Rate limiting test

## Configuration

All settings can be configured in `aiapi/src/aiapi/config.py`:

```python
# Rate limiting
rate_limit_enabled: bool = True
rate_limit_requests_per_minute: int = 60
rate_limit_burst_size: int = 10

# Retry logic
retry_max_attempts: int = 5
retry_min_wait_seconds: int = 1
retry_max_wait_seconds: int = 10

# Batch processing
batch_max_workers: int = 3
batch_embedding_size: int = 10
```

## Error Handling

### Rate Limit Errors

- Batch processing stops on rate limit to avoid further errors
- Remaining stories marked as skipped
- Returns partial results

### API Errors

- Individual story failures don't stop batch
- Errors captured per story
- Partial results always returned

### Retry Behavior

- Automatic retry with exponential backoff
- Handles transient API errors
- Graceful degradation on persistent failures

## Performance Tips

1. **Use parallel processing** for batches > 1 story
2. **Limit batch size** to 5-10 stories for optimal performance
3. **Adjust max_workers** based on API quota (3 is safe default)
4. **Monitor rate limits** via response headers
5. **Use batch embedding** for bulk operations

## API Quota Management

The implementation handles Azure OpenAI quota gracefully:

- Rate limiting prevents quota exhaustion
- Retry logic handles temporary quota issues
- Batch processing stops on persistent quota errors
- Partial results returned on failures

## Requirements Satisfied

This implementation satisfies requirements:

- **9.1**: Batch processing with error handling
- **9.2**: Exponential backoff for API calls
- **9.4**: Partial results on failures
- **9.5**: Rate limiting and quota error handling
- **9.3**: Performance optimization with parallel processing
