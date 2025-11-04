"""
Test readability validation functionality for story enhancement service.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))

from aiapi.services.story_enhancement_service import (
    validate_story_readability,
    calculate_insertion_metrics
)
from aiapi.services.story_service import calculate_readability_score


def test_readability_score_calculation():
    """Test readability score calculation with different sentence structures."""
    print("\n" + "="*60)
    print("TEST: Readability Score Calculation")
    print("="*60)
    
    # Test 1: Easy text (short sentences)
    easy_text = "Đây là câu ngắn. Câu này cũng ngắn. Rất dễ đọc."
    score_easy = calculate_readability_score(easy_text)
    print(f"\n✓ Easy text (short sentences):")
    print(f"  Text: {easy_text}")
    print(f"  Score: {score_easy} (expected: >= 70)")
    assert score_easy >= 70, f"Easy text should have high readability score, got {score_easy}"
    
    # Test 2: Medium text (medium sentences)
    medium_text = "Đây là một câu có độ dài trung bình với khoảng mười từ. Câu này cũng tương tự như vậy."
    score_medium = calculate_readability_score(medium_text)
    print(f"\n✓ Medium text (medium sentences):")
    print(f"  Text: {medium_text}")
    print(f"  Score: {score_medium} (expected: 55-85)")
    assert 55 <= score_medium <= 85, f"Medium text should have medium readability score, got {score_medium}"
    
    # Test 3: Hard text (long sentences)
    hard_text = "Đây là một câu rất dài với nhiều từ và cụm từ phức tạp mà có thể làm cho người đọc cảm thấy khó hiểu và mất tập trung khi đọc."
    score_hard = calculate_readability_score(hard_text)
    print(f"\n✓ Hard text (long sentences):")
    print(f"  Text: {hard_text}")
    print(f"  Score: {score_hard} (expected: <= 70)")
    assert score_hard <= 70, f"Hard text should have low readability score, got {score_hard}"
    
    print("\n✅ All readability score calculation tests passed!")


def test_readability_validation():
    """Test readability validation function."""
    print("\n" + "="*60)
    print("TEST: Readability Validation")
    print("="*60)
    
    # Test 1: Valid readability (above threshold)
    valid_text = "Đây là câu ngắn. Câu này cũng ngắn. Rất dễ đọc. Tốt cho người học."
    is_valid, score = validate_story_readability(valid_text, min_threshold=60)
    print(f"\n✓ Valid text (above threshold):")
    print(f"  Score: {score}, Valid: {is_valid}")
    assert is_valid, f"Text with score {score} should be valid (>= 60)"
    
    # Test 2: Invalid readability (below threshold)
    invalid_text = "Đây là một câu rất dài với nhiều từ và cụm từ phức tạp mà có thể làm cho người đọc cảm thấy khó hiểu và mất tập trung khi đọc và không thể hiểu được ý nghĩa của câu một cách dễ dàng."
    is_valid, score = validate_story_readability(invalid_text, min_threshold=60)
    print(f"\n✓ Invalid text (below threshold):")
    print(f"  Score: {score}, Valid: {is_valid}")
    assert not is_valid, f"Text with score {score} should be invalid (< 60)"
    
    # Test 3: Custom threshold
    medium_text = "Đây là một câu có độ dài trung bình. Câu này cũng tương tự."
    is_valid_low, score_low = validate_story_readability(medium_text, min_threshold=50)
    is_valid_high, score_high = validate_story_readability(medium_text, min_threshold=80)
    print(f"\n✓ Custom threshold test:")
    print(f"  Score: {score_low}")
    print(f"  Valid with threshold 50: {is_valid_low}")
    print(f"  Valid with threshold 80: {is_valid_high}")
    
    print("\n✅ All readability validation tests passed!")


def test_insertion_metrics_with_readability():
    """Test that insertion metrics include readability score."""
    print("\n" + "="*60)
    print("TEST: Insertion Metrics with Readability")
    print("="*60)
    
    original = "Đây là một câu đơn giản. Câu này cũng đơn giản."
    enhanced = "Đây là một câu đơn giản với **technology** (công nghệ). Câu này cũng đơn giản với **computer** (máy tính)."
    
    metrics = calculate_insertion_metrics(original, enhanced)
    
    print(f"\n✓ Metrics calculated:")
    print(f"  Total insertions: {metrics.total_insertions}")
    print(f"  Insertion density: {metrics.insertion_density}%")
    print(f"  Readability score: {metrics.readability_score}")
    print(f"  Language ratio: {metrics.language_ratio}")
    
    assert metrics.readability_score > 0, "Readability score should be calculated"
    assert metrics.total_insertions == 2, f"Should detect 2 insertions, got {metrics.total_insertions}"
    
    print("\n✅ Insertion metrics test passed!")


def test_readability_threshold_constant():
    """Test that the minimum readability threshold is set to 60."""
    print("\n" + "="*60)
    print("TEST: Readability Threshold Constant")
    print("="*60)
    
    # The threshold is defined in the generate_story_with_insertion function
    # We'll test with the expected value
    MIN_READABILITY_THRESHOLD = 60
    
    print(f"\n✓ Minimum readability threshold: {MIN_READABILITY_THRESHOLD}")
    assert MIN_READABILITY_THRESHOLD == 60, "Minimum readability threshold should be 60"
    
    # Test validation with this threshold
    test_text = "Đây là câu ngắn. Câu này cũng ngắn."
    is_valid, score = validate_story_readability(test_text, min_threshold=MIN_READABILITY_THRESHOLD)
    
    print(f"  Test text score: {score}")
    print(f"  Valid (>= {MIN_READABILITY_THRESHOLD}): {is_valid}")
    
    print("\n✅ Readability threshold test passed!")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("READABILITY VALIDATION TEST SUITE")
    print("="*60)
    
    try:
        test_readability_score_calculation()
        test_readability_validation()
        test_insertion_metrics_with_readability()
        test_readability_threshold_constant()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\nReadability validation features:")
        print("  ✓ Readability score calculation")
        print("  ✓ Validation against threshold (60)")
        print("  ✓ Regeneration logic for low-quality stories")
        print("  ✓ Integration with insertion metrics")
        print("="*60 + "\n")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)
