"""
Word insertion service for intelligently inserting English words into Vietnamese stories.
"""
import re
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI
from tenacity import retry, wait_random_exponential, stop_after_attempt, retry_if_exception_type
from openai import RateLimitError, APIError

from ..config import settings
from ..models import InsertionPosition, VocabularyWord
from ..exceptions import (
    WordInsertionError,
    PositionDetectionError,
    GrammarValidationError,
    VocabularyNotFoundError,
    AzureOpenAIError
)
from ..logging_config import get_logger, PerformanceMonitor, LogContext
from ..utils import handle_azure_openai_error, retry_on_api_error, safe_execute
from .vocabulary_service import get_vocabulary_by_topic, search_vocabulary_semantic
from .chromadb_service import get_embedding

logger = get_logger(__name__)

# OpenAI client configuration
client = OpenAI(
    base_url=settings.azure_endpoint,
    api_key=settings.azure_api_key
)


@retry(
    retry=retry_if_exception_type((RateLimitError, APIError)),
    wait=wait_random_exponential(
        min=settings.retry_min_wait_seconds,
        max=settings.retry_max_wait_seconds
    ),
    stop=stop_after_attempt(settings.retry_max_attempts),
    reraise=True
)
@handle_azure_openai_error
def analyze_sentence_structure(sentence: str) -> List[InsertionPosition]:
    """
    Analyze Vietnamese sentence to find natural insertion positions for English words.
    
    Uses Azure OpenAI to identify noun phrases, verb phrases, and adjective positions
    where English words can be inserted naturally without breaking grammar.
    
    Args:
        sentence: Vietnamese sentence to analyze
        
    Returns:
        List of InsertionPosition objects with scores and context
        
    Raises:
        PositionDetectionError: If position detection fails
        AzureOpenAIError: If Azure OpenAI API call fails
    """
    try:
        logger.debug(f"Analyzing sentence structure: {sentence[:50]}...")
        
        with PerformanceMonitor("analyze_sentence_structure"):
            # Create prompt for grammar analysis
            prompt = f"""Analyze this Vietnamese sentence and identify positions where English words can be naturally inserted.

Sentence: "{sentence}"

For each position, identify:
1. The word index (position in the sentence, 0-based)
2. The type of position (noun, verb, adjective, or phrase)
3. A quality score (0.0 to 1.0) based on:
   - Grammatical correctness after insertion
   - Readability impact
   - Context appropriateness
4. The context (surrounding words)

Return at least 3 positions with score > 0.7. Format as JSON array:
[
  {{
    "word_index": 2,
    "position_type": "noun",
    "score": 0.85,
    "context": "surrounding words"
  }}
]

Only return the JSON array, no other text."""

            response = client.chat.completions.create(
                model=settings.azure_deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a Vietnamese grammar expert. Analyze sentences and identify natural positions for English word insertion."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=800,
                temperature=0.3
            )
            
            # Parse response
            content = response.choices[0].message.content.strip()
            
            # Extract JSON from response (handle markdown code blocks)
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            positions_data = json.loads(content)
            
            # Convert to InsertionPosition objects
            positions = []
            for idx, pos_data in enumerate(positions_data):
                position = InsertionPosition(
                    sentence_index=0,  # Will be set by caller
                    word_index=pos_data.get("word_index", 0),
                    position_type=pos_data.get("position_type", "noun"),
                    score=pos_data.get("score", 0.7),
                    context=pos_data.get("context", "")
                )
                positions.append(position)
            
            # Filter positions with score > min_position_score
            positions = [p for p in positions if p.score >= settings.min_position_score]
            
            logger.info(f"Found {len(positions)} insertion positions for sentence")
            return positions
        
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON response: {e}")
        logger.debug(f"Response content: {content}")
        raise PositionDetectionError(
            message="Failed to parse position detection response",
            details={"error": str(e), "response": content[:200]}
        )
    except (RateLimitError, APIError, AzureOpenAIError):
        # Re-raise API errors (already handled by decorator)
        raise
    except Exception as e:
        logger.error(f"Error analyzing sentence structure: {e}", exc_info=True)
        raise PositionDetectionError(
            message=f"Failed to analyze sentence structure: {str(e)}",
            details={"sentence": sentence[:100], "error": str(e)}
        )


def analyze_story_structure(story: str) -> List[InsertionPosition]:
    """
    Analyze entire story to find insertion positions across all sentences.
    
    Args:
        story: Complete story text
        
    Returns:
        List of InsertionPosition objects for the entire story
    """
    # Split story into sentences
    sentences = re.split(r'[.!?]+', story)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    all_positions = []
    
    for sentence_idx, sentence in enumerate(sentences):
        # Skip very short sentences
        if len(sentence.split()) < 5:
            continue
        
        # Analyze each sentence
        positions = analyze_sentence_structure(sentence)
        
        # Update sentence index
        for position in positions:
            position.sentence_index = sentence_idx
        
        all_positions.extend(positions)
    
    print(f"✅ Analyzed {len(sentences)} sentences, found {len(all_positions)} total positions")
    return all_positions



def calculate_relevance_score(word_embedding: List[float], context_embedding: List[float]) -> float:
    """
    Calculate relevance score between a word and context using cosine similarity.
    
    Args:
        word_embedding: Embedding vector for the vocabulary word
        context_embedding: Embedding vector for the story context
        
    Returns:
        Relevance score between 0.0 and 1.0
    """
    try:
        # Calculate cosine similarity
        import numpy as np
        
        word_vec = np.array(word_embedding)
        context_vec = np.array(context_embedding)
        
        # Normalize vectors
        word_norm = np.linalg.norm(word_vec)
        context_norm = np.linalg.norm(context_vec)
        
        if word_norm == 0 or context_norm == 0:
            return 0.0
        
        # Cosine similarity
        similarity = np.dot(word_vec, context_vec) / (word_norm * context_norm)
        
        # Convert to 0-1 range (cosine similarity is -1 to 1)
        relevance_score = (similarity + 1) / 2
        
        return float(relevance_score)
        
    except Exception as e:
        print(f"⚠️ Error calculating relevance score: {e}")
        return 0.5  # Default middle score on error


def select_vocabulary_for_insertion(
    topic: str,
    difficulty: str,
    count: int,
    context: str,
    position_type: Optional[str] = None,
    min_relevance: float = 0.8
) -> List[VocabularyWord]:
    """
    Select appropriate vocabulary words for insertion based on context and requirements.
    
    Uses semantic search to find contextually relevant words, then scores them
    based on relevance to the story context. Filters out words with relevance < min_relevance
    and provides fallback vocabulary selection if needed.
    
    Args:
        topic: Vocabulary topic (e.g., "technology", "business")
        difficulty: Difficulty level ("beginner", "intermediate", "advanced")
        count: Number of words to select
        context: Story context for relevance scoring
        position_type: Optional filter by position type (noun, verb, adjective)
        min_relevance: Minimum relevance score threshold (default 0.8)
        
    Returns:
        List of VocabularyWord objects selected for insertion
    """
    try:
        # Get context embedding for relevance scoring
        context_embedding = get_embedding(context)
        
        # First, try semantic search with context
        candidate_words = search_vocabulary_semantic(
            query=context,
            n_results=count * 4,  # Get more candidates for filtering
            topic=topic,
            difficulty=difficulty
        )
        
        print(f"📊 Found {len(candidate_words)} candidate words from semantic search")
        
        # If not enough candidates, get by topic/difficulty
        if len(candidate_words) < count * 2:
            topic_words = get_vocabulary_by_topic(
                topic=topic,
                difficulty=difficulty,
                limit=count * 3
            )
            # Merge with semantic results
            existing_ids = {w["id"] for w in candidate_words}
            for word in topic_words:
                if word["id"] not in existing_ids:
                    candidate_words.append(word)
            
            print(f"📊 Added {len(topic_words)} words from topic search, total: {len(candidate_words)}")
        
        # Filter by position type if specified
        if position_type:
            candidate_words = [
                w for w in candidate_words
                if w["metadata"].get("pos") == position_type
            ]
            print(f"📊 Filtered to {len(candidate_words)} words matching position type: {position_type}")
        
        # Score words based on context relevance using embeddings
        scored_words = []
        
        for word_data in candidate_words:
            metadata = word_data["metadata"]
            
            # Get word embedding if available, otherwise calculate
            word_embedding = word_data.get("embedding")
            if not word_embedding:
                # Generate embedding for word + definition
                word_text = f"{metadata['word']}: {metadata['definition']}"
                word_embedding = get_embedding(word_text)
            
            # Calculate relevance score using cosine similarity
            relevance_score = calculate_relevance_score(word_embedding, context_embedding)
            
            # Also consider the similarity score from semantic search if available
            search_similarity = word_data.get("similarity_score", 0.0)
            
            # Combine both scores (weighted average: 70% embedding similarity, 30% search similarity)
            if search_similarity > 0:
                final_score = 0.7 * relevance_score + 0.3 * search_similarity
            else:
                final_score = relevance_score
            
            # Create VocabularyWord object
            vocab_word = VocabularyWord(
                word=metadata["word"],
                definition=metadata["definition"],
                vietnamese_translation=metadata["vietnamese"],
                part_of_speech=metadata["pos"],
                topic=metadata["topic"],
                difficulty=metadata["difficulty"],
                example=metadata["example"],
                ipa=metadata.get("ipa")
            )
            
            scored_words.append({
                "word": vocab_word,
                "score": final_score
            })
        
        # Sort by score (highest first)
        scored_words.sort(key=lambda x: x["score"], reverse=True)
        
        # Filter words with relevance >= min_relevance
        high_relevance_words = [
            item["word"] for item in scored_words
            if item["score"] >= min_relevance
        ]
        
        print(f"✅ Found {len(high_relevance_words)} words with relevance >= {min_relevance}")
        
        # Select top N high-relevance words
        selected_words = high_relevance_words[:count]
        
        # Fallback: If not enough high-relevance words, use lower threshold
        if len(selected_words) < count:
            print(f"⚠️ Only {len(selected_words)} words meet min_relevance={min_relevance}")
            print(f"🔄 Applying fallback: using words with relevance >= 0.7")
            
            # Fallback to 0.7 threshold
            fallback_words = [
                item["word"] for item in scored_words
                if item["score"] >= 0.7 and item["word"] not in selected_words
            ]
            
            remaining = count - len(selected_words)
            selected_words.extend(fallback_words[:remaining])
            
            print(f"✅ After fallback: {len(selected_words)} words selected")
        
        # Final fallback: If still not enough, take the best available
        if len(selected_words) < count and scored_words:
            print(f"⚠️ Still only {len(selected_words)} words after fallback")
            print(f"🔄 Final fallback: using best available words")
            
            remaining = count - len(selected_words)
            existing_words = {w.word for w in selected_words}
            additional = [
                item["word"] for item in scored_words
                if item["word"].word not in existing_words
            ][:remaining]
            
            selected_words.extend(additional)
            
            print(f"✅ Final selection: {len(selected_words)} words")
        
        # Log relevance scores for selected words
        if selected_words:
            selected_scores = [
                item["score"] for item in scored_words
                if item["word"] in selected_words
            ]
            if selected_scores:
                avg_score = sum(selected_scores) / len(selected_scores)
                min_score = min(selected_scores)
                max_score = max(selected_scores)
                print(f"📊 Relevance scores - Avg: {avg_score:.3f}, Min: {min_score:.3f}, Max: {max_score:.3f}")
        
        return selected_words
        
    except Exception as e:
        print(f"❌ Error selecting vocabulary: {e}")
        import traceback
        traceback.print_exc()
        return []



def insert_words_into_story(
    story: str,
    vocabulary: List[VocabularyWord],
    positions: List[InsertionPosition],
    bold_format: bool = True,
    show_translation: bool = True
) -> str:
    """
    Insert English words into story at specified positions.
    
    Formats inserted words in bold markdown syntax and adds Vietnamese translation
    in parentheses. Maintains sentence readability by carefully placing insertions.
    
    Args:
        story: Original story text
        vocabulary: List of vocabulary words to insert
        positions: List of insertion positions
        bold_format: Whether to format inserted words in bold
        show_translation: Whether to show Vietnamese translation
        
    Returns:
        Enhanced story with English word insertions
    """
    try:
        # Split story into sentences
        sentences = re.split(r'([.!?]+)', story)
        sentence_texts = []
        sentence_delimiters = []
        
        for i, part in enumerate(sentences):
            if i % 2 == 0:
                sentence_texts.append(part.strip())
            else:
                sentence_delimiters.append(part)
        
        # Remove empty sentences
        sentence_texts = [s for s in sentence_texts if s]
        
        # Group positions by sentence
        positions_by_sentence = {}
        for position in positions:
            if position.sentence_index not in positions_by_sentence:
                positions_by_sentence[position.sentence_index] = []
            positions_by_sentence[position.sentence_index].append(position)
        
        # Sort positions within each sentence by word_index (descending to insert from end)
        for sentence_idx in positions_by_sentence:
            positions_by_sentence[sentence_idx].sort(
                key=lambda p: p.word_index,
                reverse=True
            )
        
        # Insert words into sentences
        vocab_idx = 0
        for sentence_idx, sentence in enumerate(sentence_texts):
            if sentence_idx not in positions_by_sentence or vocab_idx >= len(vocabulary):
                continue
            
            words = sentence.split()
            sentence_positions = positions_by_sentence[sentence_idx]
            
            for position in sentence_positions:
                if vocab_idx >= len(vocabulary):
                    break
                
                vocab_word = vocabulary[vocab_idx]
                vocab_idx += 1
                
                # Create insertion text
                english_word = vocab_word.word
                if bold_format:
                    english_word = f"**{english_word}**"
                
                if show_translation:
                    insertion_text = f"{english_word} ({vocab_word.vietnamese_translation})"
                else:
                    insertion_text = english_word
                
                # Insert at position
                word_idx = min(position.word_index, len(words))
                if word_idx < len(words):
                    # Insert after the word at word_idx
                    words[word_idx] = f"{words[word_idx]} {insertion_text}"
                else:
                    # Append to end if position is beyond sentence length
                    words.append(insertion_text)
            
            # Reconstruct sentence
            sentence_texts[sentence_idx] = " ".join(words)
        
        # Reconstruct story
        enhanced_story = ""
        for i, sentence in enumerate(sentence_texts):
            enhanced_story += sentence
            if i < len(sentence_delimiters):
                enhanced_story += sentence_delimiters[i] + " "
            elif i < len(sentence_texts) - 1:
                enhanced_story += ". "
        
        print(f"✅ Inserted {vocab_idx} words into story")
        return enhanced_story.strip()
        
    except Exception as e:
        print(f"❌ Error inserting words into story: {e}")
        return story  # Return original story on error



def generate_glossary(inserted_words: List[VocabularyWord]) -> List[Dict[str, str]]:
    """
    Generate a glossary for inserted vocabulary words.
    
    Creates a structured glossary with word, translation, part of speech,
    definition, pronunciation, and example sentence for each inserted word.
    
    Args:
        inserted_words: List of VocabularyWord objects that were inserted
        
    Returns:
        List of glossary entries as dictionaries
    """
    try:
        glossary = []
        
        for vocab_word in inserted_words:
            entry = {
                "word": vocab_word.word,
                "vietnamese": vocab_word.vietnamese_translation,
                "part_of_speech": vocab_word.part_of_speech,
                "definition": vocab_word.definition,
                "example": vocab_word.example
            }
            
            # Add IPA pronunciation if available
            if vocab_word.ipa:
                entry["pronunciation"] = vocab_word.ipa
            
            glossary.append(entry)
        
        print(f"✅ Generated glossary with {len(glossary)} entries")
        return glossary
        
    except Exception as e:
        print(f"❌ Error generating glossary: {e}")
        return []


@retry(
    retry=retry_if_exception_type((RateLimitError, APIError)),
    wait=wait_random_exponential(
        min=settings.retry_min_wait_seconds,
        max=settings.retry_max_wait_seconds
    ),
    stop=stop_after_attempt(settings.retry_max_attempts),
    reraise=True
)
def validate_grammar_after_insertion(
    enhanced_story: str,
    original_story: str
) -> Dict[str, Any]:
    """
    Validate Vietnamese grammar after English word insertion.
    
    Uses Azure OpenAI to check if the inserted English words break Vietnamese
    grammar rules. Identifies problematic sentences and suggests adjustments.
    
    Args:
        enhanced_story: Story with English word insertions
        original_story: Original story without insertions
        
    Returns:
        Dictionary with validation results:
        - is_valid: bool indicating if grammar is correct
        - issues: List of grammar issues found
        - problematic_sentences: List of sentence indices with issues
        - suggestions: List of suggestions for fixing issues
    """
    try:
        print("🔍 Validating Vietnamese grammar after insertion...")
        
        # Create prompt for grammar validation
        prompt = f"""Analyze the Vietnamese grammar in this story that has English words inserted.

Original story (Vietnamese only):
"{original_story[:500]}..."

Enhanced story (with English insertions):
"{enhanced_story[:500]}..."

Check if the English word insertions break Vietnamese grammar rules. Focus on:
1. Word order and sentence structure
2. Grammatical agreement
3. Natural flow and readability
4. Proper placement of English words

Return a JSON object with:
{{
  "is_valid": true/false,
  "overall_score": 0.0-1.0,
  "issues": [
    {{
      "sentence_index": 0,
      "issue_type": "word_order|agreement|flow|placement",
      "description": "Description of the issue",
      "severity": "low|medium|high"
    }}
  ],
  "suggestions": [
    "Suggestion for fixing issues"
  ]
}}

If grammar is correct, return is_valid: true with empty issues array.
Only return the JSON object, no other text."""

        response = client.chat.completions.create(
            model=settings.azure_deployment_name,
            messages=[
                {
                    "role": "system",
                    "content": "You are a Vietnamese grammar expert. Analyze text for grammatical correctness, especially when English words are mixed in."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1000,
            temperature=0.2
        )
        
        # Parse response
        content = response.choices[0].message.content.strip()
        
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        validation_result = json.loads(content)
        
        # Ensure required fields exist
        if "is_valid" not in validation_result:
            validation_result["is_valid"] = True
        if "issues" not in validation_result:
            validation_result["issues"] = []
        if "suggestions" not in validation_result:
            validation_result["suggestions"] = []
        if "overall_score" not in validation_result:
            validation_result["overall_score"] = 1.0 if validation_result["is_valid"] else 0.7
        
        # Extract problematic sentence indices
        problematic_sentences = [
            issue["sentence_index"] 
            for issue in validation_result.get("issues", [])
            if "sentence_index" in issue
        ]
        validation_result["problematic_sentences"] = list(set(problematic_sentences))
        
        # Log results
        if validation_result["is_valid"]:
            print(f"✅ Grammar validation passed (score: {validation_result['overall_score']:.2f})")
        else:
            print(f"⚠️ Grammar issues found: {len(validation_result['issues'])} issues")
            for issue in validation_result["issues"]:
                severity = issue.get("severity", "unknown")
                print(f"   - [{severity}] {issue.get('description', 'No description')}")
        
        return validation_result
        
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing grammar validation JSON: {e}")
        print(f"Response content: {content}")
        # Return default valid result on parse error
        return {
            "is_valid": True,
            "overall_score": 0.8,
            "issues": [],
            "suggestions": [],
            "problematic_sentences": []
        }
    except Exception as e:
        print(f"❌ Error validating grammar: {e}")
        import traceback
        traceback.print_exc()
        # Return default valid result on error
        return {
            "is_valid": True,
            "overall_score": 0.8,
            "issues": [],
            "suggestions": [],
            "problematic_sentences": []
        }


def adjust_insertion_positions_for_grammar(
    positions: List[InsertionPosition],
    problematic_sentences: List[int]
) -> List[InsertionPosition]:
    """
    Adjust insertion positions to avoid problematic sentences.
    
    Filters out positions in sentences that have grammar issues,
    and adjusts scores for positions near problematic areas.
    
    Args:
        positions: Original list of insertion positions
        problematic_sentences: List of sentence indices with grammar issues
        
    Returns:
        Adjusted list of insertion positions
    """
    try:
        if not problematic_sentences:
            print("✅ No problematic sentences, keeping all positions")
            return positions
        
        print(f"🔧 Adjusting positions to avoid {len(problematic_sentences)} problematic sentences")
        
        # Filter out positions in problematic sentences
        adjusted_positions = []
        removed_count = 0
        
        for position in positions:
            if position.sentence_index in problematic_sentences:
                # Skip this position
                removed_count += 1
                continue
            
            # Check if position is adjacent to problematic sentence
            is_adjacent = any(
                abs(position.sentence_index - prob_idx) == 1
                for prob_idx in problematic_sentences
            )
            
            if is_adjacent:
                # Reduce score for adjacent positions
                adjusted_position = InsertionPosition(
                    sentence_index=position.sentence_index,
                    word_index=position.word_index,
                    position_type=position.position_type,
                    score=position.score * 0.8,  # Reduce score by 20%
                    context=position.context
                )
                adjusted_positions.append(adjusted_position)
            else:
                # Keep position as is
                adjusted_positions.append(position)
        
        print(f"✅ Removed {removed_count} positions from problematic sentences")
        print(f"✅ Kept {len(adjusted_positions)} positions")
        
        # Re-sort by score
        adjusted_positions.sort(key=lambda p: p.score, reverse=True)
        
        return adjusted_positions
        
    except Exception as e:
        print(f"❌ Error adjusting insertion positions: {e}")
        # Return original positions on error
        return positions
