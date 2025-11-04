"""Pytest configuration and shared fixtures."""

import pytest
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))


@pytest.fixture
def sample_vocabulary_word():
    """Fixture for a sample vocabulary word."""
    from aiapi.models import VocabularyWord
    
    return VocabularyWord(
        word="computer",
        definition="An electronic device for processing data",
        vietnamese_translation="máy tính",
        part_of_speech="noun",
        topic="technology",
        difficulty="beginner",
        example="I use a computer for work",
        ipa="/kəmˈpjuːtər/"
    )


@pytest.fixture
def sample_vocabulary_list():
    """Fixture for a list of vocabulary words."""
    from aiapi.models import VocabularyWord
    
    return [
        VocabularyWord(
            word="computer",
            definition="An electronic device",
            vietnamese_translation="máy tính",
            part_of_speech="noun",
            topic="technology",
            difficulty="beginner",
            example="I use a computer"
        ),
        VocabularyWord(
            word="study",
            definition="To learn",
            vietnamese_translation="học tập",
            part_of_speech="verb",
            topic="education",
            difficulty="beginner",
            example="I study English"
        ),
        VocabularyWord(
            word="technology",
            definition="Application of science",
            vietnamese_translation="công nghệ",
            part_of_speech="noun",
            topic="technology",
            difficulty="intermediate",
            example="Technology is important"
        )
    ]


@pytest.fixture
def sample_insertion_position():
    """Fixture for a sample insertion position."""
    from aiapi.models import InsertionPosition
    
    return InsertionPosition(
        sentence_index=0,
        word_index=3,
        position_type="noun",
        score=0.85,
        context="đi học"
    )


@pytest.fixture
def sample_insertion_positions():
    """Fixture for a list of insertion positions."""
    from aiapi.models import InsertionPosition
    
    return [
        InsertionPosition(
            sentence_index=0,
            word_index=2,
            position_type="noun",
            score=0.85,
            context="đi học"
        ),
        InsertionPosition(
            sentence_index=0,
            word_index=5,
            position_type="verb",
            score=0.80,
            context="gặp bạn"
        ),
        InsertionPosition(
            sentence_index=1,
            word_index=1,
            position_type="adjective",
            score=0.75,
            context="rất đẹp"
        )
    ]


@pytest.fixture
def sample_story_insertion_request():
    """Fixture for a sample story insertion request."""
    from aiapi.models import StoryInsertionRequest, InsertionConfig
    
    return StoryInsertionRequest(
        prompt="Viết một câu chuyện về công nghệ",
        insertion_config=InsertionConfig(
            topic="technology",
            difficulty="intermediate",
            insertion_count=5,
            bold_format=True,
            show_translation=True
        )
    )


@pytest.fixture
def sample_vietnamese_story():
    """Fixture for a sample Vietnamese story."""
    return """
    Hôm nay là một ngày đẹp trời. Tôi thức dậy sớm và chuẩn bị đi làm.
    Trên đường đi, tôi gặp nhiều người bạn cũ. Chúng tôi nói chuyện vui vẻ về công việc và cuộc sống.
    Khi đến văn phòng, tôi bắt đầu làm việc với máy tính. Công việc hôm nay rất nhiều nhưng thú vị.
    """


@pytest.fixture
def sample_enhanced_story():
    """Fixture for a sample enhanced story with insertions."""
    return """
    Hôm nay là một ngày đẹp trời. Tôi thức dậy sớm và chuẩn bị đi **work** (làm việc).
    Trên đường đi, tôi gặp nhiều **friends** (bạn bè) cũ. Chúng tôi nói chuyện vui vẻ về công việc và cuộc sống.
    Khi đến văn phòng, tôi bắt đầu làm việc với **computer** (máy tính). Công việc hôm nay rất nhiều nhưng **interesting** (thú vị).
    """


@pytest.fixture
def mock_chromadb_collection():
    """Fixture for a mock ChromaDB collection."""
    from unittest.mock import MagicMock
    
    mock_collection = MagicMock()
    mock_collection.name = "vocabulary"
    mock_collection.metadata = {"description": "Vocabulary collection"}
    
    # Mock get method
    mock_collection.get.return_value = {
        "ids": ["1", "2"],
        "documents": ["doc1", "doc2"],
        "metadatas": [
            {"word": "test1", "topic": "technology"},
            {"word": "test2", "topic": "technology"}
        ]
    }
    
    # Mock query method
    mock_collection.query.return_value = {
        "ids": [["1", "2"]],
        "documents": [["doc1", "doc2"]],
        "metadatas": [[
            {"word": "test1", "topic": "technology"},
            {"word": "test2", "topic": "technology"}
        ]],
        "distances": [[0.1, 0.2]]
    }
    
    # Mock add method
    mock_collection.add.return_value = None
    
    return mock_collection


@pytest.fixture
def mock_azure_openai_client():
    """Fixture for a mock Azure OpenAI client."""
    from unittest.mock import MagicMock
    
    mock_client = MagicMock()
    
    # Mock chat completion
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Test response"
    mock_client.chat.completions.create.return_value = mock_response
    
    # Mock embedding
    mock_embedding_response = MagicMock()
    mock_embedding_response.data = [MagicMock()]
    mock_embedding_response.data[0].embedding = [0.1] * 1536
    mock_client.embeddings.create.return_value = mock_embedding_response
    
    return mock_client


@pytest.fixture(autouse=True)
def reset_environment():
    """Reset environment variables before each test."""
    import os
    
    # Store original values
    original_env = os.environ.copy()
    
    # Set test environment
    os.environ["TESTING"] = "true"
    os.environ["RATE_LIMIT_ENABLED"] = "false"
    
    yield
    
    # Restore original environment
    os.environ.clear()
    os.environ.update(original_env)
