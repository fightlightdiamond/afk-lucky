"""Vocabulary test fixtures for unit tests."""

from typing import Dict, List, Any


# Sample vocabulary words for testing
SAMPLE_VOCABULARY_BEGINNER = [
    {
        "word": "laptop",
        "definition": "A portable computer that can be easily carried and used in different locations",
        "vietnamese_translation": "máy tính xách tay",
        "part_of_speech": "noun",
        "topic": "technology",
        "difficulty": "beginner",
        "example": "I use my laptop for work every day",
        "ipa": "/ˈlæp.tɑːp/"
    },
    {
        "word": "meeting",
        "definition": "A gathering of people for discussion or decision-making",
        "vietnamese_translation": "cuộc họp",
        "part_of_speech": "noun",
        "topic": "business",
        "difficulty": "beginner",
        "example": "We have a team meeting every Monday morning",
        "ipa": "/ˈmiː.tɪŋ/"
    },
    {
        "word": "teacher",
        "definition": "A person who instructs students in a school or educational setting",
        "vietnamese_translation": "giáo viên",
        "part_of_speech": "noun",
        "topic": "education",
        "difficulty": "beginner",
        "example": "My English teacher is very patient and helpful",
        "ipa": "/ˈtiː.tʃər/"
    }
]

SAMPLE_VOCABULARY_INTERMEDIATE = [
    {
        "word": "application",
        "definition": "A software program designed to perform specific tasks on a computer or mobile device",
        "vietnamese_translation": "ứng dụng",
        "part_of_speech": "noun",
        "topic": "technology",
        "difficulty": "intermediate",
        "example": "I downloaded a new application to learn English",
        "ipa": "/ˌæp.lɪˈkeɪ.ʃən/"
    },
    {
        "word": "negotiate",
        "definition": "To discuss something in order to reach an agreement",
        "vietnamese_translation": "đàm phán, thương lượng",
        "part_of_speech": "verb",
        "topic": "business",
        "difficulty": "intermediate",
        "example": "We need to negotiate the contract terms with the supplier",
        "ipa": "/nɪˈɡoʊ.ʃi.eɪt/"
    },
    {
        "word": "curriculum",
        "definition": "The subjects and content taught in a school or course",
        "vietnamese_translation": "chương trình giảng dạy",
        "part_of_speech": "noun",
        "topic": "education",
        "difficulty": "intermediate",
        "example": "The school updated its curriculum to include coding classes",
        "ipa": "/kəˈrɪk.jə.ləm/"
    }
]

SAMPLE_VOCABULARY_ADVANCED = [
    {
        "word": "algorithm",
        "definition": "A step-by-step procedure for solving a problem or completing a task",
        "vietnamese_translation": "thuật toán",
        "part_of_speech": "noun",
        "topic": "technology",
        "difficulty": "advanced",
        "example": "The search engine uses a complex algorithm to rank results",
        "ipa": "/ˈæl.ɡə.rɪ.ðəm/"
    },
    {
        "word": "stakeholder",
        "definition": "A person or group with an interest or concern in a business",
        "vietnamese_translation": "bên liên quan",
        "part_of_speech": "noun",
        "topic": "business",
        "difficulty": "advanced",
        "example": "We must consider all stakeholders when making this decision",
        "ipa": "/ˈsteɪk.hoʊl.dər/"
    },
    {
        "word": "pedagogy",
        "definition": "The method and practice of teaching",
        "vietnamese_translation": "phương pháp sư phạm",
        "part_of_speech": "noun",
        "topic": "education",
        "difficulty": "advanced",
        "example": "Modern pedagogy emphasizes student-centered learning",
        "ipa": "/ˈped.ə.ɡɑː.dʒi/"
    }
]

# All sample vocabulary combined
ALL_SAMPLE_VOCABULARY = SAMPLE_VOCABULARY_BEGINNER + SAMPLE_VOCABULARY_INTERMEDIATE + SAMPLE_VOCABULARY_ADVANCED


# Mock ChromaDB query results
def get_mock_chromadb_vocabulary_result(words: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate mock ChromaDB query result for vocabulary."""
    return {
        "ids": [[f"vocab_{i}" for i in range(len(words))]],
        "embeddings": None,
        "documents": [[f"{w['topic']}: {w['definition']}" for w in words]],
        "metadatas": [[{
            "word": w["word"],
            "definition": w["definition"],
            "vietnamese": w["vietnamese_translation"],
            "pos": w["part_of_speech"],
            "topic": w["topic"],
            "difficulty": w["difficulty"],
            "example": w["example"],
            "ipa": w.get("ipa", "")
        } for w in words]],
        "distances": [[0.1 * i for i in range(len(words))]]
    }


# Sample insertion positions
SAMPLE_INSERTION_POSITIONS = [
    {
        "sentence_index": 0,
        "word_index": 3,
        "position_type": "noun",
        "score": 0.85,
        "context": "công ty mới"
    },
    {
        "sentence_index": 1,
        "word_index": 5,
        "position_type": "verb",
        "score": 0.78,
        "context": "chuẩn bị"
    },
    {
        "sentence_index": 2,
        "word_index": 2,
        "position_type": "adjective",
        "score": 0.92,
        "context": "thân thiện"
    }
]


# Sample insertion config
SAMPLE_INSERTION_CONFIG = {
    "topic": "business",
    "difficulty": "intermediate",
    "insertion_count": 10,
    "bold_format": True,
    "show_translation": True
}


# Sample story insertion request
SAMPLE_STORY_INSERTION_REQUEST = {
    "prompt": "Viết một câu chuyện về ngày đầu tiên đi làm",
    "config": {
        "language": "vi",
        "length": "medium",
        "style": "narrative"
    },
    "preferences": {
        "tone": "professional",
        "target_audience": "adults"
    },
    "insertion_config": SAMPLE_INSERTION_CONFIG
}


# Sample glossary entries
SAMPLE_GLOSSARY = [
    {
        "word": "laptop",
        "vietnamese": "máy tính xách tay",
        "pos": "noun",
        "definition": "A portable computer",
        "example": "I use my laptop for work",
        "ipa": "/ˈlæp.tɑːp/"
    },
    {
        "word": "meeting",
        "vietnamese": "cuộc họp",
        "pos": "noun",
        "definition": "A gathering of people for discussion",
        "example": "We have a team meeting every Monday",
        "ipa": "/ˈmiː.tɪŋ/"
    }
]


# Sample metrics
SAMPLE_INSERTION_METRICS = {
    "total_insertions": 10,
    "insertion_density": 6.67,  # insertions per 100 words
    "avg_position_score": 0.82,
    "readability_score": 75,
    "language_ratio": {
        "vietnamese": 140,
        "english": 10
    }
}


# Helper function to create test vocabulary
def create_test_vocabulary(count: int = 5, difficulty: str = "intermediate", topic: str = "technology") -> List[Dict[str, Any]]:
    """Create test vocabulary words with specified parameters."""
    base_words = {
        "beginner": SAMPLE_VOCABULARY_BEGINNER,
        "intermediate": SAMPLE_VOCABULARY_INTERMEDIATE,
        "advanced": SAMPLE_VOCABULARY_ADVANCED
    }
    
    words = base_words.get(difficulty, SAMPLE_VOCABULARY_INTERMEDIATE)
    # Filter by topic if needed
    filtered = [w for w in words if w["topic"] == topic] if topic else words
    
    # Return requested count, cycling through if needed
    result = []
    for i in range(count):
        result.append(filtered[i % len(filtered)])
    
    return result
