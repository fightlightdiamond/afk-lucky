# Vocabulary Search Fix

## Problem

Backend was returning vocabulary data with nested metadata structure:

```json
{
  "id": "vocab_...",
  "metadata": {
    "vietnamese": "...",
    "pos": "...",
    ...
  },
  "similarity_score": -0.58
}
```

But frontend expected flat structure:

```json
{
  "word": "...",
  "vietnamese_translation": "...",
  "part_of_speech": "...",
  "similarity": 0.42
}
```

## Solution

Updated `aiapi/src/aiapi/services/vocabulary_service.py` in the `search_vocabulary_semantic()` function to:

1. Flatten metadata into main object
2. Map backend field names to frontend expected names:
   - `vietnamese` → `vietnamese_translation`
   - `pos` → `part_of_speech`
3. Convert similarity score: `1 - distance` (positive score)

## To Apply Fix

### 1. Restart Backend

```bash
# Stop current backend (Ctrl+C in the terminal running it)
# Then restart:
cd aiapi
python run.py
```

### 2. Test the Fix

```bash
# In another terminal:
python _py/test_vocab_format.py
```

Expected output should show:

```
✅ word: prototype
✅ definition: An early model...
✅ vietnamese_translation: nguyên mẫu
✅ part_of_speech: noun
✅ topic: technology
✅ difficulty: advanced
✅ example: The engineers...
✅ similarity: 0.4145
```

### 3. Test in Browser

1. Go to http://localhost:3000/demo/vocabulary-search
2. Enter search query: "computer technology"
3. Click Search
4. Should see vocabulary cards displayed (not stuck loading)

## Files Changed

- `aiapi/src/aiapi/services/vocabulary_service.py` - Fixed `search_vocabulary_semantic()` function
