"""Unit tests for story enhancement service."""

import pytest
from unittest.mock import Mock, patch, MagicMock

from aiapi.services.story_enhancement_service import (
    generate_story_with_insertion,
    calculate_insertion_metrics
)
from aiapi.models import (
    StoryInsertionRequest,
    InsertionConfig,
    StoryConfig,
    StoryPreferences,
    VocabularyWord,
    InsertionPosition,
    StoryMetadata,
    StoryResponse,
    InsertionMetrics
)


class TestMetricsCalculation:
    """Test insertion metrics calculation."""
    
    def test_calculate_insertion_metrics_basic(self):
        """Test basic metrics calculation."""
        original = "Đây là một câu chuyện về công nghệ. Chúng ta sẽ học nhiều điều mới."
        enhanced = "Đây là một câu chuyện về **technology** (công nghệ). Chúng ta sẽ **learn** (học) nhiều điều mới."
        
        # Execute
        metrics = calculate_insertion_metrics(original, enhanced)
        
        # Verify
        assert metrics.total_insertions == 2
        assert metrics.insertion_density > 0
        assert metrics.readability_score > 0
        assert "vi" in metrics.language_ratio or "vietnamese" in metrics.language_ratio
        assert "en" in metrics.language_ratio or "english" in metrics.language_ratio
    
    def test_calculate_insertion_metrics_no_insertions(self):
        """Test metrics with no insertions."""
        original = "Đây là một câu chuyện."
        enhanced = "Đây là một câu chuyện."
        
        # Execute
        metrics = calculate_insertion_metrics(original, enhanced)
        
        # Verify
        assert metrics.total_insertions == 0
        assert metrics.insertion_density == 0
    
    def test_calculate_insertion_metrics_density(self):
        """Test insertion density calculation."""
        # 10 words, 2 insertions = 20% density
        original = "Một hai ba bốn năm sáu bảy tám chín mười"
        enhanced = "Một **one** hai ba bốn năm sáu **seven** bảy tám chín mười"
        
        # Execute
        metrics = calculate_insertion_metrics(original, enhanced)
        
        # Verify
        assert metrics.total_insertions == 2
        # Density should be around 20 (2 insertions per 10 words * 100)
        assert 15 <= metrics.insertion_density <= 25
    
    def test_calculate_insertion_metrics_readability(self):
        """Test readability score calculation."""
        original = "Câu ngắn. Câu dài hơn một chút. Câu rất dài với nhiều từ hơn nữa."
        enhanced = original
        
        # Execute
        metrics = calculate_insertion_metrics(original, enhanced)
        
        # Verify
        assert metrics.readability_score > 0
        assert metrics.readability_score <= 100


class TestStoryGeneration:
    """Test story generation with insertion."""
    
    @patch('aiapi.services.story_enhancement_service.generate_glossary')
    @patch('aiapi.services.story_enhancement_service.insert_words_into_story')
    @patch('aiapi.services.story_enhancement_service.select_vocabulary_for_insertion')
    @patch('aiapi.services.story_enhancement_service.analyze_story_structure')
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    def test_generate_story_with_insertion_success(
        self,
        mock_generate,
        mock_analyze,
        mock_select,
        mock_insert,
        mock_glossary
    ):
        """Test successful story generation with insertion."""
        # Setup mocks
        mock_generate.return_value = StoryResponse(
            title="Test Story",
            content="Đây là một câu chuyện về công nghệ.",
            metadata=StoryMetadata(
                word_count=10,
                generation_time=1000,
                language_ratio={"vi": 100, "en": 0},
                readability_score=70
            )
        )
        
        mock_analyze.return_value = [
            InsertionPosition(
                sentence_index=0,
                word_index=5,
                position_type="noun",
                score=0.85,
                context="công nghệ"
            )
        ]
        
        mock_select.return_value = [
            VocabularyWord(
                word="technology",
                definition="The application of science",
                vietnamese_translation="công nghệ",
                part_of_speech="noun",
                topic="technology",
                difficulty="intermediate",
                example="Technology is important"
            )
        ]
        
        mock_insert.return_value = "Đây là một câu chuyện về **technology** (công nghệ)."
        
        mock_glossary.return_value = [
            {
                "word": "technology",
                "definition": "The application of science",
                "vietnamese": "công nghệ",
                "part_of_speech": "noun",
                "example": "Technology is important"
            }
        ]
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Viết câu chuyện về công nghệ",
            insertion_config=InsertionConfig(
                topic="technology",
                difficulty="intermediate",
                insertion_count=5
            )
        )
        
        # Execute
        response = generate_story_with_insertion(request)
        
        # Verify
        assert response.title == "Test Story"
        assert response.original_content is not None
        assert response.enhanced_content is not None
        assert len(response.inserted_words) > 0
        assert len(response.glossary) > 0
        assert response.metrics is not None
        assert response.error is None
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    def test_generate_story_with_insertion_handles_error(self, mock_generate):
        """Test error handling in story generation."""
        # Setup mock to raise error
        mock_generate.side_effect = Exception("API Error")
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Test prompt",
            insertion_config=InsertionConfig(
                topic="technology",
                difficulty="beginner",
                insertion_count=5
            )
        )
        
        # Execute
        response = generate_story_with_insertion(request)
        
        # Verify
        assert response.error is not None
        assert "API Error" in response.error or "error" in response.error.lower()
    
    @patch('aiapi.services.story_enhancement_service.generate_glossary')
    @patch('aiapi.services.story_enhancement_service.insert_words_into_story')
    @patch('aiapi.services.story_enhancement_service.select_vocabulary_for_insertion')
    @patch('aiapi.services.story_enhancement_service.analyze_story_structure')
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    def test_generate_story_respects_insertion_config(
        self,
        mock_generate,
        mock_analyze,
        mock_select,
        mock_insert,
        mock_glossary
    ):
        """Test that insertion config is respected."""
        # Setup mocks
        mock_generate.return_value = StoryResponse(
            title="Test",
            content="Test content",
            metadata=StoryMetadata(
                word_count=10,
                generation_time=1000,
                language_ratio={"vi": 100, "en": 0},
                readability_score=70
            )
        )
        
        mock_analyze.return_value = [
            InsertionPosition(
                sentence_index=0,
                word_index=1,
                position_type="noun",
                score=0.85,
                context="test"
            )
        ]
        
        mock_select.return_value = []
        mock_insert.return_value = "Test content"
        mock_glossary.return_value = []
        
        # Create request with specific config
        request = StoryInsertionRequest(
            prompt="Test",
            insertion_config=InsertionConfig(
                topic="business",
                difficulty="advanced",
                insertion_count=10,
                bold_format=False,
                show_translation=False
            )
        )
        
        # Execute
        response = generate_story_with_insertion(request)
        
        # Verify that select_vocabulary was called with correct params
        mock_select.assert_called_once()
        call_args = mock_select.call_args
        assert call_args[1]["topic"] == "business"
        assert call_args[1]["difficulty"] == "advanced"
        assert call_args[1]["count"] == 10
    
    @patch('aiapi.services.story_enhancement_service.add_story_to_chromadb')
    @patch('aiapi.services.story_enhancement_service.generate_glossary')
    @patch('aiapi.services.story_enhancement_service.insert_words_into_story')
    @patch('aiapi.services.story_enhancement_service.select_vocabulary_for_insertion')
    @patch('aiapi.services.story_enhancement_service.analyze_story_structure')
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    def test_generate_story_saves_to_chromadb(
        self,
        mock_generate,
        mock_analyze,
        mock_select,
        mock_insert,
        mock_glossary,
        mock_save
    ):
        """Test that generated story is saved to ChromaDB."""
        # Setup mocks
        mock_generate.return_value = StoryResponse(
            title="Test",
            content="Test content",
            metadata=StoryMetadata(
                word_count=10,
                generation_time=1000,
                language_ratio={"vi": 100, "en": 0},
                readability_score=70
            )
        )
        
        mock_analyze.return_value = []
        mock_select.return_value = []
        mock_insert.return_value = "Test content"
        mock_glossary.return_value = []
        mock_save.return_value = True
        
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
        response = generate_story_with_insertion(request)
        
        # Verify ChromaDB save was called
        mock_save.assert_called_once()


class TestIntegration:
    """Integration tests for story enhancement service."""
    
    def test_full_pipeline_with_mocks(self):
        """Test full pipeline with all components mocked."""
        with patch('aiapi.services.story_enhancement_service.generate_advanced_story') as mock_gen, \
             patch('aiapi.services.story_enhancement_service.analyze_story_structure') as mock_analyze, \
             patch('aiapi.services.story_enhancement_service.select_vocabulary_for_insertion') as mock_select, \
             patch('aiapi.services.story_enhancement_service.insert_words_into_story') as mock_insert, \
             patch('aiapi.services.story_enhancement_service.generate_glossary') as mock_glossary:
            
            # Setup complete mock chain
            mock_gen.return_value = StoryResponse(
                title="Technology Story",
                content="Câu chuyện về máy tính và lập trình.",
                metadata=StoryMetadata(
                    word_count=10,
                    generation_time=1500,
                    language_ratio={"vi": 100, "en": 0},
                    readability_score=70
                )
            )
            
            mock_analyze.return_value = [
                InsertionPosition(
                    sentence_index=0,
                    word_index=3,
                    position_type="noun",
                    score=0.90,
                    context="máy tính"
                )
            ]
            
            mock_select.return_value = [
                VocabularyWord(
                    word="computer",
                    definition="Electronic device",
                    vietnamese_translation="máy tính",
                    part_of_speech="noun",
                    topic="technology",
                    difficulty="beginner",
                    example="I use a computer"
                )
            ]
            
            mock_insert.return_value = "Câu chuyện về **computer** (máy tính) và lập trình."
            
            mock_glossary.return_value = [
                {
                    "word": "computer",
                    "definition": "Electronic device",
                    "vietnamese": "máy tính",
                    "part_of_speech": "noun",
                    "example": "I use a computer"
                }
            ]
            
            # Create request
            request = StoryInsertionRequest(
                prompt="Viết về công nghệ",
                insertion_config=InsertionConfig(
                    topic="technology",
                    difficulty="beginner",
                    insertion_count=5
                )
            )
            
            # Execute
            response = generate_story_with_insertion(request)
            
            # Verify complete response
            assert response.title == "Technology Story"
            assert "computer" in response.enhanced_content
            assert len(response.inserted_words) == 1
            assert len(response.glossary) == 1
            assert response.metrics.total_insertions == 1
            assert response.error is None


class TestStoryGenerationWithInsertion:
    """Comprehensive tests for story generation with insertion."""
    
    @patch('aiapi.services.story_enhancement_service.save_enhanced_story_to_chromadb')
    @patch('aiapi.services.story_enhancement_service.generate_glossary')
    @patch('aiapi.services.story_enhancement_service.insert_words_into_story')
    @patch('aiapi.services.story_enhancement_service.select_vocabulary_for_insertion')
    @patch('aiapi.services.story_enhancement_service.analyze_story_structure')
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    def test_story_generation_with_multiple_insertions(
        self,
        mock_generate,
        mock_analyze,
        mock_select,
        mock_insert,
        mock_glossary,
        mock_save
    ):
        """Test story generation with multiple word insertions."""
        # Setup mocks
        mock_generate.return_value = StoryResponse(
            title="Education Story",
            content="Học sinh đi học mỗi ngày. Họ học nhiều môn khác nhau.",
            metadata=StoryMetadata(
                word_count=15,
                generation_time=1200,
                readability_score=75,
                language_ratio={"vi": 100, "en": 0}
            )
        )
        
        mock_analyze.return_value = [
            InsertionPosition(sentence_index=0, word_index=2, position_type="verb", score=0.85, context="đi học"),
            InsertionPosition(sentence_index=1, word_index=1, position_type="verb", score=0.82, context="học"),
            InsertionPosition(sentence_index=1, word_index=3, position_type="adjective", score=0.78, context="khác nhau")
        ]
        
        mock_select.return_value = [
            VocabularyWord(
                word="study",
                definition="To learn",
                vietnamese_translation="học",
                part_of_speech="verb",
                topic="education",
                difficulty="beginner",
                example="I study every day"
            ),
            VocabularyWord(
                word="different",
                definition="Not the same",
                vietnamese_translation="khác nhau",
                part_of_speech="adjective",
                topic="general",
                difficulty="beginner",
                example="They are different"
            )
        ]
        
        mock_insert.return_value = "Học sinh đi **study** (học) mỗi ngày. Họ học nhiều môn **different** (khác nhau)."
        
        mock_glossary.return_value = [
            {"word": "study", "definition": "To learn", "vietnamese": "học", "part_of_speech": "verb", "example": "I study every day"},
            {"word": "different", "definition": "Not the same", "vietnamese": "khác nhau", "part_of_speech": "adjective", "example": "They are different"}
        ]
        
        mock_save.return_value = "story_123"
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Viết về giáo dục",
            insertion_config=InsertionConfig(
                topic="education",
                difficulty="beginner",
                insertion_count=5
            )
        )
        
        # Execute
        response = generate_story_with_insertion(request)
        
        # Verify
        assert response.title == "Education Story"
        assert response.original_content == "Học sinh đi học mỗi ngày. Họ học nhiều môn khác nhau."
        assert "study" in response.enhanced_content
        assert "different" in response.enhanced_content
        assert len(response.inserted_words) == 2
        assert len(response.glossary) == 2
        assert response.metrics.total_insertions == 2
        assert response.error is None
        
        # Verify ChromaDB save was called
        mock_save.assert_called_once()
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    def test_story_generation_no_positions_found(self, mock_generate):
        """Test story generation when no insertion positions are found."""
        # Setup mock
        mock_generate.return_value = StoryResponse(
            title="Simple Story",
            content="Xin chào.",
            metadata=StoryMetadata(
                word_count=2,
                generation_time=800,
                readability_score=80,
                language_ratio={"vi": 100, "en": 0}
            )
        )
        
        with patch('aiapi.services.story_enhancement_service.analyze_story_structure') as mock_analyze:
            mock_analyze.return_value = []
            
            # Create request
            request = StoryInsertionRequest(
                prompt="Viết câu ngắn",
                insertion_config=InsertionConfig(
                    topic="general",
                    difficulty="beginner",
                    insertion_count=5
                )
            )
            
            # Execute
            response = generate_story_with_insertion(request)
            
            # Verify - should return story without insertions
            assert response.title == "Simple Story"
            assert response.original_content == "Xin chào."
            assert response.enhanced_content == "Xin chào."
            assert len(response.inserted_words) == 0
            assert len(response.glossary) == 0
            assert response.metrics.total_insertions == 0
            assert "No suitable insertion positions found" in response.error
    
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    def test_story_generation_no_vocabulary_found(self, mock_generate):
        """Test story generation when no suitable vocabulary is found."""
        # Setup mocks
        mock_generate.return_value = StoryResponse(
            title="Test Story",
            content="Đây là câu chuyện test với nhiều từ để có vị trí chèn.",
            metadata=StoryMetadata(
                word_count=10,
                generation_time=900,
                readability_score=75,
                language_ratio={"vi": 100, "en": 0}
            )
        )
        
        with patch('aiapi.services.story_enhancement_service.analyze_story_structure') as mock_analyze, \
             patch('aiapi.services.story_enhancement_service.select_vocabulary_for_insertion') as mock_select:
            
            # Return positions so we pass that check
            mock_analyze.return_value = [
                InsertionPosition(sentence_index=0, word_index=2, position_type="noun", score=0.85, context="câu chuyện"),
                InsertionPosition(sentence_index=0, word_index=4, position_type="noun", score=0.82, context="test"),
                InsertionPosition(sentence_index=0, word_index=6, position_type="adjective", score=0.80, context="nhiều")
            ]
            
            # But return no vocabulary
            mock_select.return_value = []
            
            # Create request
            request = StoryInsertionRequest(
                prompt="Test",
                insertion_config=InsertionConfig(
                    topic="obscure_topic",
                    difficulty="advanced",
                    insertion_count=5
                )
            )
            
            # Execute
            response = generate_story_with_insertion(request)
            
            # Verify - should return story without insertions
            assert response.title == "Test Story"
            assert len(response.inserted_words) == 0
            assert "No suitable vocabulary found" in response.error
    
    @patch('aiapi.services.story_enhancement_service.save_enhanced_story_to_chromadb')
    @patch('aiapi.services.story_enhancement_service.validate_grammar_after_insertion')
    @patch('aiapi.services.story_enhancement_service.generate_glossary')
    @patch('aiapi.services.story_enhancement_service.insert_words_into_story')
    @patch('aiapi.services.story_enhancement_service.select_vocabulary_for_insertion')
    @patch('aiapi.services.story_enhancement_service.analyze_story_structure')
    @patch('aiapi.services.story_enhancement_service.generate_advanced_story')
    def test_story_generation_with_grammar_validation(
        self,
        mock_generate,
        mock_analyze,
        mock_select,
        mock_insert,
        mock_glossary,
        mock_validate_grammar,
        mock_save
    ):
        """Test story generation with grammar validation."""
        # Setup mocks
        mock_generate.return_value = StoryResponse(
            title="Grammar Test",
            content="Tôi đi làm mỗi ngày.",
            metadata=StoryMetadata(
                word_count=6,
                generation_time=1000,
                readability_score=80,
                language_ratio={"vi": 100, "en": 0}
            )
        )
        
        mock_analyze.return_value = [
            InsertionPosition(sentence_index=0, word_index=2, position_type="verb", score=0.85, context="đi làm")
        ]
        
        mock_select.return_value = [
            VocabularyWord(
                word="work",
                definition="To do a job",
                vietnamese_translation="làm việc",
                part_of_speech="verb",
                topic="business",
                difficulty="beginner",
                example="I work every day"
            )
        ]
        
        mock_insert.return_value = "Tôi đi **work** (làm việc) mỗi ngày."
        
        mock_validate_grammar.return_value = {
            "is_valid": True,
            "overall_score": 0.9,
            "issues": [],
            "problematic_sentences": []
        }
        
        mock_glossary.return_value = [
            {"word": "work", "definition": "To do a job", "vietnamese": "làm việc", "part_of_speech": "verb", "example": "I work every day"}
        ]
        
        mock_save.return_value = "story_456"
        
        # Create request
        request = StoryInsertionRequest(
            prompt="Viết về công việc",
            insertion_config=InsertionConfig(
                topic="business",
                difficulty="beginner",
                insertion_count=5
            )
        )
        
        # Execute
        response = generate_story_with_insertion(request)
        
        # Verify
        assert response.error is None
        assert "work" in response.enhanced_content
        
        # Verify grammar validation was called
        mock_validate_grammar.assert_called()


class TestMetricsCalculationComprehensive:
    """Comprehensive tests for metrics calculation."""
    
    def test_metrics_with_various_insertion_counts(self):
        """Test metrics calculation with different insertion counts."""
        test_cases = [
            (0, "Đây là câu chuyện.", "Đây là câu chuyện."),
            (1, "Đây là câu chuyện.", "Đây là **story** (câu chuyện)."),
            (3, "Tôi học tiếng Anh mỗi ngày.", "Tôi **study** (học) **English** (tiếng Anh) mỗi **day** (ngày)."),
        ]
        
        for expected_count, original, enhanced in test_cases:
            metrics = calculate_insertion_metrics(original, enhanced)
            assert metrics.total_insertions == expected_count
    
    def test_metrics_language_ratio(self):
        """Test language ratio calculation in metrics."""
        original = "Tôi học tiếng Anh."
        enhanced = "Tôi **study** (học) **English** (tiếng Anh)."
        
        metrics = calculate_insertion_metrics(original, enhanced)
        
        # Should have both Vietnamese and English
        assert "vi" in metrics.language_ratio or "vietnamese" in metrics.language_ratio
        assert "en" in metrics.language_ratio or "english" in metrics.language_ratio
    
    def test_metrics_readability_score_range(self):
        """Test that readability score is within valid range."""
        original = "Câu ngắn. Câu dài hơn. Câu rất dài với nhiều từ."
        enhanced = "Câu ngắn. Câu **long** (dài) hơn. Câu rất **long** (dài) với nhiều **words** (từ)."
        
        metrics = calculate_insertion_metrics(original, enhanced)
        
        # Readability score should be between 0 and 100
        assert 0 <= metrics.readability_score <= 100
    
    def test_metrics_insertion_density_calculation(self):
        """Test insertion density calculation accuracy."""
        # 20 words, 4 insertions = 20% density
        original = "Một hai ba bốn năm sáu bảy tám chín mười mười_một mười_hai mười_ba mười_bốn mười_lăm mười_sáu mười_bảy mười_tám mười_chín hai_mươi"
        enhanced = "Một **one** hai ba bốn **five** năm sáu bảy tám chín mười **eleven** mười_một mười_hai mười_ba mười_bốn mười_lăm mười_sáu mười_bảy **eighteen** mười_tám mười_chín hai_mươi"
        
        metrics = calculate_insertion_metrics(original, enhanced)
        
        assert metrics.total_insertions == 4
        # Density should be around 20 (4/20 * 100)
        assert 15 <= metrics.insertion_density <= 25


class TestChromaDBIntegration:
    """Tests for ChromaDB integration in story enhancement."""
    
    @patch('aiapi.services.story_enhancement_service.add_story_to_chromadb')
    def test_save_enhanced_story_to_chromadb_success(self, mock_add_story):
        """Test successful save of enhanced story to ChromaDB."""
        from aiapi.services.story_enhancement_service import save_enhanced_story_to_chromadb
        
        # Setup mock
        mock_add_story.return_value = True
        
        # Create test data
        vocabulary = [
            VocabularyWord(
                word="computer",
                definition="Electronic device",
                vietnamese_translation="máy tính",
                part_of_speech="noun",
                topic="technology",
                difficulty="intermediate",
                example="I use a computer"
            ),
            VocabularyWord(
                word="program",
                definition="Software application",
                vietnamese_translation="chương trình",
                part_of_speech="noun",
                topic="technology",
                difficulty="intermediate",
                example="I write a program"
            )
        ]
        
        metrics = InsertionMetrics(
            total_insertions=2,
            insertion_density=15.5,
            avg_position_score=0.85,
            readability_score=75,
            language_ratio={"vi": 60, "en": 40}
        )
        
        metadata = StoryMetadata(
            word_count=20,
            language_ratio={"vi": 60, "en": 40},
            generation_time=1500,
            readability_score=75
        )
        
        # Execute
        story_id = save_enhanced_story_to_chromadb(
            title="Tech Story",
            enhanced_content="Story with **computer** and **program**",
            original_content="Story with máy tính and chương trình",
            prompt="Write about technology",
            inserted_words=vocabulary,
            metrics=metrics,
            metadata=metadata
        )
        
        # Verify
        assert story_id != ""
        assert story_id.startswith("story_insertion_")
        
        # Verify add_story_to_chromadb was called with correct metadata
        mock_add_story.assert_called_once()
        call_args = mock_add_story.call_args
        
        # Check metadata includes insertion information
        saved_metadata = call_args[1]["metadata"]
        assert saved_metadata["has_insertion"] is True
        assert saved_metadata["insertion_count"] == 2
        assert "technology" in saved_metadata["insertion_topics"]
        assert saved_metadata["insertion_difficulty"] == "intermediate"
        assert saved_metadata["insertion_density"] == 15.5
        assert saved_metadata["avg_position_score"] == 0.85
    
    @patch('aiapi.services.story_enhancement_service.add_story_to_chromadb')
    def test_save_enhanced_story_handles_failure(self, mock_add_story):
        """Test handling of ChromaDB save failure."""
        from aiapi.services.story_enhancement_service import save_enhanced_story_to_chromadb
        
        # Setup mock to return False (failure)
        mock_add_story.return_value = False
        
        # Create minimal test data
        vocabulary = []
        metrics = InsertionMetrics(
            total_insertions=0,
            insertion_density=0.0,
            avg_position_score=0.0,
            readability_score=70,
            language_ratio={"vi": 100, "en": 0}
        )
        metadata = StoryMetadata(
            word_count=10,
            language_ratio={"vi": 100, "en": 0},
            generation_time=1000,
            readability_score=70
        )
        
        # Execute
        story_id = save_enhanced_story_to_chromadb(
            title="Test",
            enhanced_content="Test content",
            original_content="Test content",
            prompt="Test",
            inserted_words=vocabulary,
            metrics=metrics,
            metadata=metadata
        )
        
        # Verify - should return empty string on failure
        assert story_id == ""
    
    @patch('aiapi.services.story_enhancement_service.add_story_to_chromadb')
    def test_save_enhanced_story_with_multiple_topics(self, mock_add_story):
        """Test saving story with vocabulary from multiple topics."""
        from aiapi.services.story_enhancement_service import save_enhanced_story_to_chromadb
        
        # Setup mock
        mock_add_story.return_value = True
        
        # Create vocabulary with multiple topics
        vocabulary = [
            VocabularyWord(
                word="computer",
                definition="Electronic device",
                vietnamese_translation="máy tính",
                part_of_speech="noun",
                topic="technology",
                difficulty="beginner",
                example="I use a computer"
            ),
            VocabularyWord(
                word="study",
                definition="To learn",
                vietnamese_translation="học",
                part_of_speech="verb",
                topic="education",
                difficulty="beginner",
                example="I study"
            ),
            VocabularyWord(
                word="business",
                definition="Commercial activity",
                vietnamese_translation="kinh doanh",
                part_of_speech="noun",
                topic="business",
                difficulty="intermediate",
                example="I do business"
            )
        ]
        
        metrics = InsertionMetrics(
            total_insertions=3,
            insertion_density=20.0,
            avg_position_score=0.80,
            readability_score=70,
            language_ratio={"vi": 50, "en": 50}
        )
        
        metadata = StoryMetadata(
            word_count=15,
            language_ratio={"vi": 50, "en": 50},
            generation_time=1200,
            readability_score=70
        )
        
        # Execute
        story_id = save_enhanced_story_to_chromadb(
            title="Multi-topic Story",
            enhanced_content="Story content",
            original_content="Story content",
            prompt="Test",
            inserted_words=vocabulary,
            metrics=metrics,
            metadata=metadata
        )
        
        # Verify
        assert story_id != ""
        
        # Check that all topics are included
        call_args = mock_add_story.call_args
        saved_metadata = call_args[1]["metadata"]
        topics = saved_metadata["insertion_topics"]
        
        assert "technology" in topics
        assert "education" in topics
        assert "business" in topics
        assert len(topics) == 3
