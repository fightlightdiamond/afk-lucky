# Requirements Document

## Introduction

Hệ thống AI Story with English Word Insertion (Truyện chêm từ tiếng Anh) là một ứng dụng học tiếng Anh thông qua việc tự động chêm từ vựng tiếng Anh vào truyện tiếng Việt. Hệ thống sử dụng AI để phân tích ngữ pháp, xác định vị trí chêm tự nhiên, và tạo embedding cho semantic search. Hệ thống được xây dựng dựa trên codebase hiện có với aiapi (FastAPI backend), ChromaDB (vector database), và Azure OpenAI.

## Glossary

- **System**: Hệ thống AI Story with English Word Insertion
- **ChromaDB**: Vector database để lưu trữ embeddings và semantic search
- **Embedding**: Vector representation của text để semantic search
- **Azure_OpenAI**: Azure OpenAI service để tạo embeddings và LLM
- **Vocabulary_Database**: Cơ sở dữ liệu từ vựng tiếng Anh theo chủ đề và trình độ
- **Story_Content**: Nội dung truyện tiếng Việt có chêm từ tiếng Anh
- **Insertion_Position**: Vị trí trong câu để chêm từ tiếng Anh một cách tự nhiên
- **NLP_Service**: Service phân tích ngữ pháp để xác định vị trí chêm
- **Semantic_Search**: Tìm kiếm dựa trên ý nghĩa sử dụng vector embeddings
- **User**: Người dùng cuối sử dụng hệ thống để học tiếng Anh

## Requirements

### Requirement 1: Vocabulary Database Management

**User Story:** As a User, I want the system to have a structured vocabulary database, so that I can learn English words organized by topic and difficulty level.

#### Acceptance Criteria

1. THE System SHALL store English vocabulary with metadata including word, definition, part of speech, topic, and difficulty level
2. THE System SHALL support vocabulary topics including technology, business, education, daily life, and travel
3. THE System SHALL categorize vocabulary into difficulty levels including beginner, intermediate, and advanced
4. THE System SHALL provide an API endpoint to retrieve vocabulary by topic and difficulty level
5. THE System SHALL store vocabulary data in ChromaDB with embeddings for semantic search

### Requirement 2: Story Data Preparation and Storage

**User Story:** As a User, I want the system to store Vietnamese stories with embeddings, so that I can search for relevant stories semantically.

#### Acceptance Criteria

1. THE System SHALL accept Vietnamese story text in plain text format
2. WHEN a story is added, THE System SHALL generate embeddings using Azure OpenAI text-embedding-3-small model
3. THE System SHALL store story embeddings in ChromaDB with metadata including title, content, word count, and creation date
4. THE System SHALL support batch import of stories from CSV or JSON files
5. THE System SHALL provide an API endpoint to add individual stories to the database

### Requirement 3: Grammar Analysis and Insertion Position Detection

**User Story:** As a User, I want the system to intelligently identify natural positions in Vietnamese sentences to insert English words, so that the story remains readable and educational.

#### Acceptance Criteria

1. THE System SHALL analyze Vietnamese sentences to identify noun phrases, verb phrases, and adjective positions
2. WHEN analyzing a sentence, THE System SHALL identify at least 3 potential insertion positions per sentence
3. THE System SHALL prioritize insertion positions that maintain sentence readability with a minimum readability score of 70
4. THE System SHALL use Azure OpenAI to analyze sentence structure and suggest insertion positions
5. THE System SHALL avoid inserting English words in positions that break Vietnamese grammar rules

### Requirement 4: Intelligent English Word Insertion

**User Story:** As a User, I want the system to automatically insert appropriate English words into Vietnamese stories, so that I can learn vocabulary in context.

#### Acceptance Criteria

1. WHEN generating a story, THE System SHALL insert English words at identified insertion positions
2. THE System SHALL select English words from the Vocabulary Database matching the specified topic and difficulty level
3. THE System SHALL insert between 5 and 15 English words per 200-word story segment
4. THE System SHALL format inserted English words in bold using markdown syntax
5. THE System SHALL provide Vietnamese translation in parentheses after each inserted English word

### Requirement 5: Semantic Story Search

**User Story:** As a User, I want to search for stories using natural language queries, so that I can find relevant learning content easily.

#### Acceptance Criteria

1. WHEN a User submits a search query, THE System SHALL generate query embeddings using Azure OpenAI
2. THE System SHALL perform vector similarity search in ChromaDB and return top 5 most relevant stories
3. THE System SHALL return search results within 200 milliseconds for queries under 100 characters
4. THE System SHALL include similarity scores with each search result
5. THE System SHALL support filtering search results by word count, difficulty level, and topic

### Requirement 6: Story Generation with Word Insertion

**User Story:** As a User, I want to generate new stories with English word insertion based on my preferences, so that I can get personalized learning content.

#### Acceptance Criteria

1. THE System SHALL accept story generation requests with parameters including topic, difficulty level, story length, and vocabulary focus
2. WHEN generating a story, THE System SHALL use Azure OpenAI GPT-4o to create Vietnamese story content
3. THE System SHALL automatically insert English words during story generation based on specified parameters
4. THE System SHALL return generated stories with metadata including word count, insertion count, and difficulty level
5. THE System SHALL save generated stories to ChromaDB for future semantic search

### Requirement 7: Vocabulary Context and Glossary

**User Story:** As a User, I want to see definitions and usage examples for inserted English words, so that I can understand their meaning and usage.

#### Acceptance Criteria

1. THE System SHALL generate a glossary section for each story containing all inserted English words
2. WHEN displaying a glossary entry, THE System SHALL include the English word, Vietnamese translation, part of speech, and example sentence
3. THE System SHALL provide pronunciation guidance using IPA notation for each glossary entry
4. THE System SHALL generate example sentences that demonstrate proper usage of each vocabulary word
5. THE System SHALL store glossary data with the story in ChromaDB

### Requirement 8: API Integration with Existing System

**User Story:** As a Developer, I want the word insertion feature to integrate seamlessly with the existing aiapi system, so that I can use it alongside other AI services.

#### Acceptance Criteria

1. THE System SHALL expose RESTful API endpoints under the /api/v1 prefix consistent with existing aiapi structure
2. THE System SHALL use the existing Azure OpenAI configuration from aiapi config module
3. THE System SHALL reuse the existing ChromaDB service from aiapi services
4. THE System SHALL follow the existing Pydantic model patterns for request and response schemas
5. THE System SHALL include CORS middleware configuration compatible with the Next.js frontend on localhost:3000

### Requirement 9: Batch Processing and Performance

**User Story:** As a User, I want to process multiple stories efficiently, so that I can prepare learning materials in bulk.

#### Acceptance Criteria

1. THE System SHALL support batch processing of up to 10 stories in a single API request
2. WHEN processing a batch, THE System SHALL implement retry logic with exponential backoff for API failures
3. THE System SHALL process each story in a batch within 5 seconds on average
4. THE System SHALL return partial results if some stories in a batch fail to process
5. THE System SHALL implement rate limiting to avoid exceeding Azure OpenAI API quotas

### Requirement 10: Story Quality and Readability

**User Story:** As a User, I want generated stories to be high quality and readable, so that I can enjoy learning while reading engaging content.

#### Acceptance Criteria

1. THE System SHALL calculate readability scores for generated stories using average words per sentence metrics
2. WHEN a story has a readability score below 60, THE System SHALL regenerate the story with simpler sentence structures
3. THE System SHALL ensure inserted English words are contextually appropriate with a minimum relevance score of 0.8
4. THE System SHALL maintain Vietnamese language grammar correctness after English word insertion
5. THE System SHALL provide story metadata including readability score, language ratio, and generation time
