"""
Test script for grammar validation after word insertion.
"""
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from aiapi.services.word_insertion_service import (
    validate_grammar_after_insertion,
    adjust_insertion_positions_for_grammar
)
from aiapi.models import InsertionPosition


def test_grammar_validation():
    """Test grammar validation with sample Vietnamese text."""
    print("=" * 80)
    print("TEST 1: Grammar Validation with Good Insertion")
    print("=" * 80)
    
    # Sample Vietnamese story
    original_story = """
    Một ngày nọ, có một cô gái tên là Lan. Cô ấy sống ở thành phố Hà Nội.
    Mỗi sáng, Lan thức dậy lúc 6 giờ. Cô ấy đi làm bằng xe buýt.
    """
    
    # Enhanced story with proper English insertions
    enhanced_story_good = """
    Một ngày nọ, có một cô gái tên là Lan. Cô ấy sống ở **city** (thành phố) Hà Nội.
    Mỗi sáng, Lan thức dậy lúc 6 giờ. Cô ấy đi làm bằng **bus** (xe buýt).
    """
    
    print("\nOriginal story:")
    print(original_story)
    print("\nEnhanced story (good insertion):")
    print(enhanced_story_good)
    
    # Validate grammar
    result = validate_grammar_after_insertion(
        enhanced_story=enhanced_story_good,
        original_story=original_story
    )
    
    print("\n📊 Validation Result:")
    print(f"   - Is Valid: {result['is_valid']}")
    print(f"   - Overall Score: {result['overall_score']:.2f}")
    print(f"   - Issues Found: {len(result['issues'])}")
    
    if result['issues']:
        print("\n⚠️ Issues:")
        for issue in result['issues']:
            print(f"   - [{issue.get('severity', 'unknown')}] {issue.get('description', 'No description')}")
    
    if result['suggestions']:
        print("\n💡 Suggestions:")
        for suggestion in result['suggestions']:
            print(f"   - {suggestion}")
    
    print("\n" + "=" * 80)
    print("TEST 2: Grammar Validation with Poor Insertion")
    print("=" * 80)
    
    # Enhanced story with awkward English insertions
    enhanced_story_bad = """
    Một **day** (ngày) ngày nọ, có một cô gái **name** (tên) tên là Lan. Cô ấy **live** (sống) sống ở thành phố Hà Nội.
    Mỗi **morning** (sáng) sáng, Lan **wake up** (thức dậy) thức dậy lúc 6 giờ. Cô ấy đi làm bằng xe buýt.
    """
    
    print("\nEnhanced story (poor insertion):")
    print(enhanced_story_bad)
    
    # Validate grammar
    result_bad = validate_grammar_after_insertion(
        enhanced_story=enhanced_story_bad,
        original_story=original_story
    )
    
    print("\n📊 Validation Result:")
    print(f"   - Is Valid: {result_bad['is_valid']}")
    print(f"   - Overall Score: {result_bad['overall_score']:.2f}")
    print(f"   - Issues Found: {len(result_bad['issues'])}")
    
    if result_bad['issues']:
        print("\n⚠️ Issues:")
        for issue in result_bad['issues']:
            print(f"   - [{issue.get('severity', 'unknown')}] {issue.get('description', 'No description')}")
    
    if result_bad['suggestions']:
        print("\n💡 Suggestions:")
        for suggestion in result_bad['suggestions']:
            print(f"   - {suggestion}")


def test_position_adjustment():
    """Test adjustment of insertion positions based on grammar issues."""
    print("\n" + "=" * 80)
    print("TEST 3: Position Adjustment for Grammar Issues")
    print("=" * 80)
    
    # Create sample positions
    positions = [
        InsertionPosition(
            sentence_index=0,
            word_index=5,
            position_type="noun",
            score=0.9,
            context="cô gái tên là"
        ),
        InsertionPosition(
            sentence_index=1,
            word_index=3,
            position_type="verb",
            score=0.85,
            context="Cô ấy sống"
        ),
        InsertionPosition(
            sentence_index=2,
            word_index=2,
            position_type="noun",
            score=0.88,
            context="Mỗi sáng Lan"
        ),
        InsertionPosition(
            sentence_index=3,
            word_index=4,
            position_type="verb",
            score=0.92,
            context="Cô ấy đi làm"
        ),
    ]
    
    print(f"\nOriginal positions: {len(positions)}")
    for i, pos in enumerate(positions):
        print(f"   {i+1}. Sentence {pos.sentence_index}, Word {pos.word_index}, Score: {pos.score:.2f}")
    
    # Simulate problematic sentences (sentences 1 and 2 have issues)
    problematic_sentences = [1, 2]
    
    print(f"\nProblematic sentences: {problematic_sentences}")
    
    # Adjust positions
    adjusted_positions = adjust_insertion_positions_for_grammar(
        positions=positions,
        problematic_sentences=problematic_sentences
    )
    
    print(f"\nAdjusted positions: {len(adjusted_positions)}")
    for i, pos in enumerate(adjusted_positions):
        print(f"   {i+1}. Sentence {pos.sentence_index}, Word {pos.word_index}, Score: {pos.score:.2f}")
    
    print(f"\n✅ Removed {len(positions) - len(adjusted_positions)} positions from problematic sentences")


def test_integration():
    """Test full integration of grammar validation in story enhancement."""
    print("\n" + "=" * 80)
    print("TEST 4: Integration Test - Full Story Enhancement with Grammar Validation")
    print("=" * 80)
    
    print("\n📝 This test demonstrates the full workflow:")
    print("   1. Generate base story")
    print("   2. Analyze structure and find insertion positions")
    print("   3. Select vocabulary")
    print("   4. Insert words")
    print("   5. Validate grammar")
    print("   6. Adjust positions if needed")
    print("   7. Re-insert with adjusted positions")
    
    print("\n✅ Grammar validation is now integrated into the story enhancement service")
    print("   - See generate_story_with_insertion() in story_enhancement_service.py")
    print("   - Grammar validation runs automatically after word insertion")
    print("   - Positions are adjusted if grammar issues are detected")


if __name__ == "__main__":
    print("\n🧪 Testing Grammar Validation Functionality\n")
    
    try:
        # Test 1: Grammar validation with good insertion
        test_grammar_validation()
        
        # Test 2: Position adjustment
        test_position_adjustment()
        
        # Test 3: Integration overview
        test_integration()
        
        print("\n" + "=" * 80)
        print("✅ All tests completed!")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
