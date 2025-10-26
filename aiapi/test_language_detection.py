"""
Test language detection accuracy for hybrid TTS.
"""
from src.aiapi.services.tts_service import tts_service

def test_language_detection():
    """Test language detection with various text samples."""
    
    test_cases = [
        {
            "text": "Xin chào, tôi tên là John",
            "expected": [
                ("Xin chào, tôi tên là", "vi"),
                ("John", "en")
            ],
            "description": "Vietnamese with English name"
        },
        {
            "text": "Hôm nay tôi học Machine Learning và Deep Learning",
            "expected": [
                ("Hôm nay tôi học", "vi"),
                ("Machine Learning", "en"),
                ("và", "vi"),
                ("Deep Learning", "en")
            ],
            "description": "Mixed technical terms"
        },
        {
            "text": "Hello, my name is Minh and I live in Hanoi",
            "expected": [
                ("Hello, my name is", "en"),
                ("Minh", "vi"),
                ("and I live in", "en"),
                ("Hanoi", "vi")
            ],
            "description": "English with Vietnamese names"
        },
        {
            "text": "Đây là một câu hoàn toàn bằng tiếng Việt",
            "expected": [
                ("Đây là một câu hoàn toàn bằng tiếng Việt", "vi")
            ],
            "description": "Pure Vietnamese"
        },
        {
            "text": "This is a complete English sentence",
            "expected": [
                ("This is a complete English sentence", "en")
            ],
            "description": "Pure English"
        },
        {
            "text": "Tôi thích ăn pizza, hamburger và sushi",
            "expected_flexible": True,  # Food words can be detected as either language
            "description": "Vietnamese with international food terms"
        },
        {
            "text": "I love Vietnam. Tôi yêu nước Mỹ.",
            "expected": [
                ("I love Vietnam.", "en"),
                ("Tôi yêu nước Mỹ.", "vi")
            ],
            "description": "Two sentences, different languages"
        }
    ]
    
    print("=" * 80)
    print("LANGUAGE DETECTION TEST")
    print("=" * 80)
    print()
    
    passed = 0
    failed = 0
    
    for i, test_case in enumerate(test_cases, 1):
        text = test_case["text"]
        description = test_case["description"]
        
        print(f"Test {i}: {description}")
        print(f"Input: {text}")
        
        # Detect segments
        segments = tts_service._detect_language_segments(text)
        
        print(f"Detected segments:")
        for segment_text, lang in segments:
            print(f"  [{lang.upper()}] {segment_text}")
        
        # Check if detection is reasonable
        if "expected_flexible" in test_case:
            print("  ✓ Flexible test (no strict validation)")
            passed += 1
        elif "expected" in test_case:
            expected = test_case["expected"]
            # Simple validation: check if number of segments is reasonable
            if len(segments) == len(expected):
                print("  ✓ Segment count matches")
                passed += 1
            else:
                print(f"  ✗ Expected {len(expected)} segments, got {len(segments)}")
                failed += 1
        else:
            # Just check that we got some segments
            if segments:
                print("  ✓ Segments detected")
                passed += 1
            else:
                print("  ✗ No segments detected")
                failed += 1
        
        print()
    
    print("=" * 80)
    print(f"RESULTS: {passed} passed, {failed} failed out of {len(test_cases)} tests")
    print("=" * 80)
    print()
    
    # Test individual language detection
    print("=" * 80)
    print("INDIVIDUAL WORD DETECTION TEST")
    print("=" * 80)
    print()
    
    words = [
        ("Xin chào", "vi"),
        ("Hello", "en"),
        ("Machine Learning", "en"),
        ("học", "vi"),
        ("John", "en"),
        ("Minh", "vi"),
        ("pizza", "en"),  # International word
        ("Hà Nội", "vi"),
        ("Vietnam", "en"),
        ("tiếng Việt", "vi"),
    ]
    
    for word, expected_lang in words:
        detected = tts_service._detect_language(word)
        status = "✓" if detected == expected_lang else "✗"
        print(f"{status} '{word}' -> {detected.upper()} (expected: {expected_lang.upper()})")
    
    print()

if __name__ == "__main__":
    # Check if TTS service is available
    if not tts_service.is_available():
        print("ERROR: TTS service not available. Please start the server first.")
        exit(1)
    
    if not tts_service.hybrid_mode:
        print("WARNING: Hybrid mode is disabled. Enabling for testing...")
        tts_service.hybrid_mode = True
    
    test_language_detection()
