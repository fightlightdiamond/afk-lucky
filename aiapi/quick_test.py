#!/usr/bin/env python3
"""
Quick test script for the enhanced AI API.
"""
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from aiapi.services.story_service import generate_story_content_with_tools

def main():
    print("🧪 Quick Function Calling Test")
    print("="*40)
    
    try:
        prompt = "Tạo một câu chuyện ngắn về một chú mèo thông minh học tiếng Anh."
        print(f"📝 Prompt: {prompt}")
        print("\n⏳ Generating story with function calling...")
        
        result = generate_story_content_with_tools(prompt, include_sections=True)
        
        print("\n✅ Success! Generated structured story:")
        print(f"📖 Title: {result.get('title', 'N/A')}")
        print(f"📝 Content: {result.get('story_content', 'N/A')[:100]}...")
        print(f"🎯 Moral: {result.get('moral', 'N/A')}")
        print(f"❓ Quiz: {'Yes' if result.get('quiz_questions') else 'No'}")
        print(f"📚 Glossary: {'Yes' if result.get('glossary') else 'No'}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("\n💡 Make sure your Azure OpenAI credentials are correct in config.py")

if __name__ == "__main__":
    main()