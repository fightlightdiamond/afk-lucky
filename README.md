# Lucky - Interactive Story Platform

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

Lucky là một nền tảng tạo truyện tương tác hiện đại được xây dựng với Next.js, TypeScript, Python FastAPI và Prisma. Ứng dụng tích hợp AI để tạo truyện thông minh với khả năng tùy chỉnh cao và hỗ trợ đa ngôn ngữ.

## 🌟 Tính năng chính

### 🎯 Tính năng cốt lõi

- 🔐 **Xác thực người dùng** - Đăng nhập/đăng ký với JWT
- 📝 **Tạo và quản lý truyện** - Giao diện trực quan, dễ sử dụng
- 🤖 **AI tạo truyện thông minh** - Sử dụng Azure OpenAI API
- 🎨 **Giao diện hiện đại** - Dark/Light mode, responsive design
- 📊 **Phân tích và thống kê** - Theo dõi usage và performance
- 🔍 **Tìm kiếm và lọc nâng cao** - Full-text search với PostgreSQL
- 📱 **Mobile-friendly** - Tối ưu cho mọi thiết bị

### 🤖 AI Features (Python Backend)

- 📚 **Tạo truyện đơn giản** - Từ prompt cơ bản
- 🎛️ **Tạo truyện nâng cao** - Với cấu hình chi tiết
- 🌐 **Hỗ trợ đa ngôn ngữ** - Tiếng Việt/Tiếng Anh với tỷ lệ tùy chỉnh
- 🎭 **Tùy chỉnh phong cách** - Tone, style, readability level
- 💬 **AI Chat** - Trò chuyện với AI assistant
- 🗺️ **Tạo lịch trình du lịch** - AI-powered itinerary generation
- ⚡ **Rate limiting & Retry logic** - Xử lý lỗi thông minh
- 📈 **Metadata tracking** - Word count, generation time, language ratio

### 🛠️ Technical Features

- 🧪 **Testing comprehensive** - Unit, Integration, E2E tests
- 📖 **Storybook** - Component documentation
- 🎯 **Type safety** - Full TypeScript support
- 🔄 **Real-time updates** - Socket.io integration
- 📦 **Export/Import** - CSV, PDF, Excel support
- 🎨 **Component library** - Radix UI + Custom components

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    LUCKY PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Frontend      │    │   AI Backend    │                │
│  │   (Next.js)     │◄──►│   (FastAPI)     │                │
│  │                 │    │                 │                │
│  │ • React 19      │    │ • Python 3.12+ │                │
│  │ • TypeScript    │    │ • FastAPI       │                │
│  │ • Tailwind CSS  │    │ • OpenAI API    │                │
│  │ • Zustand       │    │ • Pydantic      │                │
│  │ • React Query   │    │ • Tenacity      │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                       │                        │
│           └───────────┬───────────┘                        │
│                       │                                    │
│              ┌─────────────────┐                           │
│              │   Database      │                           │
│              │  (PostgreSQL)   │                           │
│              │                 │                           │
│              │ • Prisma ORM    │                           │
│              │ • Full-text     │                           │
│              │   Search        │                           │
│              │ • Extensions    │                           │
│              └─────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript 5.9.2
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4.1.12
- **Components**: Radix UI, Lucide Icons
- **State Management**: Zustand 5.0.7
- **Data Fetching**: TanStack Query 5.84.1
- **Forms**: React Hook Form + Zod validation
- **Theme**: next-themes (Dark/Light mode)

### Backend (AI Services)

- **Language**: Python 3.12+
- **Framework**: FastAPI 0.119.0
- **AI Integration**: OpenAI 2.5.0 (Azure OpenAI)
- **Validation**: Pydantic 2.12.3
- **Settings**: pydantic-settings 2.0.0
- **Retry Logic**: tenacity 9.1.2
- **Server**: uvicorn 0.38.0

### Database & ORM

- **Database**: PostgreSQL with extensions (pg_trgm, unaccent)
- **ORM**: Prisma 6.13.0
- **Extensions**: @prisma/extension-accelerate

### Development & Testing

- **Testing**: Vitest 3.2.4, Playwright 1.55.0
- **Component Docs**: Storybook 9.0.8
- **Linting**: ESLint 9 + Next.js config
- **Type Checking**: TypeScript strict mode
- **Package Manager**: pnpm (recommended)

### DevOps & Deployment

- **Containerization**: Docker + docker-compose
- **CI/CD**: GitHub Actions ready
- **Monitoring**: Built-in health checks
- **Environment**: Multi-environment support

## 📋 Yêu cầu hệ thống

### Bắt buộc

- **Node.js**: 18.0.0 hoặc cao hơn
- **Python**: 3.12 hoặc cao hơn
- **PostgreSQL**: 13.0 hoặc cao hơn
- **pnpm**: 8.0.0 hoặc cao hơn (khuyến nghị)

### Tùy chọn

- **Docker**: 20.10.0+ (cho containerization)
- **Git**: 2.30.0+ (cho version control)

## 🚀 Hướng dẫn cài đặt cho thành viên mới

> **🚀 Muốn khởi chạy nhanh?** Xem [Quick Start Guide](./QUICK_START.md) để setup trong 10 phút!
>
> **🐍 Chỉ cần setup AI Backend?** Xem [AI Backend Setup Guide](./aiapi/SETUP_GUIDE.md)

### Bước 1: Clone repository

```bash
git clone https://github.com/your-username/lucky_.git
cd lucky_
```

### Bước 2: Cài đặt Node.js dependencies

```bash
# Sử dụng pnpm (khuyến nghị)
pnpm install

# Hoặc sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install
```

### Bước 3: Cài đặt Python AI Backend

```bash
# Di chuyển vào thư mục aiapi
cd aiapi

# Cài đặt dependencies
pip install -e .

# Hoặc sử dụng poetry (nếu có)
poetry install

# Quay lại thư mục gốc
cd ..
```

### Bước 4: Cấu hình Database

#### 4.1. Cài đặt PostgreSQL

**macOS (Homebrew):**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**

- Tải và cài đặt từ [postgresql.org](https://www.postgresql.org/download/windows/)

#### 4.2. Tạo database và user

```bash
# Kết nối PostgreSQL
psql -U postgres

# Tạo user và database
CREATE USER hero WITH PASSWORD 'hero123';
CREATE DATABASE postgres OWNER hero;
GRANT ALL PRIVILEGES ON DATABASE postgres TO hero;

# Thoát psql
\q
```

### Bước 5: Cấu hình Environment Variables

#### 5.1. Tạo file .env

```bash
cp .env.example .env
```

#### 5.2. Cập nhật .env file

```env
# Database Configuration
POSTGRES_USER=hero
POSTGRES_PASSWORD=hero123
POSTGRES_DB=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# AI API Configuration
NEXT_PUBLIC_AI_API_URL="http://localhost:8000/api/v1"

# AI Service Configuration (for Python backend)
AIAPI_AZURE_ENDPOINT="https://aiportalapi.stu-platform.live/jpe"
AIAPI_AZURE_API_KEY="sk-uX_Ax09Iv6XY-28-M_uYVg"
AIAPI_AZURE_DEPLOYMENT_NAME="GPT-4o"

# Optional: Together AI (legacy)
TOGETHER_API_KEY=your_together_api_key_here
TOGETHER_API_URL=https://api.together.xyz/v1/chat/completions
```

### Bước 6: Khởi tạo Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database với dữ liệu mẫu
npx prisma db seed
```

### Bước 7: Khởi chạy ứng dụng

#### 7.1. Khởi chạy AI Backend (Terminal 1)

```bash
cd aiapi
python run.py
```

AI API sẽ chạy tại: `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

#### 7.2. Khởi chạy Frontend (Terminal 2)

```bash
# Quay lại thư mục gốc
cd ..

# Khởi chạy Next.js development server
pnpm dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### Bước 8: Xác minh cài đặt

#### 8.1. Kiểm tra Frontend

- Truy cập `http://localhost:3000`
- Đăng ký tài khoản mới hoặc đăng nhập
- Thử tạo một story đơn giản

#### 8.2. Kiểm tra AI Backend

```bash
# Test AI API endpoints
cd aiapi
python test_api.py
```

#### 8.3. Kiểm tra Database

```bash
# Mở Prisma Studio
npx prisma studio
```

## 🧪 Testing & Development

### Chạy Tests

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# E2E tests
pnpm test:e2e

# Storybook tests
pnpm test:storybook

# All tests
pnpm test:all
```

### Development Tools

```bash
# Storybook (Component documentation)
pnpm storybook
# Truy cập: http://localhost:6006

# Database Studio
pnpm db:studio
# Truy cập: http://localhost:5555

# Linting
pnpm lint

# Type checking
npx tsc --noEmit
```

## 📁 Cấu trúc dự án

```
lucky_/
├── 📁 aiapi/                          # Python AI Backend
│   ├── 📁 src/aiapi/
│   │   ├── 📄 main.py                 # FastAPI app entry point
│   │   ├── 📄 config.py               # Configuration settings
│   │   ├── 📄 models.py               # Pydantic models
│   │   ├── 📁 routers/                # API route handlers
│   │   │   ├── 📄 story.py            # Story generation routes
│   │   │   ├── 📄 chat.py             # Chat API routes
│   │   │   └── 📄 itinerary.py        # Travel itinerary routes
│   │   └── 📁 services/               # Business logic
│   │       ├── 📄 story_service.py    # Story generation logic
│   │       ├── 📄 chat_service.py     # Chat functionality
│   │       └── 📄 openai_service.py   # OpenAI integration
│   ├── 📄 run.py                      # Development server
│   ├── 📄 test_api.py                 # API testing script
│   └── 📄 pyproject.toml              # Python dependencies
│
├── 📁 src/                            # Next.js Frontend
│   ├── 📁 app/                        # App Router pages
│   │   ├── 📁 api/                    # API routes
│   │   ├── 📁 admin/                  # Admin pages
│   │   ├── 📁 story/                  # Story-related pages
│   │   └── 📄 layout.tsx              # Root layout
│   │
│   ├── 📁 components/                 # React components
│   │   ├── 📁 ui/                     # Base UI components
│   │   ├── 📁 story/                  # Story-specific components
│   │   └── 📁 admin/                  # Admin components
│   │
│   ├── 📁 lib/                        # Utility functions
│   │   ├── 📄 prisma.ts               # Prisma client
│   │   ├── 📄 aiapi.ts                # AI API client
│   │   ├── 📄 auth.ts                 # Authentication
│   │   └── 📄 utils.ts                # General utilities
│   │
│   ├── 📁 hooks/                      # Custom React hooks
│   ├── 📁 services/                   # Business logic services
│   ├── 📁 store/                      # Zustand stores
│   ├── 📁 types/                      # TypeScript type definitions
│   └── 📁 __tests__/                  # Test files
│
├── 📁 prisma/                         # Database
│   ├── 📄 schema.prisma               # Database schema
│   ├── 📁 migrations/                 # Database migrations
│   └── 📁 seeders/                    # Seed data
│
├── 📁 docs/                           # Documentation
├── 📁 scripts/                        # Utility scripts
├── 📁 .storybook/                     # Storybook configuration
├── 📄 package.json                    # Node.js dependencies
├── 📄 next.config.ts                  # Next.js configuration
├── 📄 tailwind.config.js              # Tailwind CSS configuration
├── 📄 tsconfig.json                   # TypeScript configuration
├── 📄 vitest.config.ts                # Vitest configuration
├── 📄 playwright.config.ts            # Playwright configuration
└── 📄 docker-compose.yml              # Docker configuration
```

## 🔧 Scripts hữu ích

### Development

```bash
pnpm dev                    # Khởi chạy development server
pnpm build                  # Build production
pnpm start                  # Khởi chạy production server
pnpm lint                   # Linting code
```

### Database

```bash
pnpm db:reset              # Reset database
pnpm db:seed               # Seed database
pnpm db:migrate            # Run migrations
pnpm db:generate           # Generate Prisma client
pnpm db:studio             # Open Prisma Studio
```

### Testing

```bash
pnpm test                  # Run unit tests
pnpm test:e2e              # Run E2E tests
pnpm test:coverage         # Test coverage report
pnpm test:storybook        # Test Storybook stories
```

### AI Backend

```bash
cd aiapi
python run.py              # Khởi chạy AI API server
python test_api.py         # Test AI API endpoints
```

## 🌐 API Endpoints

### Frontend API Routes (Next.js)

```
GET    /api/auth/[...nextauth]     # NextAuth endpoints
GET    /api/users                  # Get users
POST   /api/users                  # Create user
GET    /api/stories                # Get stories
POST   /api/stories                # Create story
```

### AI Backend API Routes (Python FastAPI)

```
GET    /                           # Root endpoint
GET    /health                     # Health check
POST   /api/v1/generate-story      # Simple story generation
POST   /api/v1/generate-advanced-story  # Advanced story generation
POST   /api/v1/chat                # AI chat
POST   /api/v1/generate-itinerary  # Travel itinerary
POST   /api/v1/batch-itinerary     # Batch itinerary generation
```

## 🐳 Docker Development

### Sử dụng Docker Compose

```bash
# Khởi chạy tất cả services
docker-compose up -d

# Chỉ khởi chạy database
docker-compose up -d postgres

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

### Docker Services

- **postgres**: PostgreSQL database
- **app**: Next.js application (optional)
- **aiapi**: Python FastAPI backend (optional)

## 🔍 Troubleshooting

### Lỗi thường gặp

#### 1. Database connection error

```bash
# Kiểm tra PostgreSQL đang chạy
brew services list | grep postgresql
# hoặc
sudo systemctl status postgresql

# Kiểm tra connection
psql -U hero -d postgres -h localhost
```

#### 2. Python dependencies error

```bash
# Cài đặt lại dependencies
cd aiapi
pip install --upgrade pip
pip install -e .
```

#### 3. Node.js dependencies error

```bash
# Xóa node_modules và cài đặt lại
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 4. Prisma client error

```bash
# Regenerate Prisma client
npx prisma generate
npx prisma db push
```

#### 5. AI API connection error

- Kiểm tra AI backend đang chạy tại port 8000
- Kiểm tra environment variables trong .env
- Kiểm tra API key Azure OpenAI

### Debug Tools

```bash
# Kiểm tra database structure
pnpm validate:structure

# Kiểm tra database connection
pnpm db:check

# Test AI API
cd aiapi && python test_api.py
```

## 📚 Tài liệu bổ sung

### Trong dự án

- [Quick Start Guide](./QUICK_START.md) - Khởi chạy nhanh trong 10 phút
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Hướng dẫn phát triển chi tiết
- [AI Backend Setup Guide](./aiapi/SETUP_GUIDE.md) - Hướng dẫn chi tiết Python backend
- [Database Setup](./DATABASE_SETUP.md) - Cấu hình database
- [Implementation Summary](./docs/IMPLEMENTATION_SUMMARY.md) - Tổng quan implementation
- [Import/Export Guidelines](./docs/IMPORT_EXPORT_GUIDELINES.md) - Hướng dẫn import/export
- [Code Structure Standards](./docs/CODE_STRUCTURE_STANDARDS.md) - Chuẩn code structure

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

## 🤝 Contributing

### Quy trình đóng góp

1. **Fork repository**
2. **Tạo feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Tạo Pull Request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Testing**: Minimum 80% coverage

### Review Process

1. Code review bởi ít nhất 1 team member
2. All tests phải pass
3. No linting errors
4. Documentation updated (nếu cần)

## 📄 License

Dự án này được cấp phép theo [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/) - Amazing React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Prisma Team](https://www.prisma.io/) - Next-generation ORM
- [Radix UI](https://www.radix-ui.com/) - Low-level UI primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [OpenAI](https://openai.com/) - AI capabilities

---

**Được phát triển với ❤️ bởi Lucky Team**

Nếu bạn gặp vấn đề gì trong quá trình setup, hãy tạo issue trên GitHub hoặc liên hệ team để được hỗ trợ!
