"""
Test script for batch story generation with word insertion.
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_batch_generation_sequential():
    """Test batch story generation with sequential processing."""
    print("\n" + "="*60)
    print("TEST: Batch Story Generation (Sequential)")
    print("="*60)
    
    # Create batch request with 3 stories
    batch_request = {
        "requests": [
            {
                "prompt": "Viết một câu chuyện ngắn về công nghệ AI",
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "intermediate",
                    "insertion_count": 5
                }
            },
            {
                "prompt": "Viết một câu chuyện về kinh doanh",
                "insertion_config": {
                    "topic": "business",
                    "difficulty": "beginner",
                    "insertion_count": 5
                }
            },
            {
                "prompt": "Viết một câu chuyện về giáo dục",
                "insertion_config": {
                    "topic": "education",
                    "difficulty": "intermediate",
                    "insertion_count": 5
                }
            }
        ]
    }
    
    try:
        start_time = time.time()
        
        # Send request with parallel=False for sequential processing
        response = requests.post(
            f"{BASE_URL}/batch-generate-stories?parallel=false",
            json=batch_request,
            timeout=120
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"\n⏱️ Request completed in {elapsed_time:.2f}s")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Batch processing successful!")
            print(f"   - Total: {result['total']}")
            print(f"   - Success: {result['success_count']}")
            print(f"   - Failed: {result['failed_count']}")
            print(f"   - Processing time: {result['total_time_ms']}ms")
            
            # Show results
            for i, story_result in enumerate(result['results']):
                print(f"\n📖 Story {i+1}:")
                if story_result['success']:
                    story = story_result['result']
                    print(f"   - Title: {story['title']}")
                    print(f"   - Insertions: {story['metrics']['total_insertions']}")
                    print(f"   - Word count: {story['metadata']['word_count']}")
                else:
                    print(f"   - Error: {story_result['error']}")
            
            return True
        else:
            print(f"\n❌ Request failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_batch_generation_parallel():
    """Test batch story generation with parallel processing."""
    print("\n" + "="*60)
    print("TEST: Batch Story Generation (Parallel)")
    print("="*60)
    
    # Create batch request with 3 stories
    batch_request = {
        "requests": [
            {
                "prompt": "Viết một câu chuyện ngắn về công nghệ AI",
                "insertion_config": {
                    "topic": "technology",
                    "difficulty": "intermediate",
                    "insertion_count": 5
                }
            },
            {
                "prompt": "Viết một câu chuyện về kinh doanh",
                "insertion_config": {
                    "topic": "business",
                    "difficulty": "beginner",
                    "insertion_count": 5
                }
            },
            {
                "prompt": "Viết một câu chuyện về giáo dục",
                "insertion_config": {
                    "topic": "education",
                    "difficulty": "intermediate",
                    "insertion_count": 5
                }
            }
        ]
    }
    
    try:
        start_time = time.time()
        
        # Send request with parallel=True (default)
        response = requests.post(
            f"{BASE_URL}/batch-generate-stories?parallel=true&max_workers=3",
            json=batch_request,
            timeout=120
        )
        
        elapsed_time = time.time() - start_time
        
        print(f"\n⏱️ Request completed in {elapsed_time:.2f}s")
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Batch processing successful!")
            print(f"   - Total: {result['total']}")
            print(f"   - Success: {result['success_count']}")
            print(f"   - Failed: {result['failed_count']}")
            print(f"   - Processing time: {result['total_time_ms']}ms")
            
            # Show results
            for i, story_result in enumerate(result['results']):
                print(f"\n📖 Story {i+1}:")
                if story_result['success']:
                    story = story_result['result']
                    print(f"   - Title: {story['title']}")
                    print(f"   - Insertions: {story['metrics']['total_insertions']}")
                    print(f"   - Word count: {story['metadata']['word_count']}")
                else:
                    print(f"   - Error: {story_result['error']}")
            
            return True
        else:
            print(f"\n❌ Request failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_rate_limiting():
    """Test rate limiting by making multiple rapid requests."""
    print("\n" + "="*60)
    print("TEST: Rate Limiting")
    print("="*60)
    
    print("\n📊 Making 5 rapid requests to test rate limiting...")
    
    request_data = {
        "prompt": "Viết một câu chuyện ngắn",
        "insertion_config": {
            "topic": "general",
            "difficulty": "beginner",
            "insertion_count": 3
        }
    }
    
    success_count = 0
    rate_limited_count = 0
    
    for i in range(5):
        try:
            response = requests.post(
                f"{BASE_URL}/generate-story-with-insertion",
                json=request_data,
                timeout=30
            )
            
            if response.status_code == 200:
                success_count += 1
                print(f"✅ Request {i+1}: Success")
            elif response.status_code == 429:
                rate_limited_count += 1
                print(f"⚠️ Request {i+1}: Rate limited")
                retry_after = response.headers.get('Retry-After', 'unknown')
                print(f"   Retry after: {retry_after}s")
            else:
                print(f"❌ Request {i+1}: Failed with status {response.status_code}")
                
        except Exception as e:
            print(f"❌ Request {i+1}: Error - {e}")
        
        # Small delay between requests
        time.sleep(0.1)
    
    print(f"\n📊 Results:")
    print(f"   - Successful: {success_count}")
    print(f"   - Rate limited: {rate_limited_count}")
    
    return True


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("BATCH PROCESSING TESTS")
    print("="*60)
    print("\nMake sure the API server is running on http://localhost:8000")
    print("Start with: cd aiapi && python run.py")
    
    input("\nPress Enter to start tests...")
    
    # Test sequential processing
    test_batch_generation_sequential()
    
    print("\n" + "-"*60)
    input("\nPress Enter to test parallel processing...")
    
    # Test parallel processing
    test_batch_generation_parallel()
    
    print("\n" + "-"*60)
    input("\nPress Enter to test rate limiting...")
    
    # Test rate limiting
    test_rate_limiting()
    
    print("\n" + "="*60)
    print("ALL TESTS COMPLETED")
    print("="*60)


if __name__ == "__main__":
    main()
