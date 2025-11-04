"""
Word insertion API routes for generating stories with English vocabulary insertion.
"""
from fastapi import APIRouter, HTTPException

from ..models import (
    StoryInsertionRequest,
    StoryInsertionResponse,
    StoryEnhancementRequest,
    VocabularyWord,
    VocabularySearchRequest,
    BatchVocabularyRequest,
    BatchVocabularyResponse,
    BatchStoryInsertionRequest,
    BatchStoryInsertionResponse
)
from ..services.story_enhancement_service import (
    generate_story_with_insertion,
    enhance_existing_story,
    generate_batch_stories_with_insertion,
    generate_batch_stories_with_insertion_parallel
)
from ..services.vocabulary_service import (
    get_vocabulary_by_topic,
    search_vocabulary_semantic,
    batch_add_vocabulary
)

router = APIRouter()


@router.post("/generate-story-with-insertion", response_model=StoryInsertionResponse)
def generate_story_with_insertion_api(req: StoryInsertionRequest):
    """
    Generate a new story with English word insertion.
    
    This endpoint creates a Vietnamese story based on the prompt and intelligently
    inserts English vocabulary words at natural positions. The inserted words are
    formatted in bold with Vietnamese translations.
    
    Args:
        req: StoryInsertionRequest with prompt, config, preferences, and insertion_config
        
    Returns:
        StoryInsertionResponse with original and enhanced content, glossary, and metrics
        
    Raises:
        HTTPException: If story generation fails
    """
    try:
        result = generate_story_with_insertion(req)
        
        # Check if there was an error but still return partial results
        if result.error and not result.enhanced_content:
            raise HTTPException(status_code=500, detail=result.error)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate story with insertion: {str(e)}"
        )


@router.post("/enhance-story", response_model=StoryInsertionResponse)
def enhance_story_api(req: StoryEnhancementRequest):
    """
    Add English word insertion to an existing story.
    
    This endpoint takes an existing story from ChromaDB and enhances it by
    inserting English vocabulary words at natural positions.
    
    Args:
        req: StoryEnhancementRequest with story_id and insertion_config
        
    Returns:
        StoryInsertionResponse with original and enhanced content, glossary, and metrics
        
    Raises:
        HTTPException: If story enhancement fails or story not found
    """
    try:
        result = enhance_existing_story(
            story_id=req.story_id,
            insertion_config=req.insertion_config
        )
        
        if result.error:
            raise HTTPException(status_code=500, detail=result.error)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to enhance story: {str(e)}"
        )


@router.get("/vocabulary/{topic}/{difficulty}", response_model=list[dict])
def get_vocabulary_api(topic: str, difficulty: str, limit: int = 20):
    """
    Get vocabulary words by topic and difficulty level.
    
    Retrieves vocabulary words from ChromaDB filtered by topic and difficulty.
    Useful for browsing available vocabulary or pre-loading words for insertion.
    
    Args:
        topic: Topic category (e.g., "technology", "business", "education")
        difficulty: Difficulty level ("beginner", "intermediate", "advanced")
        limit: Maximum number of words to return (default: 20, max: 50)
        
    Returns:
        List of vocabulary words with metadata
        
    Raises:
        HTTPException: If vocabulary retrieval fails
    """
    try:
        # Validate difficulty level
        valid_difficulties = ["beginner", "intermediate", "advanced"]
        if difficulty not in valid_difficulties:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid difficulty level. Must be one of: {', '.join(valid_difficulties)}"
            )
        
        # Limit the maximum number of results
        if limit > 50:
            limit = 50
        
        vocabulary = get_vocabulary_by_topic(
            topic=topic,
            difficulty=difficulty,
            limit=limit
        )
        
        if not vocabulary:
            return []
        
        return vocabulary
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve vocabulary: {str(e)}"
        )


@router.post("/vocabulary/search", response_model=list[dict])
def search_vocabulary_api(req: VocabularySearchRequest):
    """
    Semantic search for vocabulary words.
    
    Uses vector embeddings to find vocabulary words that are semantically similar
    to the search query. Supports optional filtering by topic and difficulty.
    
    Args:
        req: VocabularySearchRequest with query, n_results, and optional filters
        
    Returns:
        List of vocabulary words with similarity scores
        
    Raises:
        HTTPException: If search fails
    """
    try:
        vocabulary = search_vocabulary_semantic(
            query=req.query,
            n_results=req.n_results,
            topic=req.topic,
            difficulty=req.difficulty
        )
        
        if not vocabulary:
            return []
        
        return vocabulary
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search vocabulary: {str(e)}"
        )


@router.post("/vocabulary/batch-add", response_model=BatchVocabularyResponse)
def batch_add_vocabulary_api(req: BatchVocabularyRequest):
    """
    Add multiple vocabulary words in batch.
    
    Efficiently adds multiple vocabulary words to ChromaDB in a single request.
    Returns success/failure counts and any error messages.
    
    Args:
        req: BatchVocabularyRequest with list of vocabulary words
        
    Returns:
        BatchVocabularyResponse with success/failure counts and errors
        
    Raises:
        HTTPException: If batch operation fails completely
    """
    try:
        if not req.words:
            raise HTTPException(
                status_code=400,
                detail="No vocabulary words provided"
            )
        
        result = batch_add_vocabulary(req.words)
        
        return BatchVocabularyResponse(
            success_count=result["success_count"],
            failed_count=result["failed_count"],
            errors=result["errors"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to batch add vocabulary: {str(e)}"
        )



@router.post("/batch-generate-stories", response_model=BatchStoryInsertionResponse)
def batch_generate_stories_api(req: BatchStoryInsertionRequest, parallel: bool = True, max_workers: int = 3):
    """
    Generate multiple stories with English word insertion in batch.
    
    This endpoint processes up to 10 story generation requests in a single call.
    Returns partial results if some stories fail to process. Each story is
    generated independently with error handling.
    
    By default, uses parallel processing with 3 concurrent workers for better
    performance. Can be switched to sequential processing if needed.
    
    Args:
        req: BatchStoryInsertionRequest with list of story requests (max 10)
        parallel: Whether to use parallel processing (default: True)
        max_workers: Maximum concurrent workers for parallel processing (default: 3, max: 5)
        
    Returns:
        BatchStoryInsertionResponse with success/failure counts and results
        
    Raises:
        HTTPException: If batch processing fails completely
    """
    try:
        if not req.requests:
            raise HTTPException(
                status_code=400,
                detail="No story requests provided"
            )
        
        if len(req.requests) > 10:
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 stories per batch request"
            )
        
        # Limit max_workers to avoid overwhelming the API
        max_workers = min(max_workers, 5)
        
        # Choose processing method
        if parallel and len(req.requests) > 1:
            result = generate_batch_stories_with_insertion_parallel(req, max_workers=max_workers)
        else:
            result = generate_batch_stories_with_insertion(req)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process batch stories: {str(e)}"
        )
