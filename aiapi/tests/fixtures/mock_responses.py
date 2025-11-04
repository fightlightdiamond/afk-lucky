"""Mock API responses for testing."""

from typing import Dict, Any, List


# Mock Azure OpenAI responses
MOCK_AZURE_OPENAI_EMBEDDING_RESPONSE = {
    "data": [
        {
            "embedding": [0.1] * 1536,  # 1536-dimensional embedding
            "index": 0,
            "object": "embedding"
        }
    ],
    "model": "text-embedding-3-small",
    "object": "list",
    "usage": {
        "prompt_tokens": 10,
        "total_tokens": 10
    }
}


MOCK_AZURE_OPENAI_CHAT_RESPONSE = {
    "id": "chatcmpl-123",
    "object": "chat.completion",
    "created": 1677652288,
    "model": "gpt-4o",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": "Hôm nay là ngày đầu tiên tôi đi làm ở công ty mới. Tôi rất hào hứng và lo lắng."
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 50,
        "completion_tokens": 30,
        "total_tokens": 80
    }
}


MOCK_GRAMMAR_ANALYSIS_RESPONSE = {
    "id": "chatcmpl-456",
    "object": "chat.completion",
    "created": 1677652288,
    "model": "gpt-4o",
    "choices": [
        {
            "index": 0,
            "message": {
                "role": "assistant",
                "content": """[
                    {
                        "sentence_index": 0,
                        "word_index": 3,
                        "position_type": "noun",
                        "score": 0.85,
                        "context": "công ty mới"
                    },
                    {
                        "sentence_index": 0,
                        "word_index": 5,
                        "position_type": "adjective",
                        "score": 0.78,
                        "context": "mới"
                    }
                ]"""
            },
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 100,
        "completion_tokens": 80,
        "total_tokens": 180
    }
}


# Mock ChromaDB responses
MOCK_CHROMADB_ADD_RESPONSE = {
    "success": True,
    "ids": ["vocab_001"]
}


MOCK_CHROMADB_QUERY_RESPONSE = {
    "ids": [["vocab_001", "vocab_002", "vocab_003"]],
    "embeddings": None,
    "documents": [
        [
            "technology: A portable computer",
            "business: A gathering of people",
            "education: A person who teaches"
        ]
    ],
    "metadatas": [
        [
            {
                "word": "laptop",
                "definition": "A portable computer",
                "vietnamese": "máy tính xách tay",
                "pos": "noun",
                "topic": "technology",
                "difficulty": "beginner",
                "example": "I use my laptop for work",
                "ipa": "/ˈlæp.tɑːp/"
            },
            {
                "word": "meeting",
                "definition": "A gathering of people",
                "vietnamese": "cuộc họp",
                "pos": "noun",
                "topic": "business",
                "difficulty": "beginner",
                "example": "We have a meeting",
                "ipa": "/ˈmiː.tɪŋ/"
            },
            {
                "word": "teacher",
                "definition": "A person who teaches",
                "vietnamese": "giáo viên",
                "pos": "noun",
                "topic": "education",
                "difficulty": "beginner",
                "example": "My teacher is helpful",
                "ipa": "/ˈtiː.tʃər/"
            }
        ]
    ],
    "distances": [[0.1, 0.15, 0.2]]
}


# Mock error responses
MOCK_AZURE_OPENAI_RATE_LIMIT_ERROR = {
    "error": {
        "message": "Rate limit exceeded",
        "type": "rate_limit_error",
        "code": "rate_limit_exceeded"
    }
}


MOCK_AZURE_OPENAI_TIMEOUT_ERROR = {
    "error": {
        "message": "Request timeout",
        "type": "timeout_error",
        "code": "timeout"
    }
}


MOCK_CHROMADB_CONNECTION_ERROR = {
    "error": "Failed to connect to ChromaDB",
    "type": "connection_error"
}


# Mock successful API responses
def create_mock_story_response(
    title: str = "Test Story",
    content: str = "Test content",
    insertion_count: int = 5
) -> Dict[str, Any]:
    """Create a mock story generation response."""
    return {
        "title": title,
        "original_content": content,
        "enhanced_content": content,
        "inserted_words": [
            {
                "word": f"word_{i}",
                "vietnamese_translation": f"từ_{i}",
                "part_of_speech": "noun",
                "topic": "general",
                "difficulty": "beginner"
            }
            for i in range(insertion_count)
        ],
        "glossary": [
            {
                "word": f"word_{i}",
                "vietnamese": f"từ_{i}",
                "pos": "noun",
                "definition": f"Definition {i}",
                "example": f"Example {i}",
                "ipa": f"/word{i}/"
            }
            for i in range(insertion_count)
        ],
        "metrics": {
            "total_insertions": insertion_count,
            "insertion_density": 5.0,
            "avg_position_score": 0.8,
            "readability_score": 75,
            "language_ratio": {
                "vietnamese": 100,
                "english": insertion_count
            }
        },
        "metadata": {
            "title": title,
            "topic": "general",
            "difficulty": "beginner",
            "word_count": 100,
            "has_insertion": True,
            "insertion_count": insertion_count
        }
    }


def create_mock_vocabulary_response(
    count: int = 5,
    topic: str = "technology",
    difficulty: str = "beginner"
) -> List[Dict[str, Any]]:
    """Create a mock vocabulary query response."""
    return [
        {
            "word": f"word_{i}",
            "definition": f"Definition for word {i}",
            "vietnamese_translation": f"từ_{i}",
            "part_of_speech": "noun",
            "topic": topic,
            "difficulty": difficulty,
            "example": f"Example sentence {i}",
            "ipa": f"/word{i}/"
        }
        for i in range(count)
    ]


def create_mock_batch_response(
    success_count: int = 2,
    failure_count: int = 0
) -> Dict[str, Any]:
    """Create a mock batch processing response."""
    results = []
    
    for i in range(success_count):
        results.append({
            "success": True,
            "story": create_mock_story_response(
                title=f"Story {i}",
                content=f"Content {i}",
                insertion_count=5
            )
        })
    
    for i in range(failure_count):
        results.append({
            "success": False,
            "error": f"Failed to generate story {i}",
            "error_type": "generation_error"
        })
    
    return {
        "total": success_count + failure_count,
        "successful": success_count,
        "failed": failure_count,
        "results": results
    }


# Mock readability validation responses
MOCK_READABILITY_VALIDATION_RESPONSE = {
    "is_valid": True,
    "readability_score": 75,
    "avg_words_per_sentence": 12.5,
    "total_sentences": 8,
    "total_words": 100
}


MOCK_LOW_READABILITY_RESPONSE = {
    "is_valid": False,
    "readability_score": 45,
    "avg_words_per_sentence": 25.0,
    "total_sentences": 4,
    "total_words": 100,
    "reason": "Sentences too long"
}


# Mock context relevance responses
MOCK_RELEVANCE_CHECK_RESPONSE = {
    "is_relevant": True,
    "relevance_score": 0.85,
    "word": "laptop",
    "context": "công ty công nghệ"
}


MOCK_LOW_RELEVANCE_RESPONSE = {
    "is_relevant": False,
    "relevance_score": 0.45,
    "word": "beach",
    "context": "công ty văn phòng",
    "reason": "Word not contextually appropriate"
}


# Mock grammar validation responses
MOCK_GRAMMAR_VALIDATION_RESPONSE = {
    "is_valid": True,
    "grammar_score": 0.9,
    "issues": []
}


MOCK_GRAMMAR_ISSUES_RESPONSE = {
    "is_valid": False,
    "grammar_score": 0.6,
    "issues": [
        {
            "type": "word_order",
            "position": 5,
            "message": "Incorrect word order after insertion"
        }
    ]
}


# Helper function to create custom mock responses
def create_custom_mock_response(
    response_type: str,
    **kwargs
) -> Dict[str, Any]:
    """Create a custom mock response based on type."""
    response_creators = {
        "story": create_mock_story_response,
        "vocabulary": create_mock_vocabulary_response,
        "batch": create_mock_batch_response
    }
    
    creator = response_creators.get(response_type)
    if creator:
        return creator(**kwargs)
    
    return {"error": f"Unknown response type: {response_type}"}
