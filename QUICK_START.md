# 🚀 Quick Start Guide - Lucky Platform

Hướng dẫn khởi chạy nhanh dự án Lucky Platform trong 10 phút.

## ⚡ TL;DR - Khởi chạy nhanh

```bash
# 1. Clone và cài đặt
git clone https://github.com/your-username/lucky_.git
cd lucky_
pnpm install

# 2. Setup database
createdb postgres
npx prisma migrate deploy
npx prisma db seed

# 3. Setup environment
cp .env.example .env
# Cập nhật DATABASE_URL trong .env

# 4. Khởi chạy AI Backend
cd aiapi && pip install -e . && python run.py &

# 5. Khởi chạy Frontend
cd .. && pnpm dev
```

Truy cập: `http://localhost:3000` 🎉

## 📋 Checklist cài đặt

### ✅ Prerequisites

- [ ] Node.js 18+ installed
- [ ] Python 3.12+ installed
- [ ] PostgreSQL 13+ installed
- [ ] pnpm installed (`npm install -g pnpm`)

### ✅ Database Setup

- [ ] PostgreSQL service running
- [ ] Database created
- [ ] Migrations applied
- [ ] Seed data loaded

### ✅ Environment Configuration

- [ ] `.env` file created
- [ ] Database URL configured
- [ ] AI API keys configured
- [ ] NextAuth secrets set

### ✅ Services Running

- [ ] AI Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Database accessible

## 🔧 Chi tiết từng bước

### Bước 1: Clone và Dependencies

```bash
# Clone repository
git clone https://github.com/your-username/lucky_.git
cd lucky_

# Cài đặt Node.js dependencies
pnpm install

# Cài đặt Python dependencies
cd aiapi
pip install -e .
cd ..
```

### Bước 2: Database Setup

```bash
# Tạo database (PostgreSQL)
createdb postgres

# Hoặc với psql
psql -U postgres -c "CREATE DATABASE postgres;"

# Apply migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed
```

### Bước 3: Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

Cập nhật `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/postgres?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_AI_API_URL="http://localhost:8000/api/v1"
```

### Bước 4: Khởi chạy Services

**Terminal 1 - AI Backend:**

```bash
cd aiapi
python run.py
```

**Terminal 2 - Frontend:**

```bash
pnpm dev
```

### Bước 5: Verify Setup

- Frontend: `http://localhost:3000`
- AI API Docs: `http://localhost:8000/docs`
- Database Studio: `npx prisma studio`

## 🐛 Troubleshooting nhanh

### Database connection error

```bash
# Kiểm tra PostgreSQL
brew services list | grep postgresql
sudo systemctl status postgresql

# Test connection
psql -U postgres -d postgres
```

### Port conflicts

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Dependencies issues

```bash
# Reset Node.js
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Reset Python
cd aiapi
pip install --upgrade pip
pip install -e .
```

## 🎯 Các tính năng chính để test

### 1. Authentication

- Đăng ký tài khoản mới
- Đăng nhập/đăng xuất

### 2. Story Generation

- Tạo story đơn giản
- Tạo story với cấu hình nâng cao
- Xem lịch sử stories

### 3. AI Chat

- Chat với AI assistant
- Test các context khác nhau

### 4. Admin Features

- Quản lý users
- Xem analytics
- Export/Import data

## 📚 Next Steps

Sau khi setup thành công:

1. **Đọc documentation**: [README.md](./README.md)
2. **Explore codebase**: Xem cấu trúc project
3. **Run tests**: `pnpm test`
4. **Check Storybook**: `pnpm storybook`
5. **Setup IDE**: VSCode extensions, ESLint, Prettier

## 🆘 Cần hỗ trợ?

- 📖 [Full Documentation](./README.md)
- 🐍 [AI Backend Guide](./aiapi/SETUP_GUIDE.md)
- 🗄️ [Database Setup](./DATABASE_SETUP.md)
- 🐛 [Create Issue](https://github.com/your-username/lucky_/issues)

---

**Happy coding! 🚀**
