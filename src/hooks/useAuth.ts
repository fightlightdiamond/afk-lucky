import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store";
import { toast } from "sonner";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

// Get user profile
export function useProfile() {
  const { isAuthenticated, token } = useAuthStore();

  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(token!),
    enabled: isAuthenticated && !!token,
  });
}

// Login mutation
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Update Zustand store
      login(data.token, data.user);

      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });

      // Show success message
      toast.success(`Chào mừng ${data.user.name}!`);

      // Navigate to home page
      router.push("/");
    },
    onError: (error: any) => {
      console.error("Login failed:", error);

      // Show error message
      const errorMessage =
        error.status === 401
          ? "Sai email hoặc mật khẩu!"
          : "Đăng nhập thất bại. Vui lòng thử lại.";

      toast.error(errorMessage);
    },
  });
}

// Logout mutation
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear Zustand store
      logout();

      // Clear all queries
      queryClient.clear();

      // Show success message
      toast.success("Đăng xuất thành công!");

      // Navigate to login page
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout failed:", error);

      // Still logout locally even if API call fails
      logout();
      queryClient.clear();

      toast.success("Đăng xuất thành công!");
      router.push("/login");
    },
  });
}
