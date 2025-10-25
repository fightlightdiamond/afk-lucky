#!/usr/bin/env python3
"""
Test script for file-based TTS functionality.
"""
import requests
import json
import os
from pathlib import Path

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_tts_file_generation():
    """Test TTS file generation."""
    print("Testing TTS file generation...")
    
    test_text = "Xin chào anh em đến với bài tập của khoá AI Application Engineer"
    
    payload = {
        "text": test_text,
        "output_format": "file"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/tts/generate-file", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Message: {result.get('message')}")
            print(f"File URL: {result.get('file_url')}")
            print(f"File Path: {result.get('file_path')}")
            print(f"Duration: {result.get('duration'):.2f} seconds")
            print(f"Size: {result.get('size_bytes')} bytes")
            
            # Test accessing the file
            file_url = result.get('file_url')
            if file_url:
                file_response = requests.get(f"http://localhost:8000{file_url}")
                if file_response.status_code == 200:
                    print(f"✅ File accessible via URL")
                    print(f"Content-Type: {file_response.headers.get('content-type')}")
                    print(f"Content-Length: {file_response.headers.get('content-length')}")
                    
                    # Save downloaded file for verification
                    with open("downloaded_test.wav", "wb") as f:
                        f.write(file_response.content)
                    print("✅ File downloaded successfully as 'downloaded_test.wav'")
                else:
                    print(f"❌ File not accessible: {file_response.status_code}")
            
            return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_story_with_tts_file():
    """Test story generation with file-based TTS."""
    print("\nTesting story generation with file-based TTS...")
    
    payload = {
        "prompt": "Kể một câu chuyện ngắn về một chú mèo thông minh",
        "generate_audio": True,
        "audio_format": "file",
        "preferences": {
            "length": "short",
            "language_mix": {
                "ratio": 80,
                "base_language": "vi",
                "target_language": "en"
            }
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/generate-story-with-tts", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Title: {result.get('title')}")
            print(f"Content length: {len(result.get('content', ''))}")
            
            if result.get('audio'):
                audio = result['audio']
                print(f"Audio format: {audio.get('format')}")
                print(f"Audio duration: {audio.get('duration', 0):.2f} seconds")
                
                if audio.get('file_url'):
                    print(f"Audio file URL: {audio.get('file_url')}")
                    
                    # Test accessing the story audio file
                    file_response = requests.get(f"http://localhost:8000{audio['file_url']}")
                    if file_response.status_code == 200:
                        print("✅ Story audio file accessible")
                        
                        # Save story audio
                        with open("story_audio_file.wav", "wb") as f:
                            f.write(file_response.content)
                        print("✅ Story audio saved as 'story_audio_file.wav'")
                    else:
                        print(f"❌ Story audio file not accessible: {file_response.status_code}")
                
                if audio.get('error'):
                    print(f"Audio error: {audio['error']}")
            else:
                print("No audio generated")
            
            return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_file_serving():
    """Test static file serving."""
    print("\nTesting static file serving...")
    
    # Check if static directory exists
    static_dir = Path("static/audio")
    if static_dir.exists():
        print(f"✅ Static audio directory exists: {static_dir}")
        
        # List files in directory
        audio_files = list(static_dir.glob("*.wav"))
        if audio_files:
            print(f"Found {len(audio_files)} audio files:")
            for file in audio_files[:5]:  # Show first 5 files
                print(f"  - {file.name} ({file.stat().st_size} bytes)")
                
                # Test accessing each file
                file_url = f"/api/v1/tts/audio/{file.name}"
                response = requests.get(f"http://localhost:8000{file_url}")
                if response.status_code == 200:
                    print(f"    ✅ Accessible via {file_url}")
                else:
                    print(f"    ❌ Not accessible: {response.status_code}")
        else:
            print("No audio files found in directory")
    else:
        print(f"❌ Static audio directory not found: {static_dir}")
        return False
    
    return True

def cleanup_test_files():
    """Clean up test files."""
    print("\nCleaning up test files...")
    
    test_files = ["downloaded_test.wav", "story_audio_file.wav"]
    for file in test_files:
        if os.path.exists(file):
            os.remove(file)
            print(f"Removed: {file}")

def main():
    """Run all file-based TTS tests."""
    print("=== File-based TTS Test Suite ===")
    
    tests = [
        ("TTS File Generation", test_tts_file_generation),
        ("Story with TTS File", test_story_with_tts_file),
        ("File Serving", test_file_serving)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        result = test_func()
        results.append((test_name, result))
        print(f"Result: {'✅ PASS' if result else '❌ FAIL'}")
    
    print(f"\n{'='*50}")
    print("=== Test Summary ===")
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All file-based TTS tests passed!")
        print("\n📁 Generated files:")
        print("   - Audio files are saved in: static/audio/")
        print("   - Access via: http://localhost:8000/api/v1/tts/audio/{filename}")
        print("   - Static files: http://localhost:8000/static/audio/{filename}")
    
    # Cleanup
    cleanup_test_files()

if __name__ == "__main__":
    main()