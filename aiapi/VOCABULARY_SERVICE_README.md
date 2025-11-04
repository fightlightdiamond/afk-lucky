# Vocabulary Service Documentation

## Overview

The Vocabulary Service manages English vocabulary words with Vietnamese translations, storing them in ChromaDB with embeddings for semantic search. This service is part of the AI Story with English Word Insertion feature.

## Components

### 1. Vocabulary Service (`src/aiapi/services/vocabulary_service.py`)

Core service providing vocabulary management functionality:

#### Key Functions

- **`initialize_vocabulary_database()`**: Initialize the vocabulary collection in ChromaDB
- **`add_vocabulary()`**: Add a single vocabulary word with embedding
- **`get_vocabulary_by_topic()`**: Retrieve words filtered by topic and difficulty
- **`search_vocabulary_semantic()`**: Semantic search using embeddings
- **`batch_add_vocabulary()`**: Add multiple words in batch
- **`get_vocabulary_stats()`**: Get collection statistics
- **`delete_vocabulary()`**: Remove a vocabulary word

### 2. Sample Vocabulary Data (`data/sample_vocabulary.json`)

JSON file containing 60 sample vocabulary words covering:

- **Topics**: technology, business, education, daily life, travel
- **Difficulty Levels**: beginner (20 words), intermediate (20 words), advanced (20 words)
- **Distribution**: 12 words per topic, evenly distributed across difficulty levels

### 3. Initialization Script (`scripts/init_vocabulary.py`)

Script to initialize the vocabulary database with sample data:

```bash
# Run from aiapi directory
python scripts/init_vocabulary.py

# Or as a module
python -m aiapi.scripts.init_vocabulary
```

**Features**:

- Creates vocabulary collection in ChromaDB
- Loads sample vocabulary from JSON
- Generates embeddings using Azure OpenAI
- Provides detailed progress and error reporting

### 4. Import Script (`scripts/import_vocabulary.py`)

Script to import vocabulary from CSV or JSON files:

```bash
# Import from JSON
python scripts/import_vocabulary.py --file vocab.json

# Import from CSV
python scripts/import_vocabulary.py --file vocab.csv

# Skip validation
python scripts/import_vocabulary.py --file vocab.json --no-validate
```

**CSV Format**:

```csv
word,definition,vietnamese_translation,part_of_speech,topic,difficulty,example,ipa
laptop,A portable computer,máy tính xách tay,noun,technology,beginner,I use my laptop for work,/ˈlæp.tɑːp/
```

## Data Model

### VocabularyWord (Pydantic Model)

```python
{
    "word": str,                      # English word
    "definition": str,                # English definition
    "vietnamese_translation": str,    # Vietnamese translation
    "part_of_speech": str,           # noun, verb, adjective, adverb, phrase
    "topic": str,                    # technology, business, education, etc.
    "difficulty": str,               # beginner, intermediate, advanced
    "example": str,                  # Example sentence
    "ipa": str (optional)            # IPA pronunciation notation
}
```

### ChromaDB Storage

Each vocabulary word is stored with:

- **ID**: `vocab_{topic}_{difficulty}_{word}`
- **Embedding**: 1536-dimensional vector from Azure OpenAI text-embedding-3-small
- **Document**: `"{topic}: {word} - {definition}. Example: {example}"`
- **Metadata**: All word fields (word, definition, vietnamese, pos, topic, difficulty, example, ipa)

## Usage Examples

### Adding Vocabulary

```python
from aiapi.services.vocabulary_service import add_vocabulary

success = add_vocabulary(
    word="laptop",
    definition="A portable computer",
    vietnamese_translation="máy tính xách tay",
    part_of_speech="noun",
    topic="technology",
    difficulty="beginner",
    example="I use my laptop for work",
    ipa="/ˈlæp.tɑːp/"
)
```

### Retrieving by Topic and Difficulty

```python
from aiapi.services.vocabulary_service import get_vocabulary_by_topic

words = get_vocabulary_by_topic(
    topic="technology",
    difficulty="beginner",
    limit=10
)

for word in words:
    print(f"{word['metadata']['word']}: {word['metadata']['vietnamese']}")
```

### Semantic Search

```python
from aiapi.services.vocabulary_service import search_vocabulary_semantic

results = search_vocabulary_semantic(
    query="computer and internet",
    n_results=5,
    topic="technology"
)

for result in results:
    word = result['metadata']['word']
    score = result['similarity_score']
    print(f"{word} (similarity: {score:.2f})")
```

### Batch Import

```python
from aiapi.models import VocabularyWord
from aiapi.services.vocabulary_service import batch_add_vocabulary

words = [
    VocabularyWord(
        word="laptop",
        definition="A portable computer",
        vietnamese_translation="máy tính xách tay",
        part_of_speech="noun",
        topic="technology",
        difficulty="beginner",
        example="I use my laptop for work",
        ipa="/ˈlæp.tɑːp/"
    ),
    # ... more words
]

result = batch_add_vocabulary(words)
print(f"Success: {result['success_count']}, Failed: {result['failed_count']}")
```

## Requirements

### Environment Variables

```bash
# Required for embedding generation
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_ENDPOINT=your_endpoint

# Optional configuration
AIAPI_vocabulary_collection_name=vocabulary
AIAPI_chromadb_path=./chroma_data
```

### Dependencies

- `chromadb`: Vector database
- `openai`: Azure OpenAI client
- `pydantic`: Data validation

## Testing

### Run Service Tests

```bash
# Test service functionality (no Azure OpenAI required)
python test_vocabulary_service.py
```

### Test with Sample Data

```bash
# Initialize with sample data (requires Azure OpenAI)
python scripts/init_vocabulary.py
```

## Implementation Details

### Embedding Generation

Embeddings are created from a combination of:

- Topic
- Word
- Definition
- Example sentence

Format: `"{topic}: {word} - {definition}. Example: {example}"`

This provides rich context for semantic search.

### Error Handling

The service handles:

- Missing Azure OpenAI credentials (graceful degradation)
- ChromaDB connection errors
- Invalid vocabulary data
- Duplicate word entries

### Performance

- **Vocabulary Search**: < 100ms (target)
- **Embedding Generation**: ~200ms per word
- **Batch Import**: Processes words sequentially with progress reporting

## Integration

### With Story Service

The vocabulary service integrates with the story enhancement service to:

1. Select appropriate vocabulary for insertion
2. Provide context-relevant words
3. Generate glossaries

### With API Endpoints

Vocabulary endpoints (to be implemented in task 5):

- `GET /api/v1/vocabulary/{topic}/{difficulty}`: Get vocabulary by filters
- `POST /api/v1/vocabulary/search`: Semantic search
- `POST /api/v1/vocabulary/batch-add`: Batch import

## Future Enhancements

1. **Caching**: Add vocabulary cache for frequently accessed words
2. **Analytics**: Track word usage and popularity
3. **User Vocabulary**: Support user-specific vocabulary lists
4. **Pronunciation**: Add audio pronunciation files
5. **Synonyms**: Link related words and synonyms
6. **Progress Tracking**: Track which words users have learned

## Troubleshooting

### Issue: "Azure OpenAI credentials not set"

**Solution**: Set environment variables:

```bash
export AZURE_OPENAI_API_KEY=your_key
export AZURE_OPENAI_ENDPOINT=your_endpoint
```

### Issue: "Failed to create embedding"

**Possible causes**:

- Invalid API credentials
- Network connectivity issues
- API rate limits exceeded

**Solution**: Check credentials and retry with exponential backoff

### Issue: "ChromaDB collection not found"

**Solution**: Run initialization:

```bash
python scripts/init_vocabulary.py
```

## References

- [ChromaDB Documentation](https://docs.trychroma.com/)
- [Azure OpenAI Embeddings](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/embeddings)
- [Design Document](.kiro/specs/ai-story-word-insertion/design.md)
- [Requirements Document](.kiro/specs/ai-story-word-insertion/requirements.md)
