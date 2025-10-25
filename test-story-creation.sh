#!/bin/bash

echo "🧪 Testing Story Creation with Audio"
echo "===================================="

# Test 1: Check API health
echo -e "\n1️⃣ Checking API health..."
curl -s http://localhost:8000/health | jq .

# Test 2: Generate story via Python API
echo -e "\n2️⃣ Generating story via Python API..."
STORY_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/generate-story \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test story about a cat"}')

echo "$STORY_RESPONSE" | jq '{title, content_length: (.content | length), has_content: (.content != null)}'

# Test 3: Generate TTS for the story
echo -e "\n3️⃣ Generating TTS audio..."
CONTENT=$(echo "$STORY_RESPONSE" | jq -r '.content')
TTS_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/tts/generate-file \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$(echo $CONTENT | head -c 200)\"}")

echo "$TTS_RESPONSE" | jq '{file_url, duration, size_bytes}'

# Test 4: Check if audio file exists
FILE_URL=$(echo "$TTS_RESPONSE" | jq -r '.file_url')
if [ "$FILE_URL" != "null" ]; then
  echo -e "\n4️⃣ Checking audio file..."
  FILE_PATH="aiapi/static/audio/$(basename $FILE_URL)"
  if [ -f "$FILE_PATH" ]; then
    echo "✅ Audio file exists: $FILE_PATH"
    ls -lh "$FILE_PATH"
  else
    echo "❌ Audio file not found: $FILE_PATH"
  fi
fi

echo -e "\n✅ Test complete!"