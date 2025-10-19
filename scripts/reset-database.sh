#!/bin/bash

# Script để thiết lập lại database và seeder
# Sử dụng: ./scripts/reset-database.sh

set -e  # Dừng script nếu có lỗi

echo "🚀 Bắt đầu thiết lập lại database..."

# Kiểm tra Docker đã chạy chưa
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker chưa chạy. Vui lòng khởi động Docker trước."
    exit 1
fi

echo "📦 Dừng và xóa containers cũ..."
docker-compose down -v --remove-orphans

echo "🗑️  Xóa volumes cũ..."
docker volume prune -f

echo "🐘 Khởi động PostgreSQL container..."
docker-compose up -d db

echo "⏳ Chờ PostgreSQL khởi động hoàn tất..."
sleep 10

# Kiểm tra kết nối database
echo "🔍 Kiểm tra kết nối database..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker-compose exec -T db pg_isready -U hero -d postgres > /dev/null 2>&1; then
        echo "✅ Database đã sẵn sàng!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Không thể kết nối database sau $max_attempts lần thử"
        exit 1
    fi
    
    echo "⏳ Thử lại... ($attempt/$max_attempts)"
    sleep 2
    ((attempt++))
done

echo "🔄 Reset Prisma migrations..."
npx prisma migrate reset --force --skip-seed

echo "📊 Chạy migrations..."
npx prisma migrate deploy

echo "🌱 Chạy seeder..."
npx prisma db seed

echo "🎯 Tạo Prisma client..."
npx prisma generate

echo "✅ Hoàn thành! Database đã được thiết lập lại thành công."
echo ""
echo "📋 Thông tin đăng nhập admin:"
echo "   Email: admin@example.com"
echo "   Password: 123456"
echo ""
echo "🌐 Các services đang chạy:"
echo "   - Database: localhost:5432"
echo "   - MailHog: http://localhost:8027"
echo "   - Redis: localhost:6379"