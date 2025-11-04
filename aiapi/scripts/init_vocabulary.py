#!/usr/bin/env python3
"""
Vocabulary initialization script.

This script initializes the vocabulary database by:
1. Creating the vocabulary collection in ChromaDB
2. Loading sample vocabulary data from JSON file
3. Adding vocabulary words with embeddings to ChromaDB

Usage:
    python -m aiapi.scripts.init_vocabulary
    
Or from the aiapi directory:
    python scripts/init_vocabulary.py
"""

import json
import os
import sys
from pathlib import Path

# Add parent directory to path to import aiapi modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.aiapi.services.vocabulary_service import (
    initialize_vocabulary_database,
    add_vocabulary,
    get_vocabulary_stats
)

def load_sample_vocabulary(file_path: str = "data/sample_vocabulary.json"):
    """
    Load sample vocabulary data from JSON file.
    
    Args:
        file_path: Path to the JSON file containing vocabulary data
        
    Returns:
        List of vocabulary dictionaries
    """
    # Get the absolute path relative to the script location
    script_dir = Path(__file__).parent.parent
    full_path = script_dir / file_path
    
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            vocabulary_data = json.load(f)
        print(f"✅ Loaded {len(vocabulary_data)} vocabulary words from {file_path}")
        return vocabulary_data
    except FileNotFoundError:
        print(f"❌ Error: File not found at {full_path}")
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON format in {file_path}: {e}")
        return []

def populate_vocabulary(vocabulary_data: list):
    """
    Add vocabulary words to ChromaDB.
    
    Args:
        vocabulary_data: List of vocabulary dictionaries
        
    Returns:
        Tuple of (success_count, failed_count)
    """
    success_count = 0
    failed_count = 0
    
    print(f"\n📝 Adding {len(vocabulary_data)} vocabulary words to ChromaDB...")
    
    for i, vocab in enumerate(vocabulary_data, 1):
        try:
            success = add_vocabulary(
                word=vocab["word"],
                definition=vocab["definition"],
                vietnamese_translation=vocab["vietnamese_translation"],
                part_of_speech=vocab["part_of_speech"],
                topic=vocab["topic"],
                difficulty=vocab["difficulty"],
                example=vocab["example"],
                ipa=vocab.get("ipa")
            )
            
            if success:
                success_count += 1
                print(f"  [{i}/{len(vocabulary_data)}] ✅ {vocab['word']}")
            else:
                failed_count += 1
                print(f"  [{i}/{len(vocabulary_data)}] ❌ {vocab['word']} - Failed to add")
                
        except Exception as e:
            failed_count += 1
            print(f"  [{i}/{len(vocabulary_data)}] ❌ {vocab['word']} - Error: {e}")
    
    return success_count, failed_count

def main():
    """
    Main function to initialize vocabulary database.
    """
    print("=" * 60)
    print("Vocabulary Database Initialization")
    print("=" * 60)
    
    # Step 1: Initialize the vocabulary collection
    print("\n🔧 Step 1: Initializing vocabulary collection...")
    if not initialize_vocabulary_database():
        print("❌ Failed to initialize vocabulary database")
        return False
    
    # Step 2: Load sample vocabulary data
    print("\n📂 Step 2: Loading sample vocabulary data...")
    vocabulary_data = load_sample_vocabulary()
    
    if not vocabulary_data:
        print("❌ No vocabulary data to load")
        return False
    
    # Step 3: Populate the database
    print("\n📝 Step 3: Populating vocabulary database...")
    success_count, failed_count = populate_vocabulary(vocabulary_data)
    
    # Step 4: Display statistics
    print("\n" + "=" * 60)
    print("Initialization Summary")
    print("=" * 60)
    print(f"✅ Successfully added: {success_count} words")
    print(f"❌ Failed to add: {failed_count} words")
    print(f"📊 Total processed: {success_count + failed_count} words")
    
    # Get and display collection stats
    print("\n📊 Collection Statistics:")
    stats = get_vocabulary_stats()
    if "error" not in stats:
        print(f"  Total words in database: {stats['total_words']}")
        print(f"  Collection name: {stats['collection_name']}")
    
    print("\n" + "=" * 60)
    print("✅ Vocabulary database initialization complete!")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Initialization interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
