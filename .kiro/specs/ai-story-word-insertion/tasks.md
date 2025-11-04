# Implementation Plan

## Overview

Implementation plan cho AI Story with English Word Insertion feature. Tasks được chia thành các bước incremental, mỗi bước build trên bước trước và tích hợp vào hệ thống hiện có.

## Tasks

- [x] 1. Setup vocabulary data models and ChromaDB collection

  - Create VocabularyWord, InsertionPosition, InsertionConfig Pydantic models in `aiapi/src/aiapi/models.py`
  - Add vocabulary-specific settings to `aiapi/src/aiapi/config.py`
  - Create vocabulary ChromaDB collection initialization in vocabulary service
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement Vocabulary Service

  - [x] 2.1 Create vocabulary_service.py with basic CRUD operations

    - Implement `add_vocabulary()` function to add words to ChromaDB
    - Implement `get_vocabulary_by_topic()` to retrieve words by topic and difficulty
    - Implement embedding generation for vocabulary using existing ChromaDB service
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 2.2 Implement semantic vocabulary search

    - Create `search_vocabulary_semantic()` function using ChromaDB vector search
    - Reuse existing `get_embedding()` from chromadb_service
    - Return vocabulary with similarity scores
    - _Requirements: 1.5, 5.1, 5.2_

  - [x] 2.3 Create vocabulary initialization script
    - Create sample vocabulary data (50-100 words) covering topics: technology, business, education, daily life
    - Implement `initialize_vocabulary_database()` function
    - Add vocabulary data in JSON format for easy import
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Implement Word Insertion Service

  - [x] 3.1 Create position detection logic

    - Implement `analyze_sentence_structure()` using Azure OpenAI
    - Create prompt template for grammar analysis
    - Parse response to extract insertion positions with scores
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 Implement word selection algorithm

    - Create `select_vocabulary_for_insertion()` function
    - Use vocabulary service to get candidate words
    - Score words based on context relevance using embeddings
    - Select top N words with score > 0.7
    - _Requirements: 4.2, 4.3, 3.4_

  - [x] 3.3 Implement word insertion logic

    - Create `insert_words_into_story()` function
    - Format inserted words in bold markdown syntax
    - Add Vietnamese translation in parentheses
    - Maintain sentence readability
    - _Requirements: 4.1, 4.4, 4.5_

  - [x] 3.4 Create glossary generation
    - Implement `generate_glossary()` function
    - Include word, translation, part of speech, example
    - Format glossary as structured data
    - _Requirements: 7.1, 7.2, 7.4_

- [x] 4. Implement Story Enhancement Service

  - [x] 4.1 Create story generation with insertion

    - Implement `generate_story_with_insertion()` function
    - Integrate with existing story_service for base story generation
    - Call word_insertion_service to enhance story
    - Generate glossary for inserted words
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 4.2 Implement metrics calculation

    - Create `calculate_insertion_metrics()` function
    - Calculate insertion density, avg position score
    - Reuse existing readability and language ratio calculations
    - _Requirements: 10.1, 10.5, 6.4_

  - [x] 4.3 Add ChromaDB storage for enhanced stories
    - Extend story metadata with insertion information
    - Save enhanced stories with embeddings
    - Update existing `add_story_to_chromadb()` to support insertion metadata
    - _Requirements: 2.3, 6.5_

- [x] 5. Create API endpoints and routers

  - [x] 5.1 Create word_insertion router

    - Create `aiapi/src/aiapi/routers/word_insertion.py`
    - Implement POST `/api/v1/generate-story-with-insertion` endpoint
    - Implement POST `/api/v1/enhance-story` endpoint
    - Add request/response models for endpoints
    - _Requirements: 8.1, 8.4_

  - [x] 5.2 Create vocabulary management endpoints

    - Implement GET `/api/v1/vocabulary/{topic}/{difficulty}` endpoint
    - Implement POST `/api/v1/vocabulary/search` endpoint
    - Implement POST `/api/v1/vocabulary/batch-add` endpoint
    - _Requirements: 1.4, 8.1_

  - [x] 5.3 Integrate routers with main app
    - Add word_insertion router to `aiapi/src/aiapi/main.py`
    - Ensure CORS configuration includes new endpoints
    - Add router to API documentation
    - _Requirements: 8.2, 8.5_

- [x] 6. Implement batch processing

  - [x] 6.1 Add batch story generation endpoint

    - Create BatchStoryInsertionRequest model
    - Implement batch processing with error handling
    - Return partial results on failures
    - _Requirements: 9.1, 9.4_

  - [x] 6.2 Add retry logic and rate limiting

    - Implement exponential backoff for Azure OpenAI calls
    - Add rate limiting middleware
    - Handle API quota errors gracefully
    - _Requirements: 9.2, 9.5_

  - [x] 6.3 Optimize batch performance
    - Implement parallel processing for independent operations
    - Batch embedding generation
    - Add performance monitoring
    - _Requirements: 9.3_

- [x] 7. Implement quality assurance features

  - [x] 7.1 Add readability validation

    - Implement readability score calculation
    - Add regeneration logic for low-quality stories
    - Set minimum readability threshold to 60
    - _Requirements: 10.1, 10.2_

  - [x] 7.2 Add context relevance checking

    - Implement relevance scoring for inserted words
    - Filter out words with relevance < 0.8
    - Add fallback vocabulary selection
    - _Requirements: 10.3_

  - [x] 7.3 Add grammar validation
    - Validate Vietnamese grammar after insertion
    - Use Azure OpenAI for grammar checking
    - Adjust insertion positions if grammar issues detected
    - _Requirements: 10.4_

- [x] 8. Create test data and fixtures

  - Create sample vocabulary JSON file with 100 words
  - Create sample Vietnamese stories for testing
  - Create test fixtures for unit tests
  - _Requirements: All_

- [x] 9. Add error handling and logging

  - Implement comprehensive error handling for all services
  - Add logging for debugging and monitoring
  - Create error response models
  - Handle Azure OpenAI API errors with retry logic
  - _Requirements: 8.1, 9.2_

- [x] 10. Create initialization and setup scripts

  - [x] 10.1 Create vocabulary initialization script

    - Create `aiapi/scripts/init_vocabulary.py`
    - Load sample vocabulary data
    - Initialize ChromaDB vocabulary collection
    - _Requirements: 1.1, 1.5_

  - [x] 10.2 Create vocabulary import script

    - Create `aiapi/scripts/import_vocabulary.py`
    - Support CSV and JSON import formats
    - Validate vocabulary data before import
    - _Requirements: 2.4_

  - [x] 10.3 Update setup documentation
    - Add setup instructions to README
    - Document environment variables
    - Add usage examples
    - _Requirements: 8.1_

- [x] 11. Write unit tests

  - [x] 11.1 Test vocabulary service

    - Test vocabulary CRUD operations
    - Test semantic search functionality
    - Test embedding generation
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 11.2 Test word insertion service

    - Test position detection algorithm
    - Test word selection logic
    - Test insertion formatting
    - Test glossary generation
    - _Requirements: 3.1, 3.2, 4.1, 7.1_

  - [x] 11.3 Test story enhancement service

    - Test story generation with insertion
    - Test metrics calculation
    - Test ChromaDB integration
    - _Requirements: 6.1, 6.4, 6.5_

  - [x] 11.4 Test API endpoints
    - Test all endpoints with valid requests
    - Test error handling
    - Test batch processing
    - _Requirements: 8.1, 9.1_

- [x] 12. Create integration tests

  - [x] 12.1 Test end-to-end story generation

    - Test complete flow from request to response
    - Verify story quality and insertions
    - Test with different configurations
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 12.2 Test ChromaDB integration
    - Test vocabulary storage and retrieval
    - Test story search with insertion filters
    - Test embedding generation and search
    - _Requirements: 1.5, 2.3, 5.1_

- [ ]\* 13. Performance testing and optimization

  - [ ]\* 13.1 Measure and optimize performance

    - Test story generation time (target < 5s)
    - Test vocabulary search time (target < 100ms)
    - Test batch processing time (target < 30s for 10 stories)
    - _Requirements: 9.3, 5.3_

  - [ ]\* 13.2 Implement caching
    - Add vocabulary cache
    - Add embedding cache
    - Add position analysis cache
    - _Requirements: 9.3_

- [ ]\* 14. Documentation

  - [ ]\* 14.1 Create API documentation

    - Document all endpoints with examples
    - Add request/response schemas
    - Include error codes and messages
    - _Requirements: 8.1_

  - [ ]\* 14.2 Create user guide

    - Write usage examples
    - Document configuration options
    - Add troubleshooting section
    - _Requirements: All_

  - [ ]\* 14.3 Create developer guide
    - Document architecture and design decisions
    - Add code examples for extending functionality
    - Document testing procedures
    - _Requirements: All_
