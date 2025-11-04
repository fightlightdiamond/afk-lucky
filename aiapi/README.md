# AI Story API with English Word Insertion

FastAPI application for generating Vietnamese stories with intelligent English word insertion for language learning, powered by Azure OpenAI and ChromaDB.

## Features

- **Story Generation**: Create Vietnamese stories with customizable parameters
- **English Word Insertion**: Intelligently insert English vocabulary into Vietnamese stories
- **Vocabulary Management**: Organize vocabulary by topic and difficulty level
- **Semantic Search**: Find relevant vocabulary and stories using vector embeddings
- **Batch Processing**: Process multiple stories efficiently with parallel execution
- **Quality Assurance**: Readability validation, context relevance checking, and grammar validation
- **ChromaDB Integration**: Vector database for semantic search and storage
- **Rate Limiting**: Built-in rate limiting and retry logic for API stability

## Installation

```bash
# Install dependencies
pip install -e .

# Or using poetry
poetry install
```

## Running the Application

```bash
# Using the run script
python run.py

# Or directly with uvicorn
uvicorn src.aiapi.main:app --reload --host 0.0.0.0 --port 8000
```

## Setup and Initialization

### 1. Install Dependencies

```bash
# Using pip
pip install -e .

# Or using poetry
poetry install
```

### 2. Initialize Vocabulary Database

Before using the word insertion features, initialize the vocabulary database with sample data:

```bash
# From the aiapi directory
python -m aiapi.scripts.init_vocabulary

# Or directly
python scripts/init_vocabulary.py
```

This will:

- Create the vocabulary collection in ChromaDB
- Load 100+ sample vocabulary words from `data/sample_vocabulary.json`
- Generate embeddings for semantic search
- Display initialization statistics

### 3. Import Custom Vocabulary (Optional)

You can import your own vocabulary from CSV or JSON files:

```bash
# Import from JSON
python -m aiapi.scripts.import_vocabulary --file your_vocab.json

# Import from CSV
python -m aiapi.scripts.import_vocabulary --file your_vocab.csv

# Skip validation (not recommended)
python -m aiapi.scripts.import_vocabulary --file vocab.json --no-validate
```

#### CSV Format

Your CSV file should have these columns:

```csv
word,definition,vietnamese_translation,part_of_speech,topic,difficulty,example,ipa
laptop,A portable computer,máy tính xách tay,noun,technology,beginner,I use my laptop for work,/ˈlæp.tɑːp/
```

#### JSON Format

```json
[
  {
    "word": "laptop",
    "definition": "A portable computer",
    "vietnamese_translation": "máy tính xách tay",
    "part_of_speech": "noun",
    "topic": "technology",
    "difficulty": "beginner",
    "example": "I use my laptop for work",
    "ipa": "/ˈlæp.tɑːp/"
  }
]
```

**Valid Values:**

- `part_of_speech`: noun, verb, adjective, adverb, phrase
- `difficulty`: beginner, intermediate, advanced
- `topic`: technology, business, education, daily life, travel, or custom topics

## API Endpoints

### Story Generation with Word Insertion

#### Generate Story with Insertion

```http
POST /api/v1/generate-story-with-insertion
```

Generate a new Vietnamese story with English words intelligently inserted.

**Request Body:**

```json
{
  "prompt": "A story about a student learning programming",
  "config": {
    "length": "medium",
    "style": "educational",
    "tone": "friendly"
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
  "title": "Hành trình học lập trình",
  "original_content": "...",
  "enhanced_content": "Một sinh viên đang học **programming (lập trình)**...",
  "inserted_words": [...],
  "glossary": [...],
  "metrics": {
    "total_insertions": 10,
    "insertion_density": 5.2,
    "avg_position_score": 0.85,
    "readability_score": 75
  }
}
```

#### Enhance Existing Story

```http
POST /api/v1/enhance-story
```

Add English word insertion to an existing Vietnamese story.

**Request Body:**

```json
{
  "story_content": "Một ngày đẹp trời, cô ấy quyết định đi du lịch...",
  "insertion_config": {
    "topic": "travel",
    "difficulty": "beginner",
    "insertion_count": 8
  }
}
```

#### Batch Generate Stories

```http
POST /api/v1/batch-generate-stories?parallel=true&max_workers=3
```

Generate multiple stories with word insertion in parallel.

**Request Body:**

```json
{
  "requests": [
    {
      "prompt": "Story about technology",
      "insertion_config": {
        "topic": "technology",
        "difficulty": "intermediate"
      }
    },
    {
      "prompt": "Story about travel",
      "insertion_config": { "topic": "travel", "difficulty": "beginner" }
    }
  ]
}
```

### Vocabulary Management

#### Get Vocabulary by Topic

```http
GET /api/v1/vocabulary/{topic}/{difficulty}?limit=20
```

Retrieve vocabulary words filtered by topic and difficulty.

**Example:**

```bash
curl http://localhost:8000/api/v1/vocabulary/technology/intermediate?limit=10
```

#### Semantic Vocabulary Search

```http
POST /api/v1/vocabulary/search
```

Search for vocabulary using natural language queries with semantic matching.

**Request Body:**

```json
{
  "query": "words related to computers and programming",
  "n_results": 10,
  "topic_filter": "technology",
  "difficulty_filter": "intermediate"
}
```

#### Batch Add Vocabulary

```http
POST /api/v1/vocabulary/batch-add
```

Add multiple vocabulary words at once.

**Request Body:**

```json
{
  "words": [
    {
      "word": "algorithm",
      "definition": "A step-by-step procedure",
      "vietnamese_translation": "thuật toán",
      "part_of_speech": "noun",
      "topic": "technology",
      "difficulty": "advanced",
      "example": "The algorithm solves the problem efficiently"
    }
  ]
}
```

### Other Endpoints

- `GET /` - Root endpoint with API information
- `GET /health` - Health check
- `POST /api/v1/generate-story` - Generate story without word insertion
- `POST /api/v1/chat` - General AI conversation
- `POST /api/v1/generate-itinerary` - Generate travel itinerary
- `POST /api/v1/batch-itinerary` - Batch itinerary generation

## Configuration

### Environment Variables

Set environment variables with `AIAPI_` prefix in your `.env` file:

#### Required Variables

```bash
# Azure OpenAI Configuration
AIAPI_AZURE_ENDPOINT=https://your-endpoint.openai.azure.com/
AIAPI_AZURE_API_KEY=your-api-key-here
AIAPI_AZURE_DEPLOYMENT_NAME=GPT-4o
```

#### Optional Variables

```bash
# Vocabulary Settings
AIAPI_DEFAULT_VOCABULARY_TOPIC=general
AIAPI_DEFAULT_INSERTION_COUNT=10
AIAPI_MAX_INSERTION_COUNT=20
AIAPI_MIN_POSITION_SCORE=0.7

# ChromaDB Settings
AIAPI_VOCABULARY_COLLECTION_NAME=vocabulary
AIAPI_CHROMADB_PATH=./chroma_data

# Rate Limiting
AIAPI_RATE_LIMIT_ENABLED=true
AIAPI_RATE_LIMIT_REQUESTS_PER_MINUTE=60
AIAPI_RATE_LIMIT_BURST_SIZE=10

# Retry Settings
AIAPI_RETRY_MAX_ATTEMPTS=5
AIAPI_RETRY_MIN_WAIT_SECONDS=1
AIAPI_RETRY_MAX_WAIT_SECONDS=10

# Batch Processing
AIAPI_BATCH_MAX_WORKERS=3
AIAPI_BATCH_EMBEDDING_SIZE=10
```

## Usage Examples

### Example 1: Generate a Story with Word Insertion

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/generate-story-with-insertion",
    json={
        "prompt": "A story about a young entrepreneur starting a tech company",
        "config": {
            "length": "medium",
            "style": "inspirational",
            "tone": "professional"
        },
        "insertion_config": {
            "topic": "business",
            "difficulty": "intermediate",
            "insertion_count": 12,
            "bold_format": True,
            "show_translation": True
        }
    }
)

result = response.json()
print(f"Title: {result['title']}")
print(f"Story: {result['enhanced_content']}")
print(f"Insertions: {result['metrics']['total_insertions']}")
print(f"Readability: {result['metrics']['readability_score']}")
```

### Example 2: Search for Vocabulary

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/vocabulary/search",
    json={
        "query": "words about learning and education",
        "n_results": 5,
        "difficulty_filter": "beginner"
    }
)

words = response.json()
for word in words:
    print(f"{word['word']}: {word['vietnamese_translation']}")
```

### Example 3: Enhance Existing Story

```python
import requests

story = """
Hôm nay tôi đi làm bằng xe buýt. Trên đường, tôi đọc một cuốn sách
về công nghệ. Buổi chiều, tôi có một cuộc họp quan trọng với khách hàng.
"""

response = requests.post(
    "http://localhost:8000/api/v1/enhance-story",
    json={
        "story_content": story,
        "insertion_config": {
            "topic": "daily life",
            "difficulty": "beginner",
            "insertion_count": 5
        }
    }
)

result = response.json()
print(result['enhanced_content'])
```

## Project Structure

```
aiapi/
├── src/
│   └── aiapi/
│       ├── __init__.py
│       ├── main.py                    # FastAPI app entry point
│       ├── config.py                  # Configuration settings
│       ├── models.py                  # Pydantic models
│       ├── exceptions.py              # Custom exceptions
│       ├── logging_config.py          # Logging configuration
│       ├── routers/                   # API route handlers
│       │   ├── __init__.py
│       │   ├── word_insertion.py      # Word insertion routes
│       │   ├── story.py               # Story generation routes
│       │   ├── chat.py                # Chat/conversation routes
│       │   ├── itinerary.py           # Travel itinerary routes
│       │   └── tts.py                 # Text-to-speech routes
│       ├── services/                  # Business logic
│       │   ├── __init__.py
│       │   ├── vocabulary_service.py  # Vocabulary management
│       │   ├── word_insertion_service.py  # Word insertion logic
│       │   ├── story_enhancement_service.py  # Story enhancement
│       │   ├── chromadb_service.py    # ChromaDB integration
│       │   ├── story_service.py       # Story generation
│       │   ├── chat_service.py        # Chat functionality
│       │   ├── openai_service.py      # OpenAI integration
│       │   └── tts_service.py         # Text-to-speech
│       ├── middleware/                # Middleware components
│       │   └── rate_limiter.py        # Rate limiting
│       └── utils/                     # Utility functions
│           └── error_handler.py       # Error handling
├── scripts/                           # Utility scripts
│   ├── init_vocabulary.py             # Initialize vocabulary DB
│   └── import_vocabulary.py           # Import vocabulary data
├── data/                              # Data files
│   ├── sample_vocabulary.json         # Sample vocabulary data
│   └── sample_stories.json            # Sample stories
├── tests/                             # Test files
│   ├── fixtures/                      # Test fixtures
│   └── ...
├── chroma_data/                       # ChromaDB persistent storage
├── run.py                             # Simple run script
├── pyproject.toml                     # Project configuration
└── README.md                          # This file
```

## Key Features Explained

### English Word Insertion

The word insertion feature intelligently adds English vocabulary to Vietnamese stories for language learning:

1. **Grammar Analysis**: Uses Azure OpenAI to analyze Vietnamese sentence structure
2. **Position Detection**: Identifies natural insertion points (noun phrases, verb phrases, adjectives)
3. **Semantic Matching**: Selects contextually relevant vocabulary using vector embeddings
4. **Quality Scoring**: Each insertion is scored for grammatical correctness and readability
5. **Formatting**: Inserted words are **bolded** with Vietnamese translations in parentheses

Example output:

```
Tôi đang học **programming (lập trình)** để trở thành một **developer (lập trình viên)**
giỏi. Mỗi ngày tôi thực hành **coding (viết mã)** và đọc **documentation (tài liệu)**.
```

### Vocabulary Management

- **Organized by Topic**: technology, business, education, daily life, travel, etc.
- **Difficulty Levels**: beginner, intermediate, advanced
- **Rich Metadata**: Includes definitions, translations, IPA pronunciation, examples
- **Semantic Search**: Find vocabulary using natural language queries
- **Vector Embeddings**: Powered by Azure OpenAI text-embedding-3-small model

### Quality Assurance

- **Readability Validation**: Ensures stories maintain a minimum readability score (default: 60)
- **Context Relevance**: Filters words with relevance score < 0.8
- **Grammar Validation**: Validates Vietnamese grammar after insertion
- **Automatic Regeneration**: Low-quality stories are automatically regenerated

### Batch Processing

- Process up to 10 stories in a single request
- Parallel execution with configurable workers
- Exponential backoff retry logic
- Partial results on failures
- Rate limiting to prevent API quota issues

## Integration with Next.js Frontend

The Python API is designed to work seamlessly with the Next.js story application. The frontend uses the `/src/lib/aiapi.ts` client to communicate with this Python backend for:

- Story generation with word insertion
- Vocabulary search and management
- Text-to-speech functionality
- Chat/conversation features

## Troubleshooting

### ChromaDB Connection Issues

If you encounter ChromaDB connection errors:

```bash
# Delete and reinitialize the database
rm -rf chroma_data/
python -m aiapi.scripts.init_vocabulary
```

### Azure OpenAI Rate Limits

If you hit rate limits:

1. Adjust rate limiting settings in `.env`:

   ```bash
   AIAPI_RATE_LIMIT_REQUESTS_PER_MINUTE=30
   AIAPI_BATCH_MAX_WORKERS=2
   ```

2. Increase retry wait times:
   ```bash
   AIAPI_RETRY_MAX_WAIT_SECONDS=20
   ```

### Vocabulary Not Found

If vocabulary searches return empty results:

```bash
# Check vocabulary statistics
python -c "from src.aiapi.services.vocabulary_service import get_vocabulary_stats; print(get_vocabulary_stats())"

# Reinitialize if needed
python -m aiapi.scripts.init_vocabulary
```

## Testing

Run tests with pytest:

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_vocabulary_service.py

# Run with coverage
pytest --cov=src/aiapi tests/
```

## Development

### Adding New Vocabulary Topics

1. Add vocabulary to `data/sample_vocabulary.json` or create a new JSON file
2. Import using the import script:
   ```bash
   python -m aiapi.scripts.import_vocabulary --file new_vocab.json
   ```

### Customizing Word Insertion Logic

Edit `src/aiapi/services/word_insertion_service.py` to modify:

- Position detection algorithm
- Word selection criteria
- Insertion formatting
- Scoring logic

### Adjusting Quality Thresholds

Modify settings in `src/aiapi/config.py`:

```python
min_position_score: float = 0.7  # Minimum score for insertion positions
default_insertion_count: int = 10  # Default number of insertions
max_insertion_count: int = 20  # Maximum allowed insertions
```

## API Documentation

Once the server is running, visit:

- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## Contributing

When adding new features:

1. Follow the existing code structure
2. Add appropriate error handling
3. Include logging for debugging
4. Write tests for new functionality
5. Update this README with usage examples

## License

[Your License Here]
