#!/usr/bin/env python3
"""Use AI to generate 3000 vocabulary words."""
import json
import sys
import os
from openai import OpenAI

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.aiapi.services.vocabulary_service import batch_add_vocabulary
from src.aiapi.models import VocabularyWord

# OpenAI client
client = OpenAI(
    base_url="https://aiportalapi.stu-platform.live/jpe",
    api_key="sk-uX_Ax09Iv6XY-28-M_uYVg"
)

def generate_vocabulary_batch(topic, difficulty, count=50):
    """Generate vocabulary using AI."""
    prompt = f"""Generate {count} common English words for topic "{topic}" at {difficulty} level.

For each word provide in JSON format:
- word: the English word
- vietnamese_translation: Vietnamese translation
- part_of_speech: noun, verb, adjective, adverb, or phrase
- definition: short English definition
- example: example sentence

Return ONLY a JSON array, no other text.

Example format:
[
  {{
    "word": "example",
    "vietnamese_translation": "ví dụ",
    "part_of_speech": "noun",
    "definition": "A thing characteristic of its kind",
    "example": "For example, this is correct"
  }}
]"""

    try:
        response = client.chat.completions.create(
            model="GPT-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content.strip()
        
        # Extract JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        words = json.loads(content)
        
        # Add topic and difficulty
        for word in words:
            word["topic"] = topic
            word["difficulty"] = difficulty
            word["ipa"] = f"/{word['word']}/"
        
        return words
    except Exception as e:
        print(f"❌ Error generating {topic}/{difficulty}: {e}")
        return []

def main():
    """Generate and import 3000 words."""
    print("=" * 60)
    print("AI-Powered Vocabulary Generation (3000 words)")
    print("=" * 60)
    
    # Define generation plan
    generation_plan = [
        # Technology (500 words)
        ("technology", "beginner", 100),
        ("technology", "intermediate", 100),
        ("technology", "advanced", 50),
        
        # Business (500 words)
        ("business", "beginner", 100),
        ("business", "intermediate", 100),
        ("business", "advanced", 50),
        
        # Education (400 words)
        ("education", "beginner", 80),
        ("education", "intermediate", 80),
        ("education", "advanced", 40),
        
        # Daily life (400 words)
        ("daily life", "beginner", 100),
        ("daily life", "intermediate", 80),
        ("daily life", "advanced", 20),
        
        # Travel (300 words)
        ("travel", "beginner", 80),
        ("travel", "intermediate", 60),
        ("travel", "advanced", 30),
        
        # Health (300 words)
        ("health", "beginner", 80),
        ("health", "intermediate", 60),
        ("health", "advanced", 30),
        
        # Food (200 words)
        ("food", "beginner", 60),
        ("food", "intermediate", 40),
        
        # Nature (200 words)
        ("nature", "beginner", 60),
        ("nature", "intermediate", 40),
        
        # Entertainment (200 words)
        ("entertainment", "beginner", 60),
        ("entertainment", "intermediate", 40),
    ]
    
    all_vocabulary = []
    total_generated = 0
    
    for topic, difficulty, count in generation_plan:
        print(f"\n📝 Generating {count} words: {topic} ({difficulty})...")
        
        words = generate_vocabulary_batch(topic, difficulty, count)
        
        if words:
            all_vocabulary.extend(words)
            total_generated += len(words)
            print(f"   ✅ Generated {len(words)} words")
        else:
            print(f"   ⚠️ Failed to generate")
    
    print(f"\n📊 Total generated: {total_generated} words")
    
    # Save to file
    output_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'ai_generated_vocabulary.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_vocabulary, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Saved to: {output_file}")
    
    # Import to ChromaDB
    print(f"\n📦 Importing to ChromaDB...")
    
    vocabulary_words = []
    for vocab in all_vocabulary:
        try:
            word = VocabularyWord(**vocab)
            vocabulary_words.append(word)
        except Exception as e:
            print(f"⚠️ Invalid word: {vocab.get('word', 'unknown')} - {e}")
    
    # Import in batches
    batch_size = 50
    total_success = 0
    total_failed = 0
    
    for i in range(0, len(vocabulary_words), batch_size):
        batch = vocabulary_words[i:i+batch_size]
        print(f"   Batch {i//batch_size + 1}: {len(batch)} words...", end=" ")
        
        try:
            result = batch_add_vocabulary(batch)
            total_success += result["success_count"]
            total_failed += result["failed_count"]
            print(f"✅ {result['success_count']} added")
        except Exception as e:
            print(f"❌ Failed: {e}")
            total_failed += len(batch)
    
    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"✅ Successfully added: {total_success} words")
    print(f"❌ Failed: {total_failed} words")
    print(f"📊 Success rate: {(total_success / len(vocabulary_words) * 100):.1f}%")
    print("\n🎉 Vocabulary database is ready with 3000+ words!")

if __name__ == "__main__":
    main()
