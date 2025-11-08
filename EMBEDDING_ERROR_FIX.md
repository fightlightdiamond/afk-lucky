# 🔧 Fix: "Failed to create query embedding" Error

## Error Message

```json
{ "detail": "Failed to search vocabulary: Failed to create query embedding" }
```

## Root Cause

This error occurs when the Azure OpenAI API cannot create embeddings. Common causes:

1. ❌ Vocabulary database not initialized
2. ❌ Azure OpenAI API credentials invalid
3. ❌ Network connection issue
4. ❌ API rate limit exceeded

## Quick Diagnosis

Run this test script:

```bash
cd aiapi
python test_vocabulary_quick.py
```

This will:

- ✅ Check if vocabulary database exists
- ✅ Test Azure OpenAI connection
- ✅ Attempt auto-fix if possible
- ✅ Show detailed error information

## Solution 1: Initialize Vocabulary Database (Most Common)

### Step 1: Check if vocabulary exists

```bash
cd aiapi
python -c "from src.aiapi.services.vocabulary_service import get_vocabulary_stats; print(get_vocabulary_stats())"
```

If you see `total_words: 0` or an error, the database is empty.

### Step 2: Initialize vocabulary

```bash
cd aiapi
python -m aiapi.scripts.init_vocabulary
```

Expected output:

```
Initializing vocabulary database...
✅ Loaded 100+ vocabulary words
✅ Generated embeddings
✅ Saved to ChromaDB
Total words: 100+
```

### Step 3: Verify

```bash
python test_vocabulary_quick.py
```

Should show: `✅ ALL TESTS PASSED`

## Solution 2: Check Azure OpenAI Credentials

### Check current credentials

```bash
cd aiapi
python -c "from src.aiapi.config import settings; print(f'Endpoint: {settings.azure_endpoint}'); print(f'Key: {settings.azure_api_key[:10]}...')"
```

### Test Azure OpenAI connection

```bash
cd aiapi
python -c "
from src.aiapi.services.chromadb_service import get_embedding
try:
    result = get_embedding('test')
    print('✅ Azure OpenAI working')
    print(f'Embedding dimensions: {len(result)}')
except Exception as e:
    print(f'❌ Azure OpenAI error: {e}')
"
```

### If credentials are wrong

Update `aiapi/src/aiapi/config.py`:

```python
class Settings(BaseSettings):
    azure_endpoint: str = 'YOUR_AZURE_ENDPOINT'
    azure_api_key: str = 'YOUR_API_KEY'
    azure_deployment_name: str = 'YOUR_DEPLOYMENT_NAME'
```

Or create `.env` file in `aiapi/` directory:

```bash
AIAPI_AZURE_ENDPOINT=https://your-endpoint.openai.azure.com/
AIAPI_AZURE_API_KEY=your-api-key-here
AIAPI_AZURE_DEPLOYMENT_NAME=your-deployment-name
```

## Solution 3: Network/Rate Limit Issues

### Check if API is accessible

```bash
curl -I https://aiportalapi.stu-platform.live/jpe
```

Should return HTTP 200 or similar.

### If rate limited

Wait 1 minute and try again. The system has retry logic with exponential backoff.

### Check backend logs

Look for detailed error messages in the terminal where `python run.py` is running.

## Solution 4: Restart Everything

Sometimes a clean restart fixes issues:

### Step 1: Stop backend

Press `Ctrl+C` in terminal running `python run.py`

### Step 2: Clear ChromaDB cache (optional)

```bash
cd aiapi
rm -rf chroma_data/
```

### Step 3: Reinitialize

```bash
python -m aiapi.scripts.init_vocabulary
```

### Step 4: Restart backend

```bash
python run.py
```

### Step 5: Test

```bash
# In another terminal
python test_vocabulary_quick.py
```

## Verification Checklist

After applying fixes, verify:

- [ ] Backend running: `curl http://localhost:8000/health`
- [ ] Vocabulary exists: `python test_vocabulary_quick.py`
- [ ] API accessible: Try vocabulary search in browser
- [ ] No errors in backend logs

## Test from Browser

Once fixed, test in browser:

1. Navigate to: `http://localhost:3000/demo/vocabulary-search`
2. Enter query: "programming"
3. Click "Search"
4. Should see vocabulary results without errors

## Common Error Messages & Solutions

### "Collection vocabulary does not exist"

**Solution**: Initialize vocabulary database

```bash
cd aiapi
python -m aiapi.scripts.init_vocabulary
```

### "Failed to create query embedding: API key invalid"

**Solution**: Update Azure OpenAI credentials in `config.py`

### "Connection refused"

**Solution**: Check if backend is running

```bash
curl http://localhost:8000/health
```

### "Rate limit exceeded"

**Solution**: Wait 1 minute, system will retry automatically

## Still Not Working?

### Get detailed logs

```bash
cd aiapi
python run.py 2>&1 | tee backend.log
```

Then try the API call and check `backend.log` for details.

### Manual test

```bash
cd aiapi
python -c "
from src.aiapi.services.vocabulary_service import search_vocabulary_semantic
try:
    results = search_vocabulary_semantic('test', n_results=1)
    print(f'✅ Success: {results}')
except Exception as e:
    print(f'❌ Error: {e}')
    import traceback
    traceback.print_exc()
"
```

### Check ChromaDB

```bash
cd aiapi
ls -la chroma_data/
```

Should see `chroma.sqlite3` file.

## Prevention

To avoid this error in the future:

1. ✅ Always initialize vocabulary after cloning repo
2. ✅ Keep Azure OpenAI credentials updated
3. ✅ Don't delete `chroma_data/` directory
4. ✅ Run `test_vocabulary_quick.py` before demos

## Quick Reference

```bash
# Test everything
cd aiapi && python test_vocabulary_quick.py

# Initialize vocabulary
cd aiapi && python -m aiapi.scripts.init_vocabulary

# Check vocabulary stats
cd aiapi && python -c "from src.aiapi.services.vocabulary_service import get_vocabulary_stats; print(get_vocabulary_stats())"

# Test Azure OpenAI
cd aiapi && python -c "from src.aiapi.services.chromadb_service import get_embedding; print(len(get_embedding('test')))"

# Restart backend
cd aiapi && python run.py
```

---

**Most Common Fix**: Run `python -m aiapi.scripts.init_vocabulary` in the `aiapi/` directory.

**Estimated Fix Time**: 2-3 minutes
