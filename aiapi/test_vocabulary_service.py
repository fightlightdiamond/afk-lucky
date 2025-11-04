#!/usr/bin/env python3
"""
Test script for vocabulary service functionality.

This script tests the vocabulary service without requiring Azure OpenAI credentials.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from src.aiapi.services.vocabulary_service import (
    get_vocabulary_collection,
    get_vocabulary_stats,
    initialize_vocabulary_database
)

def test_collection_initialization():
    """Test that vocabulary collection can be initialized."""
    print("=" * 60)
    print("Test 1: Collection Initialization")
    print("=" * 60)
    
    try:
        collection = get_vocabulary_collection()
        print(f"✅ Collection created: {collection.name}")
        print(f"   Metadata: {collection.metadata}")
        return True
    except Exception as e:
        print(f"❌ Failed to create collection: {e}")
        return False

def test_database_initialization():
    """Test database initialization function."""
    print("\n" + "=" * 60)
    print("Test 2: Database Initialization")
    print("=" * 60)
    
    try:
        result = initialize_vocabulary_database()
        if result:
            print("✅ Database initialized successfully")
        else:
            print("❌ Database initialization returned False")
        return result
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

def test_collection_stats():
    """Test getting collection statistics."""
    print("\n" + "=" * 60)
    print("Test 3: Collection Statistics")
    print("=" * 60)
    
    try:
        stats = get_vocabulary_stats()
        if "error" in stats:
            print(f"❌ Error getting stats: {stats['error']}")
            return False
        
        print(f"✅ Statistics retrieved:")
        print(f"   Total words: {stats['total_words']}")
        print(f"   Collection name: {stats['collection_name']}")
        print(f"   Metadata: {stats.get('metadata', {})}")
        return True
    except Exception as e:
        print(f"❌ Failed to get stats: {e}")
        return False

def test_json_data_loading():
    """Test that sample vocabulary JSON file exists and is valid."""
    print("\n" + "=" * 60)
    print("Test 4: Sample Vocabulary Data")
    print("=" * 60)
    
    try:
        import json
        json_path = Path(__file__).parent / "data" / "sample_vocabulary.json"
        
        if not json_path.exists():
            print(f"❌ Sample vocabulary file not found: {json_path}")
            return False
        
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✅ Sample vocabulary file loaded")
        print(f"   Total words: {len(data)}")
        
        # Check data structure
        if data and len(data) > 0:
            first_word = data[0]
            required_fields = ['word', 'definition', 'vietnamese_translation', 
                             'part_of_speech', 'topic', 'difficulty', 'example']
            
            missing_fields = [f for f in required_fields if f not in first_word]
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return False
            
            print(f"✅ Data structure is valid")
            print(f"   Sample word: {first_word['word']} ({first_word['topic']}, {first_word['difficulty']})")
            
            # Count by topic and difficulty
            topics = {}
            difficulties = {}
            for word in data:
                topics[word['topic']] = topics.get(word['topic'], 0) + 1
                difficulties[word['difficulty']] = difficulties.get(word['difficulty'], 0) + 1
            
            print(f"\n   Topics distribution:")
            for topic, count in sorted(topics.items()):
                print(f"     - {topic}: {count} words")
            
            print(f"\n   Difficulty distribution:")
            for diff, count in sorted(difficulties.items()):
                print(f"     - {diff}: {count} words")
        
        return True
    except Exception as e:
        print(f"❌ Failed to load sample data: {e}")
        return False

def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("Vocabulary Service Test Suite")
    print("=" * 60)
    print("\nNote: These tests verify service functionality without")
    print("requiring Azure OpenAI credentials.\n")
    
    tests = [
        test_collection_initialization,
        test_database_initialization,
        test_collection_stats,
        test_json_data_loading
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"\n❌ Test failed with exception: {e}")
            results.append(False)
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    print(f"Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n✅ All tests passed!")
    else:
        print("\n⚠️  Some tests failed")
    
    print("\n" + "=" * 60)
    print("Note: To fully test vocabulary addition with embeddings,")
    print("set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT")
    print("environment variables and run: python scripts/init_vocabulary.py")
    print("=" * 60)
    
    return passed == total

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
