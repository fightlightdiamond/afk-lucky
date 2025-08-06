"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuthStore } from "@/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function HomePage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chào mừng trở lại, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý tài khoản và thông tin của bạn
          </p>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Chi tiết về tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tên người dùng
                </label>
                <p className="mt-1 text-sm font-medium">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="mt-1 text-sm font-medium">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  ID người dùng
                </label>
                <p className="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {user?.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Trạng thái
                </label>
                <div className="mt-1">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Đang hoạt động
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hồ sơ</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Quản lý thông tin tài khoản và cài đặt bảo mật
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cài đặt</CardTitle>
              <CardDescription>Tùy chỉnh trải nghiệm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Thay đổi giao diện, ngôn ngữ và các tùy chọn khác
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hỗ trợ</CardTitle>
              <CardDescription>Nhận trợ giúp</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Liên hệ với đội ngũ hỗ trợ hoặc xem tài liệu
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}
