"""Import sample stories to ChromaDB."""
import sys
import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load .env
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)
print(f"✅ Loaded .env from {env_path}\n")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.aiapi.services.chromadb_service import add_story_to_chromadb

def main():
    print("=" * 60)
    print("Importing Sample Stories to ChromaDB")
    print("=" * 60)
    
    # Load sample stories
    stories_file = Path(__file__).parent.parent / 'data' / 'sample_stories.json'
    
    if not stories_file.exists():
        print(f"❌ File not found: {stories_file}")
        return
    
    with open(stories_file, 'r', encoding='utf-8') as f:
        stories = json.load(f)
    
    print(f"\n📚 Found {len(stories)} sample stories")
    
    success_count = 0
    failed_count = 0
    
    for i, story in enumerate(stories, 1):
        title = story.get('title', f'Story {i}')
        content = story.get('content', '')
        
        if not content:
            print(f"⚠️ Skipping story {i}: No content")
            failed_count += 1
            continue
        
        try:
            story_id = add_story_to_chromadb(
                story_id=f"story_{i}",
                title=title,
                content=content,
                prompt=story.get('prompt', title),  # Use title as prompt if not available
                metadata=story.get('metadata', {})
            )
            print(f"✅ {i}. {title[:50]}")
            success_count += 1
        except Exception as e:
            print(f"❌ {i}. Failed: {e}")
            failed_count += 1
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"✅ Successfully imported: {success_count} stories")
    print(f"❌ Failed: {failed_count} stories")
    print("\n🎉 Stories are ready for enhancement!")

if __name__ == "__main__":
    main()
