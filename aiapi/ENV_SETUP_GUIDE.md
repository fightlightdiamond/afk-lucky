# Environment Setup Guide

## Overview

All sensitive credentials are now stored in `.env` file for security. The `.env` file is ignored by git to prevent accidental commits of API keys.

## Setup Steps

### 1. Copy the example file

```bash
cd aiapi
cp .env.example .env
```

### 2. Edit `.env` with your actual credentials

```bash
# Open in your editor
nano .env
# or
code .env
```

### 3. Fill in your API keys

```env
# Chat/Story Generation (GPT-4o)
AZURE_CHAT_API_KEY=your-actual-key-here
AZURE_CHAT_DEPLOYMENT=GPT-4o

# Embeddings (text-embedding-3-small)
AZURE_EMBEDDING_API_KEY=your-actual-key-here
AZURE_EMBEDDING_DEPLOYMENT=text-embedding-3-small
```

### 4. Verify configuration

```bash
python -c "from src.aiapi.config import settings; print(f'Chat key: {settings.azure_chat_api_key[:10]}...')"
```

## Configuration Variables

### Azure OpenAI Settings

- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint URL
- `AZURE_CHAT_API_KEY` - API key for chat/story generation
- `AZURE_CHAT_DEPLOYMENT` - Deployment name (GPT-4o or GPT-4o-mini)
- `AZURE_EMBEDDING_API_KEY` - API key for embeddings
- `AZURE_EMBEDDING_DEPLOYMENT` - Embedding model name

### Vocabulary Settings

- `DEFAULT_VOCABULARY_TOPIC` - Default topic for vocabulary (default: "general")
- `DEFAULT_INSERTION_COUNT` - Default number of words to insert (default: 10)
- `MAX_INSERTION_COUNT` - Maximum words allowed (default: 20)
- `MIN_POSITION_SCORE` - Minimum score for insertion positions (default: 0.5)

### ChromaDB Settings

- `VOCABULARY_COLLECTION_NAME` - Collection name in ChromaDB (default: "vocabulary")
- `CHROMADB_PATH` - Path to ChromaDB data (default: "./chroma_data")

### Rate Limiting

- `RATE_LIMIT_ENABLED` - Enable/disable rate limiting (default: true)
- `RATE_LIMIT_REQUESTS_PER_MINUTE` - Max requests per minute (default: 60)
- `RATE_LIMIT_BURST_SIZE` - Burst size (default: 10)

### Retry Settings

- `RETRY_MAX_ATTEMPTS` - Max retry attempts (default: 5)
- `RETRY_MIN_WAIT_SECONDS` - Min wait between retries (default: 1)
- `RETRY_MAX_WAIT_SECONDS` - Max wait between retries (default: 10)

### Batch Processing

- `BATCH_MAX_WORKERS` - Max concurrent workers (default: 3)
- `BATCH_EMBEDDING_SIZE` - Batch size for embeddings (default: 10)

## Security Best Practices

### ✅ DO

- Keep `.env` file in `.gitignore`
- Use different keys for development and production
- Rotate API keys regularly
- Use environment-specific `.env` files (`.env.dev`, `.env.prod`)
- Share `.env.example` with team (without actual keys)

### ❌ DON'T

- Commit `.env` file to git
- Share API keys in chat/email
- Use production keys in development
- Hardcode credentials in source code
- Store keys in public repositories

## Troubleshooting

### Issue: "No .env file found"

**Solution**: Copy `.env.example` to `.env` and fill in your keys

### Issue: "API key not working"

**Solution**:

1. Check if key is correct in `.env`
2. Verify key has not exceeded budget
3. Ensure correct deployment name

### Issue: "Budget exceeded"

**Solution**:

1. Check Azure OpenAI portal for usage
2. Use a different API key
3. Increase budget limit

### Issue: "Environment variables not loading"

**Solution**:

1. Restart the server: `python run.py`
2. Check `.env` file location (should be in `aiapi/` directory)
3. Verify `python-dotenv` is installed: `pip install python-dotenv`

## Running the Application

```bash
# Make sure you're in the aiapi directory
cd aiapi

# Run the server (will auto-load .env)
python run.py

# Or with uvicorn directly
uvicorn src.aiapi.main:app --reload
```

## Checking Current Configuration

```python
from src.aiapi.config import settings

print(f"Endpoint: {settings.azure_endpoint}")
print(f"Chat deployment: {settings.azure_chat_deployment}")
print(f"Embedding deployment: {settings.azure_embedding_deployment}")
print(f"Min position score: {settings.min_position_score}")
```

## Multiple Environments

### Development

```bash
cp .env.example .env.dev
# Edit .env.dev with dev keys
export ENV_FILE=.env.dev
python run.py
```

### Production

```bash
cp .env.example .env.prod
# Edit .env.prod with prod keys
export ENV_FILE=.env.prod
python run.py
```

## Migration from Hardcoded Values

If you had hardcoded values in `config.py`, they are now loaded from `.env`:

**Before:**

```python
azure_chat_api_key: str = 'sk-xxx'  # Hardcoded
```

**After:**

```python
azure_chat_api_key: str = os.getenv('AZURE_CHAT_API_KEY', '')  # From .env
```

All existing functionality remains the same, just more secure!
