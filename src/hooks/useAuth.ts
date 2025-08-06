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

// Register mutation
export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Update Zustand store
      login(data.token, data.user);

      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });

      // Show success message
      toast.success(data.message || `Chào mừng ${data.user.name}!`);

      // Navigate to home page
      router.push("/");
    },
    onError: (error: any) => {
      console.error("Register failed:", error);

      // Show error message
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";

      if (error.status === 409) {
        errorMessage = "Email hoặc số điện thoại đã được sử dụng!";
      } else if (error.status === 400) {
        errorMessage = "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
      }

      toast.error(errorMessage);
    },
  });
}

// Forgot password mutation
export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => {
      toast.success(data.message);

      // In development, show reset link
      if (data.resetLink) {
        console.log("🔗 Reset link:", data.resetLink);
        toast.info("Check console for reset link (dev only)");
      }
    },
    onError: (error: any) => {
      console.error("Forgot password failed:", error);
      toast.error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    },
  });
}

// Reset password mutation
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (data) => {
      toast.success(data.message);

      // Navigate to login page after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: (error: any) => {
      console.error("Reset password failed:", error);
      toast.error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
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
