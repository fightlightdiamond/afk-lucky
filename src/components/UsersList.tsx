"use client";

import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { useAuthStore } from "@/store";

export default function UsersList() {
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading, error, refetch } = useUsers();
  const deleteUserMutation = useDeleteUser();

  if (!isAuthenticated) {
    return <div className="p-4">Please login to view users</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading users: {error.message}
        <button
          onClick={() => refetch()}
          className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUserMutation.mutateAsync(userId);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Users List</h2>
        <button
          onClick={() => refetch()}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {data?.users?.map((user: any) => (
          <div
            key={user.id}
            className="flex justify-between items-center p-3 border rounded-lg"
          >
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <button
              onClick={() => handleDeleteUser(user.id)}
              disabled={deleteUserMutation.isPending}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
      </div>

      {data?.users?.length === 0 && (
        <p className="text-gray-500 text-center py-8">No users found</p>
      )}
    </div>
  );
}
