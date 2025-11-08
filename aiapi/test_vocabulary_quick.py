"""
Quick test for vocabulary database and Azure OpenAI connection
"""
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from aiapi.services.vocabulary_service import (
    get_vocabulary_stats,
    initialize_vocabulary_database,
    search_vocabulary_semantic
)

def test_vocabulary_database():
    """Test vocabulary database status"""
    print("=" * 60)
    print("VOCABULARY DATABASE TEST")
    print("=" * 60)
    
    # Check vocabulary stats
    print("\n1. Checking vocabulary database...")
    try:
        stats = get_vocabulary_stats()
        print(f"✅ Vocabulary collection exists")
        print(f"   Total words: {stats['total_words']}")
        print(f"   Topics: {', '.join(stats['topics'])}")
        print(f"   Difficulties: {', '.join(stats['difficulties'])}")
        
        if stats['total_words'] == 0:
            print("\n⚠️  WARNING: Vocabulary database is empty!")
            print("   Run: python -m aiapi.scripts.init_vocabulary")
            return False
            
    except Exception as e:
        print(f"❌ Error checking vocabulary: {e}")
        print("\n💡 Solution: Initialize vocabulary database")
        print("   Run: python -m aiapi.scripts.init_vocabulary")
        return False
    
    # Test semantic search
    print("\n2. Testing semantic search...")
    try:
        results = search_vocabulary_semantic("programming", n_results=3)
        if results:
            print(f"✅ Semantic search working")
            print(f"   Found {len(results)} results:")
            for word in results[:3]:
                print(f"   - {word['word']}: {word['vietnamese']}")
        else:
            print("⚠️  No results found (database might be empty)")
            return False
            
    except Exception as e:
        print(f"❌ Error in semantic search: {e}")
        print(f"   Error type: {type(e).__name__}")
        print(f"   Error details: {str(e)}")
        
        if "Failed to create query embedding" in str(e):
            print("\n💡 This is an Azure OpenAI API error")
            print("   Possible causes:")
            print("   1. API key is invalid or expired")
            print("   2. API endpoint is not accessible")
            print("   3. Network connection issue")
            print("   4. Rate limit exceeded")
            print("\n   Check your Azure OpenAI credentials in:")
            print("   - aiapi/src/aiapi/config.py")
            print("   - .env file (if exists)")
        
        return False
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED")
    print("=" * 60)
    return True

def initialize_if_needed():
    """Initialize vocabulary database if needed"""
    print("\n" + "=" * 60)
    print("INITIALIZING VOCABULARY DATABASE")
    print("=" * 60)
    
    try:
        result = initialize_vocabulary_database()
        if result:
            print("✅ Vocabulary database initialized successfully")
            return True
        else:
            print("❌ Failed to initialize vocabulary database")
            return False
    except Exception as e:
        print(f"❌ Error initializing vocabulary: {e}")
        return False

if __name__ == "__main__":
    print("\n🔍 Testing Vocabulary System...\n")
    
    # Test current state
    success = test_vocabulary_database()
    
    if not success:
        print("\n" + "=" * 60)
        print("ATTEMPTING AUTO-FIX")
        print("=" * 60)
        
        # Try to initialize
        if initialize_if_needed():
            print("\n✅ Auto-fix successful! Testing again...\n")
            test_vocabulary_database()
        else:
            print("\n❌ Auto-fix failed")
            print("\n📝 Manual steps required:")
            print("   1. Check Azure OpenAI credentials")
            print("   2. Run: python -m aiapi.scripts.init_vocabulary")
            print("   3. Check network connection")
            sys.exit(1)
    else:
        print("\n✅ Vocabulary system is ready!")
        print("   You can now use:")
        print("   - /api/v1/vocabulary/search")
        print("   - /api/v1/generate-story-with-insertion")
