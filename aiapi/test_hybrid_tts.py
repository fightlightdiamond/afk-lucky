"""
Test hybrid TTS with mixed Vietnamese-English content.
"""
import requests
import json
import base64
from pathlib import Path

BASE_URL = "http://localhost:8001/api/v1"

def test_tts_status():
    """Check TTS service status."""
    print("=== Checking TTS Status ===")
    response = requests.get(f"{BASE_URL}/tts/status")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()
    return response.json()

def test_hybrid_mode(enabled: bool):
    """Enable or disable hybrid mode."""
    print(f"=== Setting Hybrid Mode: {enabled} ===")
    response = requests.post(f"{BASE_URL}/tts/config/hybrid?enabled={enabled}")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()

def test_tts_generation(text: str, mode_name: str, use_hybrid: bool = None):
    """Test TTS generation with given text."""
    print(f"=== Testing TTS ({mode_name}) ===")
    print(f"Text: {text}")
    
    # Generate audio file
    params = {}
    if use_hybrid is not None:
        params['use_hybrid'] = use_hybrid
    
    response = requests.post(
        f"{BASE_URL}/tts/generate-file",
        json={"text": text, "output_format": "file"},
        params=params
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"File URL: {result['file_url']}")
        print(f"Duration: {result['duration']:.2f}s")
        print(f"Size: {result['size_bytes']} bytes")
        
        # Download and save the audio file
        audio_url = f"http://localhost:8001{result['file_url']}"
        audio_response = requests.get(audio_url)
        
        if audio_response.status_code == 200:
            output_dir = Path("test_outputs")
            output_dir.mkdir(exist_ok=True)
            
            filename = f"test_{mode_name.replace(' ', '_').lower()}.wav"
            output_path = output_dir / filename
            
            with open(output_path, 'wb') as f:
                f.write(audio_response.content)
            
            print(f"Saved to: {output_path}")
        else:
            print(f"Failed to download audio: {audio_response.status_code}")
    else:
        print(f"Error: {response.text}")
    
    print()

def main():
    """Run all tests."""
    print("=" * 60)
    print("HYBRID TTS TEST SUITE")
    print("=" * 60)
    print()
    
    # Check status
    status = test_tts_status()
    
    # Test cases with mixed Vietnamese-English content
    test_cases = [
        {
            "text": "Xin chào, tôi tên là John và tôi đến từ Vietnam.",
            "description": "Mixed Vietnamese with English names"
        },
        {
            "text": "Hôm nay tôi học về Machine Learning và Artificial Intelligence.",
            "description": "Vietnamese with English technical terms"
        },
        {
            "text": "Tôi thích ăn pizza và hamburger ở restaurant gần nhà.",
            "description": "Vietnamese with English food terms"
        },
        {
            "text": "Hello, my name is Minh and I live in Hanoi.",
            "description": "English with Vietnamese name and place"
        },
        {
            "text": "Đây là một câu hoàn toàn bằng tiếng Việt không có từ nào khác.",
            "description": "Pure Vietnamese"
        }
    ]
    
    # Test with Vietnamese-only mode (hybrid disabled)
    if status.get('hybrid_mode'):
        test_hybrid_mode(False)
    
    print("=" * 60)
    print("TESTING VIETNAMESE-ONLY MODE")
    print("=" * 60)
    print()
    
    for i, test_case in enumerate(test_cases, 1):
        test_tts_generation(
            test_case["text"],
            f"vi_only_{i}_{test_case['description'][:20]}",
            use_hybrid=False
        )
    
    # Test with hybrid mode (if available)
    if status.get('en_model_loaded'):
        test_hybrid_mode(True)
        
        print("=" * 60)
        print("TESTING HYBRID MODE")
        print("=" * 60)
        print()
        
        for i, test_case in enumerate(test_cases, 1):
            test_tts_generation(
                test_case["text"],
                f"hybrid_{i}_{test_case['description'][:20]}",
                use_hybrid=True
            )
    else:
        print("=" * 60)
        print("HYBRID MODE NOT AVAILABLE (English model not loaded)")
        print("=" * 60)
        print()
    
    print("=" * 60)
    print("TEST COMPLETE")
    print("Check the 'test_outputs' directory for generated audio files")
    print("=" * 60)

if __name__ == "__main__":
    main()
