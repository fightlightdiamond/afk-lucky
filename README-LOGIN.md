# 🔐 Login System - Test Guide

## 📋 **Test Credentials**

Use these credentials to test the login functionality:

```
Email: admin@example.com
Password: 123456
```

## 🆕 **Registration**

You can also create new accounts using the registration form:

- Navigate to: `http://localhost:3001/register`
- Fill in the required fields (Tên, Email, Mật khẩu)
- Optional: Họ, Số điện thoại
- Password must be at least 6 characters

## 🚀 **How to Test**

### 1. **Start the Development Server**

```bash
npm run dev
```

### 2. **Access the Pages**

- **Login**: `http://localhost:3001/login`
- **Register**: `http://localhost:3001/register`

### 3. **Test the Login Flow**

1. Enter the test credentials above
2. Click "Đăng nhập"
3. You should be redirected to the home page
4. You'll see a welcome message with user info
5. Use the "Đăng xuất" button to logout

### 4. **Test the Registration Flow**

1. Go to register page
2. Fill in: Tên, Email, Mật khẩu, Xác nhận mật khẩu
3. Optional: Họ, Số điện thoại
4. Click "Đăng ký"
5. You'll be automatically logged in and redirected to home

## 🛠 **System Architecture**

### **State Management**

- **Zustand**: Manages authentication state with persistence
- **TanStack Query**: Handles API calls and caching

### **UI Components**

- **shadcn/ui**: Modern, accessible UI components
- **React Hook Form + Zod**: Form validation
- **Sonner**: Toast notifications

### **Authentication Flow**

1. User submits login form
2. API validates credentials against database
3. JWT token is generated and returned
4. Token is stored in Zustand store (persisted to localStorage)
5. User is redirected to protected routes

## 🔧 **Database Setup**

The system uses PostgreSQL with Prisma ORM:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed test data
npx prisma db seed
```

## 📁 **Key Files**

- `src/components/LoginForm.tsx` - Login form component
- `src/components/RegisterForm.tsx` - Registration form component
- `src/hooks/useAuth.ts` - Authentication hooks (login, register, logout)
- `src/store/authStore.ts` - Auth state management
- `src/app/api/login/route.ts` - Login API endpoint
- `src/app/api/register/route.ts` - Registration API endpoint
- `src/components/ProtectedRoute.tsx` - Route protection

## 🎯 **Features**

### **Login & Registration**

✅ **Form Validation**: Real-time validation with error messages  
✅ **Password Toggle**: Show/hide password functionality  
✅ **Password Confirmation**: Ensure passwords match during registration  
✅ **Loading States**: Visual feedback during login/register process  
✅ **Error Handling**: User-friendly error messages  
✅ **Auto-redirect**: Automatic navigation after login/logout/register  
✅ **Duplicate Prevention**: Check for existing email/phone during registration  
✅ **Persistent Auth**: Login state survives page refresh  
✅ **Protected Routes**: Automatic redirect for unauthorized access  
✅ **Responsive Design**: Works on all screen sizes

## 🐛 **Troubleshooting**

### **White Screen Issue**

- Fixed hydration mismatches between server and client
- Added proper client-side rendering for auth components

### **Database Connection**

- Ensure DATABASE_URL is properly configured in .env
- Run `npx prisma generate` if you see Prisma client errors

### **Port Issues**

- Server automatically uses available port (3001 if 3000 is busy)
- Check console output for the correct URL

## 🔒 **Security Features**

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication tokens
- **Input Validation**: Server-side validation for all inputs
- **CSRF Protection**: Built-in Next.js CSRF protection
- **SQL Injection Prevention**: Prisma ORM prevents SQL injection

## 📱 **Mobile Support**

The login system is fully responsive and works on:

- Desktop browsers
- Mobile devices
- Tablets
- Different screen orientations

---

**Happy Testing! 🎉**
