import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useProfile,
  useSessionValidation,
  useLogin,
  useRegister,
  useForgotPassword,
  useResetPassword,
  useLogout,
  authKeys,
} from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Mock dependencies
vi.mock("@/lib/api");
vi.mock("@/store");
vi.mock("sonner");
vi.mock("next/navigation");

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "USER",
};

const mockAuthStore = {
  isAuthenticated: true,
  token: "mock-token",
  user: mockUser,
  isSessionValid: vi.fn(() => true),
  setRefreshing: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  setInitializing: vi.fn(),
};

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useAuth hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue(mockAuthStore);
    (useRouter as any).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("useProfile", () => {
    it("should fetch user profile when authenticated", async () => {
      const mockProfile = { user: mockUser };
      (authApi.getProfile as any).mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProfile);
      expect(authApi.getProfile).toHaveBeenCalledWith("mock-token");
      expect(mockAuthStore.setRefreshing).toHaveBeenCalledWith(true);
      expect(mockAuthStore.setRefreshing).toHaveBeenCalledWith(false);
    });

    it("should not fetch profile when not authenticated", () => {
      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(authApi.getProfile).not.toHaveBeenCalled();
    });

    it("should not fetch profile when no token", () => {
      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        token: null,
      });

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(authApi.getProfile).not.toHaveBeenCalled();
    });

    it("should not fetch profile when session is invalid", () => {
      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        isSessionValid: vi.fn(() => false),
      });

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(authApi.getProfile).not.toHaveBeenCalled();
    });

    it("should handle profile fetch errors", async () => {
      const error = new Error("Profile fetch failed");
      (authApi.getProfile as any).mockRejectedValue(error);

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
      expect(mockAuthStore.setRefreshing).toHaveBeenCalledWith(false);
    });
  });

  describe("useSessionValidation", () => {
    it("should logout when session is invalid", () => {
      const mockQueryClient = {
        clear: vi.fn(),
      };

      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        isSessionValid: vi.fn(() => false),
      });

      renderHook(() => useSessionValidation(), {
        wrapper: createWrapper(),
      });

      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Phiên đăng nhập đã hết hạn!");
    });

    it("should not logout when session is valid", () => {
      renderHook(() => useSessionValidation(), {
        wrapper: createWrapper(),
      });

      expect(mockAuthStore.logout).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("should not logout when not authenticated", () => {
      (useAuthStore as any).mockReturnValue({
        ...mockAuthStore,
        isAuthenticated: false,
      });

      renderHook(() => useSessionValidation(), {
        wrapper: createWrapper(),
      });

      expect(mockAuthStore.logout).not.toHaveBeenCalled();
    });
  });

  describe("useLogin", () => {
    const loginData = {
      email: "test@example.com",
      password: "password123",
    };

    const loginResponse = {
      token: "new-token",
      user: mockUser,
    };

    it("should login successfully", async () => {
      (authApi.login as any).mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(loginData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.login).toHaveBeenCalledWith(loginData);
      expect(mockAuthStore.login).toHaveBeenCalledWith(
        "new-token",
        mockUser,
        24 * 60 * 60 * 1000
      );
      expect(toast.success).toHaveBeenCalledWith(`Chào mừng ${mockUser.name}!`);
      expect(mockRouter.push).toHaveBeenCalledWith("/");
      expect(mockAuthStore.setInitializing).toHaveBeenCalledWith(true);
      expect(mockAuthStore.setInitializing).toHaveBeenCalledWith(false);
    });

    it("should handle 401 login error", async () => {
      const error = { status: 401, message: "Unauthorized" };
      (authApi.login as any).mockRejectedValue(error);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(loginData);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith("Sai email hoặc mật khẩu!");
      expect(mockAuthStore.setInitializing).toHaveBeenCalledWith(false);
    });

    it("should handle 429 rate limit error", async () => {
      const error = { status: 429, message: "Too many requests" };
      (authApi.login as any).mockRejectedValue(error);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(loginData);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Quá nhiều lần thử. Vui lòng thử lại sau."
      );
    });

    it("should handle generic login error", async () => {
      const error = { status: 500, message: "Server error" };
      (authApi.login as any).mockRejectedValue(error);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(loginData);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Đăng nhập thất bại. Vui lòng thử lại."
      );
    });
  });

  describe("useRegister", () => {
    const registerData = {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    };

    const registerResponse = {
      token: "new-token",
      user: mockUser,
      message: "Registration successful",
    };

    it("should register successfully", async () => {
      (authApi.register as any).mockResolvedValue(registerResponse);

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(registerData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.register).toHaveBeenCalledWith(registerData);
      expect(mockAuthStore.login).toHaveBeenCalledWith("new-token", mockUser);
      expect(toast.success).toHaveBeenCalledWith("Registration successful");
      expect(mockRouter.push).toHaveBeenCalledWith("/");
    });

    it("should handle 409 conflict error", async () => {
      const error = { status: 409, message: "Email already exists" };
      (authApi.register as any).mockRejectedValue(error);

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(registerData);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Email hoặc số điện thoại đã được sử dụng!"
      );
    });

    it("should handle 400 validation error", async () => {
      const error = { status: 400, message: "Invalid data" };
      (authApi.register as any).mockRejectedValue(error);

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(registerData);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        "Thông tin không hợp lệ. Vui lòng kiểm tra lại."
      );
    });
  });

  describe("useForgotPassword", () => {
    const forgotPasswordData = {
      email: "test@example.com",
    };

    it("should send forgot password request successfully", async () => {
      const response = {
        message: "Reset link sent",
        resetLink: "http://example.com/reset?token=abc123",
      };
      (authApi.forgotPassword as any).mockResolvedValue(response);

      const { result } = renderHook(() => useForgotPassword(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(forgotPasswordData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.forgotPassword).toHaveBeenCalledWith(forgotPasswordData);
      expect(toast.success).toHaveBeenCalledWith("Reset link sent");
      expect(toast.info).toHaveBeenCalledWith(
        "Check console for reset link (dev only)"
      );
    });

    it("should handle forgot password errors", async () => {
      const error = { message: "User not found" };
      (authApi.forgotPassword as any).mockRejectedValue(error);

      const { result } = renderHook(() => useForgotPassword(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(forgotPasswordData);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith("User not found");
    });
  });

  describe("useResetPassword", () => {
    const resetPasswordData = {
      token: "reset-token",
      password: "newpassword123",
    };

    it("should reset password successfully", async () => {
      const response = { message: "Password reset successful" };
      (authApi.resetPassword as any).mockResolvedValue(response);

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(resetPasswordData);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.resetPassword).toHaveBeenCalledWith(resetPasswordData);
      expect(toast.success).toHaveBeenCalledWith("Password reset successful");

      // Wait for navigation timeout
      await waitFor(
        () => {
          expect(mockRouter.push).toHaveBeenCalledWith("/login");
        },
        { timeout: 2100 }
      );
    });

    it("should handle reset password errors", async () => {
      const error = { message: "Invalid token" };
      (authApi.resetPassword as any).mockRejectedValue(error);

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate(resetPasswordData);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith("Invalid token");
    });
  });

  describe("useLogout", () => {
    it("should logout successfully", async () => {
      (authApi.logout as any).mockResolvedValue({});

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.logout).toHaveBeenCalled();
      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Đăng xuất thành công!");
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });

    it("should logout locally even when API call fails", async () => {
      const error = new Error("Logout API failed");
      (authApi.logout as any).mockRejectedValue(error);

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(mockAuthStore.logout).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Đăng xuất thành công!");
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
  });

  describe("authKeys", () => {
    it("should generate correct query keys", () => {
      expect(authKeys.all).toEqual(["auth"]);
      expect(authKeys.profile()).toEqual(["auth", "profile"]);
      expect(authKeys.session()).toEqual(["auth", "session"]);
    });
  });
});
