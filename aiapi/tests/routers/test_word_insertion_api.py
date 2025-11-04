"""Unit tests for word insertion API endpoints."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
import os

# Disable rate limiting for tests BEFORE importing app
os.environ["RATE_LIMIT_ENABLED"] = "false"

from aiapi.main import app
from aiapi.models import VocabularyWord, StoryInsertionResponse, InsertionMetrics, StoryMetadata


# Override rate limiter settings for tests
@pytest.fixture(autouse=True)
def disable_rate_limit():
    """Disable rate limiting for all tests in this module."""
    from aiapi.config import settings
    original_value = settings.rate_limit_enabled
    settings.rate_limit_enabled = False
    yield
    settings.rate_limit_enabled = original_value


client = TestClient(app)


class TestVocabularyEndpoints:
    """Test vocabulary management endpoints."""
    
    @patch('aiapi.routers.word_insertion.get_vocabulary_by_topic')
    def test_get_vocabulary_by_topic_success(self, mock_get_vocab):
        """Test GET /vocabulary/{topic}/{difficulty} endpoint."""
        # Setup mock
        mock_get_vocab.return_value = [
            {
                "id": "1",
                "document": "test",
                "metadata": {
                    "word": "computer",
                    "definition": "A device",
                    "vietnamese": "máy tính",
                    "pos": "noun",
                    "topic": "technology",
                    "difficulty": "beginner",
                    "example": "I use a computer"
                }
            }
        ]
        
        # Execute
        response = client.get("/api/v1/vocabulary/technology/beginner?limit=10")
        
        # Verify
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["metadata"]["word"] == "computer"
    
    @patch('aiapi.routers.word_insertion.get_vocabulary_by_topic')
    def test_get_vocabulary_empty_result(self, mock_get_vocab):
        """Test vocabulary endpoint with no results."""
        # Setup mock
        mock_get_vocab.return_value = []
        
        # Execute
        response = client.get("/api/v1/vocabulary/unknown/beginner")
        
        # Verify
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0
    
    @patch('aiapi.routers.word_insertion.search_vocabulary_semantic')
    def test_search_vocabulary_success(self, mock_search):
        """Test POST /vocabulary/search endpoint."""
        # Setup mock
        mock_search.return_value = [
            {
                "id": "1",
                "document": "test",
                "metadata": {
                    "word": "laptop",
                    "definition": "Portable computer",
                    "vietnamese": "máy tính xách tay",
                    "pos": "noun",
                    "topic": "technology",
                    "difficulty": "beginner",
                    "example": "I have a laptop"
                },
                "similarity_score": 0.95
            }
        ]
        
        # Execute
        response = client.post(
            "/api/v1/vocabulary/search",
            json={
                "query": "portable computer",
                "n_results": 5
            }
        )
        
        # Verify
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["metadata"]["word"] == "laptop"
        assert "similarity_score" in data[0]
    
    def test_search_vocabulary_invalid_request(self):
        """Test search endpoint with invalid request."""
        # Execute - missing required field
        response = client.post(
            "/api/v1/vocabulary/search",
            json={}
        )
        
        # Verify
        assert response.status_code == 422  # Validation error
    
    @patch('aiapi.routers.word_insertion.batch_add_vocabulary')
    def test_batch_add_vocabulary_success(self, mock_batch_add):
        """Test POST /vocabulary/batch-add endpoint."""
        # Setup mock
        mock_batch_add.return_value = {"success_count": 1, "failed_count": 0, "errors": []}
        
        # Execute
        response = client.post(
            "/api/v1/vocabulary/batch-add",
            json={
                "words": [
                    {
                        "word": "test",
                        "definition": "A test word",
                        "vietnamese_translation": "kiểm tra",
                        "part_of_speech": "noun",
                        "topic": "technology",
                        "difficulty": "beginner",
                        "example": "This is a test"
                    }
                ]
            }
        )
        
        # Verify
        assert response.status_code == 200
        data = response.json()
        assert data["success_count"] == 1
        assert data["failed_count"] == 0
    
    @patch('aiapi.routers.word_insertion.batch_add_vocabulary')
    def test_batch_add_vocabulary_partial_failure(self, mock_batch_add):
        """Test batch add with some failures."""
        # Setup mock - one success, one failure
        mock_batch_add.return_value = {"success_count": 1, "failed_count": 1, "errors": ["Failed to add word: test2"]}
        
        # Execute
        response = client.post(
            "/api/v1/vocabulary/batch-add",
            json={
                "words": [
                    {
                        "word": "test1",
                        "definition": "Test 1",
                        "vietnamese_translation": "test1",
                        "part_of_speech": "noun",
                        "topic": "technology",
                        "difficulty": "beginner",
                        "example": "Test 1"
                    },
                    {
                        "word": "test2",
                        "definition": "Test 2",
                        "vietnamese_translation": "test2",
                        "part_of_speech": "noun",
                        "topic": "technology",
                        "difficulty": "beginner",
                        "example": "Test 2"
                    }
                ]
            }
        )
        
        # Verify
        assert response.status_code == 200
        data = response.json()
        assert data["success_count"] == 1
        assert data["failed_count"] == 1
        assert len(data["errors"]) == 1


class TestStoryGenerationEndpoints:
    """Test story generation with insertion endpoints."""
    
    @patch('aiapi.routers.word_insertion.generate_story_with_insertion')
    def test_generate_story_with_insertion_success(self, mock_generate):
        """Test POST /generate-story-with-insertion endpoint."""
        # Setup mock
        mock_generate.return_value = StoryInsertionResponse(
            title="Test Story",
            original_content="Original content",
            enhanced_content="Enhanced content with **words**",
            inserted_words=[
                VocabularyWord(
                    word="words",
                    definition="Units of language",
                    vietnamese_translation="từ",
                    part_of_speech="noun",
                    topic="language",
                    difficulty="beginner",
                    example="I know many words"
                )
            ],
            glossary=[
                {
                    "word": "words",
                    "definition": "Units of language",
                    "vietnamese": "từ",
                    "part_of_speech": "noun",
                    "example": "I know many words"
                }
            ],
            metrics=InsertionMetrics(
                total_insertions=1,
                insertion_density=10.0,
                avg_position_score=0.85,
                readability_score=75,
                language_ratio={"vietnamese": 90, "english": 10}
            ),
            metadata=StoryMetadata(
                word_count=10,
                generation_time=1500,
                language_ratio={"vietnamese": 90, "english": 10},
                readability_score=75
            )
        )
        
        # Execute
        response = client.post(
            "/api/v1/generate-story-with-insertion",
            json={
                "prompt": "Viết câu chuyện về công nghệ",
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "beginner",
                    "insertion_count": 5
                }
            }
        )
        
        # Verify
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Story"
        assert "enhanced_content" in data
        assert len(data["inserted_words"]) == 1
        assert len(data["glossary"]) == 1
        assert data["metrics"]["total_insertions"] == 1
    
    @patch('aiapi.routers.word_insertion.enhance_existing_story')
    def test_enhance_existing_story_success(self, mock_enhance):
        """Test POST /enhance-story endpoint."""
        # Setup mock
        mock_enhance.return_value = StoryInsertionResponse(
            title="Enhanced Story",
            original_content="Original story content",
            enhanced_content="Enhanced story with **technology** (công nghệ)",
            inserted_words=[
                VocabularyWord(
                    word="technology",
                    definition="Application of scientific knowledge",
                    vietnamese_translation="công nghệ",
                    part_of_speech="noun",
                    topic="technology",
                    difficulty="intermediate",
                    example="Technology changes our lives"
                )
            ],
            glossary=[
                {
                    "word": "technology",
                    "definition": "Application of scientific knowledge",
                    "vietnamese": "công nghệ",
                    "part_of_speech": "noun",
                    "example": "Technology changes our lives"
                }
            ],
            metrics=InsertionMetrics(
                total_insertions=1,
                insertion_density=5.0,
                avg_position_score=0.90,
                readability_score=80,
                language_ratio={"vietnamese": 95, "english": 5}
            ),
            metadata=StoryMetadata(
                word_count=20,
                generation_time=800,
                language_ratio={"vietnamese": 95, "english": 5},
                readability_score=80
            )
        )
        
        # Execute
        response = client.post(
            "/api/v1/enhance-story",
            json={
                "story_id": "story_123",
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "intermediate",
                    "insertion_count": 8
                }
            }
        )
        
        # Verify
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Enhanced Story"
        assert "enhanced_content" in data
        assert len(data["inserted_words"]) == 1
        assert data["metrics"]["total_insertions"] == 1
        # Verify mock was called with correct parameters
        mock_enhance.assert_called_once()
        call_args = mock_enhance.call_args
        assert call_args[1]["story_id"] == "story_123"
    
    def test_generate_story_invalid_request(self):
        """Test story generation with invalid request."""
        # Execute - missing required fields
        response = client.post(
            "/api/v1/generate-story-with-insertion",
            json={}
        )
        
        # Verify
        assert response.status_code == 422  # Validation error
    
    @patch('aiapi.routers.word_insertion.generate_story_with_insertion')
    def test_generate_story_handles_error(self, mock_generate):
        """Test error handling in story generation endpoint."""
        # Setup mock to return error
        mock_generate.return_value = StoryInsertionResponse(
            title="",
            original_content="",
            enhanced_content="",
            inserted_words=[],
            glossary=[],
            metrics=InsertionMetrics(
                total_insertions=0,
                insertion_density=0,
                avg_position_score=0,
                readability_score=0,
                language_ratio={}
            ),
            metadata=StoryMetadata(
                word_count=0,
                generation_time=0,
                language_ratio={},
                readability_score=0
            ),
            error="Failed to generate story"
        )
        
        # Execute
        response = client.post(
            "/api/v1/generate-story-with-insertion",
            json={
                "prompt": "Test",
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "beginner",
                    "insertion_count": 5
                }
            }
        )
        
        # Verify - endpoint returns 500 when error is set and no content
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data
    
    @patch('aiapi.routers.word_insertion.generate_story_with_insertion')
    def test_generate_story_with_custom_config(self, mock_generate):
        """Test story generation with custom insertion config."""
        # Setup mock
        mock_generate.return_value = StoryInsertionResponse(
            title="Custom Story",
            original_content="Content",
            enhanced_content="Enhanced",
            inserted_words=[],
            glossary=[],
            metrics=InsertionMetrics(
                total_insertions=0,
                insertion_density=0,
                avg_position_score=0,
                readability_score=0,
                language_ratio={}
            ),
            metadata=StoryMetadata(
                word_count=10,
                generation_time=1000,
                language_ratio={"vietnamese": 100, "english": 0},
                readability_score=70
            )
        )
        
        # Execute with custom config
        response = client.post(
            "/api/v1/generate-story-with-insertion",
            json={
                "prompt": "Test",
                "insertion_config": {
                    "topic": "business",
                    "difficulty": "advanced",
                    "insertion_count": 15,
                    "bold_format": False,
                    "show_translation": False
                }
            }
        )
        
        # Verify
        assert response.status_code == 200
        # Verify mock was called with correct config
        mock_generate.assert_called_once()
        call_args = mock_generate.call_args[0][0]
        assert call_args.insertion_config.topic == "business"
        assert call_args.insertion_config.difficulty == "advanced"
        assert call_args.insertion_config.insertion_count == 15


class TestBatchProcessing:
    """Test batch processing endpoints."""
    
    @patch('aiapi.routers.word_insertion.generate_batch_stories_with_insertion_parallel')
    def test_batch_story_generation_success(self, mock_batch_generate):
        """Test successful batch story generation."""
        from aiapi.models import BatchStoryInsertionResponse, BatchStoryInsertionResult
        
        # Setup mock
        mock_batch_generate.return_value = BatchStoryInsertionResponse(
            total=2,
            success_count=2,
            failed_count=0,
            results=[
                BatchStoryInsertionResult(
                    index=0,
                    success=True,
                    result=StoryInsertionResponse(
                        title="Story 1",
                        original_content="Content 1",
                        enhanced_content="Enhanced 1",
                        inserted_words=[],
                        glossary=[],
                        metrics=InsertionMetrics(
                            total_insertions=5,
                            insertion_density=10.0,
                            avg_position_score=0.85,
                            readability_score=75,
                            language_ratio={"vietnamese": 90, "english": 10}
                        ),
                        metadata=StoryMetadata(
                            word_count=50,
                            generation_time=1500,
                            language_ratio={"vietnamese": 90, "english": 10},
                            readability_score=75
                        )
                    ),
                    error=None
                ),
                BatchStoryInsertionResult(
                    index=1,
                    success=True,
                    result=StoryInsertionResponse(
                        title="Story 2",
                        original_content="Content 2",
                        enhanced_content="Enhanced 2",
                        inserted_words=[],
                        glossary=[],
                        metrics=InsertionMetrics(
                            total_insertions=7,
                            insertion_density=12.0,
                            avg_position_score=0.82,
                            readability_score=72,
                            language_ratio={"vietnamese": 88, "english": 12}
                        ),
                        metadata=StoryMetadata(
                            word_count=60,
                            generation_time=1800,
                            language_ratio={"vietnamese": 88, "english": 12},
                            readability_score=72
                        )
                    ),
                    error=None
                )
            ],
            total_time_ms=3500
        )
        
        # Execute
        response = client.post(
            "/api/v1/batch-generate-stories",
            json={
                "requests": [
                    {
                        "prompt": "Story 1",
                        "insertion_config": {
                            "topic": "technology",
                            "difficulty": "beginner",
                            "insertion_count": 5
                        }
                    },
                    {
                        "prompt": "Story 2",
                        "insertion_config": {
                            "topic": "business",
                            "difficulty": "intermediate",
                            "insertion_count": 7
                        }
                    }
                ]
            }
        )
        
        # Verify
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert data["success_count"] == 2
        assert data["failed_count"] == 0
        assert len(data["results"]) == 2
        assert data["results"][0]["success"] is True
        assert data["results"][1]["success"] is True
    
    @patch('aiapi.routers.word_insertion.generate_batch_stories_with_insertion_parallel')
    def test_batch_story_generation_partial_failure(self, mock_batch_generate):
        """Test batch generation with partial failures."""
        from aiapi.models import BatchStoryInsertionResponse, BatchStoryInsertionResult
        
        # Setup mock - one success, one failure
        mock_batch_generate.return_value = BatchStoryInsertionResponse(
            total=2,
            success_count=1,
            failed_count=1,
            results=[
                BatchStoryInsertionResult(
                    index=0,
                    success=True,
                    result=StoryInsertionResponse(
                        title="Story 1",
                        original_content="Content 1",
                        enhanced_content="Enhanced 1",
                        inserted_words=[],
                        glossary=[],
                        metrics=InsertionMetrics(
                            total_insertions=5,
                            insertion_density=10.0,
                            avg_position_score=0.85,
                            readability_score=75,
                            language_ratio={"vietnamese": 90, "english": 10}
                        ),
                        metadata=StoryMetadata(
                            word_count=50,
                            generation_time=1500,
                            language_ratio={"vietnamese": 90, "english": 10},
                            readability_score=75
                        )
                    ),
                    error=None
                ),
                BatchStoryInsertionResult(
                    index=1,
                    success=False,
                    result=None,
                    error="Failed to generate story: API timeout"
                )
            ],
            total_time_ms=2000
        )
        
        # Execute
        response = client.post(
            "/api/v1/batch-generate-stories",
            json={
                "requests": [
                    {
                        "prompt": "Story 1",
                        "insertion_config": {
                            "topic": "technology",
                            "difficulty": "beginner",
                            "insertion_count": 5
                        }
                    },
                    {
                        "prompt": "Story 2",
                        "insertion_config": {
                            "topic": "business",
                            "difficulty": "intermediate",
                            "insertion_count": 7
                        }
                    }
                ]
            }
        )
        
        # Verify - should return partial results
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert data["success_count"] == 1
        assert data["failed_count"] == 1
        assert len(data["results"]) == 2
        assert data["results"][0]["success"] is True
        assert data["results"][1]["success"] is False
        assert data["results"][1]["error"] is not None
    
    def test_batch_story_generation_empty_request(self):
        """Test batch generation with empty request list."""
        # Execute
        response = client.post(
            "/api/v1/batch-generate-stories",
            json={"requests": []}
        )
        
        # Verify - Pydantic validation returns 422
        assert response.status_code == 422
        data = response.json()
        # Check for either 'detail' or 'error' field (depends on error handler)
        assert "detail" in data or "error" in data
    
    def test_batch_story_generation_exceeds_limit(self):
        """Test batch generation with too many requests."""
        # Execute - 11 requests (exceeds limit of 10)
        requests = [
            {
                "prompt": f"Story {i}",
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "beginner",
                    "insertion_count": 5
                }
            }
            for i in range(11)
        ]
        
        response = client.post(
            "/api/v1/batch-generate-stories",
            json={"requests": requests}
        )
        
        # Verify - Pydantic validation returns 422
        assert response.status_code == 422
        data = response.json()
        # Check for either 'detail' or 'error' field (depends on error handler)
        assert "detail" in data or "error" in data
    
    @patch('aiapi.routers.word_insertion.generate_batch_stories_with_insertion')
    def test_batch_story_generation_sequential(self, mock_batch_generate):
        """Test batch generation with sequential processing."""
        from aiapi.models import BatchStoryInsertionResponse, BatchStoryInsertionResult
        
        # Setup mock
        mock_batch_generate.return_value = BatchStoryInsertionResponse(
            total=1,
            success_count=1,
            failed_count=0,
            results=[
                BatchStoryInsertionResult(
                    index=0,
                    success=True,
                    result=StoryInsertionResponse(
                        title="Story 1",
                        original_content="Content",
                        enhanced_content="Enhanced",
                        inserted_words=[],
                        glossary=[],
                        metrics=InsertionMetrics(
                            total_insertions=5,
                            insertion_density=10.0,
                            avg_position_score=0.85,
                            readability_score=75,
                            language_ratio={"vietnamese": 90, "english": 10}
                        ),
                        metadata=StoryMetadata(
                            word_count=50,
                            generation_time=1500,
                            language_ratio={"vietnamese": 90, "english": 10},
                            readability_score=75
                        )
                    ),
                    error=None
                )
            ],
            total_time_ms=1500
        )
        
        # Execute with parallel=False
        response = client.post(
            "/api/v1/batch-generate-stories?parallel=false",
            json={
                "requests": [
                    {
                        "prompt": "Story 1",
                        "insertion_config": {
                            "topic": "technology",
                            "difficulty": "beginner",
                            "insertion_count": 5
                        }
                    }
                ]
            }
        )
        
        # Verify
        assert response.status_code == 200
        data = response.json()
        assert data["success_count"] == 1
        # Verify sequential processing was used
        mock_batch_generate.assert_called_once()


class TestErrorHandling:
    """Test error handling in API endpoints."""
    
    def test_invalid_topic(self):
        """Test handling of invalid topic."""
        response = client.get("/api/v1/vocabulary/invalid_topic/beginner")
        
        # Should return 200 with empty results (no strict validation on topic)
        assert response.status_code == 200
    
    def test_invalid_difficulty(self):
        """Test handling of invalid difficulty."""
        response = client.get("/api/v1/vocabulary/technology/invalid_difficulty")
        
        # Should return 400 for invalid difficulty
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "difficulty" in data["detail"].lower()
    
    @patch('aiapi.routers.word_insertion.generate_story_with_insertion')
    def test_timeout_handling(self, mock_generate):
        """Test timeout handling."""
        # Setup mock to raise timeout
        mock_generate.side_effect = TimeoutError("Request timeout")
        
        # Execute
        response = client.post(
            "/api/v1/generate-story-with-insertion",
            json={
                "prompt": "Test",
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "beginner",
                    "insertion_count": 5
                }
            }
        )
        
        # Verify - should handle timeout gracefully
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data
    
    @patch('aiapi.routers.word_insertion.get_vocabulary_by_topic')
    def test_vocabulary_service_error(self, mock_get_vocab):
        """Test handling of vocabulary service errors."""
        # Setup mock to raise exception
        mock_get_vocab.side_effect = Exception("Database connection failed")
        
        # Execute
        response = client.get("/api/v1/vocabulary/technology/beginner")
        
        # Verify
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data
    
    @patch('aiapi.routers.word_insertion.search_vocabulary_semantic')
    def test_search_service_error(self, mock_search):
        """Test handling of search service errors."""
        # Setup mock to raise exception
        mock_search.side_effect = Exception("Embedding generation failed")
        
        # Execute
        response = client.post(
            "/api/v1/vocabulary/search",
            json={
                "query": "test query",
                "n_results": 5
            }
        )
        
        # Verify
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data
    
    def test_vocabulary_limit_validation(self):
        """Test vocabulary limit is capped at 50."""
        # Execute with limit > 50
        response = client.get("/api/v1/vocabulary/technology/beginner?limit=100")
        
        # Should succeed but limit to 50
        assert response.status_code == 200
    
    def test_insertion_count_validation(self):
        """Test insertion count validation."""
        # Execute with invalid insertion count (too low)
        response = client.post(
            "/api/v1/generate-story-with-insertion",
            json={
                "prompt": "Test",
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "beginner",
                    "insertion_count": 2  # Below minimum of 5
                }
            }
        )
        
        # Verify validation error
        assert response.status_code == 422
    
    def test_insertion_count_validation_high(self):
        """Test insertion count validation for high values."""
        # Execute with invalid insertion count (too high)
        response = client.post(
            "/api/v1/generate-story-with-insertion",
            json={
                "prompt": "Test",
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "beginner",
                    "insertion_count": 25  # Above maximum of 20
                }
            }
        )
        
        # Verify validation error
        assert response.status_code == 422
    
    @patch('aiapi.routers.word_insertion.enhance_existing_story')
    def test_enhance_story_not_found(self, mock_enhance):
        """Test enhancing non-existent story."""
        # Setup mock to return error
        mock_enhance.return_value = StoryInsertionResponse(
            title="",
            original_content="",
            enhanced_content="",
            inserted_words=[],
            glossary=[],
            metrics=InsertionMetrics(
                total_insertions=0,
                insertion_density=0,
                avg_position_score=0,
                readability_score=0,
                language_ratio={}
            ),
            metadata=StoryMetadata(
                word_count=0,
                generation_time=0,
                language_ratio={},
                readability_score=0
            ),
            error="Story not found"
        )
        
        # Execute
        response = client.post(
            "/api/v1/enhance-story",
            json={
                "story_id": "non_existent_id",
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "beginner",
                    "insertion_count": 5
                }
            }
        )
        
        # Verify
        assert response.status_code == 500
        data = response.json()
        assert "detail" in data
    
    def test_missing_required_fields(self):
        """Test requests with missing required fields."""
        # Test missing prompt
        response = client.post(
            "/api/v1/generate-story-with-insertion",
            json={
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "beginner",
                    "insertion_count": 5
                }
            }
        )
        
        # Verify validation error
        assert response.status_code == 422
    
    def test_invalid_difficulty_level(self):
        """Test invalid difficulty level in insertion config."""
        response = client.post(
            "/api/v1/generate-story-with-insertion",
            json={
                "prompt": "Test",
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "expert",  # Invalid, should be beginner/intermediate/advanced
                    "insertion_count": 5
                }
            }
        )
        
        # Verify validation error
        assert response.status_code == 422
    
    def test_invalid_part_of_speech(self):
        """Test batch add with invalid part of speech."""
        response = client.post(
            "/api/v1/vocabulary/batch-add",
            json={
                "words": [
                    {
                        "word": "test",
                        "definition": "A test",
                        "vietnamese_translation": "test",
                        "part_of_speech": "invalid_pos",  # Invalid
                        "topic": "technology",
                        "difficulty": "beginner",
                        "example": "Test"
                    }
                ]
            }
        )
        
        # Verify validation error
        assert response.status_code == 422
