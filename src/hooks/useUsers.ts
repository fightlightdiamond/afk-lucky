import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { userApi, ApiError } from "@/lib/api";
import type { User } from "@/types/user";
import { useUserStore } from "@/store";
import type { UserFilters } from "@/store/userStore";
import { toast } from "sonner";

// Query keys factory
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Get users with filters
export function useUsers(): UseQueryResult<{ users: User[] }, ApiError> {
  const { userFilters } = useUserStore();

  return useQuery<{ users: User[] }, ApiError>({
    queryKey: userKeys.list(userFilters),
    queryFn: userApi.getUsers,
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => {
      let users: User[] = data.users;

      // Apply client-side filtering
      if (userFilters.search) {
        const search = userFilters.search.toLowerCase();
        users = users.filter(
          (user) =>
            user.name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search)
        );
      }

      if (userFilters.role) {
        users = users.filter((user) => user.role === userFilters.role);
      }

      if (userFilters.status) {
        users = users.filter((user) => user.status === userFilters.status);
      }

      // Apply sorting
      const sortBy = userFilters.sortBy as keyof User;
      users.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (userFilters.sortOrder === "asc") {
          return aValue! > bValue! ? 1 : -1;
        } else {
          return aValue! < bValue! ? 1 : -1;
        }
      });

      return { users };
    },
  });
}

// Get single user
export function useUser(id: string): UseQueryResult<{ user: User }, ApiError> {
  return useQuery<{ user: User }, ApiError>({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create user mutation
export function useCreateUser(): UseMutationResult<
  { user: User },
  ApiError,
  Partial<User>
> {
  const queryClient = useQueryClient();

  return useMutation<{ user: User }, ApiError, Partial<User>>({
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
    onError: (error) => {
      toast.error(error.message || "Tạo người dùng thất bại!");
    },
  });
}

// Update user mutation
export function useUpdateUser(): UseMutationResult<
  { user: User },
  ApiError,
  { id: string; data: Partial<User> }
> {
  const queryClient = useQueryClient();

  return useMutation<{ user: User }, ApiError, { id: string; data: Partial<User> }>(
    {
      mutationFn: ({ id, data }) => userApi.updateUser(id, data),
      onSuccess: (data, variables) => {
        // Update cache
        queryClient.setQueryData(userKeys.detail(variables.id), {
          user: data.user,
        });

        // Invalidate lists to refresh
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });

        toast.success("Cập nhật người dùng thành công!");
      },
      onError: (error) => {
        toast.error(error.message || "Cập nhật người dùng thất bại!");
      },
    }
  );
}

// Delete user mutation
export function useDeleteUser(): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();
  const { clearSelection } = useUserStore();

  return useMutation<void, ApiError, string>({
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
    onError: (error) => {
      toast.error(error.message || "Xóa người dùng thất bại!");
    },
  });
}

// Bulk delete users mutation
export function useBulkDeleteUsers(): UseMutationResult<
  string[],
  ApiError,
  string[]
> {
  const queryClient = useQueryClient();
  const { clearSelection } = useUserStore();

  return useMutation<string[], ApiError, string[]>({
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
    onError: (error) => {
      toast.error(error.message || "Xóa người dùng thất bại!");
    },
  });
}
