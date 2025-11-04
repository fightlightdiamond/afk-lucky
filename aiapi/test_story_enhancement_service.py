"""
Test script for story enhancement service.
"""
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from aiapi.models import StoryInsertionRequest, InsertionConfig, StoryConfig, StoryPreferences
from aiapi.services.story_enhancement_service import (
    generate_story_with_insertion,
    calculate_insertion_metrics
)

def test_calculate_metrics():
    """Test metrics calculation."""
    print("\n" + "="*60)
    print("TEST: Calculate Insertion Metrics")
    print("="*60)
    
    original = "Đây là một câu chuyện về công nghệ. Chúng ta sẽ học nhiều điều mới."
    enhanced = "Đây là một câu chuyện về **technology** (công nghệ). Chúng ta sẽ **learn** (học) nhiều điều mới."
    
    metrics = calculate_insertion_metrics(original, enhanced)
    
    print(f"\n✅ Metrics calculated successfully:")
    print(f"   - Total insertions: {metrics.total_insertions}")
    print(f"   - Insertion density: {metrics.insertion_density}%")
    print(f"   - Readability score: {metrics.readability_score}")
    print(f"   - Language ratio: {metrics.language_ratio}")
    
    assert metrics.total_insertions == 2, f"Expected 2 insertions, got {metrics.total_insertions}"
    assert metrics.insertion_density > 0, "Insertion density should be > 0"
    
    print("\n✅ Metrics calculation test passed!")
    return True

def test_story_generation_with_insertion():
    """Test story generation with word insertion."""
    print("\n" + "="*60)
    print("TEST: Story Generation with Insertion")
    print("="*60)
    
    # Create request
    request = StoryInsertionRequest(
        prompt="Viết một câu chuyện ngắn về một lập trình viên học công nghệ mới",
        config=StoryConfig(
            core_topic="technology",
            vocab_focus=["programming", "technology", "learning"]
        ),
        preferences=StoryPreferences(
            length="short"
        ),
        insertion_config=InsertionConfig(
            topic="technology",
            difficulty="intermediate",
            insertion_count=5,
            bold_format=True,
            show_translation=True
        )
    )
    
    print("\n📝 Generating story with word insertion...")
    print(f"   - Topic: {request.insertion_config.topic}")
    print(f"   - Difficulty: {request.insertion_config.difficulty}")
    print(f"   - Target insertions: {request.insertion_config.insertion_count}")
    
    # Generate story
    response = generate_story_with_insertion(request)
    
    if response.error:
        print(f"\n❌ Error: {response.error}")
        return False
    
    print(f"\n✅ Story generated successfully!")
    print(f"\n📖 Title: {response.title}")
    print(f"\n📝 Original Content ({len(response.original_content)} chars):")
    print(response.original_content[:200] + "..." if len(response.original_content) > 200 else response.original_content)
    
    print(f"\n✨ Enhanced Content ({len(response.enhanced_content)} chars):")
    print(response.enhanced_content[:300] + "..." if len(response.enhanced_content) > 300 else response.enhanced_content)
    
    print(f"\n📊 Metrics:")
    print(f"   - Total insertions: {response.metrics.total_insertions}")
    print(f"   - Insertion density: {response.metrics.insertion_density}%")
    print(f"   - Avg position score: {response.metrics.avg_position_score}")
    print(f"   - Readability score: {response.metrics.readability_score}")
    print(f"   - Language ratio: {response.metrics.language_ratio}")
    
    print(f"\n📚 Inserted Words ({len(response.inserted_words)}):")
    for i, word in enumerate(response.inserted_words[:5], 1):
        print(f"   {i}. {word.word} ({word.vietnamese_translation}) - {word.part_of_speech}")
    
    print(f"\n📖 Glossary ({len(response.glossary)} entries):")
    for i, entry in enumerate(response.glossary[:3], 1):
        print(f"   {i}. {entry['word']}: {entry['definition']}")
    
    print(f"\n📈 Metadata:")
    print(f"   - Word count: {response.metadata.word_count}")
    print(f"   - Generation time: {response.metadata.generation_time}ms")
    
    # Verify results
    assert response.title, "Title should not be empty"
    assert response.original_content, "Original content should not be empty"
    assert response.enhanced_content, "Enhanced content should not be empty"
    assert len(response.inserted_words) > 0, "Should have inserted words"
    assert len(response.glossary) > 0, "Should have glossary entries"
    
    print("\n✅ Story generation with insertion test passed!")
    return True

def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("STORY ENHANCEMENT SERVICE TESTS")
    print("="*60)
    
    try:
        # Test 1: Metrics calculation
        if not test_calculate_metrics():
            print("\n❌ Metrics calculation test failed")
            return False
        
        # Test 2: Story generation with insertion
        if not test_story_generation_with_insertion():
            print("\n❌ Story generation test failed")
            return False
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
