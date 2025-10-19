# Travel Itinerary API

FastAPI application for generating travel itineraries using OpenAI.

## Features

- Single itinerary generation
- Batch itinerary processing
- Rate limiting and retry logic
- Azure OpenAI integration

## Installation

```bash
# Install dependencies
pip install -e .

# Or using poetry
poetry install
```

## Running the Application

```bash
# Using the run script
python run.py

# Or directly with uvicorn
uvicorn src.aiapi.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /api/v1/generate-itinerary` - Generate single itinerary
- `POST /api/v1/batch-itinerary` - Generate multiple itineraries

## Configuration

Set environment variables with `AIAPI_` prefix:

- `AIAPI_AZURE_ENDPOINT`
- `AIAPI_AZURE_API_KEY`
- `AIAPI_AZURE_DEPLOYMENT_NAME`

## Project Structure

```
aiapi/
├── src/
│   └── aiapi/
│       ├── __init__.py
│       ├── main.py          # FastAPI app entry point
│       ├── config.py        # Configuration settings
│       ├── models.py        # Pydantic models
│       ├── routers/         # API route handlers
│       │   ├── __init__.py
│       │   ├── itinerary.py # Travel itinerary routes
│       │   ├── story.py     # Story generation routes
│       │   └── chat.py      # Chat/conversation routes
│       └── services/        # Business logic
│           ├── __init__.py
│           ├── openai_service.py  # OpenAI integration
│           ├── story_service.py   # Story generation logic
│           └── chat_service.py    # Chat functionality
├── tests/                   # Test files
├── run.py                   # Simple run script
├── pyproject.toml          # Project configuration
└── README.md               # This file
```

## New Features

### Story Generation

- Simple story generation from prompts
- Advanced story generation with configuration options
- Language mixing (Vietnamese/English)
- Style and tone customization
- Readability scoring and metadata

### Chat API

- General AI conversation endpoint
- Context-aware responses
- Error handling and retry logic

### Integration with Next.js Frontend

The Python API is designed to replace direct OpenAI calls in the Next.js story application. The frontend now uses the `/src/lib/aiapi.ts` client to communicate with this Python backend.
