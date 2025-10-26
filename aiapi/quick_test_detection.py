"""
Quick test for language detection - no server needed.
"""
import sys
sys.path.insert(0, 'src')

from aiapi.services.tts_service import TTSService

# Create a minimal TTS service just for testing detection
class TestTTSService:
    def __init__(self):
        self.hybrid_mode = True
        self.en_model = True  # Fake, just to enable hybrid mode
        
    def _detect_language(self, text: str) -> str:
        """Copy of detection logic for testing."""
        from langdetect import detect, LangDetectException
        
        if not text or len(text.strip()) < 3:
            return 'vi'
        
        try:
            detected = detect(text)
            if detected == 'en':
                return 'en'
            elif detected == 'vi':
                return 'vi'
            else:
                latin_chars = sum(1 for c in text if c.isascii() and c.isalpha())
                total_chars = sum(1 for c in text if c.isalpha())
                if total_chars > 0 and latin_chars / total_chars > 0.7:
                    return 'en'
                return 'vi'
        except LangDetectException:
            vietnamese_chars = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ'
            if any(c in vietnamese_chars for c in text.lower()):
                return 'vi'
            if text.replace(' ', '').isascii():
                return 'en'
            return 'vi'

def test_detection():
    """Quick test of language detection."""
    service = TestTTSService()
    
    tests = [
        ("Xin chào", "vi"),
        ("Hello", "en"),
        ("Machine Learning", "en"),
        ("Tôi học tiếng Anh", "vi"),
        ("I love Vietnam", "en"),
        ("Minh", "vi"),
        ("John", "en"),
        ("Hà Nội", "vi"),
        ("New York", "en"),
        ("pizza", "en"),
        ("phở", "vi"),
    ]
    
    print("Quick Language Detection Test")
    print("=" * 50)
    
    correct = 0
    total = len(tests)
    
    for text, expected in tests:
        detected = service._detect_language(text)
        status = "✓" if detected == expected else "✗"
        if detected == expected:
            correct += 1
        print(f"{status} '{text:20}' → {detected.upper():2} (expected: {expected.upper()})")
    
    print("=" * 50)
    print(f"Result: {correct}/{total} correct ({correct/total*100:.1f}%)")
    
    if correct == total:
        print("🎉 Perfect score!")
    elif correct >= total * 0.8:
        print("👍 Good accuracy!")
    else:
        print("⚠️  Needs improvement")

if __name__ == "__main__":
    try:
        test_detection()
    except ImportError as e:
        print(f"Error: {e}")
        print("\nPlease install langdetect:")
        print("  pip install langdetect")
        print("  or")
        print("  uv pip install langdetect")
