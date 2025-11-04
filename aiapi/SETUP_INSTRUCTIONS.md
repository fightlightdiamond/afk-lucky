# Setup Instructions for AI Story Word Insertion Feature

## Quick Start

Follow these steps to set up and use the AI Story with English Word Insertion feature:

### 1. Prerequisites

- Python 3.8 or higher
- Azure OpenAI API access
- Poetry or pip for dependency management

### 2. Install Dependencies

```bash
# Navigate to the aiapi directory
cd aiapi

# Install using poetry (recommended)
poetry install

# Or using pip
pip install -e .
```

### 3. Configure Environment Variables

Create a `.env` file in the `aiapi` directory:

```bash
# Required: Azure OpenAI Configuration
AIAPI_AZURE_ENDPOINT=https://your-endpoint.openai.azure.com/
AIAPI_AZURE_API_KEY=your-api-key-here
AIAPI_AZURE_DEPLOYMENT_NAME=GPT-4o

# Optional: Customize vocabulary settings
AIAPI_DEFAULT_VOCABULARY_TOPIC=general
AIAPI_DEFAULT_INSERTION_COUNT=10
AIAPI_MAX_INSERTION_COUNT=20
AIAPI_MIN_POSITION_SCORE=0.7

# Optional: ChromaDB settings
AIAPI_VOCABULARY_COLLECTION_NAME=vocabulary
AIAPI_CHROMADB_PATH=./chroma_data
```

### 4. Initialize Vocabulary Database

This is a **required step** before using word insertion features:

```bash
# From the aiapi directory
python -m aiapi.scripts.init_vocabulary

# Or run directly
python scripts/init_vocabulary.py
```

**What this does:**

- Creates the vocabulary collection in ChromaDB
- Loads 100+ sample vocabulary words covering topics:
  - Technology (laptop, algorithm, AI, etc.)
  - Business (meeting, profit, strategy, etc.)
  - Education (teacher, homework, scholarship, etc.)
  - Daily Life (breakfast, routine, commute, etc.)
  - Travel (airport, passport, itinerary, etc.)
- Generates vector embeddings for semantic search
- Displays initialization statistics

**Expected output:**

```
============================================================
Vocabulary Database Initialization
============================================================

🔧 Step 1: Initializing vocabulary collection...
✅ Vocabulary collection initialized successfully

📂 Step 2: Loading sample vocabulary data...
✅ Loaded 100 vocabulary words from data/sample_vocabulary.json

📝 Step 3: Populating vocabulary database...
  [1/100] ✅ laptop
  [2/100] ✅ smartphone
  ...

============================================================
Initialization Summary
============================================================
✅ Successfully added: 100 words
❌ Failed to add: 0 words
📊 Total processed: 100 words

📊 Collection Statistics:
  Total words in database: 100
  Collection name: vocabulary

============================================================
✅ Vocabulary database initialization complete!
============================================================
```

### 5. Start the API Server

```bash
# Using the run script
python run.py

# Or with uvicorn directly
uvicorn src.aiapi.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### 6. Test the API

#### Test Story Generation with Word Insertion

```bash
curl -X POST "http://localhost:8000/api/v1/generate-story-with-insertion" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A story about learning technology",
    "insertion_config": {
      "topic": "technology",
      "difficulty": "beginner",
      "insertion_count": 5
    }
  }'
```

#### Test Vocabulary Search

```bash
curl "http://localhost:8000/api/v1/vocabulary/technology/beginner?limit=5"
```

## Importing Custom Vocabulary

### From JSON File

Create a JSON file with your vocabulary:

```json
[
  {
    "word": "innovation",
    "definition": "A new method, idea, or product",
    "vietnamese_translation": "sự đổi mới",
    "part_of_speech": "noun",
    "topic": "business",
    "difficulty": "intermediate",
    "example": "Innovation drives business growth",
    "ipa": "/ˌɪn.əˈveɪ.ʃən/"
  }
]
```

Import it:

```bash
python -m aiapi.scripts.import_vocabulary --file my_vocab.json
```

### From CSV File

Create a CSV file with these columns:

```csv
word,definition,vietnamese_translation,part_of_speech,topic,difficulty,example,ipa
innovation,A new method or idea,sự đổi mới,noun,business,intermediate,Innovation drives growth,/ˌɪn.əˈveɪ.ʃən/
```

Import it:

```bash
python -m aiapi.scripts.import_vocabulary --file my_vocab.csv
```

### Validation Rules

The import script validates:

- **Required fields**: word, definition, vietnamese_translation, part_of_speech, topic, difficulty, example
- **Valid part_of_speech**: noun, verb, adjective, adverb, phrase
- **Valid difficulty**: beginner, intermediate, advanced
- **Optional field**: ipa (pronunciation)

Skip validation (not recommended):

```bash
python -m aiapi.scripts.import_vocabulary --file vocab.json --no-validate
```

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'aiapi'"

**Solution**: Make sure you've installed the package:

```bash
pip install -e .
```

### Issue: "ChromaDB connection error"

**Solution**: Delete and reinitialize the database:

```bash
rm -rf chroma_data/
python -m aiapi.scripts.init_vocabulary
```

### Issue: "Azure OpenAI API error"

**Solution**: Check your environment variables:

```bash
# Verify .env file exists and has correct values
cat .env

# Test Azure OpenAI connection
python -c "from src.aiapi.config import settings; print(settings.azure_endpoint)"
```

### Issue: "No vocabulary found for topic"

**Solution**: Check available vocabulary:

```bash
python -c "from src.aiapi.services.vocabulary_service import get_vocabulary_stats; print(get_vocabulary_stats())"
```

If the count is 0, reinitialize:

```bash
python -m aiapi.scripts.init_vocabulary
```

### Issue: "Rate limit exceeded"

**Solution**: Adjust rate limiting in `.env`:

```bash
AIAPI_RATE_LIMIT_REQUESTS_PER_MINUTE=30
AIAPI_BATCH_MAX_WORKERS=2
AIAPI_RETRY_MAX_WAIT_SECONDS=20
```

## Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs for interactive documentation
2. **Test different topics**: Try technology, business, education, daily life, travel
3. **Adjust difficulty**: Test beginner, intermediate, and advanced levels
4. **Add custom vocabulary**: Import your own vocabulary files
5. **Integrate with frontend**: Use the API from your Next.js application

## Additional Resources

- **Main README**: `aiapi/README.md` - Comprehensive API documentation
- **Sample Data**: `aiapi/data/sample_vocabulary.json` - Example vocabulary format
- **Test Scripts**: `aiapi/test_*.py` - Example usage and testing
- **API Guides**:
  - `aiapi/WORD_INSERTION_API_GUIDE.md`
  - `aiapi/VOCABULARY_SERVICE_README.md`
  - `aiapi/BATCH_PROCESSING_GUIDE.md`

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the API documentation at `/docs`
3. Check existing test files for usage examples
4. Review the implementation guides in the `aiapi/` directory
