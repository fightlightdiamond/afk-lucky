"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store";
import {
  useLogin,
  useRegister,
  useLogout,
  useForgotPassword,
} from "@/hooks/useAuth";

export default function AuthTest() {
  const { isAuthenticated, user } = useAuthStore();
  const [testMode, setTestMode] = useState<"login" | "register" | "forgot">(
    "login"
  );

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const forgotPasswordMutation = useForgotPassword();

  const testLogin = async () => {
    try {
      await loginMutation.mutateAsync({
        email: "admin@example.com",
        password: "123456",
      });
    } catch (error) {
      console.error("Test login failed:", error);
    }
  };

  const testRegister = async () => {
    const randomId = Math.floor(Math.random() * 1000);
    try {
      await registerMutation.mutateAsync({
        firstName: "Test",
        lastName: "User",
        email: `test${randomId}@example.com`,
        password: "123456",
      });
    } catch (error) {
      console.error("Test register failed:", error);
    }
  };

  const testLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Test logout failed:", error);
    }
  };

  if (isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-green-600">✅ Đã đăng nhập</CardTitle>
          <CardDescription>Chào mừng {user?.name}!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>ID:</strong> {user?.id}
            </p>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Đang hoạt động
            </Badge>
          </div>

          <Button
            onClick={testLogout}
            disabled={logoutMutation.isPending}
            variant="outline"
            className="w-full"
          >
            {logoutMutation.isPending ? "Đang đăng xuất..." : "Test Logout"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🧪 Test Authentication</CardTitle>
        <CardDescription>Test login và register functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={testMode === "login" ? "default" : "outline"}
            onClick={() => setTestMode("login")}
            size="sm"
          >
            Login Test
          </Button>
          <Button
            variant={testMode === "register" ? "default" : "outline"}
            onClick={() => setTestMode("register")}
            size="sm"
          >
            Register Test
          </Button>
        </div>

        {testMode === "login" ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Test Account:</strong>
              </p>
              <p>Email: admin@example.com</p>
              <p>Password: 123456</p>
            </div>
            <Button
              onClick={testLogin}
              disabled={loginMutation.isPending}
              className="w-full"
            >
              {loginMutation.isPending ? "Đang đăng nhập..." : "Test Login"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p>
                <strong>Sẽ tạo user mới:</strong>
              </p>
              <p>Tên: Test User</p>
              <p>Email: test[random]@example.com</p>
              <p>Password: 123456</p>
            </div>
            <Button
              onClick={testRegister}
              disabled={registerMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {registerMutation.isPending ? "Đang đăng ký..." : "Test Register"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
