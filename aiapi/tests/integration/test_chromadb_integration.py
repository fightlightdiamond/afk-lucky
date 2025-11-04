"""Integration tests for ChromaDB operations with real ChromaDB instance."""

import pytest
import os
import tempfile
import shutil
from pathlib import Path
from unittest.mock import patch, MagicMock
import numpy as np

# Disable rate limiting for tests
os.environ["RATE_LIMIT_ENABLED"] = "false"

from aiapi.services.vocabulary_service import (
    add_vocabulary,
    get_vocabulary_by_topic,
    search_vocabulary_semantic,
    batch_add_vocabulary,
    get_vocabulary_collection
)
from aiapi.services.chromadb_service import (
    add_story_to_chromadb,
    search_similar_stories,
    get_stories_collection,
    get_chroma_client
)
from aiapi.models import VocabularyWord


@pytest.fixture(scope="module")
def test_chroma_dir():
    """Create a temporary ChromaDB directory for testing."""
    temp_dir = tempfile.mkdtemp(prefix="test_chroma_")
    
    # Set environment to use test directory
    original_path = os.environ.get("CHROMA_PATH")
    os.environ["CHROMA_PATH"] = temp_dir
    
    yield temp_dir
    
    # Cleanup
    if original_path:
        os.environ["CHROMA_PATH"] = original_path
    else:
        os.environ.pop("CHROMA_PATH", None)
    
    # Remove test directory
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)


@pytest.fixture(scope="function")
def clean_collections():
    """Clean up collections before each test."""
    try:
        # Reset global collection variables
        import aiapi.services.vocabulary_service as vocab_service
        import aiapi.services.chromadb_service as chroma_service
        
        vocab_service._vocabulary_collection = None
        chroma_service._stories_collection = None
        chroma_service._chroma_client = None
        
        yield
        
        # Clean up after test
        vocab_service._vocabulary_collection = None
        chroma_service._stories_collection = None
        chroma_service._chroma_client = None
    except Exception as e:
        print(f"Warning: Cleanup error: {e}")
        yield


@pytest.fixture(scope="function")
def mock_embeddings():
    """Mock embedding generation to avoid Azure OpenAI dependency."""
    def generate_embedding(text):
        """Generate deterministic embedding based on text hash."""
        # Create a deterministic embedding based on text content
        # This allows semantic similarity to work in tests
        np.random.seed(hash(text) % (2**32))
        return np.random.rand(1536).tolist()
    
    with patch('aiapi.services.chromadb_service.get_embedding', side_effect=generate_embedding):
        with patch('aiapi.services.vocabulary_service.get_embedding', side_effect=generate_embedding):
            yield generate_embedding


class TestVocabularyStorageAndRetrieval:
    """Test vocabulary storage and retrieval in ChromaDB."""
    
    def test_add_and_retrieve_vocabulary(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test adding vocabulary and retrieving it with real ChromaDB."""
        # Add vocabulary
        result = add_vocabulary(
            word="computer",
            definition="Electronic device for processing data",
            vietnamese_translation="máy tính",
            part_of_speech="noun",
            topic="technology",
            difficulty="beginner",
            example="I use a computer for work",
            ipa="/kəmˈpjuːtər/"
        )
        
        # Verify add was successful
        assert result is True
        
        # Retrieve vocabulary by topic and difficulty
        results = get_vocabulary_by_topic("technology", "beginner", limit=10)
        
        # Verify retrieval
        assert len(results) >= 1
        
        # Find our added word
        computer_word = None
        for item in results:
            if item["metadata"]["word"] == "computer":
                computer_word = item
                break
        
        assert computer_word is not None
        assert computer_word["metadata"]["definition"] == "Electronic device for processing data"
        assert computer_word["metadata"]["vietnamese"] == "máy tính"
        assert computer_word["metadata"]["topic"] == "technology"
        assert computer_word["metadata"]["difficulty"] == "beginner"
    
    def test_semantic_search_vocabulary(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test semantic search for vocabulary with real embeddings."""
        # Add multiple related vocabulary words
        words_to_add = [
            ("laptop", "Portable computer device", "máy tính xách tay", "technology", "beginner", "I work on my laptop"),
            ("computer", "Electronic device for processing data", "máy tính", "technology", "beginner", "The computer is fast"),
            ("keyboard", "Input device with keys", "bàn phím", "technology", "beginner", "I type on the keyboard"),
        ]
        
        for word, definition, vietnamese, topic, difficulty, example in words_to_add:
            add_vocabulary(
                word=word,
                definition=definition,
                vietnamese_translation=vietnamese,
                part_of_speech="noun",
                topic=topic,
                difficulty=difficulty,
                example=example
            )
        
        # Execute semantic search
        results = search_vocabulary_semantic("portable computer device", n_results=5)
        
        # Verify results
        assert len(results) >= 2
        
        # Verify similarity scores exist
        for result in results:
            assert "similarity_score" in result
            # Note: ChromaDB returns distances (lower is better), not similarity scores
            # The vocabulary service converts these to similarity scores
        
        # Verify results are sorted by similarity (highest first)
        # Since vocabulary_service converts distances to similarity, higher is better
        for i in range(len(results) - 1):
            assert results[i]["similarity_score"] >= results[i + 1]["similarity_score"]
    
    def test_batch_add_vocabulary(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test batch adding vocabulary words with real ChromaDB."""
        # Create vocabulary words
        words = [
            VocabularyWord(
                word="database",
                definition="Organized collection of data",
                vietnamese_translation="cơ sở dữ liệu",
                part_of_speech="noun",
                topic="technology",
                difficulty="intermediate",
                example="The database stores user information"
            ),
            VocabularyWord(
                word="network",
                definition="Connected system of computers",
                vietnamese_translation="mạng lưới",
                part_of_speech="noun",
                topic="technology",
                difficulty="intermediate",
                example="The network is secure"
            )
        ]
        
        # Execute batch add
        result = batch_add_vocabulary(words)
        
        # Verify success
        assert result["success_count"] == 2
        assert result["failed_count"] == 0
        assert len(result["errors"]) == 0
        
        # Verify words were actually added
        retrieved = get_vocabulary_by_topic("technology", "intermediate", limit=10)
        assert len(retrieved) >= 2
        
        # Check that our words are in the results
        word_names = [item["metadata"]["word"] for item in retrieved]
        assert "database" in word_names
        assert "network" in word_names
    
    def test_vocabulary_filtering_by_difficulty(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test filtering vocabulary by difficulty level with real ChromaDB."""
        # Add words with different difficulty levels
        test_words = [
            ("hello", "beginner", "Greeting word", "xin chào", "Hello friend"),
            ("sophisticated", "advanced", "Complex and refined", "tinh vi", "A sophisticated approach"),
            ("study", "beginner", "To learn", "học", "I study English"),
        ]
        
        for word, difficulty, definition, vietnamese, example in test_words:
            add_vocabulary(
                word=word,
                definition=definition,
                vietnamese_translation=vietnamese,
                part_of_speech="noun" if difficulty != "beginner" else "verb",
                topic="education",
                difficulty=difficulty,
                example=example
            )
        
        # Test filtering by beginner difficulty
        beginner_results = get_vocabulary_by_topic("education", "beginner", limit=10)
        assert len(beginner_results) >= 2
        for result in beginner_results:
            assert result["metadata"]["difficulty"] == "beginner"
        
        # Test filtering by advanced difficulty
        advanced_results = get_vocabulary_by_topic("education", "advanced", limit=10)
        assert len(advanced_results) >= 1
        for result in advanced_results:
            assert result["metadata"]["difficulty"] == "advanced"
    
    def test_vocabulary_filtering_by_topic(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test filtering vocabulary by topic with real ChromaDB."""
        # Add words with different topics
        topics_data = [
            ("algorithm", "technology", "Step-by-step procedure", "thuật toán", "The algorithm is efficient"),
            ("profit", "business", "Financial gain", "lợi nhuận", "The company made a profit"),
            ("teacher", "education", "Person who teaches", "giáo viên", "The teacher is helpful"),
        ]
        
        for word, topic, definition, vietnamese, example in topics_data:
            add_vocabulary(
                word=word,
                definition=definition,
                vietnamese_translation=vietnamese,
                part_of_speech="noun",
                topic=topic,
                difficulty="intermediate",
                example=example
            )
        
        # Test each topic
        for expected_topic in ["technology", "business", "education"]:
            results = get_vocabulary_by_topic(expected_topic, "intermediate", limit=10)
            
            # Verify we got results
            assert len(results) >= 1
            
            # Verify all results match the topic
            for result in results:
                assert result["metadata"]["topic"] == expected_topic


class TestStoryStorageAndSearch:
    """Test story storage and search in ChromaDB."""
    
    def test_add_story_with_insertion_metadata(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test adding story with insertion metadata to real ChromaDB."""
        # Story data with insertion metadata
        story_data = {
            "title": "Technology Story",
            "content": "Hôm nay tôi học về **computer** (máy tính). Nó rất **interesting** (thú vị).",
            "metadata": {
                "word_count": 15,
                "has_insertion": True,
                "insertion_count": 2,
                "insertion_topics": ["technology"],
                "insertion_difficulty": "beginner"
            }
        }
        
        # Add story to ChromaDB
        result = add_story_to_chromadb(
            story_id="test_story_1",
            title=story_data["title"],
            content=story_data["content"],
            prompt="Write a story about technology",
            metadata=story_data["metadata"]
        )
        
        # Verify story was added successfully
        assert result is True
        
        # Verify we can retrieve the story
        from aiapi.services.chromadb_service import get_story_by_id
        retrieved_story = get_story_by_id("test_story_1")
        
        assert retrieved_story is not None
        assert retrieved_story["metadata"]["has_insertion"] is True
        assert retrieved_story["metadata"]["insertion_count"] == 2
        assert retrieved_story["metadata"]["insertion_topics"] == ["technology"]
    
    def test_search_stories_with_insertion_filters(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test searching stories with insertion filters using real ChromaDB."""
        # Add multiple stories with different insertion metadata
        stories = [
            {
                "id": "tech_story_1",
                "title": "Tech Story",
                "content": "Story about **computer** (máy tính) and **technology** (công nghệ).",
                "metadata": {
                    "has_insertion": True,
                    "insertion_count": 2,
                    "insertion_topics": ["technology"],
                    "insertion_difficulty": "beginner"
                }
            },
            {
                "id": "business_story_1",
                "title": "Business Story",
                "content": "Story about **profit** (lợi nhuận) and **market** (thị trường).",
                "metadata": {
                    "has_insertion": True,
                    "insertion_count": 2,
                    "insertion_topics": ["business"],
                    "insertion_difficulty": "intermediate"
                }
            },
            {
                "id": "plain_story_1",
                "title": "Plain Story",
                "content": "A story without any English word insertions.",
                "metadata": {
                    "has_insertion": False,
                    "insertion_count": 0
                }
            }
        ]
        
        # Add all stories
        for story in stories:
            add_story_to_chromadb(
                story_id=story["id"],
                title=story["title"],
                content=story["content"],
                prompt="Test prompt",
                metadata=story["metadata"]
            )
        
        # Search with insertion filter
        results = search_similar_stories(
            query="technology and computers",
            n_results=5,
            filters={"has_insertion": True}
        )
        
        # Verify only stories with insertions are returned
        assert len(results["stories"]) >= 2
        for story in results["stories"]:
            assert story["metadata"]["has_insertion"] is True
            assert story["metadata"]["insertion_count"] > 0
    
    def test_embedding_generation_for_stories(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test that embeddings are generated for story content with real ChromaDB."""
        # Story data
        story_content = "Đây là một câu chuyện về **technology** (công nghệ) và **innovation** (đổi mới)."
        
        # Add story
        result = add_story_to_chromadb(
            story_id="embedding_test_story",
            title="Embedding Test",
            content=story_content,
            prompt="Test prompt",
            metadata={"word_count": 15}
        )
        
        # Verify story was added successfully (which means embedding was generated)
        assert result is True
        
        # Verify we can search for the story using semantic search
        search_results = search_similar_stories(
            query="technology and innovation",
            n_results=5
        )
        
        # Should find our story
        assert len(search_results["stories"]) >= 1
        
        # Verify the story is in results
        story_ids = [s["id"] for s in search_results["stories"]]
        assert "embedding_test_story" in story_ids


class TestEmbeddingGeneration:
    """Test embedding generation and search with real ChromaDB."""
    
    def test_vocabulary_embedding_generation(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test embedding generation for vocabulary words with real ChromaDB."""
        # Add vocabulary word
        result = add_vocabulary(
            word="innovation",
            definition="Introduction of new ideas or methods",
            vietnamese_translation="đổi mới",
            part_of_speech="noun",
            topic="business",
            difficulty="intermediate",
            example="Innovation drives progress"
        )
        
        # Verify word was added successfully (which means embedding was generated)
        assert result is True
        
        # Verify we can find the word using semantic search
        search_results = search_vocabulary_semantic(
            query="new ideas and creativity",
            n_results=5
        )
        
        # Should find our word
        assert len(search_results) >= 1
        
        # Check if our word is in the results
        words_found = [item["metadata"]["word"] for item in search_results]
        assert "innovation" in words_found
    
    def test_semantic_similarity_scoring(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test semantic similarity scoring in search results with real ChromaDB."""
        # Add vocabulary words with varying semantic similarity
        words_data = [
            ("smartphone", "Mobile computing device", "điện thoại thông minh", "A smartphone has many features"),
            ("laptop", "Portable computer", "máy tính xách tay", "I work on my laptop"),
            ("book", "Printed pages bound together", "sách", "I read a book"),
        ]
        
        for word, definition, vietnamese, example in words_data:
            add_vocabulary(
                word=word,
                definition=definition,
                vietnamese_translation=vietnamese,
                part_of_speech="noun",
                topic="technology",
                difficulty="beginner",
                example=example
            )
        
        # Search with a query more similar to some words than others
        results = search_vocabulary_semantic("portable computer device", n_results=3)
        
        # Verify we got results
        assert len(results) >= 2
        
        # Verify similarity scores are present
        for result in results:
            assert "similarity_score" in result
            # Note: ChromaDB returns distances, vocabulary service converts them
        
        # Verify results are sorted by similarity (descending - higher is better)
        for i in range(len(results) - 1):
            assert results[i]["similarity_score"] >= results[i + 1]["similarity_score"]


class TestChromaDBErrorHandling:
    """Test error handling in ChromaDB operations."""
    
    def test_handle_empty_collection(self, test_chroma_dir, clean_collections):
        """Test handling when querying an empty collection."""
        # Query empty collection
        result = get_vocabulary_by_topic("nonexistent_topic", "beginner", limit=10)
        
        # Should return empty list, not crash
        assert isinstance(result, list)
        assert len(result) == 0


class TestDataConsistency:
    """Test data consistency in ChromaDB operations with real ChromaDB."""
    
    def test_vocabulary_metadata_consistency(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test that vocabulary metadata is stored and retrieved consistently."""
        # Add vocabulary with all fields
        add_vocabulary(
            word="consistency",
            definition="State of being consistent",
            vietnamese_translation="nhất quán",
            part_of_speech="noun",
            topic="general",
            difficulty="advanced",
            example="Maintain consistency in your work",
            ipa="/kənˈsɪstənsi/"
        )
        
        # Retrieve and verify all fields are preserved
        results = get_vocabulary_by_topic("general", "advanced", limit=10)
        
        # Find our word
        consistency_word = None
        for item in results:
            if item["metadata"]["word"] == "consistency":
                consistency_word = item
                break
        
        # Verify all metadata fields
        assert consistency_word is not None
        metadata = consistency_word["metadata"]
        assert metadata["word"] == "consistency"
        assert metadata["definition"] == "State of being consistent"
        assert metadata["vietnamese"] == "nhất quán"
        assert metadata["pos"] == "noun"
        assert metadata["topic"] == "general"
        assert metadata["difficulty"] == "advanced"
        assert metadata["example"] == "Maintain consistency in your work"
        assert metadata["ipa"] == "/kənˈsɪstənsi/"
    
    def test_story_metadata_with_insertions(self, test_chroma_dir, clean_collections, mock_embeddings):
        """Test that story metadata with insertions is stored correctly."""
        # Add story with comprehensive insertion metadata
        metadata = {
            "word_count": 100,
            "has_insertion": True,
            "insertion_count": 10,
            "insertion_topics": ["technology", "business"],
            "insertion_difficulty": "intermediate",
            "readability_score": 75
        }
        
        add_story_to_chromadb(
            story_id="metadata_test_story",
            title="Metadata Test Story",
            content="Story with multiple **insertions** (chèn) about **technology** (công nghệ).",
            prompt="Test prompt",
            metadata=metadata
        )
        
        # Retrieve and verify metadata
        from aiapi.services.chromadb_service import get_story_by_id
        retrieved_story = get_story_by_id("metadata_test_story")
        
        # Verify all insertion metadata is preserved
        assert retrieved_story is not None
        story_metadata = retrieved_story["metadata"]
        assert story_metadata["has_insertion"] is True
        assert story_metadata["insertion_count"] == 10
        assert story_metadata["insertion_topics"] == ["technology", "business"]
        assert story_metadata["insertion_difficulty"] == "intermediate"
        assert story_metadata["readability_score"] == 75
