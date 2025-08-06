"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Wait for hydration
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Only check authentication after hydration
    if (isHydrated && (!isAuthenticated || !token)) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, token, router, isHydrated]);

  // Show loading while hydrating or checking authentication
  if (!isHydrated || !isAuthenticated || !token) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p className="mt-2 text-sm text-gray-600">
              Đang kiểm tra xác thực...
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
