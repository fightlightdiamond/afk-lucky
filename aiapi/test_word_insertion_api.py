"""
Test script for word insertion API endpoints.
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_health():
    """Test if the API is running"""
    try:
        response = requests.get("http://localhost:8000/health")
        print(f"✅ Health check: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_get_vocabulary():
    """Test GET /vocabulary/{topic}/{difficulty}"""
    try:
        response = requests.get(f"{BASE_URL}/vocabulary/technology/beginner?limit=5")
        print(f"\n📚 GET /vocabulary/technology/beginner")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} vocabulary words")
            if data:
                print(f"Sample: {data[0]['metadata']['word']}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_search_vocabulary():
    """Test POST /vocabulary/search"""
    try:
        payload = {
            "query": "computer programming",
            "n_results": 5,
            "topic": "technology",
            "difficulty": "intermediate"
        }
        response = requests.post(f"{BASE_URL}/vocabulary/search", json=payload)
        print(f"\n🔍 POST /vocabulary/search")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data)} vocabulary words")
            if data:
                print(f"Sample: {data[0]['metadata']['word']} (score: {data[0].get('similarity_score', 'N/A')})")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_generate_story_with_insertion():
    """Test POST /generate-story-with-insertion"""
    try:
        payload = {
            "prompt": "Viết một câu chuyện ngắn về một lập trình viên học tiếng Anh",
            "insertion_config": {
                "topic": "technology",
                "difficulty": "beginner",
                "insertion_count": 5,
                "bold_format": True,
                "show_translation": True
            }
        }
        response = requests.post(f"{BASE_URL}/generate-story-with-insertion", json=payload)
        print(f"\n✨ POST /generate-story-with-insertion")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Story generated: {data['title']}")
            print(f"Insertions: {data['metrics']['total_insertions']}")
            print(f"Density: {data['metrics']['insertion_density']}%")
            print(f"\nEnhanced content preview:")
            print(data['enhanced_content'][:200] + "...")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_batch_add_vocabulary():
    """Test POST /vocabulary/batch-add"""
    try:
        payload = {
            "words": [
                {
                    "word": "test",
                    "definition": "A procedure to check quality",
                    "vietnamese_translation": "kiểm tra",
                    "part_of_speech": "noun",
                    "topic": "technology",
                    "difficulty": "beginner",
                    "example": "We need to run a test",
                    "ipa": "/test/"
                }
            ]
        }
        response = requests.post(f"{BASE_URL}/vocabulary/batch-add", json=payload)
        print(f"\n📝 POST /vocabulary/batch-add")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: {data['success_count']}, Failed: {data['failed_count']}")
            if data['errors']:
                print(f"Errors: {data['errors']}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("Word Insertion API Test Suite")
    print("=" * 60)
    
    if not test_health():
        print("\n❌ API is not running. Please start the server first:")
        print("   cd aiapi && python run.py")
        exit(1)
    
    print("\n" + "=" * 60)
    print("Testing Vocabulary Endpoints")
    print("=" * 60)
    
    test_get_vocabulary()
    test_search_vocabulary()
    test_batch_add_vocabulary()
    
    print("\n" + "=" * 60)
    print("Testing Story Generation with Insertion")
    print("=" * 60)
    
    test_generate_story_with_insertion()
    
    print("\n" + "=" * 60)
    print("Test Suite Complete")
    print("=" * 60)
