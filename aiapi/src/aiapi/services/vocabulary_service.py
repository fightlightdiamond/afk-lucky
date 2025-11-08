"""
Vocabulary service for managing English vocabulary with ChromaDB storage.
"""
import chromadb
from typing import List, Dict, Any, Optional
from ..models import VocabularyWord
from ..config import settings
from ..exceptions import VocabularyError, VocabularyNotFoundError, ChromaDBError, EmbeddingError
from ..logging_config import get_logger, PerformanceMonitor
from ..utils import handle_chromadb_error, safe_execute
from .chromadb_service import get_chroma_client, get_embedding

logger = get_logger(__name__)

# Lazy initialization
_vocabulary_collection = None

@handle_chromadb_error
def get_vocabulary_collection():
    """
    Get or create vocabulary collection in ChromaDB.
    
    Returns:
        ChromaDB collection for vocabulary
        
    Raises:
        ChromaDBError: If collection creation/retrieval fails
    """
    global _vocabulary_collection
    if _vocabulary_collection is None:
        try:
            logger.info("Initializing vocabulary collection...")
            client = get_chroma_client()
            _vocabulary_collection = client.get_or_create_collection(
                name=settings.vocabulary_collection_name,
                metadata={
                    "description": "English vocabulary with embeddings for semantic search",
                    "topics": "technology, business, education, daily life, travel",
                    "difficulty_levels": "beginner, intermediate, advanced"
                }
            )
            logger.info(f"Vocabulary collection initialized: {settings.vocabulary_collection_name}")
        except Exception as e:
            logger.error(f"Failed to initialize vocabulary collection: {e}")
            raise ChromaDBError(
                message=f"Failed to initialize vocabulary collection: {str(e)}",
                details={"collection_name": settings.vocabulary_collection_name}
            )
    return _vocabulary_collection

def initialize_vocabulary_database() -> bool:
    """
    Initialize vocabulary database by creating the collection.
    This ensures the collection exists and is ready for use.
    
    Returns:
        True if successful, False otherwise
    """
    try:
        collection = get_vocabulary_collection()
        count = collection.count()
        print(f"✅ Vocabulary database initialized with {count} words")
        return True
    except Exception as e:
        print(f"❌ Error initializing vocabulary database: {e}")
        return False

def add_vocabulary(
    word: str,
    definition: str,
    vietnamese_translation: str,
    part_of_speech: str,
    topic: str,
    difficulty: str,
    example: str,
    ipa: Optional[str] = None
) -> bool:
    """
    Add a vocabulary word to ChromaDB with embedding.
    
    Args:
        word: English word
        definition: English definition
        vietnamese_translation: Vietnamese translation
        part_of_speech: Part of speech (noun, verb, adjective, adverb, phrase)
        topic: Topic category
        difficulty: Difficulty level (beginner, intermediate, advanced)
        example: Example sentence
        ipa: IPA pronunciation notation (optional)
        
    Returns:
        True if successful, False otherwise
        
    Raises:
        VocabularyError: If vocabulary addition fails
        EmbeddingError: If embedding generation fails
    """
    try:
        logger.debug(f"Adding vocabulary word: {word} (topic={topic}, difficulty={difficulty})")
        
        with PerformanceMonitor(f"add_vocabulary_{word}"):
            # Create embedding text from word, definition, and example
            embedding_text = f"{topic}: {word} - {definition}. Example: {example}"
            embedding = get_embedding(embedding_text)
            
            if not embedding:
                logger.error(f"Failed to create embedding for word: {word}")
                raise EmbeddingError(
                    message=f"Failed to create embedding for word: {word}",
                    details={"word": word, "topic": topic}
                )
            
            # Prepare metadata
            metadata = {
                "word": word,
                "definition": definition,
                "vietnamese": vietnamese_translation,
                "pos": part_of_speech,
                "topic": topic,
                "difficulty": difficulty,
                "example": example,
            }
            
            if ipa:
                metadata["ipa"] = ipa
            
            # Create unique ID for the word
            word_id = f"vocab_{topic}_{difficulty}_{word.lower().replace(' ', '_')}"
            
            # Add to collection
            collection = get_vocabulary_collection()
            collection.add(
                embeddings=[embedding],
                documents=[embedding_text],
                ids=[word_id],
                metadatas=[metadata]
            )
            
            logger.info(f"Added vocabulary word: {word} ({topic}, {difficulty})")
            return True
        
    except (EmbeddingError, ChromaDBError):
        # Re-raise custom exceptions
        raise
    except Exception as e:
        logger.error(f"Error adding vocabulary word '{word}': {e}", exc_info=True)
        raise VocabularyError(
            message=f"Failed to add vocabulary word: {word}",
            details={"word": word, "error": str(e)}
        )

def get_vocabulary_by_topic(
    topic: str,
    difficulty: str,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """
    Get vocabulary words by topic and difficulty level.
    
    Args:
        topic: Topic category
        difficulty: Difficulty level
        limit: Maximum number of words to return
        
    Returns:
        List of vocabulary words with metadata
    """
    try:
        collection = get_vocabulary_collection()
        
        # Query with filters
        results = collection.get(
            where={
                "$and": [
                    {"topic": topic},
                    {"difficulty": difficulty}
                ]
            },
            limit=limit,
            include=["documents", "metadatas"]
        )
        
        # Format results
        vocabulary = []
        if results["ids"] and len(results["ids"]) > 0:
            for i in range(len(results["ids"])):
                vocab_item = {
                    "id": results["ids"][i],
                    "metadata": results["metadatas"][i]
                }
                vocabulary.append(vocab_item)
        
        print(f"✅ Retrieved {len(vocabulary)} words for topic '{topic}', difficulty '{difficulty}'")
        return vocabulary
        
    except Exception as e:
        print(f"❌ Error getting vocabulary by topic: {e}")
        return []

def search_vocabulary_semantic(
    query: str,
    n_results: int = 10,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Semantic search for vocabulary words using embeddings.
    
    Args:
        query: Search query
        n_results: Number of results to return
        topic: Optional topic filter
        difficulty: Optional difficulty filter
        
    Returns:
        List of vocabulary words with similarity scores
        
    Raises:
        VocabularyError: If search fails
        EmbeddingError: If query embedding generation fails
    """
    try:
        logger.debug(f"Searching vocabulary: query='{query}', n_results={n_results}, topic={topic}, difficulty={difficulty}")
        
        with PerformanceMonitor(f"search_vocabulary_semantic"):
            # Get query embedding
            query_embedding = get_embedding(query)
            if not query_embedding:
                logger.error("Failed to create query embedding")
                raise EmbeddingError(
                    message="Failed to create query embedding",
                    details={"query": query}
                )
            
            # Build filters
            where_filter = None
            if topic and difficulty:
                where_filter = {
                    "$and": [
                        {"topic": topic},
                        {"difficulty": difficulty}
                    ]
                }
            elif topic:
                where_filter = {"topic": topic}
            elif difficulty:
                where_filter = {"difficulty": difficulty}
            
            # Search in ChromaDB
            collection = get_vocabulary_collection()
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where_filter if where_filter else None,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results - flatten metadata for frontend
            vocabulary = []
            if results["ids"] and len(results["ids"][0]) > 0:
                for i in range(len(results["ids"][0])):
                    metadata = results["metadatas"][0][i]
                    similarity = 1 - results["distances"][0][i] if "distances" in results else None
                    
                    # Flatten metadata into the main object
                    # Map backend field names to frontend expected names
                    vocab_item = {
                        "word": metadata.get("word", ""),
                        "definition": metadata.get("definition", ""),
                        "vietnamese_translation": metadata.get("vietnamese", ""),  # Backend uses "vietnamese"
                        "part_of_speech": metadata.get("pos", ""),  # Backend uses "pos"
                        "topic": metadata.get("topic", ""),
                        "difficulty": metadata.get("difficulty", ""),
                        "example": metadata.get("example", ""),
                        "ipa": metadata.get("ipa"),
                        "similarity": similarity
                    }
                    vocabulary.append(vocab_item)
            
            logger.info(f"Found {len(vocabulary)} vocabulary words for query: '{query}'")
            return vocabulary
        
    except (EmbeddingError, ChromaDBError):
        # Re-raise custom exceptions
        raise
    except Exception as e:
        logger.error(f"Error searching vocabulary: {e}", exc_info=True)
        raise VocabularyError(
            message=f"Failed to search vocabulary: {str(e)}",
            details={"query": query, "error": str(e)}
        )

def batch_add_vocabulary(words: List[VocabularyWord]) -> Dict[str, Any]:
    """
    Add multiple vocabulary words in batch.
    
    Args:
        words: List of VocabularyWord objects
        
    Returns:
        Dictionary with success/failure counts and errors
    """
    success_count = 0
    failed_count = 0
    errors = []
    
    for word in words:
        try:
            success = add_vocabulary(
                word=word.word,
                definition=word.definition,
                vietnamese_translation=word.vietnamese_translation,
                part_of_speech=word.part_of_speech,
                topic=word.topic,
                difficulty=word.difficulty,
                example=word.example,
                ipa=word.ipa
            )
            
            if success:
                success_count += 1
            else:
                failed_count += 1
                errors.append(f"Failed to add word: {word.word}")
                
        except Exception as e:
            failed_count += 1
            errors.append(f"Error adding word '{word.word}': {str(e)}")
    
    return {
        "success_count": success_count,
        "failed_count": failed_count,
        "errors": errors
    }

def get_vocabulary_stats() -> Dict[str, Any]:
    """
    Get statistics about the vocabulary collection.
    
    Returns:
        Collection statistics including total words, topics, and difficulty distribution
    """
    try:
        collection = get_vocabulary_collection()
        total_count = collection.count()
        
        return {
            "total_words": total_count,
            "collection_name": collection.name,
            "metadata": collection.metadata
        }
    except Exception as e:
        print(f"❌ Error getting vocabulary stats: {e}")
        return {"error": str(e)}

def delete_vocabulary(word_id: str) -> bool:
    """
    Delete a vocabulary word from ChromaDB.
    
    Args:
        word_id: Vocabulary word ID
        
    Returns:
        True if successful
    """
    try:
        collection = get_vocabulary_collection()
        collection.delete(ids=[word_id])
        print(f"✅ Deleted vocabulary word: {word_id}")
        return True
    except Exception as e:
        print(f"❌ Error deleting vocabulary word: {e}")
        return False
