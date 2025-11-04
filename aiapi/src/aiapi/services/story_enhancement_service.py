"""
Story enhancement service for generating stories with English word insertion.
"""
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, Any, List
from openai import RateLimitError, APIError

from ..models import (
    StoryInsertionRequest,
    StoryInsertionResponse,
    StoryEnhancementRequest,
    InsertionMetrics,
    VocabularyWord,
    StoryMetadata,
    AdvancedStoryRequest,
    BatchStoryInsertionRequest,
    BatchStoryInsertionResult,
    BatchStoryInsertionResponse,
    StoryPreferences,
    StoryStyle
)
from ..exceptions import (
    StoryGenerationError,
    ReadabilityError,
    VocabularyNotFoundError,
    PositionDetectionError,
    BatchProcessingError,
    RateLimitExceededError,
    APIQuotaExceededError
)
from ..logging_config import get_logger, PerformanceMonitor, LogContext
from ..utils import safe_execute, ErrorContext
from .story_service import generate_advanced_story, calculate_language_ratio, calculate_readability_score
from .word_insertion_service import (
    analyze_story_structure,
    select_vocabulary_for_insertion,
    insert_words_into_story,
    generate_glossary,
    validate_grammar_after_insertion,
    adjust_insertion_positions_for_grammar
)
from .chromadb_service import get_chroma_client, get_embedding, add_story_to_chromadb
import uuid

logger = get_logger(__name__)


def save_enhanced_story_to_chromadb(
    title: str,
    enhanced_content: str,
    original_content: str,
    prompt: str,
    inserted_words: List[VocabularyWord],
    metrics: InsertionMetrics,
    metadata: StoryMetadata
) -> str:
    """
    Save enhanced story with insertion metadata to ChromaDB.
    
    Extends story metadata with insertion information including:
    - has_insertion: True
    - insertion_count: number of inserted words
    - insertion_topics: list of vocabulary topics
    - insertion_difficulty: vocabulary difficulty level
    - insertion_density: insertions per 100 words
    - avg_position_score: average quality score
    
    Args:
        title: Story title
        enhanced_content: Story content with insertions
        original_content: Original story without insertions
        prompt: Original prompt
        inserted_words: List of inserted vocabulary words
        metrics: Insertion metrics
        metadata: Story metadata
        
    Returns:
        Story ID if successful, empty string otherwise
    """
    try:
        # Generate unique story ID
        story_id = f"story_insertion_{uuid.uuid4().hex[:12]}"
        
        # Extract unique topics from inserted words
        topics = list(set(word.topic for word in inserted_words))
        
        # Get difficulty level (use most common or first)
        difficulties = [word.difficulty for word in inserted_words]
        difficulty = max(set(difficulties), key=difficulties.count) if difficulties else "intermediate"
        
        # Prepare insertion metadata
        insertion_metadata = {
            "has_insertion": True,
            "insertion_count": metrics.total_insertions,
            "insertion_topics": topics,
            "insertion_difficulty": difficulty,
            "insertion_density": metrics.insertion_density,
            "avg_position_score": metrics.avg_position_score,
            "readability_score": metrics.readability_score,
            "language_ratio_vi": metrics.language_ratio.get("vi", 50),
            "language_ratio_en": metrics.language_ratio.get("en", 50),
            "generation_time": metadata.generation_time,
            "original_word_count": len(original_content.split()),
            "enhanced_word_count": metadata.word_count
        }
        
        # Save to ChromaDB
        success = add_story_to_chromadb(
            story_id=story_id,
            title=title,
            content=enhanced_content,
            prompt=prompt,
            metadata=insertion_metadata
        )
        
        if success:
            logger.info(f"Saved enhanced story to ChromaDB with ID: {story_id}")
            return story_id
        else:
            logger.error("Failed to save enhanced story to ChromaDB")
            return ""
            
    except Exception as e:
        logger.error(f"Error saving enhanced story to ChromaDB: {e}", exc_info=True)
        return ""


def calculate_insertion_metrics(original: str, enhanced: str) -> InsertionMetrics:
    """
    Calculate metrics for word insertion quality.
    
    Calculates insertion density, readability score, and language ratio
    by comparing original and enhanced story content.
    
    Args:
        original: Original story content without insertions
        enhanced: Enhanced story content with insertions
        
    Returns:
        InsertionMetrics with calculated values
    """
    try:
        # Count total insertions by comparing word counts
        original_words = original.split()
        enhanced_words = enhanced.split()
        
        # Count insertions (approximate by counting bold markers and translations)
        import re
        bold_pattern = re.compile(r'\*\*([^*]+)\*\*')
        insertions = bold_pattern.findall(enhanced)
        total_insertions = len(insertions)
        
        # Calculate insertion density (insertions per 100 words)
        original_word_count = len(original_words)
        if original_word_count > 0:
            insertion_density = (total_insertions / original_word_count) * 100
        else:
            insertion_density = 0.0
        
        # Calculate readability score using existing function
        readability_score = calculate_readability_score(enhanced)
        
        # Calculate language ratio using existing function
        language_ratio = calculate_language_ratio(enhanced)
        
        # Average position score will be set by caller
        avg_position_score = 0.0
        
        metrics = InsertionMetrics(
            total_insertions=total_insertions,
            insertion_density=round(insertion_density, 2),
            avg_position_score=avg_position_score,
            readability_score=readability_score,
            language_ratio=language_ratio
        )
        
        logger.info(f"Metrics calculated: {total_insertions} insertions, density: {insertion_density:.2f}%, readability: {readability_score}")
        return metrics
        
    except Exception as e:
        logger.error(f"Error calculating insertion metrics: {e}", exc_info=True)
        # Return default metrics on error
        return InsertionMetrics(
            total_insertions=0,
            insertion_density=0.0,
            avg_position_score=0.0,
            readability_score=70,
            language_ratio={"vi": 50, "en": 50}
        )


def validate_story_readability(
    enhanced_content: str,
    min_threshold: int = 60
) -> tuple[bool, int]:
    """
    Validate story readability score against minimum threshold.
    
    Args:
        enhanced_content: Story content to validate
        min_threshold: Minimum acceptable readability score (default: 60)
        
    Returns:
        Tuple of (is_valid, readability_score)
    """
    readability_score = calculate_readability_score(enhanced_content)
    is_valid = readability_score >= min_threshold
    
    logger.debug(f"Readability validation: score={readability_score}, threshold={min_threshold}, valid={is_valid}")
    
    return is_valid, readability_score


def generate_story_with_insertion(request: StoryInsertionRequest) -> StoryInsertionResponse:
    """
    Generate a new story with English word insertion.
    
    Integrates with existing story_service for base story generation,
    then uses word_insertion_service to enhance the story with vocabulary.
    Includes readability validation with automatic regeneration for low-quality stories.
    
    Args:
        request: StoryInsertionRequest with prompt, config, preferences, and insertion_config
        
    Returns:
        StoryInsertionResponse with original and enhanced content, glossary, and metrics
        
    Raises:
        StoryGenerationError: If story generation fails
        VocabularyNotFoundError: If no suitable vocabulary is found
        PositionDetectionError: If insertion position detection fails
    """
    with LogContext("generate_story_with_insertion", prompt=request.prompt[:50]):
        try:
            start_time = time.time()
            logger.info(f"Starting story generation with insertion: prompt='{request.prompt[:50]}...'")
            
            # Readability validation settings
            MIN_READABILITY_THRESHOLD = 60
            MAX_REGENERATION_ATTEMPTS = 2
            
            # Track regeneration attempts
            regeneration_attempt = 0
            story_response = None
            
            # Step 1: Generate base story with readability validation
            while regeneration_attempt <= MAX_REGENERATION_ATTEMPTS:
                logger.info(f"Generating base story (attempt {regeneration_attempt + 1}/{MAX_REGENERATION_ATTEMPTS + 1})...")
                
                story_request = AdvancedStoryRequest(
                    prompt=request.prompt,
                    config=request.config,
                    preferences=request.preferences
                )
                
                story_response = generate_advanced_story(story_request)
                
                if story_response.error:
                    # If there's an error, don't retry
                    break
                
                # Validate readability of base story
                is_valid, readability_score = validate_story_readability(
                    story_response.content,
                    MIN_READABILITY_THRESHOLD
                )
                
                if is_valid:
                    logger.info(f"Base story readability acceptable: {readability_score}")
                    break
                else:
                    logger.warning(f"Base story readability too low: {readability_score} < {MIN_READABILITY_THRESHOLD}")
                    regeneration_attempt += 1
                    
                    if regeneration_attempt <= MAX_REGENERATION_ATTEMPTS:
                        logger.info(f"Regenerating story with simpler sentence structures...")
                        # Adjust preferences for simpler readability
                        if not request.preferences:
                            request.preferences = StoryPreferences()
                        if not request.preferences.style:
                            from ..models import StoryStyle
                            request.preferences.style = StoryStyle()
                        
                        # Set to beginner level for better readability
                        request.preferences.style.readability_level = "beginner"
                    else:
                        logger.warning(f"Max regeneration attempts reached. Proceeding with current story.")
                        break
            
            if story_response.error:
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
                        generation_time=0,
                        readability_score=0
                    ),
                    error=story_response.error
                )
        
            original_content = story_response.content
            title = story_response.title
            
            logger.info(f"Base story generated: {len(original_content)} characters")
            
            # Step 2: Analyze story structure to find insertion positions
            logger.info("Analyzing story structure for insertion positions...")
            positions = analyze_story_structure(original_content)
            
            if not positions:
                logger.warning("No suitable insertion positions found")
            # Return story without insertions
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
                    readability_score=story_response.metadata.readability_score if story_response.metadata else 70,
                    language_ratio=story_response.metadata.language_ratio if story_response.metadata else {"vi": 100, "en": 0}
                ),
                metadata=story_response.metadata or StoryMetadata(
                    word_count=len(original_content.split()),
                    language_ratio={"vi": 100, "en": 0},
                    generation_time=int((time.time() - start_time) * 1000),
                    readability_score=70
                ),
                error="No suitable insertion positions found"
            )
        
            # Step 3: Select vocabulary for insertion
            logger.info(f"Selecting vocabulary for insertion (count: {request.insertion_config.insertion_count})...")
            insertion_count = min(request.insertion_config.insertion_count, len(positions))
            
            vocabulary = select_vocabulary_for_insertion(
                topic=request.insertion_config.topic,
                difficulty=request.insertion_config.difficulty,
                count=insertion_count,
                context=original_content[:500],  # Use first 500 chars as context
                min_relevance=0.8  # Requirement 10.3: minimum relevance score of 0.8
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
                    readability_score=story_response.metadata.readability_score if story_response.metadata else 70,
                    language_ratio=story_response.metadata.language_ratio if story_response.metadata else {"vi": 100, "en": 0}
                ),
                metadata=story_response.metadata or StoryMetadata(
                    word_count=len(original_content.split()),
                    language_ratio={"vi": 100, "en": 0},
                    generation_time=int((time.time() - start_time) * 1000),
                    readability_score=70
                ),
                error="No suitable vocabulary found"
            )
            
            # Limit positions to match vocabulary count
            selected_positions = positions[:len(vocabulary)]
            
            # Step 4: Insert words into story with readability and grammar validation
            logger.info("Inserting words into story...")
            enhanced_content = insert_words_into_story(
                story=original_content,
                vocabulary=vocabulary,
                positions=selected_positions,
                bold_format=request.insertion_config.bold_format,
                show_translation=request.insertion_config.show_translation
            )
            
            # Validate readability after insertion
            is_valid_after_insertion, readability_after_insertion = validate_story_readability(
                enhanced_content,
                MIN_READABILITY_THRESHOLD
            )
            
            # Validate grammar after insertion (Requirement 10.4)
            logger.info("Validating grammar after insertion...")
            grammar_validation = validate_grammar_after_insertion(
                enhanced_story=enhanced_content,
                original_story=original_content
            )
            
            # Check if we need to adjust due to readability or grammar issues
            needs_adjustment = (
                not is_valid_after_insertion or 
                not grammar_validation["is_valid"] or
                grammar_validation["overall_score"] < 0.7
            )
            
            if needs_adjustment:
                if not is_valid_after_insertion:
                    logger.warning(f"Readability decreased after insertion: {readability_after_insertion} < {MIN_READABILITY_THRESHOLD}")
                
                if not grammar_validation["is_valid"]:
                    logger.warning(f"Grammar issues detected: {len(grammar_validation['issues'])} issues")
                    logger.debug(f"Grammar score: {grammar_validation['overall_score']:.2f}")
                
                logger.info(f"Adjusting insertion positions and retrying...")
                
                # Adjust positions based on grammar issues
                if grammar_validation.get("problematic_sentences"):
                    adjusted_positions = adjust_insertion_positions_for_grammar(
                        positions=positions,
                        problematic_sentences=grammar_validation["problematic_sentences"]
                    )
                else:
                    adjusted_positions = positions
                
                # Reduce insertion count by 30% to improve quality
                reduced_count = max(5, int(len(vocabulary) * 0.7))
                vocabulary = vocabulary[:reduced_count]
                selected_positions = adjusted_positions[:reduced_count]
                
                # Re-insert with adjusted positions
                enhanced_content = insert_words_into_story(
                    story=original_content,
                    vocabulary=vocabulary,
                    positions=selected_positions,
                    bold_format=request.insertion_config.bold_format,
                    show_translation=request.insertion_config.show_translation
                )
                
                # Re-validate readability
                is_valid_retry, readability_retry = validate_story_readability(
                    enhanced_content,
                    MIN_READABILITY_THRESHOLD
                )
                
                # Re-validate grammar
                grammar_validation_retry = validate_grammar_after_insertion(
                    enhanced_story=enhanced_content,
                    original_story=original_content
                )
                
                if is_valid_retry and grammar_validation_retry["is_valid"]:
                    logger.info(f"Quality improved after adjustment:")
                    logger.info(f"  - Readability: {readability_retry}")
                    logger.info(f"  - Grammar score: {grammar_validation_retry['overall_score']:.2f}")
                else:
                    logger.warning(f"Quality after retry:")
                    logger.warning(f"  - Readability: {readability_retry} (valid: {is_valid_retry})")
                    logger.warning(f"  - Grammar score: {grammar_validation_retry['overall_score']:.2f} (valid: {grammar_validation_retry['is_valid']})")
                    logger.info(f"  Proceeding with current result.")
            else:
                logger.info(f"Quality validation passed:")
                logger.info(f"  - Readability: {readability_after_insertion}")
                logger.info(f"  - Grammar score: {grammar_validation['overall_score']:.2f}")
            
            # Step 5: Generate glossary
            # Step 5: Generate glossary
            logger.info("Generating glossary...")
            glossary = generate_glossary(vocabulary)
            
            # Step 6: Calculate metrics
            logger.info("Calculating insertion metrics...")
            metrics = calculate_insertion_metrics(original_content, enhanced_content)
            
            # Update metrics with position scores
            if selected_positions:
                avg_score = sum(p.score for p in selected_positions) / len(selected_positions)
                metrics.avg_position_score = round(avg_score, 2)
            
            # Calculate total generation time
            total_time = int((time.time() - start_time) * 1000)
            
            # Create metadata
            metadata = StoryMetadata(
                word_count=len(enhanced_content.split()),
                language_ratio=metrics.language_ratio,
                generation_time=total_time,
                readability_score=metrics.readability_score
            )
            
            logger.info(f"Story enhancement complete! Inserted {len(vocabulary)} words")
            
            # Step 7: Save enhanced story to ChromaDB
            logger.info("Saving enhanced story to ChromaDB...")
            story_id = save_enhanced_story_to_chromadb(
                title=title,
                enhanced_content=enhanced_content,
                original_content=original_content,
                prompt=request.prompt,
                inserted_words=vocabulary,
                metrics=metrics,
                metadata=metadata
            )
            
            if story_id:
                logger.info(f"Enhanced story saved with ID: {story_id}")
            
            return StoryInsertionResponse(
                title=title,
                original_content=original_content,
                enhanced_content=enhanced_content,
                inserted_words=vocabulary,
                glossary=glossary,
                metrics=metrics,
                metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"Error generating story with insertion: {e}", exc_info=True)
            
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
                generation_time=0,
                readability_score=0
            ),
            error=str(e)
        )


def enhance_existing_story(
    story_id: str,
    insertion_config: "InsertionConfig"
) -> StoryInsertionResponse:
    """
    Add English words to an existing story.
    
    Args:
        story_id: ID of existing story in ChromaDB
        insertion_config: Configuration for word insertion
        
    Returns:
        StoryInsertionResponse with enhanced story
    """
    try:
        # TODO: Implement retrieval of existing story from ChromaDB
        # For now, return error as this requires ChromaDB story storage
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
                generation_time=0,
                readability_score=0
            ),
            error="Story enhancement from existing story not yet implemented"
        )
        
    except Exception as e:
        logger.error(f"Error enhancing existing story: {e}", exc_info=True)
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
                generation_time=0,
                readability_score=0
            ),
            error=str(e)
        )



def generate_batch_stories_with_insertion(
    batch_request: BatchStoryInsertionRequest
) -> BatchStoryInsertionResponse:
    """
    Generate multiple stories with English word insertion in batch.
    
    Processes multiple story generation requests with error handling.
    Returns partial results if some stories fail to process.
    Handles API quota errors gracefully with retry logic.
    
    Args:
        batch_request: BatchStoryInsertionRequest with list of story requests
        
    Returns:
        BatchStoryInsertionResponse with results for each request
    """
    from openai import RateLimitError, APIError
    
    start_time = time.time()
    results = []
    success_count = 0
    failed_count = 0
    
    logger.info(f"Starting batch processing of {len(batch_request.requests)} stories...")
    
    for index, request in enumerate(batch_request.requests):
        try:
            logger.info(f"Processing story {index + 1}/{len(batch_request.requests)}...")
            
            # Generate story with insertion
            result = generate_story_with_insertion(request)
            
            # Check if generation was successful
            if result.error and not result.enhanced_content:
                # Complete failure
                failed_count += 1
                results.append(BatchStoryInsertionResult(
                    index=index,
                    success=False,
                    result=None,
                    error=result.error
                ))
                logger.error(f"Story {index + 1} failed: {result.error}")
            else:
                # Success (even with partial errors)
                success_count += 1
                results.append(BatchStoryInsertionResult(
                    index=index,
                    success=True,
                    result=result,
                    error=None
                ))
                logger.info(f"Story {index + 1} completed successfully")
                
        except RateLimitError as e:
            # Handle rate limit errors gracefully
            failed_count += 1
            error_msg = f"Rate limit exceeded: {str(e)}. Please try again later."
            results.append(BatchStoryInsertionResult(
                index=index,
                success=False,
                result=None,
                error=error_msg
            ))
            logger.warning(f"Story {index + 1} hit rate limit: {error_msg}")
            
            # If we hit rate limit, we might want to stop processing remaining stories
            # to avoid further rate limit errors
            logger.warning(f"Stopping batch processing due to rate limit. Processed {index + 1}/{len(batch_request.requests)} stories.")
            
            # Mark remaining stories as failed
            for remaining_index in range(index + 1, len(batch_request.requests)):
                failed_count += 1
                results.append(BatchStoryInsertionResult(
                    index=remaining_index,
                    success=False,
                    result=None,
                    error="Skipped due to rate limit on previous request"
                ))
            
            break  # Stop processing
            
        except APIError as e:
            # Handle API errors gracefully
            failed_count += 1
            error_msg = f"API error: {str(e)}"
            results.append(BatchStoryInsertionResult(
                index=index,
                success=False,
                result=None,
                error=error_msg
            ))
            logger.error(f"Story {index + 1} failed with API error: {error_msg}")
            
        except Exception as e:
            # Handle unexpected errors
            failed_count += 1
            error_msg = f"Unexpected error: {str(e)}"
            results.append(BatchStoryInsertionResult(
                index=index,
                success=False,
                result=None,
                error=error_msg
            ))
            logger.error(f"Story {index + 1} failed with exception: {error_msg}", exc_info=True)
    
    # Calculate total processing time
    total_time_ms = int((time.time() - start_time) * 1000)
    
    logger.info(f"Batch processing complete: {success_count} succeeded, {failed_count} failed")
    logger.info(f"Total time: {total_time_ms}ms ({total_time_ms/1000:.2f}s)")
    
    return BatchStoryInsertionResponse(
        total=len(batch_request.requests),
        success_count=success_count,
        failed_count=failed_count,
        results=results,
        total_time_ms=total_time_ms
    )



def _process_single_story(index: int, request: StoryInsertionRequest) -> BatchStoryInsertionResult:
    """
    Process a single story generation request (for parallel processing).
    
    Args:
        index: Index of the request in the batch
        request: Story insertion request
        
    Returns:
        BatchStoryInsertionResult with success/failure status
    """
    from openai import RateLimitError, APIError
    
    try:
        logger.debug(f"Processing story {index + 1}...")
        
        # Generate story with insertion
        result = generate_story_with_insertion(request)
        
        # Check if generation was successful
        if result.error and not result.enhanced_content:
            logger.error(f"Story {index + 1} failed: {result.error}")
            return BatchStoryInsertionResult(
                index=index,
                success=False,
                result=None,
                error=result.error
            )
        else:
            logger.debug(f"Story {index + 1} completed successfully")
            return BatchStoryInsertionResult(
                index=index,
                success=True,
                result=result,
                error=None
            )
            
    except RateLimitError as e:
        error_msg = f"Rate limit exceeded: {str(e)}"
        logger.warning(f"Story {index + 1} hit rate limit")
        return BatchStoryInsertionResult(
            index=index,
            success=False,
            result=None,
            error=error_msg
        )
        
    except APIError as e:
        error_msg = f"API error: {str(e)}"
        logger.error(f"Story {index + 1} failed with API error")
        return BatchStoryInsertionResult(
            index=index,
            success=False,
            result=None,
            error=error_msg
        )
        
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(f"Story {index + 1} failed with exception", exc_info=True)
        return BatchStoryInsertionResult(
            index=index,
            success=False,
            result=None,
            error=error_msg
        )


def generate_batch_stories_with_insertion_parallel(
    batch_request: BatchStoryInsertionRequest,
    max_workers: int = 3
) -> BatchStoryInsertionResponse:
    """
    Generate multiple stories with English word insertion in parallel.
    
    Uses ThreadPoolExecutor to process multiple stories concurrently,
    improving performance for batch operations. Limits concurrent workers
    to avoid overwhelming the Azure OpenAI API.
    
    Args:
        batch_request: BatchStoryInsertionRequest with list of story requests
        max_workers: Maximum number of concurrent workers (default: 3)
        
    Returns:
        BatchStoryInsertionResponse with results for each request
    """
    start_time = time.time()
    results = []
    success_count = 0
    failed_count = 0
    
    logger.info(f"Starting parallel batch processing of {len(batch_request.requests)} stories...")
    logger.info(f"Using {max_workers} concurrent workers")
    
    # Track performance metrics
    story_times = []
    
    # Use ThreadPoolExecutor for parallel processing
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_index = {
            executor.submit(_process_single_story, index, request): index
            for index, request in enumerate(batch_request.requests)
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_index):
            story_start = time.time()
            
            try:
                result = future.result()
                results.append(result)
                
                if result.success:
                    success_count += 1
                else:
                    failed_count += 1
                
                # Track processing time
                story_time = time.time() - story_start
                story_times.append(story_time)
                
            except Exception as e:
                index = future_to_index[future]
                failed_count += 1
                results.append(BatchStoryInsertionResult(
                    index=index,
                    success=False,
                    result=None,
                    error=f"Future execution error: {str(e)}"
                ))
    
    # Sort results by index to maintain order
    results.sort(key=lambda x: x.index)
    
    # Calculate total processing time
    total_time_ms = int((time.time() - start_time) * 1000)
    
    # Performance metrics
    if story_times:
        avg_time = sum(story_times) / len(story_times)
        min_time = min(story_times)
        max_time = max(story_times)
        logger.info(f"Performance metrics:")
        logger.info(f"  - Average story time: {avg_time:.2f}s")
        logger.info(f"  - Min story time: {min_time:.2f}s")
        logger.info(f"  - Max story time: {max_time:.2f}s")
    
    logger.info(f"Parallel batch processing complete: {success_count} succeeded, {failed_count} failed")
    logger.info(f"Total time: {total_time_ms}ms ({total_time_ms/1000:.2f}s)")
    
    return BatchStoryInsertionResponse(
        total=len(batch_request.requests),
        success_count=success_count,
        failed_count=failed_count,
        results=results,
        total_time_ms=total_time_ms
    )
