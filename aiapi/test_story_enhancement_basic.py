"""
Basic test script for story enhancement service (without requiring vocabulary DB).
"""
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from aiapi.models import InsertionMetrics, VocabularyWord
from aiapi.services.story_enhancement_service import calculate_insertion_metrics

def test_calculate_metrics():
    """Test metrics calculation."""
    print("\n" + "="*60)
    print("TEST: Calculate Insertion Metrics")
    print("="*60)
    
    original = "Đây là một câu chuyện về công nghệ. Chúng ta sẽ học nhiều điều mới."
    enhanced = "Đây là một câu chuyện về **technology** (công nghệ). Chúng ta sẽ **learn** (học) nhiều điều mới."
    
    print(f"\nOriginal: {original}")
    print(f"Enhanced: {enhanced}")
    
    metrics = calculate_insertion_metrics(original, enhanced)
    
    print(f"\n✅ Metrics calculated successfully:")
    print(f"   - Total insertions: {metrics.total_insertions}")
    print(f"   - Insertion density: {metrics.insertion_density}%")
    print(f"   - Readability score: {metrics.readability_score}")
    print(f"   - Language ratio: {metrics.language_ratio}")
    
    # Verify results
    assert metrics.total_insertions == 2, f"Expected 2 insertions, got {metrics.total_insertions}"
    assert metrics.insertion_density > 0, "Insertion density should be > 0"
    assert metrics.readability_score > 0, "Readability score should be > 0"
    assert "vi" in metrics.language_ratio, "Should have Vietnamese ratio"
    assert "en" in metrics.language_ratio, "Should have English ratio"
    
    print("\n✅ All assertions passed!")
    return True

def test_metrics_with_multiple_insertions():
    """Test metrics with more insertions."""
    print("\n" + "="*60)
    print("TEST: Metrics with Multiple Insertions")
    print("="*60)
    
    original = "Tôi đang học lập trình. Tôi thích công nghệ. Tôi muốn trở thành developer."
    enhanced = "Tôi đang học **programming** (lập trình). Tôi thích **technology** (công nghệ). Tôi muốn trở thành **developer** (nhà phát triển)."
    
    print(f"\nOriginal word count: {len(original.split())}")
    print(f"Enhanced word count: {len(enhanced.split())}")
    
    metrics = calculate_insertion_metrics(original, enhanced)
    
    print(f"\n✅ Metrics calculated:")
    print(f"   - Total insertions: {metrics.total_insertions}")
    print(f"   - Insertion density: {metrics.insertion_density}%")
    print(f"   - Readability score: {metrics.readability_score}")
    
    assert metrics.total_insertions == 3, f"Expected 3 insertions, got {metrics.total_insertions}"
    assert metrics.insertion_density > 15, f"Expected density > 15%, got {metrics.insertion_density}%"
    
    print("\n✅ Multiple insertions test passed!")
    return True

def test_metrics_no_insertions():
    """Test metrics with no insertions."""
    print("\n" + "="*60)
    print("TEST: Metrics with No Insertions")
    print("="*60)
    
    original = "Đây là một câu chuyện đơn giản."
    enhanced = "Đây là một câu chuyện đơn giản."
    
    metrics = calculate_insertion_metrics(original, enhanced)
    
    print(f"\n✅ Metrics calculated:")
    print(f"   - Total insertions: {metrics.total_insertions}")
    print(f"   - Insertion density: {metrics.insertion_density}%")
    
    assert metrics.total_insertions == 0, f"Expected 0 insertions, got {metrics.total_insertions}"
    assert metrics.insertion_density == 0, f"Expected 0% density, got {metrics.insertion_density}%"
    
    print("\n✅ No insertions test passed!")
    return True

def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("STORY ENHANCEMENT SERVICE - BASIC TESTS")
    print("="*60)
    
    try:
        # Test 1: Basic metrics calculation
        if not test_calculate_metrics():
            print("\n❌ Basic metrics test failed")
            return False
        
        # Test 2: Multiple insertions
        if not test_metrics_with_multiple_insertions():
            print("\n❌ Multiple insertions test failed")
            return False
        
        # Test 3: No insertions
        if not test_metrics_no_insertions():
            print("\n❌ No insertions test failed")
            return False
        
        print("\n" + "="*60)
        print("✅ ALL BASIC TESTS PASSED!")
        print("="*60)
        print("\nNote: Full integration tests require:")
        print("  1. Azure OpenAI credentials configured")
        print("  2. Vocabulary database initialized")
        print("  3. ChromaDB running")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
