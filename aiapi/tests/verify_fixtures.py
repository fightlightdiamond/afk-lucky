#!/usr/bin/env python3
"""Verification script for test fixtures."""

import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from tests.fixtures.vocabulary_fixtures import (
    ALL_SAMPLE_VOCABULARY,
    create_test_vocabulary,
    get_mock_chromadb_vocabulary_result,
    SAMPLE_INSERTION_CONFIG
)
from tests.fixtures.story_fixtures import (
    SAMPLE_STORY_MEDIUM,
    TEST_SCENARIOS,
    split_into_sentences,
    create_test_story
)
from tests.fixtures.mock_responses import (
    create_mock_story_response,
    create_mock_vocabulary_response,
    MOCK_AZURE_OPENAI_CHAT_RESPONSE
)
from tests.fixtures.test_config import (
    get_test_config,
    TEST_TOPICS,
    TEST_DIFFICULTIES
)


def verify_data_files():
    """Verify data files exist and have correct structure."""
    print("=" * 60)
    print("VERIFYING DATA FILES")
    print("=" * 60)
    
    # Check vocabulary file
    vocab_file = Path(__file__).parent.parent / "data" / "sample_vocabulary.json"
    with open(vocab_file) as f:
        vocab_data = json.load(f)
    
    print(f"\n✓ Vocabulary file: {vocab_file}")
    print(f"  - Total words: {len(vocab_data)}")
    
    topics = {}
    difficulties = {}
    pos = {}
    for word in vocab_data:
        topics[word['topic']] = topics.get(word['topic'], 0) + 1
        difficulties[word['difficulty']] = difficulties.get(word['difficulty'], 0) + 1
        pos[word['part_of_speech']] = pos.get(word['part_of_speech'], 0) + 1
    
    print(f"  - By topic: {topics}")
    print(f"  - By difficulty: {difficulties}")
    print(f"  - By part of speech: {pos}")
    
    # Check stories file
    stories_file = Path(__file__).parent.parent / "data" / "sample_stories.json"
    with open(stories_file) as f:
        stories_data = json.load(f)
    
    print(f"\n✓ Stories file: {stories_file}")
    print(f"  - Total stories: {len(stories_data)}")
    
    story_topics = {}
    story_difficulties = {}
    for story in stories_data:
        story_topics[story['topic']] = story_topics.get(story['topic'], 0) + 1
        story_difficulties[story['difficulty']] = story_difficulties.get(story['difficulty'], 0) + 1
    
    print(f"  - By topic: {story_topics}")
    print(f"  - By difficulty: {story_difficulties}")


def verify_vocabulary_fixtures():
    """Verify vocabulary fixtures work correctly."""
    print("\n" + "=" * 60)
    print("VERIFYING VOCABULARY FIXTURES")
    print("=" * 60)
    
    print(f"\n✓ ALL_SAMPLE_VOCABULARY: {len(ALL_SAMPLE_VOCABULARY)} words")
    
    # Test create_test_vocabulary
    test_vocab = create_test_vocabulary(5, "intermediate", "technology")
    print(f"✓ create_test_vocabulary(5, 'intermediate', 'technology'): {len(test_vocab)} words")
    assert len(test_vocab) == 5
    assert all(v["difficulty"] == "intermediate" for v in test_vocab)
    
    # Test mock ChromaDB result
    mock_result = get_mock_chromadb_vocabulary_result(test_vocab)
    print(f"✓ get_mock_chromadb_vocabulary_result: {len(mock_result['ids'][0])} results")
    
    # Test insertion config
    print(f"✓ SAMPLE_INSERTION_CONFIG: {SAMPLE_INSERTION_CONFIG}")


def verify_story_fixtures():
    """Verify story fixtures work correctly."""
    print("\n" + "=" * 60)
    print("VERIFYING STORY FIXTURES")
    print("=" * 60)
    
    print(f"\n✓ SAMPLE_STORY_MEDIUM: {len(SAMPLE_STORY_MEDIUM)} characters")
    
    # Test sentence splitting
    sentences = split_into_sentences(SAMPLE_STORY_MEDIUM)
    print(f"✓ split_into_sentences: {len(sentences)} sentences")
    
    # Test create_test_story
    test_story = create_test_story("long", "technology")
    print(f"✓ create_test_story('long', 'technology'): {len(test_story)} characters")
    
    # Test scenarios
    print(f"✓ TEST_SCENARIOS: {len(TEST_SCENARIOS)} scenarios")
    for name, scenario in TEST_SCENARIOS.items():
        print(f"  - {name}: {scenario['topic']}, {scenario['difficulty']}, "
              f"{scenario['expected_insertions']} insertions")


def verify_mock_responses():
    """Verify mock responses work correctly."""
    print("\n" + "=" * 60)
    print("VERIFYING MOCK RESPONSES")
    print("=" * 60)
    
    # Test story response
    story_resp = create_mock_story_response("Test Story", "Test content", 5)
    print(f"\n✓ create_mock_story_response:")
    print(f"  - Keys: {list(story_resp.keys())}")
    print(f"  - Insertions: {story_resp['metrics']['total_insertions']}")
    
    # Test vocabulary response
    vocab_resp = create_mock_vocabulary_response(3, "technology", "beginner")
    print(f"✓ create_mock_vocabulary_response: {len(vocab_resp)} words")
    
    # Test Azure OpenAI mock
    print(f"✓ MOCK_AZURE_OPENAI_CHAT_RESPONSE: {MOCK_AZURE_OPENAI_CHAT_RESPONSE['model']}")


def verify_test_config():
    """Verify test configuration works correctly."""
    print("\n" + "=" * 60)
    print("VERIFYING TEST CONFIGURATION")
    print("=" * 60)
    
    config = get_test_config()
    print(f"\n✓ get_test_config:")
    print(f"  - Sections: {list(config.keys())}")
    print(f"  - Topics: {TEST_TOPICS}")
    print(f"  - Difficulties: {TEST_DIFFICULTIES}")
    print(f"  - Default insertion count: {config['insertion']['default_count']}")
    print(f"  - Min readability score: {config['insertion']['min_readability_score']}")


def main():
    """Run all verification tests."""
    print("\n" + "=" * 60)
    print("TEST FIXTURES VERIFICATION")
    print("=" * 60)
    
    try:
        verify_data_files()
        verify_vocabulary_fixtures()
        verify_story_fixtures()
        verify_mock_responses()
        verify_test_config()
        
        print("\n" + "=" * 60)
        print("✓ ALL VERIFICATIONS PASSED")
        print("=" * 60)
        print("\nTest fixtures are ready to use!")
        print("See aiapi/tests/fixtures/README.md for usage examples.")
        
        return 0
    except Exception as e:
        print(f"\n✗ VERIFICATION FAILED: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
