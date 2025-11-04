"""
Test script for word insertion service.
"""
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from aiapi.services.word_insertion_service import (
    analyze_sentence_structure,
    analyze_story_structure,
    select_vocabulary_for_insertion,
    insert_words_into_story,
    generate_glossary
)
from aiapi.models import VocabularyWord, InsertionPosition

def test_position_detection():
    """Test position detection logic."""
    print("\n" + "="*60)
    print("TEST 1: Position Detection")
    print("="*60)
    
    sentence = "Hôm nay tôi đi học và gặp bạn bè ở trường"
    print(f"Sentence: {sentence}")
    
    try:
        positions = analyze_sentence_structure(sentence)
        print(f"\n✅ Found {len(positions)} insertion positions:")
        for i, pos in enumerate(positions, 1):
            print(f"  {i}. Index: {pos.word_index}, Type: {pos.position_type}, Score: {pos.score:.2f}")
            print(f"     Context: {pos.context}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_story_analysis():
    """Test story structure analysis."""
    print("\n" + "="*60)
    print("TEST 2: Story Structure Analysis")
    print("="*60)
    
    story = """Hôm nay là một ngày đẹp trời. Tôi thức dậy sớm và chuẩn bị đi làm. 
    Trên đường đi, tôi gặp nhiều người bạn cũ. Chúng tôi nói chuyện vui vẻ."""
    
    print(f"Story: {story[:100]}...")
    
    try:
        positions = analyze_story_structure(story)
        print(f"\n✅ Found {len(positions)} total insertion positions across all sentences")
        
        # Group by sentence
        by_sentence = {}
        for pos in positions:
            if pos.sentence_index not in by_sentence:
                by_sentence[pos.sentence_index] = []
            by_sentence[pos.sentence_index].append(pos)
        
        for sent_idx, sent_positions in by_sentence.items():
            print(f"\n  Sentence {sent_idx}: {len(sent_positions)} positions")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_word_selection():
    """Test vocabulary word selection."""
    print("\n" + "="*60)
    print("TEST 3: Vocabulary Word Selection")
    print("="*60)
    
    context = "Tôi đang học về công nghệ và máy tính"
    print(f"Context: {context}")
    
    try:
        words = select_vocabulary_for_insertion(
            topic="technology",
            difficulty="intermediate",
            count=5,
            context=context
        )
        
        print(f"\n✅ Selected {len(words)} vocabulary words:")
        for i, word in enumerate(words, 1):
            print(f"  {i}. {word.word} ({word.vietnamese_translation}) - {word.part_of_speech}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_word_insertion():
    """Test word insertion into story."""
    print("\n" + "="*60)
    print("TEST 4: Word Insertion")
    print("="*60)
    
    story = "Hôm nay tôi đi học. Tôi gặp bạn bè ở trường."
    print(f"Original story: {story}")
    
    # Create mock vocabulary words
    vocabulary = [
        VocabularyWord(
            word="school",
            definition="An institution for education",
            vietnamese_translation="trường học",
            part_of_speech="noun",
            topic="education",
            difficulty="beginner",
            example="I go to school every day"
        ),
        VocabularyWord(
            word="friend",
            definition="A person you know well",
            vietnamese_translation="bạn bè",
            part_of_speech="noun",
            topic="daily life",
            difficulty="beginner",
            example="My friend is very kind"
        )
    ]
    
    # Create mock positions
    positions = [
        InsertionPosition(
            sentence_index=0,
            word_index=3,
            position_type="noun",
            score=0.85,
            context="đi học"
        ),
        InsertionPosition(
            sentence_index=1,
            word_index=2,
            position_type="noun",
            score=0.80,
            context="gặp bạn"
        )
    ]
    
    try:
        enhanced_story = insert_words_into_story(
            story=story,
            vocabulary=vocabulary,
            positions=positions,
            bold_format=True,
            show_translation=True
        )
        
        print(f"\n✅ Enhanced story:")
        print(f"  {enhanced_story}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_glossary_generation():
    """Test glossary generation."""
    print("\n" + "="*60)
    print("TEST 5: Glossary Generation")
    print("="*60)
    
    vocabulary = [
        VocabularyWord(
            word="computer",
            definition="An electronic device for processing data",
            vietnamese_translation="máy tính",
            part_of_speech="noun",
            topic="technology",
            difficulty="beginner",
            example="I use a computer for work",
            ipa="/kəmˈpjuːtər/"
        ),
        VocabularyWord(
            word="study",
            definition="To learn about a subject",
            vietnamese_translation="học tập",
            part_of_speech="verb",
            topic="education",
            difficulty="beginner",
            example="I study English every day"
        )
    ]
    
    try:
        glossary = generate_glossary(vocabulary)
        
        print(f"\n✅ Generated glossary with {len(glossary)} entries:")
        for i, entry in enumerate(glossary, 1):
            print(f"\n  {i}. {entry['word']} ({entry['vietnamese']})")
            print(f"     Part of speech: {entry['part_of_speech']}")
            print(f"     Definition: {entry['definition']}")
            if 'pronunciation' in entry:
                print(f"     Pronunciation: {entry['pronunciation']}")
            print(f"     Example: {entry['example']}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("WORD INSERTION SERVICE TEST SUITE")
    print("="*60)
    
    # Run tests
    test_position_detection()
    test_story_analysis()
    test_word_selection()
    test_word_insertion()
    test_glossary_generation()
    
    print("\n" + "="*60)
    print("TEST SUITE COMPLETED")
    print("="*60 + "\n")
