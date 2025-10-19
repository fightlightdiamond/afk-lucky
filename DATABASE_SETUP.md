# Hướng dẫn thiết lập Database

## 🚀 Thiết lập nhanh

### 1. Reset toàn bộ database (Khuyến nghị)

```bash
npm run db:reset
```

Script này sẽ:

- Dừng và xóa containers cũ
- Xóa volumes database cũ
- Khởi động PostgreSQL container mới
- Chạy migrations
- Chạy seeder với dữ liệu mẫu
- Tạo Prisma client

### 2. Kiểm tra trạng thái database

```bash
npm run db:check
```

## 📋 Các lệnh database khác

### Chỉ chạy seeder

```bash
npm run db:seed
```

``

### Tạo Prisma client

```bash
npm run db:generate
```

### Mở Prisma Studio (GUI)

```bash
npm run db:studio
```

## 🔧 Thiết lập thủ công

### 1. Khởi động Docker services

```bash
docker-compose up -d
```

### 2. Chạy migrations

```bash
npx prisma migrate deploy
```

### 3. Chạy seeder

```bash
npx prisma db seed
```

## 👥 Tài khoản mẫu sau khi seed

| Email                 | Password | Role      | Mô tả                     |
| --------------------- | -------- | --------- | ------------------------- |
| admin@example.com     | 123456   | ADMIN     | Quản trị viên hệ thống    |
| editor@example.com    | 123456   | EDITOR    | Biên tập viên             |
| author@example.com    | 123456   | AUTHOR    | Tác giả                   |
| moderator@example.com | 123456   | MODERATOR | Kiểm duyệt viên           |
| user@example.com      | 123456   | USER      | Người dùng thường         |
| inactive@example.com  | 123456   | USER      | Tài khoản không hoạt động |

## 🐘 Thông tin Database

- **Host**: localhost
- **Port**: 5432
- **Database**: postgres
- **Username**: hero
- **Password**: hero123

## 📊 Dữ liệu mẫu được tạo

### Roles

- ADMIN: Toàn quyền hệ thống
- EDITOR: Quyền biên tập nội dung
- AUTHOR: Quyền tạo nội dung
- MODERATOR: Quyền kiểm duyệt
- USER: Quyền cơ bản

### Story Templates

- Câu chuyện công nghệ (💻)
- Câu chuyện kinh doanh (💼)
- Câu chuyện cuộc sống (🌟)
- Câu chuyện giáo dục (📚)

### Story Versions

- Simple: Phiên bản miễn phí
- Advanced: Phiên bản trả phí

## 🔍 Troubleshooting

### Database không kết nối được

```bash
# Kiểm tra Docker đang chạy
docker ps

# Khởi động lại database
docker-compose restart db

# Kiểm tra logs
docker-compose logs db
```

### Lỗi migration

```bash
# Reset migrations
npx prisma migrate reset --force

# Chạy lại migrations
npx prisma migrate deploy
```

### Lỗi seeder

```bash
# Xóa dữ liệu và chạy lại
npx prisma migrate reset --force
npx prisma db seed
```

## 🌐 Services khác

### MailHog (Email testing)

- URL: http://localhost:8027
- SMTP: localhost:1027

### Redis

- Host: localhost
- Port: 6379

## 📝 Ghi chú

- Tất cả mật khẩu mẫu đều là `123456`
- Database sử dụng PostgreSQL với extensions `pg_trgm` và `unaccent`
- Dữ liệu mẫu được tạo với locale tiếng Việt
- Tài khoản admin có 10,000 coin, các tài khoản khác có ít hơn

### Chỉ chạy migrations

```bash
npm run db:migrate
`
```
