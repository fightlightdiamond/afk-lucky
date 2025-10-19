#!/usr/bin/env python3
"""
Simple test script for the AI API endpoints.
"""
import requests
import json

API_BASE = "http://localhost:8000/api/v1"

def test_health():
    """Test health endpoint"""
    response = requests.get("http://localhost:8000/health")
    print(f"Health check: {response.json()}")

def test_simple_story():
    """Test simple story generation"""
    data = {
        "prompt": "Write a short story about a brave little mouse"
    }
    response = requests.post(f"{API_BASE}/generate-story", json=data)
    if response.status_code == 200:
        result = response.json()
        print(f"Simple story generated: {result['title']}")
        print(f"Word count: {result['metadata']['word_count']}")
    else:
        print(f"Error: {response.status_code} - {response.text}")

def test_advanced_story():
    """Test advanced story generation"""
    data = {
        "prompt": "Write a story about friendship",
        "preferences": {
            "length": "medium",
            "language_mix": {
                "ratio": 70,
                "base_language": "vi",
                "target_language": "en"
            },
            "style": {
                "storytelling": "narrative",
                "tone": "friendly",
                "readability_level": "intermediate"
            }
        }
    }
    response = requests.post(f"{API_BASE}/generate-advanced-story", json=data)
    if response.status_code == 200:
        result = response.json()
        print(f"Advanced story generated: {result['title']}")
        print(f"Language ratio: {result['metadata']['language_ratio']}")
    else:
        print(f"Error: {response.status_code} - {response.text}")

def test_chat():
    """Test chat endpoint"""
    data = {
        "content": "Hello, can you help me write a story?",
        "context": "You are a helpful writing assistant"
    }
    response = requests.post(f"{API_BASE}/chat", json=data)
    if response.status_code == 200:
        result = response.json()
        print(f"Chat response: {result['response'][:100]}...")
    else:
        print(f"Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    print("Testing AI API endpoints...")
    
    try:
        test_health()
        test_simple_story()
        test_advanced_story()
        test_chat()
        print("All tests completed!")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to API. Make sure the server is running on localhost:8000")
    except Exception as e:
        print(f"Error: {e}")