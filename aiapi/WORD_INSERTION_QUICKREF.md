# Word Insertion Service - Quick Reference

## Import

```python
from aiapi.services.word_insertion_service import (
    analyze_sentence_structure,
    analyze_story_structure,
    select_vocabulary_for_insertion,
    insert_words_into_story,
    generate_glossary
)
from aiapi.models import InsertionPosition, VocabularyWord
```

## Functions

### 1. analyze_sentence_structure(sentence: str) → List[InsertionPosition]

Analyze a single Vietnamese sentence to find insertion positions.

```python
positions = analyze_sentence_structure("Hôm nay tôi đi học")
# Returns: [InsertionPosition(sentence_index=0, word_index=2, ...)]
```

### 2. analyze_story_structure(story: str) → List[InsertionPosition]

Analyze entire story across all sentences.

```python
story = "Hôm nay tôi đi học. Tôi gặp bạn bè."
positions = analyze_story_structure(story)
# Returns: List of positions across all sentences
```

### 3. select_vocabulary_for_insertion(...)

Select vocabulary words based on context and requirements.

```python
words = select_vocabulary_for_insertion(
    topic="technology",           # Vocabulary topic
    difficulty="intermediate",    # beginner/intermediate/advanced
    count=5,                      # Number of words to select
    context="story context",      # Story text for relevance
    position_type="noun"          # Optional: filter by POS
)
# Returns: List[VocabularyWord]
```

### 4. insert_words_into_story(...)

Insert English words into story at specified positions.

```python
enhanced = insert_words_into_story(
    story="Original story",
    vocabulary=[word1, word2],
    positions=[pos1, pos2],
    bold_format=True,            # Use **word** format
    show_translation=True        # Show (translation)
)
# Returns: "Enhanced story with **words** (translations)"
```

### 5. generate_glossary(inserted_words: List[VocabularyWord])

Generate glossary for inserted words.

```python
glossary = generate_glossary([word1, word2])
# Returns: [
#   {
#     "word": "computer",
#     "vietnamese": "máy tính",
#     "part_of_speech": "noun",
#     "definition": "...",
#     "pronunciation": "/kəmˈpjuːtər/",
#     "example": "..."
#   }
# ]
```

## Complete Example

```python
# 1. Analyze story
story = "Hôm nay tôi đi học và gặp bạn bè ở trường"
positions = analyze_story_structure(story)

# 2. Select vocabulary
vocabulary = select_vocabulary_for_insertion(
    topic="education",
    difficulty="beginner",
    count=3,
    context=story
)

# 3. Insert words
enhanced_story = insert_words_into_story(
    story=story,
    vocabulary=vocabulary,
    positions=positions[:3],  # Use first 3 positions
    bold_format=True,
    show_translation=True
)

# 4. Generate glossary
glossary = generate_glossary(vocabulary)

print(f"Original: {story}")
print(f"Enhanced: {enhanced_story}")
print(f"Glossary: {len(glossary)} entries")
```

## Configuration

Set in `config.py`:

```python
min_position_score: float = 0.7  # Minimum score for positions
max_insertion_count: int = 20    # Maximum insertions per story
```

## Error Handling

All functions return empty lists/original content on error:

```python
try:
    positions = analyze_story_structure(story)
except Exception as e:
    print(f"Error: {e}")
    positions = []  # Safe fallback
```

## Performance Tips

1. **Batch Processing**: Analyze multiple sentences in parallel
2. **Caching**: Cache position analysis for repeated sentences
3. **Limit Positions**: Use only top-scored positions
4. **Async**: Use async/await for concurrent API calls

## Requirements

- Azure OpenAI API credentials configured
- ChromaDB vocabulary collection populated
- Vocabulary service initialized

## Testing

Run test suite:

```bash
python aiapi/test_word_insertion_service.py
```

## Next Steps

- Implement Story Enhancement Service (Task 4)
- Create API endpoints (Task 5)
- Add batch processing (Task 6)
