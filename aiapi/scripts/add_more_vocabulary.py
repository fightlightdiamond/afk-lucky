"""
Script to add extended vocabulary to ChromaDB.
"""
import sys
import os
import json

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.aiapi.services.vocabulary_service import batch_add_vocabulary
from src.aiapi.models import VocabularyWord

def load_vocabulary_from_files():
    """Load vocabulary from both sample and extended files."""
    vocabulary = []
    
    # Load sample vocabulary
    sample_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'sample_vocabulary.json')
    if os.path.exists(sample_file):
        with open(sample_file, 'r', encoding='utf-8') as f:
            sample_data = json.load(f)
            vocabulary.extend(sample_data)
            print(f"✅ Loaded {len(sample_data)} words from sample_vocabulary.json")
    
    # Load extended vocabulary
    extended_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'extended_vocabulary.json')
    if os.path.exists(extended_file):
        with open(extended_file, 'r', encoding='utf-8') as f:
            extended_data = json.load(f)
            vocabulary.extend(extended_data)
            print(f"✅ Loaded {len(extended_data)} words from extended_vocabulary.json")
    
    return vocabulary

def main():
    """Main function to add vocabulary."""
    print("=" * 60)
    print("Adding Extended Vocabulary to ChromaDB")
    print("=" * 60)
    
    # Load vocabulary
    vocabulary_data = load_vocabulary_from_files()
    
    if not vocabulary_data:
        print("❌ No vocabulary data found")
        return
    
    print(f"\n📚 Total vocabulary words to add: {len(vocabulary_data)}")
    
    # Convert to VocabularyWord objects
    vocabulary_words = []
    for vocab in vocabulary_data:
        try:
            word = VocabularyWord(**vocab)
            vocabulary_words.append(word)
        except Exception as e:
            print(f"⚠️ Skipping invalid word: {vocab.get('word', 'unknown')} - {e}")
    
    print(f"✅ Validated {len(vocabulary_words)} vocabulary words")
    
    # Add to ChromaDB in batches
    batch_size = 50
    total_success = 0
    total_failed = 0
    
    for i in range(0, len(vocabulary_words), batch_size):
        batch = vocabulary_words[i:i+batch_size]
        print(f"\n📦 Processing batch {i//batch_size + 1} ({len(batch)} words)...")
        
        try:
            result = batch_add_vocabulary(batch)
            total_success += result["success_count"]
            total_failed += result["failed_count"]
            
            if result["errors"]:
                print(f"⚠️ Batch had {len(result['errors'])} errors:")
                for error in result["errors"][:3]:  # Show first 3 errors
                    print(f"   - {error}")
        except Exception as e:
            print(f"❌ Batch failed: {e}")
            total_failed += len(batch)
    
    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"✅ Successfully added: {total_success} words")
    print(f"❌ Failed: {total_failed} words")
    print(f"📊 Success rate: {(total_success / len(vocabulary_words) * 100):.1f}%")
    print("\n🎉 Vocabulary database is ready!")

if __name__ == "__main__":
    main()
