"""
Story search and enhancement service using ChromaDB.
"""
import time
from typing import List, Dict, Any
from ..models import StoryInsertionRequest, StoryInsertionResponse, InsertionMetrics, StoryMetadata
from .chromadb_service import search_similar_stories
from .word_insertion_service import (
    analyze_story_structure,
    select_vocabulary_for_insertion,
    insert_words_into_story,
    generate_glossary
)
from .story_enhancement_service import calculate_insertion_metrics
from ..logging_config import logger


def search_and_enhance_story(request: StoryInsertionRequest) -> StoryInsertionResponse:
    """
    Search for a relevant story in ChromaDB and enhance it with word insertion.
    
    This is the main demo function that:
    1. Searches ChromaDB for stories matching the prompt
    2. Selects the best matching story
    3. Analyzes positions for word insertion
    4. Inserts vocabulary words
    5. Returns enhanced story
    
    Args:
        request: StoryInsertionRequest with prompt and insertion config
        
    Returns:
        StoryInsertionResponse with enhanced story
    """
    start_time = time.time()
    
    try:
        # Step 1: Search for relevant stories in ChromaDB
        logger.info(f"Searching ChromaDB for stories matching: '{request.prompt}'")
        
        search_results = search_similar_stories(
            query=request.prompt,
            n_results=3  # Get top 3 matching stories
        )
        
        if not search_results or len(search_results.get("stories", [])) == 0:
            logger.warning("No stories found in ChromaDB")
            return StoryInsertionResponse(
                title="Error",
                original_content="",
                enhanced_content="",
                inserted_words=[],
                glossary=[],
                metrics=InsertionMetrics(
                    total_insertions=0,
                    insertion_density=0.0,
                    avg_position_score=0.0,
                    readability_score=0,
                    language_ratio={"vi": 50, "en": 50}
                ),
                metadata=StoryMetadata(
                    word_count=0,
                    language_ratio={"vi": 50, "en": 50},
                    generation_time=int((time.time() - start_time) * 1000),
                    readability_score=0
                ),
                error="No stories found in database. Please import stories first."
            )
        
        # Step 2: Select best matching story
        stories = search_results["stories"]
        best_story = stories[0]  # ChromaDB returns sorted by relevance
        
        title = best_story.get("title", "Story")
        original_content = best_story.get("content", "")
        story_id = best_story.get("id", "unknown")
        
        logger.info(f"Selected story: '{title}' (ID: {story_id}, {len(original_content)} chars)")
        
        # Step 3: Analyze story structure for insertion positions
        logger.info("Analyzing story structure for insertion positions...")
        positions = analyze_story_structure(original_content)
        logger.info(f"Found {len(positions)} insertion positions")
        
        if not positions:
            logger.warning("No suitable insertion positions found")
            return StoryInsertionResponse(
                title=title,
                original_content=original_content,
                enhanced_content=original_content,
                inserted_words=[],
                glossary=[],
                metrics=InsertionMetrics(
                    total_insertions=0,
                    insertion_density=0.0,
                    avg_position_score=0.0,
                    readability_score=70,
                    language_ratio={"vi": 100, "en": 0}
                ),
                metadata=StoryMetadata(
                    word_count=len(original_content.split()),
                    language_ratio={"vi": 100, "en": 0},
                    generation_time=int((time.time() - start_time) * 1000),
                    readability_score=70
                ),
                error="No suitable insertion positions found"
            )
        
        # Step 4: Select vocabulary for insertion
        logger.info(f"Selecting vocabulary (topic: {request.insertion_config.topic}, difficulty: {request.insertion_config.difficulty})...")
        insertion_count = min(request.insertion_config.insertion_count, len(positions))
        
        vocabulary = select_vocabulary_for_insertion(
            topic=request.insertion_config.topic,
            difficulty=request.insertion_config.difficulty,
            count=insertion_count,
            context=original_content
        )
        
        if not vocabulary:
            logger.warning("No suitable vocabulary found")
            return StoryInsertionResponse(
                title=title,
                original_content=original_content,
                enhanced_content=original_content,
                inserted_words=[],
                glossary=[],
                metrics=InsertionMetrics(
                    total_insertions=0,
                    insertion_density=0.0,
                    avg_position_score=0.0,
                    readability_score=70,
                    language_ratio={"vi": 100, "en": 0}
                ),
                metadata=StoryMetadata(
                    word_count=len(original_content.split()),
                    language_ratio={"vi": 100, "en": 0},
                    generation_time=int((time.time() - start_time) * 1000),
                    readability_score=70
                ),
                error="No suitable vocabulary found"
            )
        
        logger.info(f"Selected {len(vocabulary)} vocabulary words")
        
        # Step 5: Insert words into story
        selected_positions = positions[:len(vocabulary)]
        enhanced_content = insert_words_into_story(
            story=original_content,
            vocabulary=vocabulary,
            positions=selected_positions,
            bold_format=request.insertion_config.bold_format,
            show_translation=request.insertion_config.show_translation
        )
        
        # Step 6: Create glossary
        glossary = generate_glossary(vocabulary)
        
        # Step 7: Calculate metrics
        metrics = calculate_insertion_metrics(
            original=original_content,
            enhanced=enhanced_content
        )
        
        generation_time = int((time.time() - start_time) * 1000)
        
        logger.info(f"✅ Story enhanced successfully: {len(vocabulary)} words inserted in {generation_time}ms")
        
        return StoryInsertionResponse(
            title=title,
            original_content=original_content,
            enhanced_content=enhanced_content,
            inserted_words=vocabulary,
            glossary=glossary,
            metrics=metrics,
            metadata=StoryMetadata(
                word_count=len(original_content.split()),
                language_ratio=metrics.language_ratio,
                generation_time=generation_time,
                readability_score=metrics.readability_score
            )
        )
        
    except Exception as e:
        logger.error(f"Error in search_and_enhance_story: {e}", exc_info=True)
        return StoryInsertionResponse(
            title="Error",
            original_content="",
            enhanced_content="",
            inserted_words=[],
            glossary=[],
            metrics=InsertionMetrics(
                total_insertions=0,
                insertion_density=0.0,
                avg_position_score=0.0,
                readability_score=0,
                language_ratio={"vi": 50, "en": 50}
            ),
            metadata=StoryMetadata(
                word_count=0,
                language_ratio={"vi": 50, "en": 50},
                generation_time=int((time.time() - start_time) * 1000),
                readability_score=0
            ),
            error=str(e)
        )
