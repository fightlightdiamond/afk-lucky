"use client";

import { useAuthStore } from "@/store";

export default function AuthExample() {
  const { isAuthenticated, user, login, logout } = useAuthStore();

  const handleLogin = () => {
    // Example login
    login("sample-token", {
      id: "1",
      email: "user@example.com",
      name: "John Doe",
    });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Auth Status</h2>

      {isAuthenticated ? (
        <div>
          <p className="text-green-600">✅ Logged in as: {user?.name}</p>
          <p className="text-sm text-gray-600">Email: {user?.email}</p>
          <button
            onClick={logout}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p className="text-red-600">❌ Not logged in</p>
          <button
            onClick={handleLogin}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}
