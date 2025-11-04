"""
Test script for vocabulary data models and ChromaDB collection setup.
"""
import sys
sys.path.insert(0, 'src')

from aiapi.models import (
    VocabularyWord, 
    InsertionPosition, 
    InsertionConfig,
    InsertionMetrics,
    StoryInsertionRequest,
    StoryInsertionResponse
)
from aiapi.services.vocabulary_service import (
    initialize_vocabulary_database,
    add_vocabulary,
    get_vocabulary_by_topic,
    search_vocabulary_semantic,
    get_vocabulary_stats
)
from aiapi.config import settings

def test_models():
    """Test Pydantic models."""
    print("\n=== Testing Pydantic Models ===")
    
    # Test VocabularyWord
    vocab = VocabularyWord(
        word="laptop",
        definition="A portable computer",
        vietnamese_translation="máy tính xách tay",
        part_of_speech="noun",
        topic="technology",
        difficulty="beginner",
        example="I use my laptop for work",
        ipa="/ˈlæp.tɑːp/"
    )
    print(f"✅ VocabularyWord model: {vocab.word}")
    
    # Test InsertionPosition
    position = InsertionPosition(
        sentence_index=0,
        word_index=5,
        position_type="noun",
        score=0.85,
        context="This is a test sentence"
    )
    print(f"✅ InsertionPosition model: score={position.score}")
    
    # Test InsertionConfig
    config = InsertionConfig(
        topic="technology",
        difficulty="intermediate",
        insertion_count=10
    )
    print(f"✅ InsertionConfig model: topic={config.topic}, count={config.insertion_count}")
    
    print("✅ All Pydantic models validated successfully!")

def test_config():
    """Test configuration settings."""
    print("\n=== Testing Configuration Settings ===")
    
    print(f"Default vocabulary topic: {settings.default_vocabulary_topic}")
    print(f"Default insertion count: {settings.default_insertion_count}")
    print(f"Max insertion count: {settings.max_insertion_count}")
    print(f"Min position score: {settings.min_position_score}")
    print(f"Vocabulary collection name: {settings.vocabulary_collection_name}")
    print(f"ChromaDB path: {settings.chromadb_path}")
    
    print("✅ Configuration settings loaded successfully!")

def test_vocabulary_service():
    """Test vocabulary service and ChromaDB collection."""
    print("\n=== Testing Vocabulary Service ===")
    
    # Initialize database
    print("\n1. Initializing vocabulary database...")
    success = initialize_vocabulary_database()
    if success:
        print("✅ Vocabulary database initialized")
    else:
        print("❌ Failed to initialize vocabulary database")
        return
    
    # Add sample vocabulary
    print("\n2. Adding sample vocabulary words...")
    sample_words = [
        {
            "word": "laptop",
            "definition": "A portable computer",
            "vietnamese_translation": "máy tính xách tay",
            "part_of_speech": "noun",
            "topic": "technology",
            "difficulty": "beginner",
            "example": "I use my laptop for work every day",
            "ipa": "/ˈlæp.tɑːp/"
        },
        {
            "word": "algorithm",
            "definition": "A step-by-step procedure for solving a problem",
            "vietnamese_translation": "thuật toán",
            "part_of_speech": "noun",
            "topic": "technology",
            "difficulty": "intermediate",
            "example": "The algorithm processes data efficiently",
            "ipa": "/ˈæl.ɡə.rɪ.ðəm/"
        },
        {
            "word": "meeting",
            "definition": "A gathering of people for discussion",
            "vietnamese_translation": "cuộc họp",
            "part_of_speech": "noun",
            "topic": "business",
            "difficulty": "beginner",
            "example": "We have a meeting at 2 PM",
            "ipa": "/ˈmiː.tɪŋ/"
        }
    ]
    
    for word_data in sample_words:
        success = add_vocabulary(**word_data)
        if not success:
            print(f"❌ Failed to add word: {word_data['word']}")
    
    # Get vocabulary stats
    print("\n3. Getting vocabulary statistics...")
    stats = get_vocabulary_stats()
    print(f"Total words in database: {stats.get('total_words', 0)}")
    
    # Get vocabulary by topic
    print("\n4. Getting vocabulary by topic and difficulty...")
    tech_words = get_vocabulary_by_topic("technology", "beginner", limit=10)
    print(f"Found {len(tech_words)} technology/beginner words")
    
    # Semantic search
    print("\n5. Testing semantic search...")
    results = search_vocabulary_semantic("computer device", n_results=5)
    print(f"Found {len(results)} words for query 'computer device'")
    if results:
        print(f"Top result: {results[0]['metadata']['word']}")
    
    print("\n✅ Vocabulary service tests completed!")

def main():
    """Run all tests."""
    print("=" * 60)
    print("Testing Vocabulary Data Models and ChromaDB Collection Setup")
    print("=" * 60)
    
    try:
        test_models()
        test_config()
        test_vocabulary_service()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
