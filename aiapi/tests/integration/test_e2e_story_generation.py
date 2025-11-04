"""End-to-end integration tests for story generation with word insertion.

This module tests the complete flow from request to response, verifying:
- Story generation with word insertion
- Story quality and readability
- Different configurations (topics, difficulties, insertion counts)
- Error handling and recovery
- Requirements: 6.1, 6.2, 6.3
"""

import pytest
from unittest.mock import patch, MagicMock
import os

# Disable rate limiting for tests
os.environ["RATE_LIMIT_ENABLED"] = "false"

from aiapi.models import (
    StoryInsertionRequest,
    InsertionConfig,
    StoryInsertionResponse,
    StoryResponse,
    StoryMetadata,
    StoryConfig,
    StoryPreferences
)
from aiapi.services.story_enhancement_service import generate_story_with_insertion
from tests.fixtures.story_fixtures import (
    SAMPLE_STORY_SHORT,
    SAMPLE_STORY_MEDIUM,
    SAMPLE_STORY_LONG
)
from tests.fixtures.vocabulary_fixtures import (
    SAMPLE_VOCABULARY_BEGINNER,
    SAMPLE_VOCABULARY_INTERMEDIATE,
    SAMPLE_VOCABULARY_ADVANCED
)


def create_mock_openai_response(content: str):
    """Helper to create mock OpenAI response."""
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = content
    return mock_response


def create_mock_vocabulary_result(words: list):
    """Helper to create mock vocabulary ChromaDB result."""
    return [
        {
            "id": f"vocab_{i}",
            "document": f"{w['topic']}: {w['definition']}",
            "metadata": {
                "word": w["word"],
                "definition": w["definition"],
                "vietnamese": w["vietnamese_translation"],
                "pos": w["part_of_speech"],
                "topic": w["topic"],
                "difficulty": w["difficulty"],
                "example": w["example"],
                "ipa": w.get("ipa", "")
            }
        }
        for i, w in enumerate(words)
    ]


class TestEndToEndStoryGeneration:
    """Test complete flow from request to response."""
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    @patch('aiapi.services.word_insertion_service.get_embedding')
    @patch('aiapi.services.word_insertion_service.client')
    def test_complete_story_generation_flow_beginner(
        self,
        mock_client,
        mock_embedding,
        mock_vocab,
        mock_generate_story
    ):
        """Test complete flow with beginner difficulty: generate story -> analyze -> insert -> glossary."""
        # Setup mocks
        mock_generate_story.return_value = StoryResponse(
            title="Ngày đầu tiên đi làm",
            content=SAMPLE_STORY_SHORT,
            metadata=StoryMetadata(
                word_count=50,
                generation_time=1000,
                language_ratio={"vietnamese": 100, "english": 0},
                readability_score=75
            )
        )
        
        mock_vocab.return_value = create_mock_vocabulary_result(SAMPLE_VOCABULARY_BEGINNER[:3])
        mock_embedding.return_value = [0.1] * 1536
        
        # Mock OpenAI client for position analysis
        mock_client.chat.completions.create.return_value = create_mock_openai_response(
            '{"positions": [{"sentence_index": 0, "word_index": 7, "position_type": "noun", "score": 0.85, "context": "công ty mới"}, {"sentence_index": 1, "word_index": 3, "position_type": "verb", "score": 0.80, "context": "chuẩn bị"}]}'
        )
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Viết câu chuyện về ngày đầu tiên đi làm",
            insertion_config=InsertionConfig(
                topic="business",
                difficulty="beginner",
                insertion_count=3
            )
        )
        
        # Execute
        result = generate_story_with_insertion(request)
        
        # Verify response structure
        assert isinstance(result, StoryInsertionResponse)
        assert result.title == "Ngày đầu tiên đi làm"
        assert result.error is None
        assert result.original_content is not None
        assert result.enhanced_content is not None
        
        # Verify story quality
        assert result.metadata.readability_score >= 60, "Story should meet minimum readability"
        assert result.metrics.total_insertions >= 0, "Should have insertion count"
        
        # Verify glossary is generated
        assert result.glossary is not None
        assert isinstance(result.glossary, list)
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    @patch('aiapi.services.word_insertion_service.get_embedding')
    @patch('aiapi.services.word_insertion_service.client')
    def test_complete_story_generation_flow_intermediate(
        self,
        mock_client,
        mock_embedding,
        mock_vocab,
        mock_generate_story
    ):
        """Test complete flow with intermediate difficulty and more insertions."""
        # Setup mocks
        mock_generate_story.return_value = StoryResponse(
            title="Công nghệ hiện đại",
            content=SAMPLE_STORY_MEDIUM,
            metadata=StoryMetadata(
                word_count=100,
                generation_time=1500,
                language_ratio={"vietnamese": 100, "english": 0},
                readability_score=70
            )
        )
        
        mock_vocab.return_value = create_mock_vocabulary_result(SAMPLE_VOCABULARY_INTERMEDIATE)
        mock_embedding.return_value = [0.2] * 1536
        
        # Mock multiple position analysis calls
        mock_client.chat.completions.create.return_value = create_mock_openai_response(
            '{"positions": [{"sentence_index": 0, "word_index": 5, "position_type": "noun", "score": 0.88, "context": "công ty"}, {"sentence_index": 1, "word_index": 4, "position_type": "verb", "score": 0.82, "context": "chuẩn bị"}, {"sentence_index": 2, "word_index": 3, "position_type": "noun", "score": 0.79, "context": "văn phòng"}]}'
        )
        
        # Create request with intermediate config
        request = StoryInsertionRequest(
            prompt="Viết câu chuyện về công nghệ hiện đại",
            config=StoryConfig(
                language="vi",
                length="medium",
                style="informative"
            ),
            insertion_config=InsertionConfig(
                topic="technology",
                difficulty="intermediate",
                insertion_count=8,
                bold_format=True,
                show_translation=True
            )
        )
        
        # Execute
        result = generate_story_with_insertion(request)
        
        # Verify
        assert isinstance(result, StoryInsertionResponse)
        assert result.error is None
        assert result.metadata.word_count >= 100
        
        # Verify insertions are formatted correctly
        if result.metrics.total_insertions > 0:
            assert "**" in result.enhanced_content, "Should have bold formatting"
            assert "(" in result.enhanced_content, "Should have translations"
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    @patch('aiapi.services.word_insertion_service.get_embedding')
    @patch('aiapi.services.word_insertion_service.client')
    def test_complete_story_generation_flow_advanced(
        self,
        mock_client,
        mock_embedding,
        mock_vocab,
        mock_generate_story
    ):
        """Test complete flow with advanced difficulty and long story."""
        # Setup mocks
        mock_generate_story.return_value = StoryResponse(
            title="Trí tuệ nhân tạo",
            content=SAMPLE_STORY_LONG,
            metadata=StoryMetadata(
                word_count=150,
                generation_time=2000,
                language_ratio={"vietnamese": 100, "english": 0},
                readability_score=65
            )
        )
        
        mock_vocab.return_value = create_mock_vocabulary_result(SAMPLE_VOCABULARY_ADVANCED)
        mock_embedding.return_value = [0.3] * 1536
        
        # Mock position analysis
        mock_client.chat.completions.create.return_value = create_mock_openai_response(
            '{"positions": [{"sentence_index": 0, "word_index": 2, "position_type": "noun", "score": 0.90, "context": "công nghệ"}, {"sentence_index": 1, "word_index": 5, "position_type": "noun", "score": 0.85, "context": "thuật toán"}]}'
        )
        
        # Create request with advanced config
        request = StoryInsertionRequest(
            prompt="Viết về trí tuệ nhân tạo và ứng dụng",
            config=StoryConfig(
                language="vi",
                length="long",
                style="academic"
            ),
            preferences=StoryPreferences(
                tone="professional",
                target_audience="adults",
                formality="formal"
            ),
            insertion_config=InsertionConfig(
                topic="technology",
                difficulty="advanced",
                insertion_count=12,
                bold_format=True,
                show_translation=True
            )
        )
        
        # Execute
        result = generate_story_with_insertion(request)
        
        # Verify
        assert isinstance(result, StoryInsertionResponse)
        assert result.error is None
        assert result.metadata.word_count >= 150
        
        # Verify metrics
        assert result.metrics.insertion_density >= 0
        assert result.metrics.avg_position_score >= 0


class TestDifferentConfigurations:
    """Test story generation with different configurations."""
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    @patch('aiapi.services.word_insertion_service.get_embedding')
    @patch('aiapi.services.word_insertion_service.client')
    def test_different_topics(
        self,
        mock_client,
        mock_embedding,
        mock_vocab,
        mock_generate_story
    ):
        """Test story generation with different topics."""
        topics = ["technology", "business", "education", "daily life"]
        
        for topic in topics:
            # Setup mocks
            mock_generate_story.return_value = StoryResponse(
                title=f"Story about {topic}",
                content=SAMPLE_STORY_MEDIUM,
                metadata=StoryMetadata(
                    word_count=100,
                    generation_time=1000,
                    language_ratio={"vietnamese": 100, "english": 0},
                    readability_score=70
                )
            )
            
            mock_vocab.return_value = create_mock_vocabulary_result(SAMPLE_VOCABULARY_INTERMEDIATE)
            mock_embedding.return_value = [0.1] * 1536
            mock_client.chat.completions.create.return_value = create_mock_openai_response(
                '{"positions": [{"sentence_index": 0, "word_index": 3, "position_type": "noun", "score": 0.85, "context": "test"}]}'
            )
            
            # Create request
            request = StoryInsertionRequest(
                prompt=f"Viết về {topic}",
                insertion_config=InsertionConfig(
                    topic=topic,
                    difficulty="intermediate",
                    insertion_count=5
                )
            )
            
            # Execute
            result = generate_story_with_insertion(request)
            
            # Verify
            assert isinstance(result, StoryInsertionResponse)
            assert result.error is None
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    @patch('aiapi.services.word_insertion_service.get_embedding')
    @patch('aiapi.services.word_insertion_service.client')
    def test_different_insertion_counts(
        self,
        mock_client,
        mock_embedding,
        mock_vocab,
        mock_generate_story
    ):
        """Test story generation with different insertion counts."""
        insertion_counts = [5, 10, 15]
        
        for count in insertion_counts:
            # Setup mocks
            mock_generate_story.return_value = StoryResponse(
                title="Test Story",
                content=SAMPLE_STORY_LONG,
                metadata=StoryMetadata(
                    word_count=150,
                    generation_time=1000,
                    language_ratio={"vietnamese": 100, "english": 0},
                    readability_score=70
                )
            )
            
            mock_vocab.return_value = create_mock_vocabulary_result(SAMPLE_VOCABULARY_INTERMEDIATE * 3)
            mock_embedding.return_value = [0.1] * 1536
            mock_client.chat.completions.create.return_value = create_mock_openai_response(
                '{"positions": [{"sentence_index": 0, "word_index": 3, "position_type": "noun", "score": 0.85, "context": "test"}]}'
            )
            
            # Create request
            request = StoryInsertionRequest(
                prompt="Test story",
                insertion_config=InsertionConfig(
                    topic="technology",
                    difficulty="intermediate",
                    insertion_count=count
                )
            )
            
            # Execute
            result = generate_story_with_insertion(request)
            
            # Verify
            assert isinstance(result, StoryInsertionResponse)
            assert result.error is None
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    @patch('aiapi.services.word_insertion_service.get_embedding')
    @patch('aiapi.services.word_insertion_service.client')
    def test_formatting_options(
        self,
        mock_client,
        mock_embedding,
        mock_vocab,
        mock_generate_story
    ):
        """Test different formatting options (bold, translation)."""
        # Setup mocks
        mock_generate_story.return_value = StoryResponse(
            title="Test",
            content=SAMPLE_STORY_SHORT,
            metadata=StoryMetadata(
                word_count=50,
                generation_time=1000,
                language_ratio={"vietnamese": 100, "english": 0},
                readability_score=75
            )
        )
        
        mock_vocab.return_value = create_mock_vocabulary_result(SAMPLE_VOCABULARY_BEGINNER)
        mock_embedding.return_value = [0.1] * 1536
        mock_client.chat.completions.create.return_value = create_mock_openai_response(
            '{"positions": [{"sentence_index": 0, "word_index": 3, "position_type": "noun", "score": 0.85, "context": "test"}]}'
        )
        
        # Test with bold and translation
        request1 = StoryInsertionRequest(
            prompt="Test",
            insertion_config=InsertionConfig(
                topic="business",
                difficulty="beginner",
                insertion_count=3,
                bold_format=True,
                show_translation=True
            )
        )
        
        result1 = generate_story_with_insertion(request1)
        assert isinstance(result1, StoryInsertionResponse)
        
        # Test without bold
        request2 = StoryInsertionRequest(
            prompt="Test",
            insertion_config=InsertionConfig(
                topic="business",
                difficulty="beginner",
                insertion_count=3,
                bold_format=False,
                show_translation=True
            )
        )
        
        result2 = generate_story_with_insertion(request2)
        assert isinstance(result2, StoryInsertionResponse)


class TestStoryQuality:
    """Test story quality verification."""
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    @patch('aiapi.services.word_insertion_service.get_embedding')
    @patch('aiapi.services.word_insertion_service.client')
    def test_readability_score_calculation(
        self,
        mock_client,
        mock_embedding,
        mock_vocab,
        mock_generate_story
    ):
        """Test that readability score is calculated correctly."""
        # Setup mocks
        mock_generate_story.return_value = StoryResponse(
            title="Test",
            content=SAMPLE_STORY_MEDIUM,
            metadata=StoryMetadata(
                word_count=100,
                generation_time=1000,
                language_ratio={"vietnamese": 100, "english": 0},
                readability_score=75
            )
        )
        
        mock_vocab.return_value = create_mock_vocabulary_result(SAMPLE_VOCABULARY_INTERMEDIATE)
        mock_embedding.return_value = [0.1] * 1536
        mock_client.chat.completions.create.return_value = create_mock_openai_response(
            '{"positions": [{"sentence_index": 0, "word_index": 3, "position_type": "noun", "score": 0.85, "context": "test"}]}'
        )
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Test",
            insertion_config=InsertionConfig(
                topic="technology",
                difficulty="intermediate",
                insertion_count=5
            )
        )
        
        # Execute
        result = generate_story_with_insertion(request)
        
        # Verify readability
        assert result.metadata.readability_score >= 0
        assert result.metadata.readability_score <= 100
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    @patch('aiapi.services.word_insertion_service.get_embedding')
    @patch('aiapi.services.word_insertion_service.client')
    def test_insertion_density_calculation(
        self,
        mock_client,
        mock_embedding,
        mock_vocab,
        mock_generate_story
    ):
        """Test that insertion density is calculated correctly."""
        # Setup mocks
        mock_generate_story.return_value = StoryResponse(
            title="Test",
            content=SAMPLE_STORY_MEDIUM,
            metadata=StoryMetadata(
                word_count=100,
                generation_time=1000,
                language_ratio={"vietnamese": 100, "english": 0},
                readability_score=70
            )
        )
        
        mock_vocab.return_value = create_mock_vocabulary_result(SAMPLE_VOCABULARY_INTERMEDIATE)
        mock_embedding.return_value = [0.1] * 1536
        mock_client.chat.completions.create.return_value = create_mock_openai_response(
            '{"positions": [{"sentence_index": 0, "word_index": 3, "position_type": "noun", "score": 0.85, "context": "test"}]}'
        )
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Test",
            insertion_config=InsertionConfig(
                topic="technology",
                difficulty="intermediate",
                insertion_count=10
            )
        )
        
        # Execute
        result = generate_story_with_insertion(request)
        
        # Verify insertion density
        assert result.metrics.insertion_density >= 0
        # Density should be reasonable (not more than 20 insertions per 100 words)
        assert result.metrics.insertion_density <= 20
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    @patch('aiapi.services.word_insertion_service.get_embedding')
    @patch('aiapi.services.word_insertion_service.client')
    def test_language_ratio_tracking(
        self,
        mock_client,
        mock_embedding,
        mock_vocab,
        mock_generate_story
    ):
        """Test that language ratio is tracked correctly."""
        # Setup mocks
        mock_generate_story.return_value = StoryResponse(
            title="Test",
            content=SAMPLE_STORY_MEDIUM,
            metadata=StoryMetadata(
                word_count=100,
                generation_time=1000,
                language_ratio={"vietnamese": 100, "english": 0},
                readability_score=70
            )
        )
        
        mock_vocab.return_value = create_mock_vocabulary_result(SAMPLE_VOCABULARY_INTERMEDIATE)
        mock_embedding.return_value = [0.1] * 1536
        mock_client.chat.completions.create.return_value = create_mock_openai_response(
            '{"positions": [{"sentence_index": 0, "word_index": 3, "position_type": "noun", "score": 0.85, "context": "test"}]}'
        )
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Test",
            insertion_config=InsertionConfig(
                topic="technology",
                difficulty="intermediate",
                insertion_count=5
            )
        )
        
        # Execute
        result = generate_story_with_insertion(request)
        
        # Verify language ratio
        assert "vietnamese" in result.metrics.language_ratio
        assert "english" in result.metrics.language_ratio
        assert result.metrics.language_ratio["vietnamese"] > 0


class TestErrorRecovery:
    """Test error handling and recovery in end-to-end flow."""
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    def test_story_generation_failure(self, mock_generate_story):
        """Test handling of story generation failures."""
        # Setup mock to raise exception
        mock_generate_story.side_effect = Exception("Generation failed")
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Test",
            insertion_config=InsertionConfig(
                topic="technology",
                difficulty="beginner",
                insertion_count=5
            )
        )
        
        # Execute
        result = generate_story_with_insertion(request)
        
        # Verify error is captured
        assert isinstance(result, StoryInsertionResponse)
        assert result.error is not None
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    def test_vocabulary_service_failure(
        self,
        mock_vocab,
        mock_generate_story
    ):
        """Test recovery when vocabulary service fails."""
        # Setup mocks
        mock_generate_story.return_value = StoryResponse(
            title="Test",
            content=SAMPLE_STORY_SHORT,
            metadata=StoryMetadata(
                word_count=50,
                generation_time=1000,
                language_ratio={"vietnamese": 100, "english": 0},
                readability_score=75
            )
        )
        
        # Vocabulary service returns empty
        mock_vocab.return_value = []
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Test",
            insertion_config=InsertionConfig(
                topic="technology",
                difficulty="beginner",
                insertion_count=5
            )
        )
        
        # Execute
        result = generate_story_with_insertion(request)
        
        # Verify - should return story without insertions
        assert isinstance(result, StoryInsertionResponse)
        assert result.metrics.total_insertions == 0
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    @patch('aiapi.services.word_insertion_service.get_embedding')
    @patch('aiapi.services.word_insertion_service.client')
    def test_position_analysis_failure(
        self,
        mock_client,
        mock_embedding,
        mock_vocab,
        mock_generate_story
    ):
        """Test recovery when position analysis fails."""
        # Setup mocks
        mock_generate_story.return_value = StoryResponse(
            title="Test",
            content=SAMPLE_STORY_SHORT,
            metadata=StoryMetadata(
                word_count=50,
                generation_time=1000,
                language_ratio={"vietnamese": 100, "english": 0},
                readability_score=75
            )
        )
        
        mock_vocab.return_value = create_mock_vocabulary_result(SAMPLE_VOCABULARY_BEGINNER)
        mock_embedding.return_value = [0.1] * 1536
        
        # Position analysis fails
        mock_client.chat.completions.create.side_effect = Exception("API error")
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Test",
            insertion_config=InsertionConfig(
                topic="business",
                difficulty="beginner",
                insertion_count=3
            )
        )
        
        # Execute
        result = generate_story_with_insertion(request)
        
        # Verify - should handle gracefully
        assert isinstance(result, StoryInsertionResponse)
        # May have error or zero insertions
        assert result.error is not None or result.metrics.total_insertions == 0


class TestResponseCompleteness:
    """Test that responses contain all required fields."""
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    @patch('aiapi.services.word_insertion_service.get_embedding')
    @patch('aiapi.services.word_insertion_service.client')
    def test_response_has_all_required_fields(
        self,
        mock_client,
        mock_embedding,
        mock_vocab,
        mock_generate_story
    ):
        """Test that response contains all required fields."""
        # Setup mocks
        mock_generate_story.return_value = StoryResponse(
            title="Test",
            content=SAMPLE_STORY_SHORT,
            metadata=StoryMetadata(
                word_count=50,
                generation_time=1000,
                language_ratio={"vietnamese": 100, "english": 0},
                readability_score=75
            )
        )
        
        mock_vocab.return_value = create_mock_vocabulary_result(SAMPLE_VOCABULARY_BEGINNER)
        mock_embedding.return_value = [0.1] * 1536
        mock_client.chat.completions.create.return_value = create_mock_openai_response(
            '{"positions": [{"sentence_index": 0, "word_index": 3, "position_type": "noun", "score": 0.85, "context": "test"}]}'
        )
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Test",
            insertion_config=InsertionConfig(
                topic="business",
                difficulty="beginner",
                insertion_count=3
            )
        )
        
        # Execute
        result = generate_story_with_insertion(request)
        
        # Verify all required fields
        assert hasattr(result, 'title')
        assert hasattr(result, 'original_content')
        assert hasattr(result, 'enhanced_content')
        assert hasattr(result, 'inserted_words')
        assert hasattr(result, 'glossary')
        assert hasattr(result, 'metrics')
        assert hasattr(result, 'metadata')
        assert hasattr(result, 'error')
        
        # Verify metrics fields
        assert hasattr(result.metrics, 'total_insertions')
        assert hasattr(result.metrics, 'insertion_density')
        assert hasattr(result.metrics, 'avg_position_score')
        assert hasattr(result.metrics, 'readability_score')
        assert hasattr(result.metrics, 'language_ratio')
        
        # Verify metadata fields
        assert hasattr(result.metadata, 'word_count')
        assert hasattr(result.metadata, 'generation_time')
