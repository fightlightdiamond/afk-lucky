#!/usr/bin/env python3
"""
Test script for enhanced AI API with function calling and structured output.
"""
import asyncio
import json
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from aiapi.services.story_service import (
    generate_simple_story, 
    generate_advanced_story,
    generate_story_content_with_tools
)
from aiapi.services.chat_service import generate_chat_response
from aiapi.models import (
    AdvancedStoryRequest, 
    StoryPreferences, 
    StoryConfig,
    LanguageMix,
    StoryStyle,
    StoryStructure,
    ChatMessage
)

def test_function_calling():
    """Test the new function calling implementation."""
    print("🧪 Testing Function Calling Implementation...")
    
    try:
        # Test structured output generation
        prompt = "Create a short story about a brave little mouse who learns about friendship."
        result = generate_story_content_with_tools(prompt, include_sections=True)
        
        print("✅ Function calling successful!")
        print(f"📖 Title: {result.get('title', 'N/A')}")
        print(f"📝 Story length: {len(result.get('story_content', '').split())} words")
        print(f"🎯 Has moral: {'Yes' if result.get('moral') else 'No'}")
        print(f"❓ Has quiz: {'Yes' if result.get('quiz_questions') else 'No'}")
        print(f"📚 Has glossary: {'Yes' if result.get('glossary') else 'No'}")
        
        return True
    except Exception as e:
        print(f"❌ Function calling failed: {str(e)}")
        return False

def test_simple_story():
    """Test simple story generation."""
    print("\n🧪 Testing Simple Story Generation...")
    
    try:
        prompt = "A magical adventure in a enchanted forest"
        result = generate_simple_story(prompt)
        
        if result.error:
            print(f"❌ Simple story failed: {result.error}")
            return False
        
        print("✅ Simple story generation successful!")
        print(f"📖 Title: {result.title}")
        print(f"📝 Word count: {result.metadata.word_count if result.metadata else 'N/A'}")
        print(f"⏱️ Generation time: {result.metadata.generation_time if result.metadata else 'N/A'}ms")
        
        return True
    except Exception as e:
        print(f"❌ Simple story failed: {str(e)}")
        return False

def test_advanced_story():
    """Test advanced story generation with full configuration."""
    print("\n🧪 Testing Advanced Story Generation...")
    
    try:
        # Create advanced request with all features
        request = AdvancedStoryRequest(
            prompt="A story about learning Vietnamese through cooking traditional dishes",
            config=StoryConfig(
                vocab_focus=["nấu ăn", "món truyền thống", "gia đình"],
                core_topic="Vietnamese culture and cooking"
            ),
            preferences=StoryPreferences(
                length="medium",
                language_mix=LanguageMix(
                    ratio=70,  # 70% Vietnamese
                    base_language="vi",
                    target_language="en"
                ),
                style=StoryStyle(
                    storytelling="narrative",
                    tone="friendly",
                    readability_level="intermediate"
                ),
                structure=StoryStructure(
                    sections=["story", "moral"],
                    include_quiz=True,
                    include_glossary=True
                )
            )
        )
        
        result = generate_advanced_story(request)
        
        if result.error:
            print(f"❌ Advanced story failed: {result.error}")
            return False
        
        print("✅ Advanced story generation successful!")
        print(f"📖 Title: {result.title}")
        print(f"📝 Word count: {result.metadata.word_count if result.metadata else 'N/A'}")
        print(f"🌐 Language ratio: {result.metadata.language_ratio if result.metadata else 'N/A'}")
        print(f"📊 Readability score: {result.metadata.readability_score if result.metadata else 'N/A'}")
        
        if result.sections:
            print(f"🎯 Has moral: {'Yes' if result.sections.moral else 'No'}")
            print(f"❓ Quiz questions: {len(result.sections.quiz) if result.sections.quiz else 0}")
            print(f"📚 Glossary terms: {len(result.sections.glossary) if result.sections.glossary else 0}")
        
        return True
    except Exception as e:
        print(f"❌ Advanced story failed: {str(e)}")
        return False

def test_chat_service():
    """Test chat service."""
    print("\n🧪 Testing Chat Service...")
    
    try:
        message = ChatMessage(
            content="Explain the benefits of bilingual storytelling for language learning.",
            context="Educational context for language learning"
        )
        
        result = generate_chat_response(message)
        
        if result.error:
            print(f"❌ Chat service failed: {result.error}")
            return False
        
        print("✅ Chat service successful!")
        print(f"💬 Response length: {len(result.response.split())} words")
        
        return True
    except Exception as e:
        print(f"❌ Chat service failed: {str(e)}")
        return False

def main():
    """Run all tests."""
    print("🚀 Starting Enhanced AI API Tests\n")
    
    tests = [
        ("Function Calling", test_function_calling),
        ("Simple Story", test_simple_story),
        ("Advanced Story", test_advanced_story),
        ("Chat Service", test_chat_service)
    ]
    
    results = []
    for test_name, test_func in tests:
        success = test_func()
        results.append((test_name, success))
    
    # Summary
    print("\n" + "="*50)
    print("📊 TEST SUMMARY")
    print("="*50)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name:20} {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The enhanced API is working correctly.")
    else:
        print("⚠️ Some tests failed. Please check the error messages above.")

if __name__ == "__main__":
    main()