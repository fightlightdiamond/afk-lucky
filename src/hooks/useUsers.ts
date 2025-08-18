import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { useUserStore } from "@/store";
import { toast } from "sonner";

// Query keys factory
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: any) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Get users with filters
export function useUsers() {
  const { userFilters } = useUserStore();

  return useQuery({
    queryKey: userKeys.list(userFilters),
    queryFn: () => userApi.getUsers(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => {
      let users = data.users;

      // Apply client-side filtering
      if (userFilters.search) {
        const search = userFilters.search.toLowerCase();
        users = users.filter(
          (user: any) =>
            user.name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search)
        );
      }

      if (userFilters.role) {
        users = users.filter((user: any) => user.role === userFilters.role);
      }

      if (userFilters.status) {
        users = users.filter((user: any) => user.status === userFilters.status);
      }

      // Apply sorting
      users.sort((a: any, b: any) => {
        const aValue = a[userFilters.sortBy];
        const bValue = b[userFilters.sortBy];

        if (userFilters.sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      return { users };
    },
  });
}

// Get single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: (data) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // Add to cache
      queryClient.setQueryData(userKeys.detail(data.user.id), {
        user: data.user,
      });

      toast.success("Tạo người dùng thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Tạo người dùng thất bại!");
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      userApi.updateUser(id, data),
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData(userKeys.detail(variables.id), {
        user: data.user,
      });

      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      toast.success("Cập nhật người dùng thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Cập nhật người dùng thất bại!");
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { clearSelection } = useUserStore();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // Clear selection if deleted user was selected
      clearSelection();

      toast.success("Xóa người dùng thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Xóa người dùng thất bại!");
    },
  });
}

// Bulk delete users mutation
export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();
  const { clearSelection } = useUserStore();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      // Delete users in parallel
      await Promise.all(userIds.map((id) => userApi.deleteUser(id)));
      return userIds;
    },
    onSuccess: (deletedIds) => {
      // Remove from cache
      deletedIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // Clear selection
      clearSelection();

      toast.success(`Đã xóa ${deletedIds.length} người dùng!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Xóa người dùng thất bại!");
    },
  });
}
