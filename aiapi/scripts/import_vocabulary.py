#!/usr/bin/env python3
"""
Vocabulary import script.

This script imports vocabulary data from CSV or JSON files into ChromaDB.

Usage:
    python -m aiapi.scripts.import_vocabulary --file vocab.csv
    python -m aiapi.scripts.import_vocabulary --file vocab.json
    
Or from the aiapi directory:
    python scripts/import_vocabulary.py --file vocab.csv
"""

import json
import csv
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Any

# Add parent directory to path to import aiapi modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.aiapi.services.vocabulary_service import (
    initialize_vocabulary_database,
    add_vocabulary,
    get_vocabulary_stats
)

def load_from_json(file_path: str) -> List[Dict[str, Any]]:
    """
    Load vocabulary data from JSON file.
    
    Args:
        file_path: Path to JSON file
        
    Returns:
        List of vocabulary dictionaries
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if not isinstance(data, list):
            print("❌ Error: JSON file must contain an array of vocabulary objects")
            return []
        
        print(f"✅ Loaded {len(data)} vocabulary words from JSON file")
        return data
        
    except FileNotFoundError:
        print(f"❌ Error: File not found: {file_path}")
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON format: {e}")
        return []

def load_from_csv(file_path: str) -> List[Dict[str, Any]]:
    """
    Load vocabulary data from CSV file.
    
    Expected CSV columns:
    word, definition, vietnamese_translation, part_of_speech, topic, difficulty, example, ipa (optional)
    
    Args:
        file_path: Path to CSV file
        
    Returns:
        List of vocabulary dictionaries
    """
    try:
        vocabulary_data = []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Validate required columns
            required_columns = [
                'word', 'definition', 'vietnamese_translation',
                'part_of_speech', 'topic', 'difficulty', 'example'
            ]
            
            if not all(col in reader.fieldnames for col in required_columns):
                print(f"❌ Error: CSV file must contain columns: {', '.join(required_columns)}")
                print(f"   Found columns: {', '.join(reader.fieldnames)}")
                return []
            
            for row in reader:
                # Clean up the data
                vocab = {
                    'word': row['word'].strip(),
                    'definition': row['definition'].strip(),
                    'vietnamese_translation': row['vietnamese_translation'].strip(),
                    'part_of_speech': row['part_of_speech'].strip(),
                    'topic': row['topic'].strip(),
                    'difficulty': row['difficulty'].strip(),
                    'example': row['example'].strip(),
                }
                
                # Add optional IPA if present
                if 'ipa' in row and row['ipa'].strip():
                    vocab['ipa'] = row['ipa'].strip()
                
                vocabulary_data.append(vocab)
        
        print(f"✅ Loaded {len(vocabulary_data)} vocabulary words from CSV file")
        return vocabulary_data
        
    except FileNotFoundError:
        print(f"❌ Error: File not found: {file_path}")
        return []
    except Exception as e:
        print(f"❌ Error reading CSV file: {e}")
        return []

def validate_vocabulary(vocab: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate vocabulary data.
    
    Args:
        vocab: Vocabulary dictionary
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    required_fields = [
        'word', 'definition', 'vietnamese_translation',
        'part_of_speech', 'topic', 'difficulty', 'example'
    ]
    
    # Check required fields
    for field in required_fields:
        if field not in vocab or not vocab[field]:
            return False, f"Missing or empty required field: {field}"
    
    # Validate part_of_speech
    valid_pos = ['noun', 'verb', 'adjective', 'adverb', 'phrase']
    if vocab['part_of_speech'] not in valid_pos:
        return False, f"Invalid part_of_speech: {vocab['part_of_speech']}. Must be one of: {', '.join(valid_pos)}"
    
    # Validate difficulty
    valid_difficulty = ['beginner', 'intermediate', 'advanced']
    if vocab['difficulty'] not in valid_difficulty:
        return False, f"Invalid difficulty: {vocab['difficulty']}. Must be one of: {', '.join(valid_difficulty)}"
    
    return True, ""

def import_vocabulary(vocabulary_data: List[Dict[str, Any]], validate: bool = True):
    """
    Import vocabulary words to ChromaDB.
    
    Args:
        vocabulary_data: List of vocabulary dictionaries
        validate: Whether to validate data before importing
        
    Returns:
        Tuple of (success_count, failed_count, errors)
    """
    success_count = 0
    failed_count = 0
    errors = []
    
    print(f"\n📝 Importing {len(vocabulary_data)} vocabulary words...")
    
    for i, vocab in enumerate(vocabulary_data, 1):
        try:
            # Validate if requested
            if validate:
                is_valid, error_msg = validate_vocabulary(vocab)
                if not is_valid:
                    failed_count += 1
                    error = f"[{i}] {vocab.get('word', 'Unknown')} - Validation error: {error_msg}"
                    errors.append(error)
                    print(f"  ❌ {error}")
                    continue
            
            # Add to database
            success = add_vocabulary(
                word=vocab['word'],
                definition=vocab['definition'],
                vietnamese_translation=vocab['vietnamese_translation'],
                part_of_speech=vocab['part_of_speech'],
                topic=vocab['topic'],
                difficulty=vocab['difficulty'],
                example=vocab['example'],
                ipa=vocab.get('ipa')
            )
            
            if success:
                success_count += 1
                print(f"  [{i}/{len(vocabulary_data)}] ✅ {vocab['word']}")
            else:
                failed_count += 1
                error = f"[{i}] {vocab['word']} - Failed to add to database"
                errors.append(error)
                print(f"  ❌ {error}")
                
        except Exception as e:
            failed_count += 1
            error = f"[{i}] {vocab.get('word', 'Unknown')} - Error: {str(e)}"
            errors.append(error)
            print(f"  ❌ {error}")
    
    return success_count, failed_count, errors

def main():
    """
    Main function to import vocabulary data.
    """
    parser = argparse.ArgumentParser(
        description='Import vocabulary data from CSV or JSON file into ChromaDB'
    )
    parser.add_argument(
        '--file',
        required=True,
        help='Path to CSV or JSON file containing vocabulary data'
    )
    parser.add_argument(
        '--no-validate',
        action='store_true',
        help='Skip validation of vocabulary data'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Vocabulary Import Tool")
    print("=" * 60)
    
    # Determine file type
    file_path = Path(args.file)
    if not file_path.exists():
        print(f"❌ Error: File not found: {args.file}")
        return False
    
    file_ext = file_path.suffix.lower()
    
    # Step 1: Initialize the vocabulary collection
    print("\n🔧 Step 1: Initializing vocabulary collection...")
    if not initialize_vocabulary_database():
        print("❌ Failed to initialize vocabulary database")
        return False
    
    # Step 2: Load vocabulary data
    print(f"\n📂 Step 2: Loading vocabulary data from {file_path.name}...")
    
    if file_ext == '.json':
        vocabulary_data = load_from_json(str(file_path))
    elif file_ext == '.csv':
        vocabulary_data = load_from_csv(str(file_path))
    else:
        print(f"❌ Error: Unsupported file format: {file_ext}")
        print("   Supported formats: .json, .csv")
        return False
    
    if not vocabulary_data:
        print("❌ No vocabulary data to import")
        return False
    
    # Step 3: Import the data
    print("\n📝 Step 3: Importing vocabulary data...")
    success_count, failed_count, errors = import_vocabulary(
        vocabulary_data,
        validate=not args.no_validate
    )
    
    # Step 4: Display summary
    print("\n" + "=" * 60)
    print("Import Summary")
    print("=" * 60)
    print(f"✅ Successfully imported: {success_count} words")
    print(f"❌ Failed to import: {failed_count} words")
    print(f"📊 Total processed: {success_count + failed_count} words")
    
    if errors:
        print(f"\n⚠️  {len(errors)} errors occurred:")
        for error in errors[:10]:  # Show first 10 errors
            print(f"  - {error}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more errors")
    
    # Get and display collection stats
    print("\n📊 Collection Statistics:")
    stats = get_vocabulary_stats()
    if "error" not in stats:
        print(f"  Total words in database: {stats['total_words']}")
        print(f"  Collection name: {stats['collection_name']}")
    
    print("\n" + "=" * 60)
    print("✅ Vocabulary import complete!")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Import interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
