# API Key Configuration Fix

## Problem

API was using the wrong key that only had access to `text-embedding-3-small` model, causing 401 errors when trying to use GPT-4o for chat/story generation.

## Solution

Separated API keys and deployment names for different operations:

### Configuration Changes (`aiapi/src/aiapi/config.py`)

```python
# Chat/Story Generation
azure_chat_api_key: str = 'sk-uX_Ax09Iv6XY-28-M_uYVg'  # GPT-4o access
azure_chat_deployment: str = 'GPT-4o'

# Embeddings Only
azure_embedding_api_key: str = 'sk-Ed-DQu3T_L_cgQhBN5_H3w'  # text-embedding-3-small access
azure_embedding_deployment: str = 'text-embedding-3-small'
```

### Updated Services

All services now use the correct API key:

**Chat/Story Generation Services** (use `azure_chat_api_key`):

- `story_service.py` - Story generation with GPT-4o
- `chat_service.py` - Chat completions
- `word_insertion_service.py` - Word insertion logic
- `openai_service.py` - General OpenAI operations

**Embedding Services** (use `azure_embedding_api_key`):

- `chromadb_service.py` - Vector embeddings for vocabulary search

## Testing

Restart the API server and test:

```bash
cd aiapi
python run.py
```

Then call the endpoint:

```bash
curl -X POST http://localhost:8000/api/v1/generate-story-with-insertion \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## Key Source

Correct API keys found in `_py/b2.py` which had working GPT-4o configuration.
