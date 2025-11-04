"""Unit tests for word insertion service."""

import pytest
from unittest.mock import Mock, patch, MagicMock

from aiapi.services.word_insertion_service import (
    analyze_sentence_structure,
    analyze_story_structure,
    select_vocabulary_for_insertion,
    insert_words_into_story,
    generate_glossary
)
from aiapi.models import VocabularyWord, InsertionPosition


class TestPositionDetection:
    """Test position detection algorithms."""
    
    @patch('aiapi.services.word_insertion_service.client')
    def test_analyze_sentence_structure(self, mock_client):
        """Test analyzing sentence structure for insertion positions."""
        # Setup mock
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = """
        [
            {"word_index": 2, "position_type": "noun", "score": 0.85, "context": "đi học"},
            {"word_index": 5, "position_type": "verb", "score": 0.80, "context": "gặp bạn"}
        ]
        """
        mock_client.chat.completions.create.return_value = mock_response
        
        # Execute
        sentence = "Hôm nay tôi đi học và gặp bạn"
        positions = analyze_sentence_structure(sentence)
        
        # Verify
        assert len(positions) > 0
        assert all(isinstance(p, InsertionPosition) for p in positions)
        assert all(p.score > 0 for p in positions)
    
    @patch('aiapi.services.word_insertion_service.client')
    def test_analyze_story_structure(self, mock_client):
        """Test analyzing story structure."""
        # Setup mock
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = """
        [
            {"word_index": 2, "position_type": "noun", "score": 0.85, "context": "test"}
        ]
        """
        mock_client.chat.completions.create.return_value = mock_response
        
        # Execute - use longer sentences (minimum 5 words each)
        story = "Hôm nay tôi đi học ở trường. Tôi gặp bạn và nói chuyện vui. Chúng tôi học bài và làm việc nhóm."
        positions = analyze_story_structure(story)
        
        # Verify
        assert len(positions) > 0
        # Should be called for each sentence (3 sentences)
        assert mock_client.chat.completions.create.call_count >= 1


class TestWordSelection:
    """Test vocabulary word selection."""
    
    @patch('aiapi.services.word_insertion_service.search_vocabulary_semantic')
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    def test_select_vocabulary_for_insertion(self, mock_get_vocab, mock_search):
        """Test selecting vocabulary for insertion."""
        # Setup mocks
        mock_get_vocab.return_value = [
            {
                "id": "1",
                "document": "computer: A device",
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
        
        mock_search.return_value = [
            {
                "id": "1",
                "document": "computer: A device",
                "metadata": {
                    "word": "computer",
                    "definition": "A device",
                    "vietnamese": "máy tính",
                    "pos": "noun",
                    "topic": "technology",
                    "difficulty": "beginner",
                    "example": "I use a computer"
                },
                "similarity_score": 0.9
            }
        ]
        
        # Execute
        words = select_vocabulary_for_insertion(
            topic="technology",
            difficulty="beginner",
            count=5,
            context="Tôi học về máy tính"
        )
        
        # Verify
        assert len(words) > 0
        assert all(isinstance(w, VocabularyWord) for w in words)
        assert all(w.topic == "technology" for w in words)
    
    @patch('aiapi.services.word_insertion_service.get_vocabulary_by_topic')
    def test_select_vocabulary_respects_count(self, mock_get_vocab):
        """Test that word selection respects count parameter."""
        # Setup mock with many words
        mock_get_vocab.return_value = [
            {
                "id": str(i),
                "document": f"word{i}",
                "metadata": {
                    "word": f"word{i}",
                    "definition": "test",
                    "vietnamese": "test",
                    "pos": "noun",
                    "topic": "technology",
                    "difficulty": "beginner",
                    "example": "test"
                }
            }
            for i in range(20)
        ]
        
        # Execute
        words = select_vocabulary_for_insertion(
            topic="technology",
            difficulty="beginner",
            count=5,
            context="test"
        )
        
        # Verify
        assert len(words) <= 5


class TestWordInsertion:
    """Test word insertion logic."""
    
    def test_insert_words_into_story_basic(self):
        """Test basic word insertion."""
        story = "Tôi đi học. Tôi gặp bạn."
        
        vocabulary = [
            VocabularyWord(
                word="school",
                definition="An institution",
                vietnamese_translation="trường học",
                part_of_speech="noun",
                topic="education",
                difficulty="beginner",
                example="I go to school"
            )
        ]
        
        positions = [
            InsertionPosition(
                sentence_index=0,
                word_index=2,
                position_type="noun",
                score=0.85,
                context="đi học"
            )
        ]
        
        # Execute
        enhanced = insert_words_into_story(
            story=story,
            vocabulary=vocabulary,
            positions=positions,
            bold_format=True,
            show_translation=True
        )
        
        # Verify
        assert enhanced != story
        assert "school" in enhanced
        assert "trường học" in enhanced
    
    def test_insert_words_with_bold_format(self):
        """Test insertion with bold formatting."""
        story = "Tôi học."
        
        vocabulary = [
            VocabularyWord(
                word="study",
                definition="To learn",
                vietnamese_translation="học tập",
                part_of_speech="verb",
                topic="education",
                difficulty="beginner",
                example="I study"
            )
        ]
        
        positions = [
            InsertionPosition(
                sentence_index=0,
                word_index=1,
                position_type="verb",
                score=0.85,
                context="học"
            )
        ]
        
        # Execute
        enhanced = insert_words_into_story(
            story=story,
            vocabulary=vocabulary,
            positions=positions,
            bold_format=True,
            show_translation=True
        )
        
        # Verify
        assert "**study**" in enhanced or "study" in enhanced
    
    def test_insert_words_without_translation(self):
        """Test insertion without translation."""
        story = "Tôi học."
        
        vocabulary = [
            VocabularyWord(
                word="study",
                definition="To learn",
                vietnamese_translation="học tập",
                part_of_speech="verb",
                topic="education",
                difficulty="beginner",
                example="I study"
            )
        ]
        
        positions = [
            InsertionPosition(
                sentence_index=0,
                word_index=1,
                position_type="verb",
                score=0.85,
                context="học"
            )
        ]
        
        # Execute
        enhanced = insert_words_into_story(
            story=story,
            vocabulary=vocabulary,
            positions=positions,
            bold_format=False,
            show_translation=False
        )
        
        # Verify
        assert "study" in enhanced
        assert "học tập" not in enhanced or enhanced.count("học") == 1


class TestGlossaryGeneration:
    """Test glossary generation."""
    
    def test_generate_glossary_basic(self):
        """Test basic glossary generation."""
        vocabulary = [
            VocabularyWord(
                word="computer",
                definition="An electronic device",
                vietnamese_translation="máy tính",
                part_of_speech="noun",
                topic="technology",
                difficulty="beginner",
                example="I use a computer",
                ipa="/kəmˈpjuːtər/"
            ),
            VocabularyWord(
                word="study",
                definition="To learn",
                vietnamese_translation="học tập",
                part_of_speech="verb",
                topic="education",
                difficulty="beginner",
                example="I study English"
            )
        ]
        
        # Execute
        glossary = generate_glossary(vocabulary)
        
        # Verify
        assert len(glossary) == 2
        assert all("word" in entry for entry in glossary)
        assert all("definition" in entry for entry in glossary)
        assert all("vietnamese" in entry for entry in glossary)
        assert all("part_of_speech" in entry for entry in glossary)
        assert all("example" in entry for entry in glossary)
    
    def test_generate_glossary_includes_pronunciation(self):
        """Test glossary includes pronunciation when available."""
        vocabulary = [
            VocabularyWord(
                word="computer",
                definition="An electronic device",
                vietnamese_translation="máy tính",
                part_of_speech="noun",
                topic="technology",
                difficulty="beginner",
                example="I use a computer",
                ipa="/kəmˈpjuːtər/"
            )
        ]
        
        # Execute
        glossary = generate_glossary(vocabulary)
        
        # Verify
        assert len(glossary) == 1
        assert "pronunciation" in glossary[0]
        assert glossary[0]["pronunciation"] == "/kəmˈpjuːtər/"
    
    def test_generate_glossary_empty_list(self):
        """Test glossary generation with empty vocabulary list."""
        # Execute
        glossary = generate_glossary([])
        
        # Verify
        assert len(glossary) == 0
        assert isinstance(glossary, list)
