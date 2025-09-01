# Lucky - AI Story Generation Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.13.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.12-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)

Lucky là một nền tảng tạo truyện AI hiện đại được xây dựng với Next.js, TypeScript và Prisma. Ứng dụng hỗ trợ tạo truyện thông minh với nhiều phiên bản khác nhau, quản lý người dùng toàn diện và giao diện đẹp mắt.

## ✨ Tính năng chính

### 📚 Tạo truyện AI
- 🎯 **4 phiên bản tạo truyện**: Simple, Advanced, Pro, Enterprise
- 🎨 **4 kiểu loading độc đáo**: Interactive, Smart Progress, Magical, Stages
- 📝 **Template truyện đa dạng**: Tech, Business, Life, Education
- 🌐 **Hỗ trợ đa ngôn ngữ**: Tiếng Việt và Tiếng Anh với tỷ lệ tùy chỉnh
- 📊 **Phân tích nội dung**: Word count, readability score, language ratio

### 👥 Quản lý người dùng
- 🔐 **Xác thực người dùng**: Đăng nhập/đăng ký với NextAuth
- 👑 **Hệ thống phân quyền**: 5 vai trò (ADMIN, USER, AUTHOR, EDITOR, MODERATOR)
- 📋 **Admin panel**: Quản lý người dùng, vai trò, phân quyền
- 📊 **Thống kê chi tiết**: Analytics người dùng và hoạt động
- 📤 **Export/Import**: CSV, Excel, JSON, PDF

### 🎨 Giao diện & UX
- 📱 **Responsive design**: Mobile-first approach
- 🌙 **Dark/Light mode**: Hỗ trợ theme switching
- 🎭 **UI Components**: Radix UI với Tailwind CSS
- ⚡ **Performance**: Optimized với React 19 và Next.js 15
- 🔍 **Search & Filter**: Tìm kiếm và lọc nâng cao

### 🧪 Testing & Quality
- ✅ **Unit Testing**: Vitest với coverage
- 🎭 **Component Testing**: Storybook stories
- 🤖 **E2E Testing**: Playwright automation
- ♿ **Accessibility**: A11y testing với axe-core
- 📏 **Code Quality**: ESLint, TypeScript strict mode

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.5.2 với App Router
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 4.1.12
- **Components**: Radix UI, Lucide Icons
- **State Management**: Zustand 5.0.7
- **Forms**: React Hook Form với Zod validation

### Backend & Database
- **Database**: PostgreSQL với Prisma ORM 6.13.0
- **Authentication**: NextAuth 4.24.11 với JWT
- **API**: Next.js API Routes
- **File Processing**: CSV/Excel export với json2csv, xlsx
- **PDF Generation**: jsPDF với autotable

### Testing & Development
- **Unit Testing**: Vitest 3.2.4
- **E2E Testing**: Playwright 1.55.0
- **Component Testing**: Storybook 9.0.8
- **Accessibility**: @axe-core/playwright
- **Mocking**: @faker-js/faker

### DevOps & Deployment
- **Package Manager**: pnpm
- **Containerization**: Docker với docker-compose
- **CI/CD**: GitHub Actions ready
- **Deployment**: Vercel, Netlify compatible

## 🛠️ Prerequisites

- Node.js 18+
- PostgreSQL
- pnpm (recommended)

## 🚀 Hướng dẫn cài đặt

### 1. **Clone repository**
```bash
git clone https://github.com/your-username/lucky_.git
cd lucky_
```

### 2. **Cài đặt dependencies**
```bash
pnpm install
```

### 3. **Thiết lập environment variables**
Tạo file `.env` trong thư mục gốc:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lucky?schema=public"

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# JWT
JWT_SECRET=your_jwt_secret_here

# AI Story Generation (nếu sử dụng)
TOGETHER_API_KEY=your_together_api_key_here
```

### 4. **Thiết lập database**
```bash
# Chạy migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed initial data (optional)
npx prisma db seed
```

### 5. **Chạy development server**
```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 🐳 Docker Setup

Chạy ứng dụng với Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📦 Available Scripts

### Development
- `pnpm dev` - Chạy development server với Turbopack
- `pnpm build` - Build production
- `pnpm start` - Chạy production server
- `pnpm lint` - Chạy ESLint

### Testing
- `pnpm test` - Chạy unit tests
- `pnpm test:watch` - Chạy tests ở watch mode
- `pnpm test:coverage` - Chạy tests với coverage report
- `pnpm test:e2e` - Chạy E2E tests với Playwright
- `pnpm test:e2e:ui` - Chạy E2E tests với UI mode
- `pnpm test:accessibility` - Chạy accessibility tests

### Development Tools
- `pnpm storybook` - Chạy Storybook (port 6006)
- `pnpm build-storybook` - Build Storybook
- `pnpm validate:structure` - Validate code structure

## 📂 Cấu trúc dự án

```
lucky_/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 admin/             # Admin panel pages
│   │   ├── 📁 api/               # API routes
│   │   │   ├── 📁 auth/          # Authentication APIs
│   │   │   ├── 📁 story/         # Story generation APIs
│   │   │   └── 📁 admin/         # Admin management APIs
│   │   ├── 📁 story/             # Story pages (Simple, Advanced, Pro)
│   │   ├── 📁 login/             # Authentication pages
│   │   └── 📄 page.tsx           # Dashboard homepage
│   ├── 📁 components/            # Reusable UI components
│   │   ├── 📁 admin/             # Admin-specific components
│   │   ├── 📁 auth/              # Authentication components
│   │   ├── 📁 story/             # Story generation components
│   │   ├── 📁 ui/                # Base UI components (Radix)
│   │   └── 📁 providers/         # Context providers
│   ├── 📁 lib/                   # Utility functions
│   │   ├── 📄 auth.ts            # NextAuth configuration
│   │   ├── 📄 prisma.ts          # Prisma client
│   │   └── 📄 together.ts        # AI story generation
│   ├── 📁 store/                 # Zustand stores
│   ├── 📁 types/                 # TypeScript type definitions
│   ├── 📁 hooks/                 # Custom React hooks
│   └── 📁 __tests__/             # Test files
├── 📁 prisma/                    # Database schema & migrations
│   ├── 📄 schema.prisma          # Database schema
│   ├── 📁 migrations/            # Database migrations
│   └── 📁 seeders/               # Database seeders
├── 📁 .storybook/                # Storybook configuration
├── 📁 docs/                      # Documentation
└── 📄 docker-compose.yml         # Docker setup
```

## 🎯 Sử dụng ứng dụng

### 🔐 Authentication
**Tài khoản test mặc định:**
- **Email**: `admin@example.com`
- **Password**: `123456`
- **Role**: ADMIN (full permissions)

### 📚 Story Generation
1. **Simple Version** (`/story`): 
   - 10 stories/day, 300 words max
   - 2 basic templates
   - 4 loading animations
   - Fixed 70/30 language mix

2. **Advanced Version** (`/story/advanced`):
   - 50 stories/day
   - 6 templates
   - Custom language ratios
   - Advanced formatting options

3. **Pro Version** (`/story/pro`):
   - 200 stories/day
   - Custom templates
   - Premium features
   - Analytics dashboard

### 👑 Admin Panel (`/admin`)
- **User Management**: CRUD operations, bulk actions
- **Role Management**: Assign roles và permissions
- **Analytics**: User activity tracking
- **Export/Import**: CSV, Excel, JSON, PDF formats

## 🗄️ Database Schema

### Core Models
- **User**: Quản lý người dùng với role-based permissions
- **Role**: 5 vai trò với custom permissions
- **Story**: Lưu trữ stories với metadata và analytics
- **StoryTemplate**: Templates cho các loại truyện khác nhau
- **UserPreferences**: Cài đặt cá nhân của người dùng
- **StoryUsageAnalytics**: Tracking usage và performance

### Key Features
- **Role-based Access Control (RBAC)**: 26 permissions across 5 roles
- **Multi-language Support**: Vietnamese/English mixing
- **Story Versioning**: Simple → Advanced → Pro → Enterprise
- **Usage Tracking**: Comprehensive analytics và reporting
- **Bulk Operations**: Mass user management operations

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```bash
pnpm test                    # Run all unit tests
pnpm test:watch             # Watch mode
pnpm test:coverage          # Coverage report
```

### E2E Tests (Playwright)
```bash
pnpm test:e2e               # Headless E2E tests
pnpm test:e2e:ui            # Interactive UI mode
pnpm test:e2e:headed        # Headed browser mode
pnpm test:accessibility     # A11y tests
```

### Component Tests (Storybook)
```bash
pnpm storybook              # Start Storybook dev server
pnpm test:storybook         # Run Storybook tests
pnpm build-storybook        # Build static Storybook
```

## 🚀 Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=your_production_db_url
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_secret
```

### Docker Deployment
```bash
# Build và deploy với Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel Deployment
```bash
# Deploy to Vercel
npx vercel --prod
```

## 🔧 Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

### Component Development
- **Storybook**: Document all components
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive**: Mobile-first design
- **Performance**: Lazy loading, code splitting

### API Development
- **RESTful**: Consistent API design
- **Validation**: Zod schemas
- **Error Handling**: Comprehensive error responses
- **Rate Limiting**: Prevent abuse

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check PostgreSQL status
pg_ctl status

# Restart PostgreSQL
brew services restart postgresql
```

**Prisma Issues:**
```bash
# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate
```

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow code standards và testing requirements
4. Run tests: `pnpm test:all`
5. Create Pull Request

### Pull Request Requirements
- ✅ All tests passing
- ✅ Code coverage maintained
- ✅ Storybook stories updated
- ✅ Documentation updated
- ✅ Accessibility compliance

## 📊 Performance Metrics

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Bundle Size**: Optimized với code splitting
- **Database**: Indexed queries, connection pooling
- **Caching**: Redis-ready, CDN optimized

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Storybook](https://storybook.js.org/) - Component development
- [Playwright](https://playwright.dev/) - E2E testing

---

**Made with ❤️ for the Vietnamese developer community**

> 🌟 **Star this repo** nếu bạn thấy hữu ích!
