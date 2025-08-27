# Debug User Management Issues

## Vấn đề hiện tại: "No users found"

### Các bước debug:

#### 1. Kiểm tra Database Connection

- Truy cập: `/test-db`
- Xem có kết nối được database không
- Kiểm tra có users trong database không

#### 2. Kiểm tra API Endpoint

- Truy cập: `/test-users-api`
- Xem API `/api/admin/users` có hoạt động không
- Kiểm tra response structure

#### 3. Kiểm tra Authentication

- Đảm bảo đã đăng nhập với tài khoản admin
- Kiểm tra session có hợp lệ không
- Xem console có lỗi authentication không

#### 4. Kiểm tra Console Logs

- Mở Developer Tools → Console
- Xem có error messages không
- Tìm "UserManagementPage Debug" logs

#### 5. Kiểm tra Network Tab

- Mở Developer Tools → Network
- Reload trang `/admin/users`
- Xem request đến `/api/admin/users` có thành công không
- Kiểm tra response data

### Các lỗi thường gặp:

#### Database Issues:

- Database chưa được seed
- Connection string sai
- Prisma schema không sync

#### Authentication Issues:

- Chưa đăng nhập
- Session expired
- Không có quyền admin

#### API Issues:

- Route handler bị lỗi
- Middleware block request
- CORS issues

### Quick Fixes:

#### 1. Seed Database:

```bash
npm run db:seed
```

#### 2. Reset Database:

```bash
npx prisma db push --force-reset
npm run db:seed
```

#### 3. Check Environment:

```bash
# Kiểm tra .env file
cat .env | grep DATABASE_URL
```

#### 4. Restart Development Server:

```bash
npm run dev
```

### Debug Pages Created:

- `/test-db` - Test database connection
- `/test-users-api` - Test users API
- `/test-export` - Test export functionality

### Expected Data Structure:

```typescript
// API Response (/api/admin/users)
{
  users: User[],
  pagination: {
    page: number,
    pageSize: number,
    total: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  },
  filters: UserFilters,
  metadata?: {...}
}

// User Object
{
  id: string,
  email: string,
  first_name: string,
  last_name: string,
  full_name: string,
  is_active: boolean,
  role?: {
    id: string,
    name: string,
    permissions: string[]
  },
  created_at: string,
  updated_at: string,
  last_login?: string,
  // ... other fields
}
```

### Next Steps:

1. Truy cập `/test-db` để kiểm tra database
2. Truy cập `/test-users-api` để kiểm tra API
3. Kiểm tra console logs trong `/admin/users`
4. Báo cáo kết quả để debug tiếp
