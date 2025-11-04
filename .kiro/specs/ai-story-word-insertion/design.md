# Design Document

## Overview

Hệ thống AI Story with English Word Insertion được thiết kế để tích hợp vào aiapi backend hiện có, sử dụng Azure OpenAI cho NLP tasks và ChromaDB cho vector storage. Hệ thống bao gồm 3 components chính: Vocabulary Service, Word Insertion Service, và Story Enhancement Service.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│                    (localhost:3000)                          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (aiapi)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Story      │  │  Vocabulary  │  │  Insertion   │     │
│  │   Router     │  │   Router     │  │   Router     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │           Word Insertion Service                    │    │
│  │  - Grammar Analysis                                 │    │
│  │  - Position Detection                               │    │
│  │  - Word Selection                                   │    │
│  └──────┬──────────────────┬──────────────────┬───────┘    │
│         │                  │                  │              │
│  ┌──────▼───────┐   ┌─────▼──────┐   ┌──────▼───────┐    │
│  │  Vocabulary  │   │   Story    │   │   ChromaDB   │    │
│  │   Service    │   │  Service   │   │   Service    │    │
│  └──────┬───────┘   └─────┬──────┘   └──────┬───────┘    │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
│  Azure OpenAI   │  │  Azure OpenAI│  │   ChromaDB   │
│  (Embeddings)   │  │   (GPT-4o)   │  │  (Persistent)│
└─────────────────┘  └──────────────┘  └──────────────┘
```

### Data Flow

#### Story Generation with Word Insertion Flow

```
1. User Request → FastAPI Router
2. Router → Word Insertion Service
3. Word Insertion Service:
   a. Generate base story (Azure OpenAI GPT-4o)
   b. Analyze grammar and find insertion positions
   c. Select appropriate vocabulary from Vocabulary Service
   d. Insert words at identified positions
   e. Generate glossary
4. Story Service → Save to ChromaDB with embeddings
5. Return enhanced story to user
```

#### Semantic Search Flow

```
1. User Query → Search Router
2. Generate query embedding (Azure OpenAI)
3. ChromaDB vector search
4. Return ranked results with metadata
```

## Components and Interfaces

### 1. Vocabulary Service

**Purpose**: Quản lý từ vựng tiếng Anh với metadata và embeddings

**Location**: `aiapi/src/aiapi/services/vocabulary_service.py`

**Key Functions**:

```python
def initialize_vocabulary_database() -> bool:
    """Initialize vocabulary database with sample data"""

def add_vocabulary(
    word: str,
    definition: str,
    part_of_speech: str,
    topic: str,
    difficulty: str,
    example: str
) -> bool:
    """Add a vocabulary word to ChromaDB"""

def get_vocabulary_by_topic(
    topic: str,
    difficulty: str,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """Get vocabulary words by topic and difficulty"""

def search_vocabulary_semantic(
    query: str,
    n_results: int = 10
) -> List[Dict[str, Any]]:
    """Semantic search for vocabulary words"""
```

**ChromaDB Collection**: `vocabulary`

- Embeddings: Word + definition + example
- Metadata: word, definition, pos, topic, difficulty, ipa

### 2. Word Insertion Service

**Purpose**: Phân tích câu và chêm từ tiếng Anh vào vị trí phù hợp

**Location**: `aiapi/src/aiapi/services/word_insertion_service.py`

**Key Functions**:

```python
def analyze_sentence_structure(
    sentence: str
) -> List[InsertionPosition]:
    """Analyze Vietnamese sentence to find insertion positions"""

def select_vocabulary_for_insertion(
    topic: str,
    difficulty: str,
    count: int,
    context: str
) -> List[VocabularyWord]:
    """Select appropriate vocabulary for insertion"""

def insert_words_into_story(
    story: str,
    vocabulary: List[VocabularyWord],
    positions: List[InsertionPosition]
) -> str:
    """Insert English words into story at specified positions"""

def generate_glossary(
    inserted_words: List[VocabularyWord]
) -> List[Dict[str, str]]:
    """Generate glossary for inserted words"""
```

**Algorithm for Position Detection**:

1. Split story into sentences
2. For each sentence, use Azure OpenAI to identify:
   - Noun phrases (danh từ)
   - Verb phrases (động từ)
   - Adjective positions (tính từ)
3. Score each position based on:
   - Grammatical correctness (0-1)
   - Readability impact (0-1)
   - Context relevance (0-1)
4. Select top N positions with score > 0.7

### 3. Story Enhancement Service

**Purpose**: Tạo và enhance stories với word insertion

**Location**: `aiapi/src/aiapi/services/story_enhancement_service.py`

**Key Functions**:

```python
def generate_story_with_insertion(
    request: StoryInsertionRequest
) -> StoryInsertionResponse:
    """Generate a new story with English word insertion"""

def enhance_existing_story(
    story_id: str,
    insertion_config: InsertionConfig
) -> StoryInsertionResponse:
    """Add English words to an existing story"""

def calculate_insertion_metrics(
    original: str,
    enhanced: str
) -> InsertionMetrics:
    """Calculate metrics for word insertion quality"""
```

### 4. API Routers

**Location**: `aiapi/src/aiapi/routers/word_insertion.py`

**Endpoints**:

```python
POST /api/v1/generate-story-with-insertion
- Generate new story with word insertion
- Request: StoryInsertionRequest
- Response: StoryInsertionResponse

POST /api/v1/enhance-story
- Add word insertion to existing story
- Request: StoryEnhancementRequest
- Response: StoryInsertionResponse

GET /api/v1/vocabulary/{topic}/{difficulty}
- Get vocabulary by topic and difficulty
- Response: List[VocabularyWord]

POST /api/v1/vocabulary/search
- Semantic search for vocabulary
- Request: VocabularySearchRequest
- Response: List[VocabularyWord]

POST /api/v1/vocabulary/batch-add
- Batch add vocabulary words
- Request: BatchVocabularyRequest
- Response: BatchVocabularyResponse
```

## Data Models

### Pydantic Models

**Location**: `aiapi/src/aiapi/models.py` (extend existing)

```python
class VocabularyWord(BaseModel):
    word: str
    definition: str
    vietnamese_translation: str
    part_of_speech: Literal["noun", "verb", "adjective", "adverb", "phrase"]
    topic: str
    difficulty: Literal["beginner", "intermediate", "advanced"]
    example: str
    ipa: Optional[str] = None

class InsertionPosition(BaseModel):
    sentence_index: int
    word_index: int
    position_type: Literal["noun", "verb", "adjective", "phrase"]
    score: float
    context: str

class InsertionConfig(BaseModel):
    topic: str = "general"
    difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate"
    insertion_count: int = Field(10, ge=5, le=20)
    bold_format: bool = True
    show_translation: bool = True

class StoryInsertionRequest(BaseModel):
    prompt: str
    config: Optional[StoryConfig] = None
    preferences: Optional[StoryPreferences] = None
    insertion_config: InsertionConfig

class InsertionMetrics(BaseModel):
    total_insertions: int
    insertion_density: float  # insertions per 100 words
    avg_position_score: float
    readability_score: int
    language_ratio: Dict[str, int]

class StoryInsertionResponse(BaseModel):
    title: str
    original_content: str
    enhanced_content: str
    inserted_words: List[VocabularyWord]
    glossary: List[Dict[str, str]]
    metrics: InsertionMetrics
    metadata: StoryMetadata
    error: Optional[str] = None
```

### ChromaDB Collections

#### 1. `vocabulary` Collection

```python
{
    "id": "vocab_001",
    "embedding": [0.123, 0.456, ...],  # 1536 dimensions
    "document": "technology: A laptop is a portable computer...",
    "metadata": {
        "word": "laptop",
        "definition": "A portable computer",
        "vietnamese": "máy tính xách tay",
        "pos": "noun",
        "topic": "technology",
        "difficulty": "beginner",
        "example": "I use my laptop for work",
        "ipa": "/ˈlæp.tɑːp/"
    }
}
```

#### 2. `stories` Collection (extend existing)

Add new metadata fields:

```python
{
    "metadata": {
        # ... existing fields ...
        "has_insertion": True,
        "insertion_count": 12,
        "insertion_topics": ["technology", "business"],
        "insertion_difficulty": "intermediate"
    }
}
```

## Error Handling

### Error Types and Handling Strategy

1. **Azure OpenAI API Errors**

   - RateLimitError: Retry with exponential backoff (max 5 attempts)
   - APIError: Retry once, then return error to user
   - Timeout: Set 30s timeout, return partial results if available

2. **ChromaDB Errors**

   - Connection Error: Graceful degradation, use in-memory fallback
   - Query Error: Log error, return empty results
   - Write Error: Retry once, log failure

3. **Validation Errors**

   - Invalid vocabulary data: Return 400 with detailed message
   - Invalid insertion config: Return 400 with validation errors
   - Missing required fields: Return 422 with field details

4. **Business Logic Errors**
   - No suitable insertion positions: Return story without insertions + warning
   - Vocabulary not found: Use fallback vocabulary list
   - Low quality score: Regenerate with adjusted parameters

### Error Response Format

```python
{
    "error": "Error message",
    "error_type": "validation_error",
    "details": {
        "field": "insertion_count",
        "message": "Must be between 5 and 20"
    },
    "partial_result": {...}  # If applicable
}
```

## Testing Strategy

### Unit Tests

**Location**: `aiapi/tests/services/`

1. **test_vocabulary_service.py**

   - Test vocabulary CRUD operations
   - Test semantic search accuracy
   - Test embedding generation

2. **test_word_insertion_service.py**

   - Test position detection algorithm
   - Test word selection logic
   - Test insertion formatting

3. **test_story_enhancement_service.py**
   - Test story generation with insertion
   - Test metrics calculation
   - Test glossary generation

### Integration Tests

**Location**: `aiapi/tests/integration/`

1. **test_word_insertion_api.py**

   - Test end-to-end story generation
   - Test batch processing
   - Test error handling

2. **test_chromadb_integration.py**
   - Test vocabulary storage and retrieval
   - Test story search with insertion filters

### Test Data

**Location**: `aiapi/tests/fixtures/`

1. **vocabulary_samples.json**

   - 100 sample vocabulary words across topics
   - All difficulty levels represented

2. **story_samples.json**
   - 10 Vietnamese stories for testing
   - Various lengths and topics

### Performance Tests

**Targets**:

- Story generation with insertion: < 5s
- Vocabulary search: < 100ms
- Batch processing (10 stories): < 30s
- ChromaDB query: < 50ms

## Integration with Existing System

### Reuse Existing Components

1. **ChromaDB Service** (`chromadb_service.py`)

   - Extend with vocabulary collection
   - Reuse embedding generation
   - Reuse search functions

2. **Story Service** (`story_service.py`)

   - Extend with insertion logic
   - Reuse story generation
   - Reuse metadata calculation

3. **Config** (`config.py`)

   - Reuse Azure OpenAI credentials
   - Add vocabulary-specific settings

4. **Main App** (`main.py`)
   - Add new routers
   - Reuse CORS configuration
   - Reuse middleware

### New Components to Add

1. **Vocabulary Service** (new)
2. **Word Insertion Service** (new)
3. **Story Enhancement Service** (new)
4. **Word Insertion Router** (new)

### Configuration Updates

**Add to `config.py`**:

```python
class Settings(BaseSettings):
    # ... existing settings ...

    # Vocabulary settings
    default_vocabulary_topic: str = "general"
    default_insertion_count: int = 10
    max_insertion_count: int = 20
    min_position_score: float = 0.7

    # ChromaDB settings
    vocabulary_collection_name: str = "vocabulary"
```

## Performance Optimization

### Caching Strategy

1. **Vocabulary Cache**

   - Cache frequently used vocabulary by topic
   - TTL: 1 hour
   - Invalidate on vocabulary updates

2. **Embedding Cache**

   - Cache embeddings for common queries
   - TTL: 24 hours
   - Max size: 1000 entries

3. **Position Analysis Cache**
   - Cache sentence structure analysis
   - TTL: 1 hour
   - Key: sentence hash

### Batch Processing Optimization

1. **Parallel Processing**

   - Process multiple stories concurrently
   - Max 5 concurrent requests to Azure OpenAI
   - Use asyncio for I/O operations

2. **Embedding Batch Generation**
   - Generate embeddings in batches of 10
   - Reduces API calls by 90%

## Security Considerations

1. **API Key Protection**

   - Store Azure OpenAI keys in environment variables
   - Never expose keys in responses
   - Rotate keys regularly

2. **Input Validation**

   - Sanitize all user inputs
   - Limit story length to 5000 words
   - Validate vocabulary data format

3. **Rate Limiting**
   - Implement per-user rate limits
   - Max 100 requests per hour per user
   - Max 10 batch requests per hour

## Deployment Considerations

### Dependencies

Add to `pyproject.toml`:

```toml
[tool.poetry.dependencies]
# ... existing dependencies ...
spacy = "^3.7.0"  # For NLP analysis (optional)
langdetect = "^1.0.9"  # For language detection
```

### Environment Variables

```bash
# Existing
AZURE_OPENAI_API_KEY=xxx
AZURE_OPENAI_ENDPOINT=xxx

# New (optional)
VOCABULARY_CACHE_TTL=3600
MAX_INSERTION_COUNT=20
MIN_POSITION_SCORE=0.7
```

### Database Initialization

```bash
# Initialize vocabulary database
python -m aiapi.scripts.init_vocabulary

# Import vocabulary from CSV
python -m aiapi.scripts.import_vocabulary --file vocab.csv
```

## Future Enhancements

1. **Advanced NLP**

   - Integrate spaCy for better grammar analysis
   - Support more languages beyond Vietnamese

2. **Personalization**

   - Track user vocabulary progress
   - Adaptive difficulty adjustment
   - Personalized word recommendations

3. **Interactive Features**

   - Click-to-hear pronunciation
   - Interactive quizzes
   - Progress tracking

4. **Content Generation**
   - Generate stories based on vocabulary lists
   - Create themed story collections
   - Auto-generate practice exercises
