"""Story test fixtures for unit tests."""

from typing import Dict, List, Any


# Sample Vietnamese stories for testing
SAMPLE_STORY_SHORT = """Hôm nay là ngày đầu tiên tôi đi làm ở công ty mới. Tôi thức dậy từ sáng sớm để chuẩn bị. Sau khi ăn sáng, tôi mặc bộ vest đen và đi xe buýt đến văn phòng. Công ty nằm ở tầng 15 của một tòa nhà cao tầng."""

SAMPLE_STORY_MEDIUM = """Hôm nay là ngày đầu tiên tôi đi làm ở công ty mới. Tôi thức dậy từ sáng sớm để chuẩn bị. Sau khi ăn sáng, tôi mặc bộ vest đen và đi xe buýt đến văn phòng. Công ty nằm ở tầng 15 của một tòa nhà cao tầng. Khi đến nơi, người quản lý đã giới thiệu tôi với các đồng nghiệp. Họ rất thân thiện và nhiệt tình. Buổi sáng, tôi được hướng dẫn về quy trình làm việc và các dự án đang thực hiện. Buổi trưa, cả nhóm cùng đi ăn trưa tại một nhà hàng gần đó."""

SAMPLE_STORY_LONG = """Trong thập kỷ qua, công nghệ đã thay đổi đáng kể cách chúng ta sống và làm việc. Điện thoại thông minh đã trở thành một phần không thể thiếu trong cuộc sống hàng ngày. Chúng ta có thể làm mọi thứ từ mua sắm, thanh toán hóa đơn đến học tập trực tuyến chỉ với vài cú chạm trên màn hình. Trí tuệ nhân tạo đang được ứng dụng rộng rãi trong nhiều lĩnh vực từ y tế, giáo dục đến kinh doanh. Các thuật toán học máy giúp phân tích dữ liệu lớn và đưa ra dự đoán chính xác. Điện toán đám mây cho phép chúng ta lưu trữ và truy cập dữ liệu từ bất kỳ đâu. Tuy nhiên, sự phát triển của công nghệ cũng đặt ra nhiều thách thức về bảo mật thông tin và quyền riêng tư."""

# Sample enhanced story with insertions
SAMPLE_ENHANCED_STORY = """Hôm nay là ngày đầu tiên tôi đi làm ở **company** (công ty) mới. Tôi thức dậy từ sáng sớm để **prepare** (chuẩn bị). Sau khi ăn **breakfast** (bữa sáng), tôi mặc bộ vest đen và đi xe buýt đến **office** (văn phòng). Công ty nằm ở tầng 15 của một tòa nhà cao tầng. Khi đến nơi, người **manager** (quản lý) đã giới thiệu tôi với các đồng nghiệp. Họ rất **friendly** (thân thiện) và nhiệt tình."""

# Sample story metadata
SAMPLE_STORY_METADATA = {
    "title": "Ngày đầu tiên đi làm",
    "topic": "business",
    "difficulty": "beginner",
    "word_count": 150,
    "language": "vi",
    "has_insertion": False,
    "insertion_count": 0
}

SAMPLE_ENHANCED_STORY_METADATA = {
    "title": "Ngày đầu tiên đi làm",
    "topic": "business",
    "difficulty": "beginner",
    "word_count": 150,
    "language": "vi",
    "has_insertion": True,
    "insertion_count": 6,
    "insertion_topics": ["business", "daily life"],
    "insertion_difficulty": "beginner"
}

# Sample story generation config
SAMPLE_STORY_CONFIG = {
    "language": "vi",
    "length": "medium",
    "style": "narrative",
    "tone": "professional"
}

# Sample story preferences
SAMPLE_STORY_PREFERENCES = {
    "tone": "professional",
    "target_audience": "adults",
    "formality": "formal"
}

# Sample ChromaDB story result
def get_mock_chromadb_story_result(stories: List[str], metadatas: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate mock ChromaDB query result for stories."""
    return {
        "ids": [[f"story_{i}" for i in range(len(stories))]],
        "embeddings": None,
        "documents": [stories],
        "metadatas": [metadatas],
        "distances": [[0.1 * i for i in range(len(stories))]]
    }

# Sample sentences for grammar analysis
SAMPLE_SENTENCES = [
    "Tôi đi làm ở công ty mới.",
    "Họ rất thân thiện và nhiệt tình.",
    "Chúng ta có thể làm mọi thứ từ mua sắm đến học tập.",
    "Công nghệ đã thay đổi cách chúng ta sống.",
    "Tôi học tiếng Anh mỗi ngày."
]

# Sample grammar analysis results
SAMPLE_GRAMMAR_ANALYSIS = {
    "sentence": "Tôi đi làm ở công ty mới.",
    "positions": [
        {
            "index": 3,
            "type": "noun",
            "word": "công ty",
            "score": 0.85,
            "reason": "Noun phrase, suitable for replacement"
        },
        {
            "index": 4,
            "type": "adjective",
            "word": "mới",
            "score": 0.75,
            "reason": "Adjective, can be replaced"
        }
    ]
}

# Sample batch processing request
SAMPLE_BATCH_REQUEST = {
    "stories": [
        {
            "prompt": "Viết về ngày đầu tiên đi làm",
            "config": SAMPLE_STORY_CONFIG,
            "insertion_config": {
                "topic": "business",
                "difficulty": "beginner",
                "insertion_count": 5
            }
        },
        {
            "prompt": "Viết về chuyến du lịch",
            "config": SAMPLE_STORY_CONFIG,
            "insertion_config": {
                "topic": "travel",
                "difficulty": "intermediate",
                "insertion_count": 8
            }
        }
    ]
}

# Sample API responses
SAMPLE_STORY_INSERTION_RESPONSE = {
    "title": "Ngày đầu tiên đi làm",
    "original_content": SAMPLE_STORY_MEDIUM,
    "enhanced_content": SAMPLE_ENHANCED_STORY,
    "inserted_words": [
        {
            "word": "company",
            "vietnamese_translation": "công ty",
            "part_of_speech": "noun",
            "topic": "business",
            "difficulty": "beginner"
        },
        {
            "word": "prepare",
            "vietnamese_translation": "chuẩn bị",
            "part_of_speech": "verb",
            "topic": "daily life",
            "difficulty": "beginner"
        }
    ],
    "glossary": [
        {
            "word": "company",
            "vietnamese": "công ty",
            "pos": "noun",
            "definition": "A business organization",
            "example": "I work at a technology company",
            "ipa": "/ˈkʌm.pə.ni/"
        }
    ],
    "metrics": {
        "total_insertions": 6,
        "insertion_density": 4.0,
        "avg_position_score": 0.82,
        "readability_score": 75,
        "language_ratio": {
            "vietnamese": 144,
            "english": 6
        }
    },
    "metadata": SAMPLE_ENHANCED_STORY_METADATA
}

# Sample error responses
SAMPLE_ERROR_RESPONSE = {
    "error": "Failed to generate story",
    "error_type": "generation_error",
    "details": {
        "message": "Azure OpenAI API timeout"
    }
}

# Helper functions
def create_test_story(length: str = "medium", topic: str = "business") -> str:
    """Create a test story with specified parameters."""
    stories = {
        "short": SAMPLE_STORY_SHORT,
        "medium": SAMPLE_STORY_MEDIUM,
        "long": SAMPLE_STORY_LONG
    }
    return stories.get(length, SAMPLE_STORY_MEDIUM)


def create_test_story_with_insertions(insertion_count: int = 5) -> str:
    """Create a test story with specified number of insertions."""
    base_story = SAMPLE_STORY_MEDIUM
    # This is a simplified version - actual implementation would insert words properly
    return SAMPLE_ENHANCED_STORY


def split_into_sentences(story: str) -> List[str]:
    """Split story into sentences for testing."""
    import re
    sentences = re.split(r'[.!?]+', story)
    return [s.strip() for s in sentences if s.strip()]


# Test data for different scenarios
TEST_SCENARIOS = {
    "beginner_business": {
        "story": SAMPLE_STORY_SHORT,
        "topic": "business",
        "difficulty": "beginner",
        "expected_insertions": 3
    },
    "intermediate_technology": {
        "story": SAMPLE_STORY_LONG,
        "topic": "technology",
        "difficulty": "intermediate",
        "expected_insertions": 8
    },
    "advanced_education": {
        "story": SAMPLE_STORY_MEDIUM,
        "topic": "education",
        "difficulty": "advanced",
        "expected_insertions": 5
    }
}
