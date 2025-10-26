"""
Story search API routes using ChromaDB.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from ..services.chromadb_service import (
    search_similar_stories,
    get_story_by_id,
    get_collection_stats
)

router = APIRouter()

class StorySearchRequest(BaseModel):
    query: str
    n_results: int = 5
    filters: Optional[Dict[str, Any]] = None

class StorySearchResponse(BaseModel):
    stories: List[Dict[str, Any]]
    count: int
    error: Optional[str] = None

@router.post("/search-stories", response_model=StorySearchResponse)
def search_stories_endpoint(request: StorySearchRequest):
    """
    Search for similar stories using semantic search.
    
    Args:
        request: Search request with query and filters
        
    Returns:
        List of similar stories
    """
    try:
        results = search_similar_stories(
            query=request.query,
            n_results=request.n_results,
            filters=request.filters
        )
        
        return StorySearchResponse(**results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/story/{story_id}")
def get_story_endpoint(story_id: str):
    """
    Get a story by ID from ChromaDB.
    
    Args:
        story_id: Story ID
        
    Returns:
        Story data
    """
    story = get_story_by_id(story_id)
    
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    return story

@router.get("/collection-stats")
def get_stats_endpoint():
    """
    Get statistics about the stories collection.
    
    Returns:
        Collection statistics
    """
    return get_collection_stats()

class SyncStoryRequest(BaseModel):
    story_id: str
    title: str
    content: str
    prompt: str
    metadata: Optional[Dict[str, Any]] = None

@router.post("/sync-story-to-chromadb")
def sync_story_endpoint(request: SyncStoryRequest):
    """
    Sync a story to ChromaDB.
    
    Args:
        request: Story data to sync
        
    Returns:
        Success status
    """
    from ..services.chromadb_service import add_story_to_chromadb
    
    success = add_story_to_chromadb(
        story_id=request.story_id,
        title=request.title,
        content=request.content,
        prompt=request.prompt,
        metadata=request.metadata
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to sync story to ChromaDB")
    
    return {"message": "Story synced successfully", "story_id": request.story_id}
