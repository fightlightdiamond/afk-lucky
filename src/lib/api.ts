// API utility functions for TanStack Query

// Import types
import {
  GetUsersParams,
  UsersResponse,
  User as AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  BulkOperationRequest,
  BulkOperationResult,
} from "@/types/user";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`;
      let errorDetails;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        errorDetails = errorData;
      } catch {
        // If we can't parse the error response, use the status text
      }

      const error = new ApiError(errorMessage, response.status);
      (error as any).details = errorDetails;
      throw error;
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timeout", 408);
    }

    throw error;
  }
}

// Types for auth
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Registration types
export interface RegisterRequest {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
  message: string;
}

// Auth API functions
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return apiRequest<LoginResponse>("/api/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: RegisterRequest) => {
    return apiRequest<RegisterResponse>("/api/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest<{ message: string; resetLink?: string }>(
      "/api/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  },

  resetPassword: async (data: {
    token: string;
    email: string;
    password: string;
  }) => {
    return apiRequest<{ message: string }>("/api/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout: async () => {
    return apiRequest("/api/logout", { method: "POST" });
  },

  getProfile: async (token: string) => {
    return apiRequest<{ user: User }>("/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// User API functions
export const userApi = {
  getUsers: async (params?: GetUsersParams) => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `/api/admin/users${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    return apiRequest<UsersResponse>(url);
  },

  getUser: async (id: string) => {
    return apiRequest<AdminUser>(`/api/admin/users/${id}`);
  },

  createUser: async (userData: CreateUserRequest) => {
    return apiRequest<AdminUser>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id: string, userData: UpdateUserRequest) => {
    return apiRequest<AdminUser>(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id: string) => {
    return apiRequest(`/api/admin/users/${id}`, { method: "DELETE" });
  },

  // New bulk operations
  bulkOperation: async (request: BulkOperationRequest) => {
    return apiRequest<BulkOperationResult>("/api/admin/users/bulk", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  // Convenience methods for specific bulk operations
  bulkBan: async (userIds: string[]) => {
    return userApi.bulkOperation({ operation: "ban", userIds });
  },

  bulkUnban: async (userIds: string[]) => {
    return userApi.bulkOperation({ operation: "unban", userIds });
  },

  bulkDelete: async (userIds: string[]) => {
    return userApi.bulkOperation({ operation: "delete", userIds });
  },

  bulkAssignRole: async (userIds: string[], roleId: string) => {
    return userApi.bulkOperation({ operation: "assign_role", userIds, roleId });
  },

  // Enhanced methods for better data management
  getUsersCount: async (filters?: Partial<GetUsersParams>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    params.append("pageSize", "1"); // Minimal query for count

    const response = await apiRequest<UsersResponse>(
      `/api/admin/users?${params.toString()}`
    );
    return response.pagination.total;
  },

  // Prefetch users for better UX
  prefetchUsers: async (params: GetUsersParams) => {
    return userApi.getUsers(params);
  },

  // Get user suggestions for search
  getUserSuggestions: async (query: string, limit: number = 10) => {
    const response = await userApi.getUsers({
      search: query,
      pageSize: limit,
      page: 1,
    });
    return response.users.map((user) => ({
      id: user.id,
      label: `${user.full_name} (${user.email})`,
      value: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role?.name,
    }));
  },
};
