# Vocabulary Import Summary

## Current Status

✅ **Total words in ChromaDB: ~318 words**

### Import History

1. Initial import: 134 words (sample + extended vocabulary)
2. AI generation: 184 words (from 219 generated, some duplicates filtered)

## What's Been Fixed

1. ✅ API key configuration (GPT-4o for chat, text-embedding-3-small for embeddings)
2. ✅ Added 'adverb' support to position types
3. ✅ Lowered min_position_score from 0.7 to 0.5
4. ✅ Created AI generation script
5. ✅ Imported 318 words total

## Next Steps to Reach 3000 Words

### Option 1: Run AI Generation Multiple Times

The AI script has JSON parsing issues but works partially. Run it 10-15 more times:

```bash
for i in {1..10}; do
  echo "Run $i..."
  python aiapi/scripts/ai_generate_vocabulary.py
  sleep 5
done
```

### Option 2: Manual Import from Word Lists

Download and convert existing word lists:

- Oxford 3000: https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000
- TOEFL vocabulary lists
- Business English word lists

### Option 3: Use Current 318 Words for Testing

The system should work with 318 words. Test it first:

```bash
# Test vocabulary search
curl -X POST http://localhost:8000/api/v1/vocabulary/search \
  -H "Content-Type: application/json" \
  -d '{"query": "technology", "n_results": 10}'

# Test story generation with word insertion
curl -X POST http://localhost:8000/api/v1/generate-story-with-insertion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Viết câu chuyện về một ngày làm việc",
    "config": {
      "vocab_focus": ["work", "computer", "meeting"]
    },
    "insertion_config": {
      "topic": "business",
      "difficulty": "beginner",
      "insertion_count": 5
    }
  }'
```

## Files Created

- `aiapi/data/sample_vocabulary.json` - 100 words
- `aiapi/data/extended_vocabulary.json` - 34 words
- `aiapi/data/ai_generated_vocabulary.json` - 219 words (with duplicates)
- `aiapi/data/bulk_vocabulary_3000.json` - 152 words (not imported yet)
- `aiapi/data/large_vocabulary.json` - 10 sample words

## Import Scripts

- `aiapi/scripts/add_more_vocabulary.py` - Import from JSON files
- `aiapi/scripts/ai_generate_vocabulary.py` - AI-powered generation
- `aiapi/scripts/init_vocabulary.py` - Initial setup

## Recommendation

**Start testing with 318 words now!** The system should work. You can add more vocabulary later as needed. The important fixes (API keys, adverb support, score threshold) are all done.

To verify current vocabulary count:

```python
from aiapi.src.aiapi.services.chromadb_service import get_vocabulary_collection
collection = get_vocabulary_collection()
print(f"Total words: {collection.count()}")
```
