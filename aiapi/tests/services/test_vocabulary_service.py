"""Unit tests for vocabulary service."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path
import json

from aiapi.services.vocabulary_service import (
    get_vocabulary_collection,
    add_vocabulary,
    get_vocabulary_by_topic,
    search_vocabulary_semantic,
    get_vocabulary_stats,
    initialize_vocabulary_database
)
from aiapi.models import VocabularyWord


class TestVocabularyCollection:
    """Test vocabulary collection operations."""
    
    def test_get_vocabulary_collection(self):
        """Test getting vocabulary collection."""
        collection = get_vocabulary_collection()
        assert collection is not None
        assert collection.name == "vocabulary"
    
    def test_get_vocabulary_stats(self):
        """Test getting vocabulary statistics."""
        stats = get_vocabulary_stats()
        assert "total_words" in stats
        assert "collection_name" in stats
        assert stats["collection_name"] == "vocabulary"


class TestVocabularyOperations:
    """Test vocabulary CRUD operations."""
    
    @patch('aiapi.services.vocabulary_service.get_embedding')
    @patch('aiapi.services.vocabulary_service.get_vocabulary_collection')
    def test_add_vocabulary_success(self, mock_collection, mock_embedding):
        """Test adding vocabulary word successfully."""
        # Setup mocks
        mock_embedding.return_value = [0.1] * 1536
        mock_coll = MagicMock()
        mock_collection.return_value = mock_coll
        
        # Test data
        word = VocabularyWord(
            word="test",
            definition="A test word",
            vietnamese_translation="kiểm tra",
            part_of_speech="noun",
            topic="technology",
            difficulty="beginner",
            example="This is a test"
        )
        
        # Execute
        result = add_vocabulary(
            word=word.word,
            definition=word.definition,
            vietnamese_translation=word.vietnamese_translation,
            part_of_speech=word.part_of_speech,
            topic=word.topic,
            difficulty=word.difficulty,
            example=word.example
        )
        
        # Verify
        assert result is True
        mock_embedding.assert_called_once()
        mock_coll.add.assert_called_once()
    
    @patch('aiapi.services.vocabulary_service.get_embedding')
    @patch('aiapi.services.vocabulary_service.get_vocabulary_collection')
    def test_add_vocabulary_with_ipa(self, mock_collection, mock_embedding):
        """Test adding vocabulary word with IPA pronunciation."""
        # Setup mocks
        mock_embedding.return_value = [0.1] * 1536
        mock_coll = MagicMock()
        mock_collection.return_value = mock_coll
        
        # Execute
        result = add_vocabulary(
            word="laptop",
            definition="A portable computer",
            vietnamese_translation="máy tính xách tay",
            part_of_speech="noun",
            topic="technology",
            difficulty="beginner",
            example="I use my laptop",
            ipa="/ˈlæp.tɑːp/"
        )
        
        # Verify
        assert result is True
        # Check that IPA was included in metadata
        call_args = mock_coll.add.call_args
        assert call_args[1]['metadatas'][0]['ipa'] == "/ˈlæp.tɑːp/"
    
    @patch('aiapi.services.vocabulary_service.get_embedding')
    @patch('aiapi.services.vocabulary_service.get_vocabulary_collection')
    def test_add_vocabulary_embedding_failure(self, mock_collection, mock_embedding):
        """Test adding vocabulary when embedding generation fails."""
        from aiapi.exceptions import EmbeddingError
        
        # Setup mocks - embedding returns None
        mock_embedding.return_value = None
        mock_coll = MagicMock()
        mock_collection.return_value = mock_coll
        
        # Execute and verify exception
        with pytest.raises(EmbeddingError):
            add_vocabulary(
                word="test",
                definition="A test word",
                vietnamese_translation="kiểm tra",
                part_of_speech="noun",
                topic="technology",
                difficulty="beginner",
                example="This is a test"
            )
    
    @patch('aiapi.services.vocabulary_service.get_vocabulary_collection')
    def test_get_vocabulary_by_topic(self, mock_collection):
        """Test retrieving vocabulary by topic and difficulty."""
        # Setup mock
        mock_coll = MagicMock()
        mock_coll.get.return_value = {
            "ids": ["1", "2"],
            "documents": ["doc1", "doc2"],
            "metadatas": [
                {"word": "computer", "topic": "technology", "difficulty": "beginner"},
                {"word": "laptop", "topic": "technology", "difficulty": "beginner"}
            ]
        }
        mock_collection.return_value = mock_coll
        
        # Execute
        results = get_vocabulary_by_topic("technology", "beginner", limit=10)
        
        # Verify
        assert len(results) == 2
        assert results[0]["metadata"]["word"] == "computer"
        mock_coll.get.assert_called_once()
    
    @patch('aiapi.services.vocabulary_service.get_embedding')
    @patch('aiapi.services.vocabulary_service.get_vocabulary_collection')
    def test_search_vocabulary_semantic(self, mock_collection, mock_embedding):
        """Test semantic search for vocabulary."""
        # Setup mocks
        mock_embedding.return_value = [0.1] * 1536
        mock_coll = MagicMock()
        mock_coll.query.return_value = {
            "ids": [["1", "2"]],
            "documents": [["doc1", "doc2"]],
            "metadatas": [[
                {"word": "computer", "topic": "technology"},
                {"word": "laptop", "topic": "technology"}
            ]],
            "distances": [[0.1, 0.2]]
        }
        mock_collection.return_value = mock_coll
        
        # Execute
        results = search_vocabulary_semantic("computer technology", n_results=5)
        
        # Verify
        assert len(results) == 2
        assert results[0]["metadata"]["word"] == "computer"
        assert "similarity_score" in results[0]
        mock_embedding.assert_called_once()
        mock_coll.query.assert_called_once()
    
    @patch('aiapi.services.vocabulary_service.get_embedding')
    @patch('aiapi.services.vocabulary_service.get_vocabulary_collection')
    def test_search_vocabulary_with_topic_filter(self, mock_collection, mock_embedding):
        """Test semantic search with topic filter."""
        # Setup mocks
        mock_embedding.return_value = [0.1] * 1536
        mock_coll = MagicMock()
        mock_coll.query.return_value = {
            "ids": [["1"]],
            "documents": [["doc1"]],
            "metadatas": [[{"word": "computer", "topic": "technology"}]],
            "distances": [[0.1]]
        }
        mock_collection.return_value = mock_coll
        
        # Execute
        results = search_vocabulary_semantic("computer", n_results=5, topic="technology")
        
        # Verify
        assert len(results) == 1
        # Check that where filter was used
        call_args = mock_coll.query.call_args
        assert call_args[1]['where'] == {"topic": "technology"}
    
    @patch('aiapi.services.vocabulary_service.get_embedding')
    @patch('aiapi.services.vocabulary_service.get_vocabulary_collection')
    def test_search_vocabulary_with_topic_and_difficulty_filter(self, mock_collection, mock_embedding):
        """Test semantic search with both topic and difficulty filters."""
        # Setup mocks
        mock_embedding.return_value = [0.1] * 1536
        mock_coll = MagicMock()
        mock_coll.query.return_value = {
            "ids": [["1"]],
            "documents": [["doc1"]],
            "metadatas": [[{"word": "computer", "topic": "technology", "difficulty": "beginner"}]],
            "distances": [[0.1]]
        }
        mock_collection.return_value = mock_coll
        
        # Execute
        results = search_vocabulary_semantic(
            "computer", 
            n_results=5, 
            topic="technology",
            difficulty="beginner"
        )
        
        # Verify
        assert len(results) == 1
        # Check that combined where filter was used
        call_args = mock_coll.query.call_args
        assert call_args[1]['where'] == {
            "$and": [
                {"topic": "technology"},
                {"difficulty": "beginner"}
            ]
        }
    
    @patch('aiapi.services.vocabulary_service.get_embedding')
    @patch('aiapi.services.vocabulary_service.get_vocabulary_collection')
    def test_search_vocabulary_embedding_failure(self, mock_collection, mock_embedding):
        """Test semantic search when embedding generation fails."""
        from aiapi.exceptions import EmbeddingError
        
        # Setup mocks - embedding returns None
        mock_embedding.return_value = None
        mock_coll = MagicMock()
        mock_collection.return_value = mock_coll
        
        # Execute and verify exception
        with pytest.raises(EmbeddingError):
            search_vocabulary_semantic("test query")


class TestVocabularyInitialization:
    """Test vocabulary database initialization."""
    
    @patch('aiapi.services.vocabulary_service.get_vocabulary_collection')
    def test_initialize_vocabulary_database(self, mock_get_collection):
        """Test initializing vocabulary database."""
        # Setup mock
        mock_coll = MagicMock()
        mock_coll.count.return_value = 0
        mock_get_collection.return_value = mock_coll
        
        # Execute
        result = initialize_vocabulary_database()
        
        # Verify - should create collection
        assert result is True
        mock_get_collection.assert_called_once()
    
    def test_sample_vocabulary_file_exists(self):
        """Test that sample vocabulary file exists and is valid."""
        json_path = Path(__file__).parent.parent.parent / "data" / "sample_vocabulary.json"
        
        assert json_path.exists(), "Sample vocabulary file should exist"
        
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        assert len(data) > 0, "Sample vocabulary should not be empty"
        
        # Check first word has required fields
        first_word = data[0]
        required_fields = ['word', 'definition', 'vietnamese_translation', 
                          'part_of_speech', 'topic', 'difficulty', 'example']
        for field in required_fields:
            assert field in first_word, f"Field {field} should be present"


class TestBatchOperations:
    """Test batch vocabulary operations."""
    
    @patch('aiapi.services.vocabulary_service.add_vocabulary')
    def test_batch_add_vocabulary_success(self, mock_add):
        """Test batch adding vocabulary words successfully."""
        from aiapi.services.vocabulary_service import batch_add_vocabulary
        
        # Setup mock
        mock_add.return_value = True
        
        # Test data
        words = [
            VocabularyWord(
                word="test1",
                definition="Test word 1",
                vietnamese_translation="kiểm tra 1",
                part_of_speech="noun",
                topic="technology",
                difficulty="beginner",
                example="This is test 1"
            ),
            VocabularyWord(
                word="test2",
                definition="Test word 2",
                vietnamese_translation="kiểm tra 2",
                part_of_speech="verb",
                topic="business",
                difficulty="intermediate",
                example="This is test 2"
            )
        ]
        
        # Execute
        result = batch_add_vocabulary(words)
        
        # Verify
        assert result["success_count"] == 2
        assert result["failed_count"] == 0
        assert len(result["errors"]) == 0
        assert mock_add.call_count == 2
    
    @patch('aiapi.services.vocabulary_service.add_vocabulary')
    def test_batch_add_vocabulary_partial_failure(self, mock_add):
        """Test batch adding with some failures."""
        from aiapi.services.vocabulary_service import batch_add_vocabulary
        
        # Setup mock - first succeeds, second fails
        mock_add.side_effect = [True, Exception("Test error")]
        
        # Test data
        words = [
            VocabularyWord(
                word="test1",
                definition="Test word 1",
                vietnamese_translation="kiểm tra 1",
                part_of_speech="noun",
                topic="technology",
                difficulty="beginner",
                example="This is test 1"
            ),
            VocabularyWord(
                word="test2",
                definition="Test word 2",
                vietnamese_translation="kiểm tra 2",
                part_of_speech="verb",
                topic="business",
                difficulty="intermediate",
                example="This is test 2"
            )
        ]
        
        # Execute
        result = batch_add_vocabulary(words)
        
        # Verify
        assert result["success_count"] == 1
        assert result["failed_count"] == 1
        assert len(result["errors"]) == 1
        assert "test2" in result["errors"][0]


class TestVocabularyDeletion:
    """Test vocabulary deletion operations."""
    
    @patch('aiapi.services.vocabulary_service.get_vocabulary_collection')
    def test_delete_vocabulary_success(self, mock_collection):
        """Test deleting vocabulary word successfully."""
        from aiapi.services.vocabulary_service import delete_vocabulary
        
        # Setup mock
        mock_coll = MagicMock()
        mock_collection.return_value = mock_coll
        
        # Execute
        result = delete_vocabulary("vocab_test_beginner_test")
        
        # Verify
        assert result is True
        mock_coll.delete.assert_called_once_with(ids=["vocab_test_beginner_test"])
    
    @patch('aiapi.services.vocabulary_service.get_vocabulary_collection')
    def test_delete_vocabulary_failure(self, mock_collection):
        """Test deleting vocabulary word with error."""
        from aiapi.services.vocabulary_service import delete_vocabulary
        
        # Setup mock to raise exception
        mock_coll = MagicMock()
        mock_coll.delete.side_effect = Exception("Delete failed")
        mock_collection.return_value = mock_coll
        
        # Execute
        result = delete_vocabulary("vocab_test_beginner_test")
        
        # Verify
        assert result is False
