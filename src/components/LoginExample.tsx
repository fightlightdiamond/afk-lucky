"use client";

import { useState } from "react";
import { useLogin, useLogout, useProfile } from "@/hooks/useAuth";
import { useAuthStore } from "@/store";

export default function LoginExample() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { isAuthenticated, user } = useAuthStore();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="p-6 border rounded-lg max-w-md">
        <h2 className="text-xl font-bold mb-4">Welcome!</h2>

        <div className="space-y-2 mb-4">
          <p>
            <strong>User:</strong> {user?.name}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>

          {profileLoading && (
            <p className="text-sm text-gray-500">Loading profile...</p>
          )}
          {profile && (
            <div className="text-sm text-gray-600">
              <p>Profile loaded from API ✅</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg max-w-md">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        {loginMutation.error && (
          <div className="text-red-600 text-sm">
            Login failed: {loginMutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
