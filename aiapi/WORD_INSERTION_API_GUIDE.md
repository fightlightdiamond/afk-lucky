# Word Insertion API Guide

## Overview

The Word Insertion API provides endpoints for generating Vietnamese stories with intelligently inserted English vocabulary words. The API uses AI to analyze sentence structure, select contextually appropriate vocabulary, and insert words at natural positions while maintaining readability.

## Base URL

```
http://localhost:8000/api/v1
```

## Endpoints

### 1. Generate Story with Insertion

Generate a new Vietnamese story with English word insertion.

**Endpoint:** `POST /generate-story-with-insertion`

**Request Body:**

```json
{
  "prompt": "Viết một câu chuyện về một lập trình viên học tiếng Anh",
  "config": {
    "vocab_focus": ["programming", "learning"],
    "core_topic": "technology"
  },
  "preferences": {
    "length": "medium",
    "style": {
      "tone": "friendly",
      "readability_level": "intermediate"
    }
  },
  "insertion_config": {
    "topic": "technology",
    "difficulty": "intermediate",
    "insertion_count": 10,
    "bold_format": true,
    "show_translation": true
  }
}
```

**Response:**

```json
{
  "title": "Hành trình học tiếng Anh của một lập trình viên",
  "original_content": "Original story text...",
  "enhanced_content": "Story with **computer** (máy tính) insertions...",
  "inserted_words": [
    {
      "word": "computer",
      "definition": "An electronic device for processing data",
      "vietnamese_translation": "máy tính",
      "part_of_speech": "noun",
      "topic": "technology",
      "difficulty": "beginner",
      "example": "I use my computer every day",
      "ipa": "/kəmˈpjuːtər/"
    }
  ],
  "glossary": [
    {
      "word": "computer",
      "vietnamese": "máy tính",
      "part_of_speech": "noun",
      "definition": "An electronic device for processing data",
      "example": "I use my computer every day",
      "pronunciation": "/kəmˈpjuːtər/"
    }
  ],
  "metrics": {
    "total_insertions": 10,
    "insertion_density": 5.2,
    "avg_position_score": 0.85,
    "readability_score": 75,
    "language_ratio": {
      "vi": 85,
      "en": 15
    }
  },
  "metadata": {
    "word_count": 250,
    "language_ratio": {
      "vi": 85,
      "en": 15
    },
    "generation_time": 4500,
    "readability_score": 75
  }
}
```

### 2. Enhance Existing Story

Add English word insertion to an existing story.

**Endpoint:** `POST /enhance-story`

**Request Body:**

```json
{
  "story_id": "story_abc123",
  "insertion_config": {
    "topic": "business",
    "difficulty": "advanced",
    "insertion_count": 15,
    "bold_format": true,
    "show_translation": true
  }
}
```

**Response:** Same as Generate Story with Insertion

**Note:** This endpoint is currently not fully implemented as it requires story retrieval from ChromaDB.

### 3. Get Vocabulary by Topic and Difficulty

Retrieve vocabulary words filtered by topic and difficulty level.

**Endpoint:** `GET /vocabulary/{topic}/{difficulty}`

**Parameters:**

- `topic` (path): Topic category (e.g., "technology", "business", "education")
- `difficulty` (path): Difficulty level ("beginner", "intermediate", "advanced")
- `limit` (query, optional): Maximum number of results (default: 20, max: 50)

**Example:**

```bash
GET /vocabulary/technology/beginner?limit=10
```

**Response:**

```json
[
  {
    "id": "vocab_technology_beginner_computer",
    "metadata": {
      "word": "computer",
      "definition": "An electronic device for processing data",
      "vietnamese": "máy tính",
      "pos": "noun",
      "topic": "technology",
      "difficulty": "beginner",
      "example": "I use my computer every day",
      "ipa": "/kəmˈpjuːtər/"
    }
  }
]
```

### 4. Search Vocabulary (Semantic)

Search for vocabulary words using semantic similarity.

**Endpoint:** `POST /vocabulary/search`

**Request Body:**

```json
{
  "query": "computer programming and software development",
  "n_results": 10,
  "topic": "technology",
  "difficulty": "intermediate"
}
```

**Response:**

```json
[
  {
    "id": "vocab_technology_intermediate_programming",
    "metadata": {
      "word": "programming",
      "definition": "The process of writing computer programs",
      "vietnamese": "lập trình",
      "pos": "noun",
      "topic": "technology",
      "difficulty": "intermediate",
      "example": "Programming requires logical thinking",
      "ipa": "/ˈproʊɡræmɪŋ/"
    },
    "similarity_score": 0.92
  }
]
```

### 5. Batch Add Vocabulary

Add multiple vocabulary words in a single request.

**Endpoint:** `POST /vocabulary/batch-add`

**Request Body:**

```json
{
  "words": [
    {
      "word": "algorithm",
      "definition": "A step-by-step procedure for solving a problem",
      "vietnamese_translation": "thuật toán",
      "part_of_speech": "noun",
      "topic": "technology",
      "difficulty": "intermediate",
      "example": "The algorithm sorts the data efficiently",
      "ipa": "/ˈælɡəˌrɪðəm/"
    },
    {
      "word": "database",
      "definition": "An organized collection of data",
      "vietnamese_translation": "cơ sở dữ liệu",
      "part_of_speech": "noun",
      "topic": "technology",
      "difficulty": "intermediate",
      "example": "The database stores user information",
      "ipa": "/ˈdeɪtəˌbeɪs/"
    }
  ]
}
```

**Response:**

```json
{
  "success_count": 2,
  "failed_count": 0,
  "errors": []
}
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a detail message:

```json
{
  "detail": "Error message describing what went wrong"
}
```

## Usage Examples

### Python

```python
import requests

# Generate story with insertion
response = requests.post(
    "http://localhost:8000/api/v1/generate-story-with-insertion",
    json={
        "prompt": "Viết câu chuyện về công nghệ",
        "insertion_config": {
            "topic": "technology",
            "difficulty": "beginner",
            "insertion_count": 5
        }
    }
)

story = response.json()
print(f"Title: {story['title']}")
print(f"Enhanced content: {story['enhanced_content']}")
```

### cURL

```bash
# Get vocabulary
curl -X GET "http://localhost:8000/api/v1/vocabulary/technology/beginner?limit=5"

# Search vocabulary
curl -X POST "http://localhost:8000/api/v1/vocabulary/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "computer programming",
    "n_results": 10
  }'

# Generate story with insertion
curl -X POST "http://localhost:8000/api/v1/generate-story-with-insertion" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Viết câu chuyện về lập trình viên",
    "insertion_config": {
      "topic": "technology",
      "difficulty": "intermediate",
      "insertion_count": 10
    }
  }'
```

## API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Configuration

The API uses the following configuration from `config.py`:

- `vocabulary_collection_name`: ChromaDB collection name for vocabulary (default: "vocabulary")
- `default_vocabulary_topic`: Default topic if not specified (default: "general")
- `default_insertion_count`: Default number of insertions (default: 10)
- `max_insertion_count`: Maximum insertions allowed (default: 20)
- `min_position_score`: Minimum quality score for insertion positions (default: 0.7)

## Testing

Run the test suite:

```bash
cd aiapi
python test_word_insertion_api.py
```

Make sure the API server is running before executing tests:

```bash
cd aiapi
python run.py
```

## Notes

- The API requires Azure OpenAI credentials to be configured in environment variables
- ChromaDB must be initialized with vocabulary data before using the endpoints
- Story generation typically takes 3-5 seconds depending on complexity
- Vocabulary search uses vector embeddings for semantic matching
