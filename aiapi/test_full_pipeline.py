"""Test full word insertion pipeline."""
import sys
import os
from pathlib import Path
from dotenv import load_dotenv
import json

# Load .env
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from src.aiapi.models import StoryInsertionRequest, InsertionConfig
from src.aiapi.services.story_enhancement_service import generate_story_with_insertion

print("=" * 60)
print("Testing Full Word Insertion Pipeline")
print("=" * 60)

# Create request
request = StoryInsertionRequest(
    prompt="Viết câu chuyện ngắn 5 câu về một ngày đi làm",
    insertion_config=InsertionConfig(
        topic="business",
        difficulty="beginner",
        insertion_count=5
    )
)

print(f"\nPrompt: {request.prompt}")
print(f"Topic: {request.insertion_config.topic}")
print(f"Difficulty: {request.insertion_config.difficulty}")
print(f"Insertion count: {request.insertion_config.insertion_count}")

print("\n" + "-" * 60)
print("Generating story with word insertion...")
print("-" * 60 + "\n")

try:
    result = generate_story_with_insertion(request)
    
    print(f"✅ Title: {result.title}\n")
    
    print(f"📝 Original Story ({len(result.original_content)} chars):")
    print(result.original_content[:200] + "..." if len(result.original_content) > 200 else result.original_content)
    
    print(f"\n✨ Enhanced Story ({len(result.enhanced_content)} chars):")
    print(result.enhanced_content[:200] + "..." if len(result.enhanced_content) > 200 else result.enhanced_content)
    
    print(f"\n📊 Metrics:")
    print(f"  - Total insertions: {result.metrics.total_insertions}")
    print(f"  - Insertion density: {result.metrics.insertion_density:.2%}")
    print(f"  - Avg position score: {result.metrics.avg_position_score:.2f}")
    print(f"  - Readability score: {result.metrics.readability_score}")
    
    if result.inserted_words:
        print(f"\n📚 Inserted Words ({len(result.inserted_words)}):")
        for word in result.inserted_words[:5]:
            print(f"  - {word.word} ({word.vietnamese_translation})")
    else:
        print("\n⚠️ No words were inserted!")
    
    if result.error:
        print(f"\n❌ Error: {result.error}")
    
    # Save result
    output_file = Path(__file__).parent / 'test_result.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "title": result.title,
            "original_content": result.original_content,
            "enhanced_content": result.enhanced_content,
            "inserted_words": [w.dict() for w in result.inserted_words],
            "metrics": result.metrics.dict(),
            "error": result.error
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Result saved to: {output_file}")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
