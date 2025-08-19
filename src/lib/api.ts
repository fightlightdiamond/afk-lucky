// API utility functions for TanStack Query
import type { User } from "@/types/user";

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
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(`API Error: ${response.statusText}`, response.status);
  }

  return response.json();
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
  getUsers: async () => {
    return apiRequest<{ users: User[] }>("/api/users");
  },

  getUser: async (id: string) => {
    return apiRequest<{ user: User }>(`/api/users/${id}`);
  },

  createUser: async (userData: Partial<User>) => {
    return apiRequest<{ user: User }>("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    return apiRequest<{ user: User }>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id: string) => {
    return apiRequest(`/api/users/${id}`, { method: "DELETE" });
  },
};
