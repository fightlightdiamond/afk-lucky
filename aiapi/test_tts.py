#!/usr/bin/env python3
"""
Test script for TTS functionality.
"""
import requests
import json
import base64
import os
from pathlib import Path

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_tts_status():
    """Test TTS service status."""
    print("Testing TTS status...")
    try:
        response = requests.get(f"{BASE_URL}/tts/status")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_tts_generation():
    """Test TTS audio generation."""
    print("\nTesting TTS generation...")
    
    test_text = "Xin chào anh em đến với bài tập của khoá AI Application Engineer"
    
    payload = {
        "text": test_text,
        "output_format": "base64"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/tts/generate", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Format: {result.get('format')}")
            print(f"Sampling Rate: {result.get('sampling_rate')}")
            print(f"Duration: {result.get('duration'):.2f} seconds")
            print(f"Size: {result.get('size_bytes')} bytes")
            
            # Save audio file for testing
            if result.get('audio_base64'):
                audio_data = base64.b64decode(result['audio_base64'])
                output_path = Path("test_tts_output.wav")
                with open(output_path, "wb") as f:
                    f.write(audio_data)
                print(f"Audio saved to: {output_path.absolute()}")
            
            return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_tts_wav_download():
    """Test TTS WAV file download."""
    print("\nTesting TTS WAV download...")
    
    test_text = "Đây là test tải file WAV từ TTS service"
    
    payload = {
        "text": test_text,
        "output_format": "wav"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/tts/generate-wav", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            output_path = Path("test_tts_download.wav")
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"WAV file downloaded to: {output_path.absolute()}")
            print(f"File size: {len(response.content)} bytes")
            return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_story_with_tts():
    """Test story generation with TTS."""
    print("\nTesting story generation with TTS...")
    
    payload = {
        "prompt": "Kể một câu chuyện ngắn về một chú mèo thông minh",
        "generate_audio": True,
        "audio_format": "base64",
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
                
                if audio.get('audio_base64'):
                    # Save story audio
                    audio_data = base64.b64decode(audio['audio_base64'])
                    output_path = Path("test_story_audio.wav")
                    with open(output_path, "wb") as f:
                        f.write(audio_data)
                    print(f"Story audio saved to: {output_path.absolute()}")
                
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

def main():
    """Run all TTS tests."""
    print("=== TTS Service Test Suite ===")
    
    tests = [
        ("TTS Status", test_tts_status),
        ("TTS Generation", test_tts_generation),
        ("TTS WAV Download", test_tts_wav_download),
        ("Story with TTS", test_story_with_tts)
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

if __name__ == "__main__":
    main()