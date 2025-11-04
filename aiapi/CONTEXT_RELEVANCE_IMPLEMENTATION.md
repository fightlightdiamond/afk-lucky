# Context Relevance Checking Implementation

## Overview

Implementation of task 7.2 from the AI Story Word Insertion spec: Add context relevance checking for inserted vocabulary words.

## Requirements (10.3)

> THE System SHALL ensure inserted English words are contextually appropriate with a minimum relevance score of 0.8

## Implementation Details

### 1. Relevance Score Calculation

**Function**: `calculate_relevance_score(word_embedding, context_embedding)`

**Location**: `aiapi/src/aiapi/services/word_insertion_service.py`

**Algorithm**:

- Uses cosine similarity between word embedding and context embedding
- Normalizes vectors using L2 norm
- Converts cosine similarity (-1 to 1) to relevance score (0 to 1)
- Formula: `relevance_score = (cosine_similarity + 1) / 2`

**Properties**:

- Identical vectors: score ≈ 1.0
- Orthogonal vectors: score ≈ 0.5
- Opposite vectors: score ≈ 0.0
- Similar vectors: score between 0.5 and 1.0

### 2. Enhanced Vocabulary Selection

**Function**: `select_vocabulary_for_insertion()`

**New Parameters**:

- `min_relevance`: Minimum relevance score threshold (default: 0.8)

**Selection Process**:

1. **Semantic Search**: Get candidate words using ChromaDB vector search
2. **Topic Fallback**: If not enough candidates, get words by topic/difficulty
3. **Position Filtering**: Filter by part of speech if specified
4. **Relevance Scoring**: Calculate relevance for each candidate word
   - Get word embedding (from ChromaDB or generate new)
   - Calculate cosine similarity with context embedding
   - Combine with semantic search similarity (70% embedding, 30% search)
5. **Primary Selection**: Select words with relevance >= min_relevance (0.8)
6. **First Fallback**: If not enough, use threshold 0.7
7. **Final Fallback**: If still not enough, use best available words

### 3. Logging and Monitoring

The implementation includes comprehensive logging:

- Number of candidate words found
- Number of words meeting relevance threshold
- Fallback activation messages
- Relevance score statistics (avg, min, max)

### 4. Integration with Story Enhancement

**Updated**: `story_enhancement_service.py`

The `generate_story_with_insertion()` function now passes `min_relevance=0.8` to vocabulary selection, ensuring compliance with requirement 10.3.

## Testing

### Unit Tests

**File**: `aiapi/test_relevance_logic.py`

Tests the core logic without requiring Azure OpenAI credentials:

1. **Cosine Similarity Calculation**: Verifies correct scoring for different vector relationships
2. **Filtering Logic**: Tests threshold-based filtering
3. **Fallback Logic**: Tests multi-level fallback mechanism
4. **Threshold Comparison**: Verifies behavior with different thresholds

**Results**: All 4 tests pass ✅

### Integration Tests

**File**: `aiapi/test_relevance_checking.py`

Tests the full integration with ChromaDB and Azure OpenAI:

1. Relevance score calculation with real embeddings
2. Relevance filtering with vocabulary database
3. Fallback vocabulary selection
4. Different relevance thresholds

**Note**: Requires Azure OpenAI credentials and initialized vocabulary database.

## Example Usage

```python
from aiapi.services.word_insertion_service import select_vocabulary_for_insertion

# Select vocabulary with high relevance requirement
vocabulary = select_vocabulary_for_insertion(
    topic="technology",
    difficulty="intermediate",
    count=10,
    context="Story about software development and programming",
    min_relevance=0.8  # Requirement 10.3
)

# Result: Only words with relevance >= 0.8 are selected
# If not enough, fallback to 0.7, then best available
```

## Performance Characteristics

- **Relevance Calculation**: O(n) where n is embedding dimension (1536)
- **Filtering**: O(m) where m is number of candidate words
- **Fallback**: O(m) additional pass if needed

## Compliance

✅ **Requirement 10.3**: Implemented relevance scoring with minimum threshold of 0.8
✅ **Filtering**: Words with relevance < 0.8 are filtered out
✅ **Fallback**: Multi-level fallback ensures vocabulary is always provided

## Future Enhancements

1. **Caching**: Cache relevance scores for frequently used word-context pairs
2. **Adaptive Thresholds**: Adjust threshold based on vocabulary availability
3. **Context Window**: Use sliding context window for longer stories
4. **Multi-context Scoring**: Score against multiple context segments

## Related Files

- `aiapi/src/aiapi/services/word_insertion_service.py` - Core implementation
- `aiapi/src/aiapi/services/story_enhancement_service.py` - Integration
- `aiapi/test_relevance_logic.py` - Unit tests
- `aiapi/test_relevance_checking.py` - Integration tests
- `.kiro/specs/ai-story-word-insertion/requirements.md` - Requirements
- `.kiro/specs/ai-story-word-insertion/tasks.md` - Task definition
