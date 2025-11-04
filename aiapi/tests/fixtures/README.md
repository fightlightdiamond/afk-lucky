# Test Fixtures for AI Story Word Insertion

This directory contains test fixtures and mock data for unit and integration tests.

## Files

### `vocabulary_fixtures.py`

Contains sample vocabulary data and helper functions for vocabulary-related tests.

**Key Components:**

- `SAMPLE_VOCABULARY_BEGINNER`: 3 beginner-level vocabulary words
- `SAMPLE_VOCABULARY_INTERMEDIATE`: 3 intermediate-level vocabulary words
- `SAMPLE_VOCABULARY_ADVANCED`: 3 advanced-level vocabulary words
- `ALL_SAMPLE_VOCABULARY`: Combined list of all sample vocabulary
- `SAMPLE_INSERTION_POSITIONS`: Example insertion positions for testing
- `SAMPLE_INSERTION_CONFIG`: Default insertion configuration
- `SAMPLE_GLOSSARY`: Example glossary entries
- `SAMPLE_INSERTION_METRICS`: Example metrics data

**Helper Functions:**

- `get_mock_chromadb_vocabulary_result()`: Generate mock ChromaDB query results
- `create_test_vocabulary()`: Create test vocabulary with specified parameters

### `story_fixtures.py`

Contains sample Vietnamese stories and story-related test data.

**Key Components:**

- `SAMPLE_STORY_SHORT`: Short Vietnamese story (~50 words)
- `SAMPLE_STORY_MEDIUM`: Medium Vietnamese story (~150 words)
- `SAMPLE_STORY_LONG`: Long Vietnamese story (~300 words)
- `SAMPLE_ENHANCED_STORY`: Story with English word insertions
- `SAMPLE_STORY_METADATA`: Story metadata examples
- `SAMPLE_SENTENCES`: Individual sentences for grammar analysis
- `SAMPLE_GRAMMAR_ANALYSIS`: Example grammar analysis results
- `TEST_SCENARIOS`: Pre-configured test scenarios

**Helper Functions:**

- `get_mock_chromadb_story_result()`: Generate mock ChromaDB story results
- `create_test_story()`: Create test story with specified parameters
- `split_into_sentences()`: Split story into sentences

### `mock_responses.py`

Contains mock API responses for external services (Azure OpenAI, ChromaDB).

**Key Components:**

- `MOCK_AZURE_OPENAI_EMBEDDING_RESPONSE`: Mock embedding API response
- `MOCK_AZURE_OPENAI_CHAT_RESPONSE`: Mock chat completion response
- `MOCK_GRAMMAR_ANALYSIS_RESPONSE`: Mock grammar analysis response
- `MOCK_CHROMADB_QUERY_RESPONSE`: Mock ChromaDB query response
- Error responses for various failure scenarios

**Helper Functions:**

- `create_mock_story_response()`: Create custom story response
- `create_mock_vocabulary_response()`: Create custom vocabulary response
- `create_mock_batch_response()`: Create batch processing response
- `create_custom_mock_response()`: Generic mock response creator

### `test_config.py`

Contains test configuration, constants, and environment setup.

**Key Components:**

- Test directory paths
- ChromaDB test settings
- Azure OpenAI test configuration
- API endpoints and timeouts
- Validation thresholds
- Performance targets
- Feature flags

**Helper Functions:**

- `get_test_config()`: Get complete test configuration
- `cleanup_test_data()`: Clean up test data after tests
- `setup_test_environment()`: Initialize test environment

## Usage Examples

### Using Vocabulary Fixtures

```python
from tests.fixtures.vocabulary_fixtures import (
    SAMPLE_VOCABULARY_BEGINNER,
    create_test_vocabulary,
    get_mock_chromadb_vocabulary_result
)

# Use pre-defined vocabulary
vocab = SAMPLE_VOCABULARY_BEGINNER[0]
assert vocab["word"] == "laptop"

# Create custom test vocabulary
test_vocab = create_test_vocabulary(
    count=5,
    difficulty="intermediate",
    topic="technology"
)

# Mock ChromaDB response
mock_result = get_mock_chromadb_vocabulary_result(test_vocab)
```

### Using Story Fixtures

```python
from tests.fixtures.story_fixtures import (
    SAMPLE_STORY_MEDIUM,
    create_test_story,
    TEST_SCENARIOS
)

# Use pre-defined story
story = SAMPLE_STORY_MEDIUM

# Create custom test story
test_story = create_test_story(length="long", topic="technology")

# Use test scenario
scenario = TEST_SCENARIOS["beginner_business"]
assert scenario["expected_insertions"] == 3
```

### Using Mock Responses

```python
from tests.fixtures.mock_responses import (
    MOCK_AZURE_OPENAI_CHAT_RESPONSE,
    create_mock_story_response
)

# Use pre-defined mock
mock_response = MOCK_AZURE_OPENAI_CHAT_RESPONSE

# Create custom mock response
custom_mock = create_mock_story_response(
    title="Test Story",
    content="Test content",
    insertion_count=10
)
```

### Using Test Configuration

```python
from tests.fixtures.test_config import (
    get_test_config,
    setup_test_environment,
    cleanup_test_data
)

# Setup test environment
setup_test_environment()

# Get configuration
config = get_test_config()
assert config["insertion"]["default_count"] == 10

# Cleanup after tests
cleanup_test_data()
```

## Test Data Files

The fixtures reference actual data files in `aiapi/data/`:

- `sample_vocabulary.json`: 100 vocabulary words across all topics and difficulties
- `sample_stories.json`: 10 Vietnamese stories for testing

## Best Practices

1. **Use fixtures instead of hardcoding test data** - This makes tests more maintainable
2. **Use helper functions to create variations** - Don't duplicate fixture data
3. **Mock external API calls** - Use mock responses instead of real API calls
4. **Clean up after tests** - Use `cleanup_test_data()` in teardown
5. **Use appropriate fixtures for test scope** - Use smaller fixtures for unit tests, larger for integration tests

## Adding New Fixtures

When adding new fixtures:

1. Add the fixture data to the appropriate file
2. Create helper functions if the fixture needs variations
3. Document the fixture in this README
4. Add usage examples
5. Update related test files to use the new fixture

## Maintenance

- Keep fixtures synchronized with actual data models
- Update mock responses when API contracts change
- Review and update test scenarios regularly
- Remove unused fixtures to keep the codebase clean
