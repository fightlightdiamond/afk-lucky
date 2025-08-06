"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import ClientOnly from "@/components/ClientOnly";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Link không hợp lệ
            </CardTitle>
            <CardDescription className="text-center">
              Link reset mật khẩu không hợp lệ hoặc đã hết hạn
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-500"
            >
              Yêu cầu link mới
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ResetPasswordForm token={token} email={email} />;
}

export default function ResetPasswordPage() {
  return (
    <ClientOnly
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="animate-pulse">
            <div className="w-96 h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="animate-pulse">
              <div className="w-96 h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </ClientOnly>
  );
}
