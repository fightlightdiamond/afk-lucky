"""
Demonstration of the readability validation feature.
Shows how the feature works in practice with realistic scenarios.
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


def demo_readability_validation():
    """Demonstrate readability validation with real examples."""
    print("\n" + "="*70)
    print("READABILITY VALIDATION FEATURE DEMONSTRATION")
    print("="*70)
    
    print("\n📚 Feature Overview:")
    print("   - Minimum readability threshold: 60")
    print("   - Maximum regeneration attempts: 2")
    print("   - Automatic preference adjustment to 'beginner' level")
    print("   - Post-insertion validation with insertion count reduction")
    
    # Example 1: Good readability story
    print("\n" + "-"*70)
    print("Example 1: Story with Good Readability")
    print("-"*70)
    
    good_story = """
    Hôm nay là một ngày đẹp trời. Mặt trời chiếu sáng rực rỡ. 
    Tôi đi dạo trong công viên. Có nhiều người đang tập thể dục.
    Trẻ em chơi đùa vui vẻ. Không khí rất trong lành.
    """
    
    is_valid, score = validate_story_readability(good_story.strip())
    print(f"\n✓ Story content: {good_story.strip()[:100]}...")
    print(f"✓ Readability score: {score}")
    print(f"✓ Validation result: {'PASS ✅' if is_valid else 'FAIL ❌'}")
    print(f"✓ Action: {'No regeneration needed' if is_valid else 'Regenerate with simpler sentences'}")
    
    # Example 2: Poor readability story
    print("\n" + "-"*70)
    print("Example 2: Story with Poor Readability")
    print("-"*70)
    
    poor_story = """
    Trong bối cảnh của sự phát triển công nghệ hiện đại với những tiến bộ vượt bậc 
    trong lĩnh vực trí tuệ nhân tạo và học máy, chúng ta đang chứng kiến một cuộc 
    cách mạng toàn diện về cách thức mà con người tương tác với máy móc và các hệ 
    thống tự động hóa phức tạp, điều này đòi hỏi chúng ta phải có những hiểu biết 
    sâu sắc về các khái niệm kỹ thuật và khả năng thích ứng với những thay đổi 
    nhanh chóng trong môi trường công nghệ đang không ngừng biến đổi.
    """
    
    is_valid, score = validate_story_readability(poor_story.strip())
    print(f"\n✓ Story content: {poor_story.strip()[:100]}...")
    print(f"✓ Readability score: {score}")
    print(f"✓ Validation result: {'PASS ✅' if is_valid else 'FAIL ❌'}")
    print(f"✓ Action: {'No regeneration needed' if is_valid else 'Regenerate with simpler sentences'}")
    
    # Example 3: Story with word insertions
    print("\n" + "-"*70)
    print("Example 3: Story with English Word Insertions")
    print("-"*70)
    
    original = "Tôi thích sử dụng máy tính. Nó giúp tôi làm việc hiệu quả. Tôi học lập trình mỗi ngày."
    enhanced = "Tôi thích sử dụng **computer** (máy tính). Nó giúp tôi làm việc **efficient** (hiệu quả). Tôi học **programming** (lập trình) mỗi ngày."
    
    metrics = calculate_insertion_metrics(original, enhanced)
    is_valid, score = validate_story_readability(enhanced)
    
    print(f"\n✓ Original: {original}")
    print(f"✓ Enhanced: {enhanced}")
    print(f"✓ Insertions: {metrics.total_insertions} words")
    print(f"✓ Insertion density: {metrics.insertion_density}%")
    print(f"✓ Readability score: {score}")
    print(f"✓ Validation result: {'PASS ✅' if is_valid else 'FAIL ❌'}")
    
    # Example 4: Over-insertion scenario
    print("\n" + "-"*70)
    print("Example 4: Story with Excessive Insertions")
    print("-"*70)
    
    original_simple = "Tôi đi học. Tôi học toán. Tôi về nhà."
    over_inserted = "Tôi **go** (đi) **to** (đến) **school** (học). Tôi **study** (học) **mathematics** (toán). Tôi **return** (về) **home** (nhà)."
    
    metrics_over = calculate_insertion_metrics(original_simple, over_inserted)
    is_valid_over, score_over = validate_story_readability(over_inserted)
    
    print(f"\n✓ Original: {original_simple}")
    print(f"✓ Over-inserted: {over_inserted}")
    print(f"✓ Insertions: {metrics_over.total_insertions} words")
    print(f"✓ Insertion density: {metrics_over.insertion_density}%")
    print(f"✓ Readability score: {score_over}")
    print(f"✓ Validation result: {'PASS ✅' if is_valid_over else 'FAIL ❌'}")
    
    if not is_valid_over:
        print(f"✓ Action: Reduce insertion count by 30% and retry")
        reduced_count = max(5, int(metrics_over.total_insertions * 0.7))
        print(f"✓ New insertion count: {reduced_count}")


def demo_regeneration_flow():
    """Demonstrate the regeneration flow."""
    print("\n" + "="*70)
    print("REGENERATION FLOW DEMONSTRATION")
    print("="*70)
    
    print("\n📋 Regeneration Process:")
    print("   1. Generate base story")
    print("   2. Validate readability (threshold: 60)")
    print("   3. If score < 60:")
    print("      a. Adjust readability_level to 'beginner'")
    print("      b. Regenerate story")
    print("      c. Repeat up to 2 times")
    print("   4. Proceed with best available story")
    
    print("\n📊 Example Regeneration Scenario:")
    
    attempts = [
        {"attempt": 1, "score": 45, "action": "Regenerate (too low)"},
        {"attempt": 2, "score": 55, "action": "Regenerate (still low)"},
        {"attempt": 3, "score": 70, "action": "Accept (meets threshold)"}
    ]
    
    for attempt in attempts:
        status = "✅" if attempt["score"] >= 60 else "❌"
        print(f"\n   Attempt {attempt['attempt']}: Score = {attempt['score']} {status}")
        print(f"   Action: {attempt['action']}")
    
    print("\n✅ Final story accepted with readability score: 70")


def demo_metrics_integration():
    """Demonstrate how readability integrates with metrics."""
    print("\n" + "="*70)
    print("METRICS INTEGRATION DEMONSTRATION")
    print("="*70)
    
    print("\n📊 Insertion Metrics Include:")
    print("   - total_insertions: Number of English words inserted")
    print("   - insertion_density: Insertions per 100 words")
    print("   - avg_position_score: Average quality of insertion positions")
    print("   - readability_score: Readability after insertion ⭐")
    print("   - language_ratio: Vietnamese vs English ratio")
    
    # Example metrics
    example_story = "Tôi học **technology** (công nghệ) mỗi ngày. Nó rất **interesting** (thú vị)."
    original = "Tôi học công nghệ mỗi ngày. Nó rất thú vị."
    
    metrics = calculate_insertion_metrics(original, example_story)
    
    print(f"\n✓ Example Story: {example_story}")
    print(f"\n✓ Calculated Metrics:")
    print(f"   - Total insertions: {metrics.total_insertions}")
    print(f"   - Insertion density: {metrics.insertion_density}%")
    print(f"   - Readability score: {metrics.readability_score} ⭐")
    print(f"   - Language ratio: {metrics.language_ratio}")


if __name__ == "__main__":
    try:
        demo_readability_validation()
        demo_regeneration_flow()
        demo_metrics_integration()
        
        print("\n" + "="*70)
        print("✅ DEMONSTRATION COMPLETE")
        print("="*70)
        print("\n🎯 Key Takeaways:")
        print("   1. Readability validation ensures story quality (threshold: 60)")
        print("   2. Automatic regeneration with up to 2 retry attempts")
        print("   3. Preference adjustment to 'beginner' level for simpler sentences")
        print("   4. Post-insertion validation with automatic insertion reduction")
        print("   5. Comprehensive metrics tracking including readability score")
        print("="*70 + "\n")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)
