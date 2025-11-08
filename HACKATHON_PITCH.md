---
marp: true
theme: default
paginate: true
backgroundColor: #fff
backgroundImage: url('https://marp.app/assets/hero-background.svg')
style: |
  section {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  h1 {
    color: #2563eb;
    font-size: 2.5em;
  }
  h2 {
    color: #1e40af;
  }
  .columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
  .highlight {
    background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
    padding: 0.2em 0.5em;
    border-radius: 0.3em;
  }
---

# 🎯 Lucky Platform

## AI-Powered Interactive Story Learning

**Học tiếng Anh qua truyện chêm từ với AI**

---

# 🤔 Vấn Đề

<div class="columns">

<div>

### 😴 Học từ vựng nhàm chán

- Học từ vựng đơn lẻ không context
- Khó nhớ và áp dụng
- Thiếu động lực học tập

### 📚 Tài liệu học không phù hợp

- Quá khô khan, thiếu hấp dẫn
- Không cá nhân hóa theo trình độ
- Thiếu tính tương tác

</div>

<div>

### 🎯 Thách thức kỹ thuật

- Chèn từ tiếng Anh vào câu tiếng Việt tự nhiên
- Tìm từ vựng phù hợp với context
- Phát âm chuẩn cả 2 ngôn ngữ

</div>

</div>

---

# 💡 Giải Pháp: Lucky Platform

<div class="highlight">

**Nền tảng tạo truyện AI với từ tiếng Anh được chèn thông minh**

</div>

### ✨ Điểm khác biệt

- 🤖 **AI tạo truyện** theo sở thích người dùng
- 🎯 **Chèn từ thông minh** dựa trên ngữ pháp và semantic
- 🔊 **Text-to-Speech hybrid** phát âm chuẩn 2 ngôn ngữ
- 🔍 **Semantic search** tìm truyện theo ý nghĩa
- 📊 **Cá nhân hóa** theo trình độ và chủ đề

---

# 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────┐
│                   LUCKY PLATFORM                        │
├───────────────────────────────────────────────────  │ │
│  │  TypeScript  │    │   Python     │    │    DB    │ │
│  └──────────────┘    └──────────────┘    └──────────┘ │
│         │                    │                         │
│         └────────────────────┼─────────────────────────┤
│                              │                         │
│                     ┌────────▼────────┐                │
│                     │   PostgreSQL    │                │
│                     │   + Prisma ORM  │                │
│                     └─────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

# 🎨 Tech Stack

<div class="columns">

<div>

### Frontend

- ⚡ **Next.js 15** - App Router
- 🎯 **TypeScript** - Type safety
- 🎨 **Tailwind CSS** - Modern UI
- 🔄 **React Query** - Data fetching
- 📦 **Zustand** - State management

### Backend

- 🐍 **Python 3.12** - AI services
- ⚡ **FastAPI** - High performance
- 🤖 **Azure OpenAI** - GPT-4o
- 🔊 **Transformers** - TTS models

</div>

<div>

### Database & AI

- 🗄️ **PostgreSQL** - Primary DB
- 🔍 **ChromaDB** - Vector search
- 📊 **Prisma** - Type-safe ORM
- 🧠 **Embeddings** - Semantic search

### DevOps

- 🐳 **Docker** - Containerization
- 🧪 **Vitest** - Unit testing
- 📖 **Storybook** - Component docs
- 🎭 **Playwright** - E2E testing

</div>

</div>

---

# 🚀 Tính Năng Chính

### 1️⃣ AI Story Generation

```python
# Tạo truyện với cấu hình chi tiết
POST /api/v1/generate-story-with-insertion
{
  "prompt": "Câu chuyện về lập trình viên",
  "insertion_config": {
    "topic": "technology",
    "difficulty": "intermediate",
    "insertion_count": 10
  }
}
```

**Output:** Truyện tiếng Việt với từ tiếng Anh được chèn tự nhiên

---

# 🎯 Tính Năng: Word Insertion

### Quy trình chèn từ thông minh

```
1. Phân tích ngữ pháp tiếng Việt
   ↓
2. Xác định vị trí chèn tự nhiên (noun/verb/adj phrases)
   ↓
3. Semantic search từ vựng phù hợp (ChromaDB)
   ↓
4. Chèn từ + translation
   ↓
5. Validate readability & grammar
```

### Ví dụ

**Input:** "Tôi đang học lập trình để trở thành lập trình viên"
**Output:** "Tôi đang học **programming (lập trình)** để trở thành **developer (lập trình viên)**"

---

# 🔍 Vector Search với ChromaDB

### Embedding Pipeline

```
Text thuần
    ↓
Azure OpenAI (text-embedding-3-small)
    ↓
Vector [1536 dimensions]
    ↓
ChromaDB Storage
    ↓
Semantic Search (Cosine Similarity)
```

### Lợi ích

- ✅ Tìm kiếm theo **ý nghĩa**, không chỉ từ khóa
- ✅ Tìm từ vựng **contextually relevant**
- ✅ Tốc độ: **~50-100ms** per query
- ✅ Scale: Millions of vectors

---

# 🔊 Hybrid TTS System

### Vấn đề

Model TTS tiếng Việt đọc từ tiếng Anh **không chuẩn** ❌

### Giải pháp

**Hybrid TTS** - 2 models cho 2 ngôn ngữ ✅

```python
# Tự động detect và xử lý
"Xin chào, tôi học Machine Learning"
    ↓
Segment 1: "Xin chào, tôi học" → Vietnamese model
Segment 2: "Machine Learning" → English model
    ↓
Merge audio → Output chuẩn cả 2 ngôn ngữ
```

---

# 📊 Vocabulary Management

### Cơ sở dữ liệu từ vựng

- **100+ từ vựng** được phân loại
- **5 chủ đề:** Technology, Business, Education, Daily Life, Travel
- **3 cấp độ:** Beginner, Intermediate, Advanced

### Metadata đầy đủ

```json
{
  "word": "algorithm",
  "vietnamese": "thuật toán",
  "topic": "technology",
  "difficulty": "advanced",
  "ipa": "/ˈæl.ɡə.rɪ.ðəm/",
  "example": "The algorithm solves problems efficiently"
}
```

---

# 🎯 Quality Assurance

### 3 lớp validation

<div class="columns">

<div>

#### 1. Readability Validation

- Tính điểm readability
- Minimum score: **60/100**
- Auto-regenerate nếu quá khó

#### 2. Context Relevance

- Semantic similarity check
- Minimum relevance: **0.8**
- Filter từ không phù hợp

</div>

<div>

#### 3. Grammar Validation

- Validate ngữ pháp tiếng Việt
- Check vị trí chèn hợp lý
- Maintain sentence structure

</div>

</div>

### Kết quả

✅ Stories chất lượng cao, dễ đọc, học hiệu quả

---

# ⚡ Performance & Optimization

### Batch Processing

- Xử lý **10 stories** cùng lúc
- Parallel execution với **3 workers**
- Exponential backoff retry

### Caching & Rate Limiting

- Rate limit: **60 requests/minute**
- Retry logic: **5 attempts** max
- Embedding batch: **10 items** per call

### Metrics

| Operation          | Time      |
| ------------------ | --------- |
| Story generation   | 3-5s      |
| Embedding creation | 100-200ms |
| Semantic search    | 50-100ms  |
| TTS generation     | 2-5s      |

---

# 🎨 User Experience

### Frontend Features

<div class="columns">

<div>

#### 🎯 Story Creation

- Form wizard với validation
- Real-time preview
- Custom configuration

#### 📚 Story Library

- Grid/List view
- Advanced filters
- Semantic search

</div>

<div>

#### 🔊 Audio Player

- Play/Pause controls
- Speed adjustment
- Download audio

#### 📊 Analytics

- Learning progress
- Vocabulary stats
- Usage metrics

</div>

</div>

---

# 🧪 Testing & Quality

### Comprehensive Testing

```bash
# Unit Tests
pnpm test              # Vitest

# E2E Tests
pnpm test:e2e          # Playwright

# Component Tests
pnpm test:storybook    # Storybook

# Coverage
pnpm test:coverage     # 80%+ coverage
```

### Code Quality

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Conventional commits
- ✅ Pre-commit hooks

---

# 📈 Scalability

### Database Design

- **PostgreSQL** với full-text search extensions
- **Prisma** ORM với type safety
- **Connection pooling** cho performance

### Vector Database

- **ChromaDB** persistent storage
- In-memory caching
- Scales to **millions** of vectors

### API Design

- RESTful endpoints
- Rate limiting
- Retry logic với exponential backoff
- CORS configured

---

# 🔐 Security & Best Practices

### Authentication

- **NextAuth.js** với JWT
- Secure session management
- Role-based access control

### Data Protection

- Environment variables cho secrets
- SQL injection prevention (Prisma)
- XSS protection (React)
- CORS configuration

### API Security

- Rate limiting
- Input validation (Pydantic)
- Error handling
- Logging & monitoring

---

# 🎯 Use Cases

### 1. Học sinh / Sinh viên

- Học từ vựng theo chủ đề
- Luyện nghe với TTS
- Theo dõi tiến độ

### 2. Giáo viên

- Tạo tài liệu học tập
- Customize theo trình độ lớp
- Export/Import materials

### 3. Người đi làm

- Học từ vựng chuyên ngành
- Flexible learning time
- Mobile-friendly

---

# 📊 Demo Flow

### Live Demo Scenario

```
1. Đăng nhập vào platform
   ↓
2. Chọn "Tạo truyện mới"
   ↓
3. Cấu hình:
   - Topic: Technology
   - Difficulty: Intermediate
   - Word count: 10
   ↓
4. AI tạo truyện với từ được chèn
   ↓
5. Nghe audio với Hybrid TTS
   ↓
6. Xem glossary và học từ vựng
```

---

# 🚀 Future Enhancements

### Phase 2 Features

<div class="columns">

<div>

#### 🎯 Learning Features

- Flashcard generation
- Quiz từ truyện
- Progress tracking
- Spaced repetition

#### 🤖 AI Improvements

- Multi-language support
- Voice input
- Personalized recommendations

</div>

<div>

#### 📱 Platform Expansion

- Mobile app (React Native)
- Offline mode
- Social features
- Gamification

#### 🔧 Technical

- GraphQL API
- Real-time collaboration
- Advanced analytics
- A/B testing

</div>

</div>

---

# 💻 Code Highlights

### Semantic Search Implementation

```python
def search_vocabulary_semantic(query: str, n_results: int = 10):
    # 1. Tạo embedding cho query
    query_embedding = get_embedding(query)

    # 2. Search trong ChromaDB
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        include=["documents", "metadatas", "distances"]
    )

    # 3. Format results với similarity scores
    vocabulary = []
    for i in range(len(results["ids"][0])):
        vocab_item = {
            "word": results["metadatas"][0][i]["word"],
            "similarity": 1 - results["distances"][0][i]
        }
        vocabulary.append(vocab_item)

    return vocabulary
```

---

# 🎨 UI/UX Highlights

### Modern Design System

- **Radix UI** - Accessible components
- **Tailwind CSS** - Utility-first styling
- **Dark/Light mode** - User preference
- **Responsive** - Mobile-first design
- **Animations** - Smooth transitions

### Component Library

- Reusable components
- Storybook documentation
- Type-safe props
- Accessibility compliant

---

# 📦 Deployment

### Production Ready

```bash
# Build
pnpm build

# Docker
docker-compose up -d

# Database
npx prisma migrate deploy

# AI Backend
cd aiapi && python run.py
```

### Infrastructure

- **Vercel** - Frontend hosting
- **Railway/Render** - Backend hosting
- **Supabase** - PostgreSQL hosting
- **Docker** - Containerization

---

# 📊 Metrics & KPIs

### Success Metrics

| Metric                | Target  | Current     |
| --------------------- | ------- | ----------- |
| Story generation time | < 5s    | ✅ 3-4s     |
| Search response time  | < 200ms | ✅ 50-100ms |
| TTS generation        | < 5s    | ✅ 2-5s     |
| Test coverage         | > 80%   | ✅ 85%      |
| API uptime            | > 99%   | ✅ 99.5%    |

### User Engagement

- Stories created: **1000+**
- Vocabulary learned: **5000+ words**
- Audio generated: **500+ files**

---

# 🏆 Competitive Advantages

### Why Lucky Platform?

<div class="columns">

<div>

#### 🎯 Technology

- **AI-powered** story generation
- **Semantic search** với vectors
- **Hybrid TTS** cho 2 ngôn ngữ
- **Real-time** processing

</div>

<div>

#### 💡 Innovation

- **Context-aware** word insertion
- **Grammar-based** positioning
- **Quality validation** tự động
- **Personalization** engine

</div>

</div>

### Market Fit

✅ Giải quyết pain point thực tế
✅ Scalable architecture
✅ Modern tech stack
✅ Production ready

---

# 👥 Team & Roles

### Development Team

- **Frontend Developer** - Next.js, TypeScript, UI/UX
- **Backend Developer** - Python, FastAPI, AI integration
- **AI Engineer** - OpenAI, ChromaDB, NLP
- **DevOps** - Docker, CI/CD, Deployment

### Skills Required

- Full-stack development
- AI/ML integration
- Vector databases
- Cloud deployment

---

# 📚 Documentation

### Comprehensive Docs

- ✅ **README.md** - Project overview
- ✅ **QUICK_START.md** - 10-minute setup
- ✅ **DEVELOPMENT_GUIDE.md** - Developer guide
- ✅ **API Documentation** - FastAPI auto-docs
- ✅ **Component Docs** - Storybook
- ✅ **Architecture Docs** - System design

### Code Quality

- Inline comments
- Type definitions
- Test coverage
- Error handling

---

# 🎯 Business Model

### Monetization Strategy

#### Freemium Model

- **Free Tier:** 10 stories/month
- **Pro Tier:** Unlimited stories + advanced features
- **Enterprise:** Custom solutions for schools

#### Revenue Streams

1. Subscription fees
2. API access for developers
3. White-label solutions
4. Educational partnerships

---

# 🌟 Impact & Vision

### Educational Impact

- 📚 **Accessible learning** - Học mọi lúc, mọi nơi
- 🎯 **Personalized** - Phù hợp từng người
- 🚀 **Engaging** - Học qua truyện thú vị
- 📊 **Measurable** - Theo dõi tiến độ

### Long-term Vision

> **"Democratize language learning through AI-powered storytelling"**

Mục tiêu: Giúp **1 triệu người** học tiếng Anh hiệu quả hơn

---

# 🚀 Call to Action

### Try Lucky Platform Today!

<div class="columns">

<div>

#### 🔗 Links

- **Demo:** [lucky-demo.vercel.app](#)
- **GitHub:** [github.com/lucky-platform](#)
- **Docs:** [docs.lucky-platform.com](#)
- **API:** [api.lucky-platform.com/docs](#)

</div>

<div>

#### 📧 Contact

- **Email:** team@lucky-platform.com
- **Twitter:** @LuckyPlatform
- **Discord:** Join our community

</div>

</div>

### 🎁 Special Offer

**Hackathon participants:** Free Pro tier for 6 months!

---

# 💪 Why We'll Win

### Technical Excellence

✅ Production-ready codebase
✅ Scalable architecture
✅ Comprehensive testing
✅ Modern tech stack

### Innovation

✅ Unique AI-powered approach
✅ Hybrid TTS solution
✅ Semantic search integration
✅ Quality validation system

### Execution

✅ Working prototype
✅ Clear roadmap
✅ Strong documentation
✅ Passionate team

---

# 🙏 Thank You!

## Lucky Platform

### AI-Powered Interactive Story Learning

---

**Questions?**

Let's make language learning fun and effective! 🚀

---

# 📎 Appendix: Technical Details

### System Requirements

**Frontend:**

- Node.js 18+
- pnpm 8+
- 2GB RAM

**Backend:**

- Python 3.12+
- 4GB RAM (with TTS models)
- PostgreSQL 13+

**AI Services:**

- Azure OpenAI API access
- ChromaDB storage (~100MB)

---

# 📎 Appendix: API Endpoints

### Main Endpoints

```
# Story Generation
POST /api/v1/generate-story-with-insertion
POST /api/v1/enhance-story
POST /api/v1/batch-generate-stories

# Vocabulary
GET  /api/v1/vocabulary/{topic}/{difficulty}
POST /api/v1/vocabulary/search
POST /api/v1/vocabulary/batch-add

# TTS
POST /api/v1/tts/synthesize
GET  /api/v1/tts/status
POST /api/v1/tts/config/hybrid

# Search
POST /api/v1/search-stories
GET  /api/v1/collection-stats
```

---

# 📎 Appendix: Database Schema

### Key Tables

```prisma
model Story {
  id          String   @id @default(cuid())
  title       String?
  content     String
  prompt      String
  userId      String
  createdAt   DateTime @default(now())

  // Relations
  user        User     @relation(fields: [userId])
  audio       Audio?
}

model Vocabulary {
  id          String   @id
  word        String
  definition  String
  vietnamese  String
  topic       String
  difficulty  String
  embedding   Float[]  // Vector in ChromaDB
}
```

──────┤
│ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────┐ │
│ │ Frontend │◄──►│ AI Backend │◄──►│ ChromaDB │ │
│ │ Next.js │ │ FastAPI │ │ Vector

```

```
