"use client";

import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/store";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function LogoutButton({
  variant = "outline",
  size = "default",
  className,
}: LogoutButtonProps) {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang đăng xuất...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </>
      )}
    </Button>
  );
}
