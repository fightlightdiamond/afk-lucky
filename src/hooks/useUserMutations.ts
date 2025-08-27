import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, CreateUserRequest, UpdateUserRequest } from "@/types/user";

interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role_id: string;
  is_active: boolean;
  locale?: string;
}

interface UpdateUserData extends CreateUserData {
  id: string;
}

// API functions
async function createUser(data: CreateUserData): Promise<User> {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || "Failed to create user");
  }

  const result = await response.json();
  return result.user || result.data || result;
}

async function updateUser(data: UpdateUserData): Promise<User> {
  const { id, ...updateData } = data;
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || "Failed to update user");
  }

  const result = await response.json();
  return result.user || result.data || result;
}

async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || "Failed to delete user");
  }
}

async function toggleUserStatus(
  userId: string,
  isActive: boolean
): Promise<User> {
  console.log("Toggling user status:", { userId, isActive });

  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_active: isActive }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || error.message || "Failed to update user status"
    );
  }

  const result = await response.json();
  console.log("Toggle user status response:", result);
  return result;
}

async function changeUserStatus(
  userId: string,
  newStatus: "active" | "inactive" | "banned",
  reason?: string
): Promise<User> {
  console.log("Changing user status:", { userId, newStatus, reason });

  const isActive = newStatus === "active";
  const action =
    newStatus === "banned"
      ? "ban"
      : newStatus === "active"
      ? "activate"
      : "deactivate";

  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      is_active: isActive,
      action,
      reason: reason || `User ${action}d via admin interface`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || error.message || "Failed to update user status"
    );
  }

  const result = await response.json();
  console.log("Change user status response:", result);
  return result;
}

// Custom hooks
export function useUserMutations() {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users"] });
      const displayName = `${data.first_name} ${data.last_name}`;
      toast.success(`User "${displayName}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users"] });
      const displayName = `${data.first_name} ${data.last_name}`;
      toast.success(`User "${displayName}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      toggleUserStatus(userId, isActive),
    onSuccess: (data) => {
      // Invalidate all user queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users"] });
      const displayName = `${data.first_name} ${data.last_name}`;
      const status = data.is_active ? "activated" : "deactivated";
      toast.success(`User "${displayName}" ${status} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user status: ${error.message}`);
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({
      userId,
      newStatus,
      reason,
    }: {
      userId: string;
      newStatus: "active" | "inactive" | "banned";
      reason?: string;
    }) => changeUserStatus(userId, newStatus, reason),
    onSuccess: (data) => {
      // Invalidate all user queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.refetchQueries({ queryKey: ["users"] });
      const displayName = `${data.first_name} ${data.last_name}`;
      const statusText = data.is_active ? "activated" : "deactivated";
      toast.success(`User "${displayName}" ${statusText} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to change user status: ${error.message}`);
    },
  });

  return {
    createUser: createUserMutation,
    updateUser: updateUserMutation,
    deleteUser: deleteUserMutation,
    toggleStatus: toggleStatusMutation,
    changeStatus: changeStatusMutation,
  };
}
