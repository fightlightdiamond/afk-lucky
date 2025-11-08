# Vocabulary Expansion Guide

## Current Status

- ✅ 134 words imported successfully
- 📊 Topics covered: technology, business, education, daily life, travel, general
- 🎯 Target: 3000+ words

## Quick Add Vocabulary

### Method 1: Add to existing JSON files

Edit `aiapi/data/extended_vocabulary.json` or create new JSON files with this format:

```json
[
  {
    "word": "example",
    "definition": "A thing characteristic of its kind",
    "vietnamese_translation": "ví dụ",
    "part_of_speech": "noun",
    "topic": "education",
    "difficulty": "beginner",
    "example": "For example, this is how it works",
    "ipa": "/ɪɡˈzæm.pəl/"
  }
]
```

### Method 2: Use the import script

```bash
python aiapi/scripts/add_more_vocabulary.py
```

## Vocabulary Categories to Expand

### 1. Technology (Current: 40 words, Target: 500)

- Programming terms
- Internet/Web
- Mobile devices
- AI/ML terms
- Cybersecurity

### 2. Business (Current: 40 words, Target: 500)

- Finance
- Marketing
- Management
- Sales
- HR terms

### 3. Education (Current: 40 words, Target: 400)

- Academic subjects
- School facilities
- Learning methods
- Degrees/Certifications

### 4. Daily Life (Current: 40 words, Target: 400)

- Home/House
- Family
- Clothing
- Food/Cooking
- Shopping

### 5. Travel (Current: 40 words, Target: 300)

- Transportation
- Accommodation
- Directions
- Tourist activities

### 6. Health (Target: 300)

- Medical terms
- Body parts
- Illnesses
- Treatments
- Fitness

### 7. Nature & Environment (Target: 200)

- Weather
- Animals
- Plants
- Geography

### 8. Entertainment (Target: 200)

- Movies/TV
- Music
- Sports
- Hobbies

### 9. Social & Relationships (Target: 200)

- Family
- Friends
- Emotions
- Communication

## Part of Speech Distribution

- **Nouns**: 40% (1200 words)
- **Verbs**: 30% (900 words)
- **Adjectives**: 20% (600 words)
- **Adverbs**: 8% (240 words)
- **Phrases**: 2% (60 words)

## Difficulty Distribution

- **Beginner**: 50% (1500 words) - Common, everyday words
- **Intermediate**: 35% (1050 words) - Professional, academic words
- **Advanced**: 15% (450 words) - Specialized, technical words

## Automated Generation Options

### Option 1: Use AI to generate

Create a script that uses GPT-4o to generate vocabulary:

```python
import openai

client = openai.OpenAI(
    base_url="https://aiportalapi.stu-platform.live/jpe",
    api_key="sk-uX_Ax09Iv6XY-28-M_uYVg"
)

def generate_vocabulary(topic, count=100):
    prompt = f"""Generate {count} common English words related to {topic}.
    For each word provide:
    - word
    - Vietnamese translation
    - part of speech
    - difficulty (beginner/intermediate/advanced)
    - example sentence

    Return as JSON array."""

    response = client.chat.completions.create(
        model="GPT-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
```

### Option 2: Import from existing word lists

- Oxford 3000 word list
- TOEFL/IELTS vocabulary
- Business English word lists
- Academic word lists

## Testing After Adding Vocabulary

1. **Verify import**:

```bash
python aiapi/scripts/add_more_vocabulary.py
```

2. **Check collection size**:

```python
from aiapi.src.aiapi.services.vocabulary_service import get_collection_stats
stats = get_collection_stats()
print(f"Total words: {stats['total_words']}")
```

3. **Test search**:

```bash
curl -X POST http://localhost:8000/api/v1/vocabulary/search \
  -H "Content-Type: application/json" \
  -d '{"query": "technology", "n_results": 10}'
```

4. **Test word insertion**:

```bash
curl -X POST http://localhost:8000/api/v1/generate-story-with-insertion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Viết câu chuyện về công nghệ",
    "insertion_config": {
      "topic": "technology",
      "difficulty": "beginner",
      "insertion_count": 10
    }
  }'
```

## Next Steps

1. ✅ Fix API key issues (DONE)
2. ✅ Add adverb support (DONE)
3. ✅ Lower min_position_score to 0.5 (DONE)
4. 🔄 Expand vocabulary to 1000+ words (IN PROGRESS)
5. ⏳ Test with real story generation
6. ⏳ Fine-tune insertion logic

## Resources

- [Oxford 3000 Word List](https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000)
- [Academic Word List](https://www.wgtn.ac.nz/lals/resources/academicwordlist)
- [Business English Vocabulary](https://www.englishclub.com/business-english/vocabulary.htm)
- [TOEFL Vocabulary](https://www.ets.org/toefl)

## Contact

For questions or issues, check the API logs:

```bash
tail -f aiapi/logs/app.log
```
