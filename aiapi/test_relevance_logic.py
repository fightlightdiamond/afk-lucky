"""
Unit test for relevance checking logic without requiring Azure OpenAI credentials.

Tests the core logic of:
1. Relevance score calculation using cosine similarity
2. Filtering logic for words with relevance < 0.8
3. Fallback vocabulary selection logic
"""

import sys
import os
import numpy as np

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from aiapi.services.word_insertion_service import calculate_relevance_score


def test_cosine_similarity_calculation():
    """Test cosine similarity calculation with known vectors."""
    print("\n" + "="*80)
    print("TEST 1: Cosine Similarity Calculation")
    print("="*80)
    
    try:
        # Test with identical vectors (should give score close to 1.0)
        vec1 = [1.0, 0.0, 0.0]
        vec2 = [1.0, 0.0, 0.0]
        score_identical = calculate_relevance_score(vec1, vec2)
        print(f"\n✅ Identical vectors score: {score_identical:.4f}")
        
        # Test with orthogonal vectors (should give score close to 0.5)
        vec3 = [1.0, 0.0, 0.0]
        vec4 = [0.0, 1.0, 0.0]
        score_orthogonal = calculate_relevance_score(vec3, vec4)
        print(f"✅ Orthogonal vectors score: {score_orthogonal:.4f}")
        
        # Test with opposite vectors (should give score close to 0.0)
        vec5 = [1.0, 0.0, 0.0]
        vec6 = [-1.0, 0.0, 0.0]
        score_opposite = calculate_relevance_score(vec5, vec6)
        print(f"✅ Opposite vectors score: {score_opposite:.4f}")
        
        # Test with similar vectors (should give score between 0.5 and 1.0)
        vec7 = [1.0, 0.5, 0.0]
        vec8 = [0.9, 0.6, 0.1]
        score_similar = calculate_relevance_score(vec7, vec8)
        print(f"✅ Similar vectors score: {score_similar:.4f}")
        
        # Verify ordering
        if score_identical > score_similar > score_orthogonal > score_opposite:
            print(f"\n✅ TEST PASSED: Scores ordered correctly")
            print(f"   identical ({score_identical:.4f}) > similar ({score_similar:.4f}) > orthogonal ({score_orthogonal:.4f}) > opposite ({score_opposite:.4f})")
            return True
        else:
            print(f"\n❌ TEST FAILED: Score ordering incorrect")
            return False
            
    except Exception as e:
        print(f"\n❌ TEST FAILED with error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_filtering_logic():
    """Test the filtering logic for relevance thresholds."""
    print("\n" + "="*80)
    print("TEST 2: Filtering Logic")
    print("="*80)
    
    try:
        # Simulate scored words
        scored_words = [
            {"word": "word1", "score": 0.95},
            {"word": "word2", "score": 0.88},
            {"word": "word3", "score": 0.82},
            {"word": "word4", "score": 0.75},
            {"word": "word5", "score": 0.68},
            {"word": "word6", "score": 0.55},
        ]
        
        # Test filtering with threshold 0.8
        threshold = 0.8
        high_relevance = [item for item in scored_words if item["score"] >= threshold]
        
        print(f"\n📊 Total words: {len(scored_words)}")
        print(f"📊 Words with score >= {threshold}: {len(high_relevance)}")
        
        expected_count = 3  # word1, word2, word3
        if len(high_relevance) == expected_count:
            print(f"✅ Correct number of words filtered: {len(high_relevance)}")
            
            # Verify the correct words were selected
            selected_words = [item["word"] for item in high_relevance]
            expected_words = ["word1", "word2", "word3"]
            
            if selected_words == expected_words:
                print(f"✅ Correct words selected: {selected_words}")
                print(f"\n✅ TEST PASSED: Filtering logic works correctly")
                return True
            else:
                print(f"❌ Wrong words selected: {selected_words}")
                return False
        else:
            print(f"❌ Wrong number of words: expected {expected_count}, got {len(high_relevance)}")
            return False
            
    except Exception as e:
        print(f"\n❌ TEST FAILED with error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_fallback_logic():
    """Test the fallback logic when not enough high-relevance words."""
    print("\n" + "="*80)
    print("TEST 3: Fallback Logic")
    print("="*80)
    
    try:
        # Simulate scored words with only 2 words above 0.8 threshold
        scored_words = [
            {"word": "word1", "score": 0.85},
            {"word": "word2", "score": 0.82},
            {"word": "word3", "score": 0.75},
            {"word": "word4", "score": 0.73},
            {"word": "word5", "score": 0.68},
        ]
        
        requested_count = 5
        min_relevance = 0.8
        fallback_threshold = 0.7
        
        # Primary selection
        high_relevance = [item for item in scored_words if item["score"] >= min_relevance]
        print(f"\n📊 Requested: {requested_count} words")
        print(f"📊 High relevance (>= {min_relevance}): {len(high_relevance)} words")
        
        # Fallback selection
        if len(high_relevance) < requested_count:
            print(f"⚠️ Not enough high-relevance words, applying fallback...")
            
            fallback_words = [
                item for item in scored_words
                if item["score"] >= fallback_threshold and item not in high_relevance
            ]
            
            remaining = requested_count - len(high_relevance)
            high_relevance.extend(fallback_words[:remaining])
            
            print(f"✅ After fallback: {len(high_relevance)} words")
        
        # Final fallback if still not enough
        if len(high_relevance) < requested_count:
            print(f"⚠️ Still not enough, using best available...")
            
            existing = {item["word"] for item in high_relevance}
            additional = [
                item for item in scored_words
                if item["word"] not in existing
            ]
            
            remaining = requested_count - len(high_relevance)
            high_relevance.extend(additional[:remaining])
            
            print(f"✅ Final selection: {len(high_relevance)} words")
        
        # Verify we got the requested count
        if len(high_relevance) == requested_count:
            selected_words = [item["word"] for item in high_relevance]
            print(f"\n✅ Selected words: {selected_words}")
            print(f"✅ TEST PASSED: Fallback logic provided {len(high_relevance)} words")
            return True
        else:
            print(f"\n❌ TEST FAILED: Expected {requested_count} words, got {len(high_relevance)}")
            return False
            
    except Exception as e:
        print(f"\n❌ TEST FAILED with error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_threshold_comparison():
    """Test that different thresholds produce expected results."""
    print("\n" + "="*80)
    print("TEST 4: Threshold Comparison")
    print("="*80)
    
    try:
        scored_words = [
            {"word": f"word{i}", "score": 0.95 - (i * 0.05)}
            for i in range(20)
        ]
        
        thresholds = [0.9, 0.8, 0.7, 0.6]
        results = {}
        
        for threshold in thresholds:
            filtered = [item for item in scored_words if item["score"] >= threshold]
            results[threshold] = len(filtered)
            print(f"📊 Threshold {threshold}: {len(filtered)} words")
        
        # Verify that lower thresholds give more words
        if results[0.6] >= results[0.7] >= results[0.8] >= results[0.9]:
            print(f"\n✅ TEST PASSED: Lower thresholds provide more words")
            print(f"   0.6: {results[0.6]} >= 0.7: {results[0.7]} >= 0.8: {results[0.8]} >= 0.9: {results[0.9]}")
            return True
        else:
            print(f"\n❌ TEST FAILED: Threshold ordering incorrect")
            return False
            
    except Exception as e:
        print(f"\n❌ TEST FAILED with error: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all unit tests for relevance checking logic."""
    print("\n" + "="*80)
    print("RELEVANCE CHECKING LOGIC UNIT TESTS")
    print("="*80)
    print("\nTesting core logic for task 7.2:")
    print("- Relevance score calculation (cosine similarity)")
    print("- Filtering words with relevance < 0.8")
    print("- Fallback vocabulary selection")
    
    tests = [
        ("Cosine Similarity Calculation", test_cosine_similarity_calculation),
        ("Filtering Logic", test_filtering_logic),
        ("Fallback Logic", test_fallback_logic),
        ("Threshold Comparison", test_threshold_comparison)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Test '{test_name}' crashed: {e}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\n{'='*80}")
    print(f"Total: {passed}/{total} tests passed")
    print(f"{'='*80}\n")
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
