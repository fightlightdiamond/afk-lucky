"use client";

import AuthTest from "@/components/AuthTest";
import ClientOnly from "@/components/ClientOnly";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Authentication Test Page
          </h1>
          <p className="text-gray-600 mb-6">
            Test login và register functionality nhanh chóng
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <Link href="/login">
              <Button variant="outline">Trang Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Trang Register</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Trang chủ</Button>
            </Link>
          </div>
        </div>

        <ClientOnly>
          <AuthTest />
        </ClientOnly>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">📋 Hướng dẫn test</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900">1. Test Login:</h3>
              <p>• Click "Login Test" và "Test Login"</p>
              <p>• Hoặc vào /login và nhập: admin@example.com / 123456</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">2. Test Register:</h3>
              <p>
                • Click "Register Test" và "Test Register" (tạo user random)
              </p>
              <p>• Hoặc vào /register và điền form</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">3. Test Logout:</h3>
              <p>• Sau khi login, click "Test Logout"</p>
              <p>• Hoặc dùng nút "Đăng xuất" ở header</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
