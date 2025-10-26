# 🔍 ChromaDB Integration for Story Search

## Overview

Tích hợp ChromaDB để semantic search truyện chêm sử dụng vector embeddings.

## Architecture

```
Story Creation Flow:
1. User tạo truyện
2. Lưu vào PostgreSQL (primary storage)
3. Tạo embedding và lưu vào ChromaDB (vector search)
4. Tạo audio file (TTS)

Story Search Flow:
1. User nhập query
2. Tạo embedding cho query
3. Search trong ChromaDB (semantic search)
4. Trả về stories tương tự
```

## Installation

```bash
cd aiapi
pip install chromadb openai
```

## Configuration

Set environment variables:

```bash
export AZURE_OPENAI_API_KEY="your-key"
export AZURE_OPENAI_ENDPOINT="your-endpoint"
```

## API Endpoints

### 1. Search Similar Stories

```bash
POST /api/v1/search-stories
{
  "query": "Tìm truyện về công nghệ",
  "n_results": 5
}
```

### 2. Get Story by ID

```bash
GET /api/v1/story/{story_id}
```

### 3. Collection Stats

```bash
GET /api/v1/collection-stats
```

### 4. Sync Story to ChromaDB

```bash
POST /api/v1/sync-story-to-chromadb
{
  "story_id": "xxx",
  "title": "Story Title",
  "content": "Story content...",
  "prompt": "Original prompt"
}
```

## Usage Examples

### Search for Similar Stories

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/search-stories",
    json={
        "query": "Tìm truyện về lập trình viên",
        "n_results": 3
    }
)

results = response.json()
for story in results["stories"]:
    print(f"Title: {story['metadata']['title']}")
    print(f"Content: {story['content'][:100]}...")
    print(f"Distance: {story['distance']}")
    print()
```

### Frontend Integration

```typescript
// Search stories
const searchStories = async (query: string) => {
  const response = await fetch("http://localhost:8000/api/v1/search-stories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, n_results: 5 }),
  });

  const data = await response.json();
  return data.stories;
};

// Usage
const stories = await searchStories("Truyện về IT");
```

## Features

### Semantic Search

- Tìm truyện dựa trên ý nghĩa, không chỉ từ khóa
- Sử dụng Azure OpenAI embeddings
- Kết quả được rank theo độ tương đồng

### Automatic Sync

- Stories tự động sync sang ChromaDB khi tạo
- Không block story creation
- Graceful degradation nếu ChromaDB fail

### Metadata Filtering

```python
# Search with filters
results = search_similar_stories(
    query="Truyện về IT",
    n_results=5,
    filters={"word_count": {"$gt": 100}}
)
```

## Data Storage

### PostgreSQL (Primary)

- Full story data
- User information
- Metadata
- Audio URLs

### ChromaDB (Search Index)

- Story embeddings
- Basic metadata
- Fast semantic search

## Benefits

### vs PostgreSQL Full-Text Search

- ✅ Semantic understanding
- ✅ Language-agnostic
- ✅ Better for mixed language content
- ✅ Finds similar stories, not just keyword matches

### vs Elasticsearch

- ✅ Simpler setup
- ✅ Built for embeddings
- ✅ No complex configuration
- ✅ Perfect for AI applications

## Performance

### Embedding Generation

- Time: ~100-200ms per story
- Model: text-embedding-3-small
- Dimensions: 1536

### Search Performance

- Query time: ~50-100ms
- Scales to millions of stories
- In-memory for fast access

## Maintenance

### Backup ChromaDB

```bash
# Data stored in aiapi/chroma_data/
tar -czf chroma_backup.tar.gz aiapi/chroma_data/
```

### Rebuild Index

```python
# Sync all stories from PostgreSQL to ChromaDB
from services.chromadb_service import add_story_to_chromadb
import prisma

stories = prisma.story.find_many()
for story in stories:
    add_story_to_chromadb(
        story_id=story.id,
        title=story.title or "Story",
        content=story.content,
        prompt=story.prompt
    )
```

## Troubleshooting

### ChromaDB not starting

```bash
# Check if chroma_data directory exists
ls -la aiapi/chroma_data/

# Remove and recreate
rm -rf aiapi/chroma_data/
# Restart API server
```

### Embeddings failing

```bash
# Check Azure OpenAI credentials
echo $AZURE_OPENAI_API_KEY
echo $AZURE_OPENAI_ENDPOINT

# Test embedding
python -c "from aiapi.src.aiapi.services.chromadb_service import get_embedding; print(get_embedding('test'))"
```

## Future Enhancements

- [ ] Hybrid search (vector + keyword)
- [ ] Multi-language embeddings
- [ ] Story recommendations
- [ ] Clustering similar stories
- [ ] Auto-tagging based on content

---

**Status**: ✅ Ready for testing

**Next Steps**:

1. Install chromadb: `pip install chromadb`
2. Restart API server
3. Create stories - they will auto-sync
4. Test search endpoint
