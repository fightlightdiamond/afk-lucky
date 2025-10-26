"""
ChromaDB service for story vector search and storage.
"""
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
from openai import AzureOpenAI
import os

# Azure OpenAI configuration for embeddings
AZURE_OPENAI_EMBEDDING_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_EMBEDDING_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_EMBED_MODEL = "text-embedding-3-small"

# Lazy initialization
_embedding_client = None
_chroma_client = None
_stories_collection = None

def get_embedding_client():
    """Get or create embedding client."""
    global _embedding_client
    if _embedding_client is None:
        if not AZURE_OPENAI_EMBEDDING_API_KEY or not AZURE_OPENAI_EMBEDDING_ENDPOINT:
            print("⚠️ Azure OpenAI credentials not set, ChromaDB features disabled")
            return None
        _embedding_client = AzureOpenAI(
            api_key=AZURE_OPENAI_EMBEDDING_API_KEY,
            azure_endpoint=AZURE_OPENAI_EMBEDDING_ENDPOINT,
            api_version="2023-05-15"
        )
    return _embedding_client

def get_chroma_client():
    """Get or create ChromaDB client."""
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path="./chroma_data")
    return _chroma_client

def get_stories_collection():
    """Get or create stories collection."""
    global _stories_collection
    if _stories_collection is None:
        client = get_chroma_client()
        _stories_collection = client.get_or_create_collection(
            name="stories",
            metadata={"description": "Story embeddings for semantic search"}
        )
    return _stories_collection

def get_embedding(text: str) -> List[float]:
    """
    Get embedding vector for text using Azure OpenAI.
    
    Args:
        text: Text to embed
        
    Returns:
        Embedding vector
    """
    client = get_embedding_client()
    if not client:
        return None
        
    try:
        response = client.embeddings.create(
            input=text,
            model=AZURE_OPENAI_EMBED_MODEL
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return None

def add_story_to_chromadb(
    story_id: str,
    title: str,
    content: str,
    prompt: str,
    metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Add a story to ChromaDB with its embedding.
    
    Args:
        story_id: Unique story ID
        title: Story title
        content: Story content
        prompt: Original prompt
        metadata: Additional metadata
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Create embedding from content
        embedding = get_embedding(content)
        if not embedding:
            return False
        
        # Prepare metadata
        story_metadata = {
            "title": title,
            "prompt": prompt,
            "word_count": len(content.split()),
        }
        if metadata:
            story_metadata.update(metadata)
        
        # Add to collection
        collection = get_stories_collection()
        collection.add(
            embeddings=[embedding],
            documents=[content],
            ids=[story_id],
            metadatas=[story_metadata]
        )
        
        print(f"✅ Added story {story_id} to ChromaDB")
        return True
        
    except Exception as e:
        print(f"❌ Error adding story to ChromaDB: {e}")
        return False

def search_similar_stories(
    query: str,
    n_results: int = 5,
    filters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Search for similar stories using semantic search.
    
    Args:
        query: Search query
        n_results: Number of results to return
        filters: Optional metadata filters
        
    Returns:
        Search results with stories and metadata
    """
    try:
        # Get query embedding
        query_embedding = get_embedding(query)
        if not query_embedding:
            return {"stories": [], "error": "Failed to create query embedding"}
        
        # Search in ChromaDB
        collection = get_stories_collection()
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=filters if filters else None
        )
        
        # Format results
        stories = []
        if results["ids"] and len(results["ids"][0]) > 0:
            for i in range(len(results["ids"][0])):
                story = {
                    "id": results["ids"][0][i],
                    "content": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i],
                    "distance": results["distances"][0][i] if "distances" in results else None
                }
                stories.append(story)
        
        return {
            "stories": stories,
            "count": len(stories)
        }
        
    except Exception as e:
        print(f"❌ Error searching stories: {e}")
        return {"stories": [], "error": str(e)}

def get_story_by_id(story_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a story by its ID from ChromaDB.
    
    Args:
        story_id: Story ID
        
    Returns:
        Story data or None
    """
    try:
        collection = get_stories_collection()
        result = collection.get(
            ids=[story_id],
            include=["documents", "metadatas"]
        )
        
        if result["ids"] and len(result["ids"]) > 0:
            return {
                "id": result["ids"][0],
                "content": result["documents"][0],
                "metadata": result["metadatas"][0]
            }
        return None
        
    except Exception as e:
        print(f"❌ Error getting story: {e}")
        return None

def update_story_in_chromadb(
    story_id: str,
    content: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Update a story in ChromaDB.
    
    Args:
        story_id: Story ID
        content: New content (will regenerate embedding)
        metadata: New metadata
        
    Returns:
        True if successful
    """
    try:
        collection = get_stories_collection()
        
        if content:
            # Regenerate embedding
            embedding = get_embedding(content)
            if not embedding:
                return False
            
            collection.update(
                ids=[story_id],
                embeddings=[embedding],
                documents=[content],
                metadatas=[metadata] if metadata else None
            )
        elif metadata:
            collection.update(
                ids=[story_id],
                metadatas=[metadata]
            )
        
        print(f"✅ Updated story {story_id} in ChromaDB")
        return True
        
    except Exception as e:
        print(f"❌ Error updating story: {e}")
        return False

def delete_story_from_chromadb(story_id: str) -> bool:
    """
    Delete a story from ChromaDB.
    
    Args:
        story_id: Story ID
        
    Returns:
        True if successful
    """
    try:
        collection = get_stories_collection()
        collection.delete(ids=[story_id])
        print(f"✅ Deleted story {story_id} from ChromaDB")
        return True
        
    except Exception as e:
        print(f"❌ Error deleting story: {e}")
        return False

def get_collection_stats() -> Dict[str, Any]:
    """
    Get statistics about the stories collection.
    
    Returns:
        Collection statistics
    """
    try:
        collection = get_stories_collection()
        count = collection.count()
        return {
            "total_stories": count,
            "collection_name": collection.name,
            "metadata": collection.metadata
        }
    except Exception as e:
        print(f"❌ Error getting stats: {e}")
        return {"error": str(e)}
