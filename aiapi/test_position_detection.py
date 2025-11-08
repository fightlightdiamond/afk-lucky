"""Test position detection to debug the issue."""
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)
print(f"✅ Loaded .env from {env_path}\n")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from src.aiapi.services.word_insertion_service import analyze_story_structure

# Test with a simple Vietnamese story
test_story = """
Hôm nay tôi đi làm bằng xe buýt. Công ty tôi ở trung tâm thành phố. 
Tôi làm việc với máy tính mỗi ngày. Buổi trưa tôi ăn cơm với đồng nghiệp.
Sau giờ làm việc, tôi về nhà và nghỉ ngơi.
"""

print("=" * 60)
print("Testing Position Detection")
print("=" * 60)
print(f"\nTest story:\n{test_story}\n")

try:
    print("Analyzing story structure...")
    positions = analyze_story_structure(test_story)
    
    print(f"\n✅ Found {len(positions)} insertion positions:")
    for i, pos in enumerate(positions[:10], 1):  # Show first 10
        print(f"\n{i}. Sentence {pos.sentence_index}, Word {pos.word_index}")
        print(f"   Type: {pos.position_type}")
        print(f"   Score: {pos.score}")
        print(f"   Context: {pos.context}")
    
    if len(positions) == 0:
        print("\n❌ NO POSITIONS FOUND!")
        print("\nPossible reasons:")
        print("1. AI is not returning valid JSON")
        print("2. All positions have score < 0.5")
        print("3. Sentences are too short (< 5 words)")
        print("4. API error")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
