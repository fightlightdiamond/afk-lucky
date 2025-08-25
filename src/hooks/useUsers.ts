import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { useUserStore } from "@/store";
import { toast } from "sonner";
import {
  User,
  UserFilters,
  GetUsersParams,
  UsersResponse,
  CreateUserRequest,
  UpdateUserRequest,
  BulkOperationRequest,
  BulkOperationResult,
  UserMutationResponse,
} from "@/types/user";

// Query keys factory
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: any) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Get users with filters - now uses server-side filtering
export function useUsers(params?: Partial<GetUsersParams>) {
  const { userFilters } = useUserStore();

  // Merge store filters with provided params
  const queryParams: GetUsersParams = {
    page: params?.page || 1,
    pageSize: params?.pageSize || 20,
    search: params?.search || userFilters.search || undefined,
    role: params?.role || userFilters.role || undefined,
    status: params?.status || userFilters.status || undefined,
    sortBy: params?.sortBy || userFilters.sortBy || "created_at",
    sortOrder: params?.sortOrder || userFilters.sortOrder || "desc",
    dateFrom: params?.dateFrom,
    dateTo: params?.dateTo,
    activityDateFrom: params?.activityDateFrom,
    activityDateTo: params?.activityDateTo,
    hasAvatar: params?.hasAvatar || userFilters.hasAvatar,
    locale: params?.locale || userFilters.locale,
    group_id: params?.group_id || userFilters.group_id,
    activity_status: params?.activity_status || userFilters.activity_status,
  };

  return useQuery({
    queryKey: userKeys.list(queryParams),
    queryFn: () => userApi.getUsers(queryParams),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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

// Get filter options for UI components
export function useUserFilterOptions() {
  return useQuery({
    queryKey: [...userKeys.all, "filter-options"],
    queryFn: async () => {
      // Get a minimal query to fetch filter options
      const response = await userApi.getUsers({ page: 1, pageSize: 1 });
      return {
        roles: response.metadata?.availableRoles || [],
        locales: response.metadata?.availableLocales || [],
        groupIds: response.metadata?.availableGroupIds || [],
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - filter options don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Enhanced hook for user statistics
export function useUserStatistics() {
  return useQuery({
    queryKey: [...userKeys.all, "statistics"],
    queryFn: async () => {
      // Get basic stats from a minimal query
      const response = await userApi.getUsers({ page: 1, pageSize: 1 });
      return response.metadata;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.createUser(data),
    onSuccess: (response: UserMutationResponse) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // Add to cache
      queryClient.setQueryData(userKeys.detail(response.user.id), {
        user: response.user,
      });

      toast.success("User created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create user!");
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userApi.updateUser(id, data),
    onSuccess: (response: UserMutationResponse, variables) => {
      // Update cache
      queryClient.setQueryData(userKeys.detail(variables.id), {
        user: response.user,
      });

      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      toast.success("User updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user!");
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { clearSelection } = useUserStore();

  return useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // Clear selection if deleted user was selected
      clearSelection();

      toast.success("User deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user!");
    },
  });
}

// Enhanced bulk operations hooks
export function useBulkOperation() {
  const queryClient = useQueryClient();
  const { clearSelection } = useUserStore();

  return useMutation({
    mutationFn: (request: BulkOperationRequest) =>
      userApi.bulkOperation(request),
    onSuccess: (result: BulkOperationResult, variables) => {
      // Invalidate lists to refresh data
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // Clear selection
      clearSelection();

      // Show appropriate success message
      const { operation, userIds } = variables;
      const successCount = result.success;
      const failedCount = result.failed;

      if (failedCount === 0) {
        toast.success(
          `Successfully ${operation}ed ${successCount} user${
            successCount > 1 ? "s" : ""
          }!`
        );
      } else {
        toast.warning(
          `${operation} completed: ${successCount} successful, ${failedCount} failed`
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Bulk operation failed!");
    },
  });
}

// Specific bulk operation hooks for convenience
export function useBulkDeleteUsers() {
  const bulkOperation = useBulkOperation();

  return {
    ...bulkOperation,
    mutate: (userIds: string[]) =>
      bulkOperation.mutate({ operation: "delete", userIds }),
    mutateAsync: (userIds: string[]) =>
      bulkOperation.mutateAsync({ operation: "delete", userIds }),
  };
}

export function useBulkBanUsers() {
  const bulkOperation = useBulkOperation();

  return {
    ...bulkOperation,
    mutate: (userIds: string[]) =>
      bulkOperation.mutate({ operation: "ban", userIds }),
    mutateAsync: (userIds: string[]) =>
      bulkOperation.mutateAsync({ operation: "ban", userIds }),
  };
}

export function useBulkUnbanUsers() {
  const bulkOperation = useBulkOperation();

  return {
    ...bulkOperation,
    mutate: (userIds: string[]) =>
      bulkOperation.mutate({ operation: "unban", userIds }),
    mutateAsync: (userIds: string[]) =>
      bulkOperation.mutateAsync({ operation: "unban", userIds }),
  };
}

export function useBulkAssignRole() {
  const bulkOperation = useBulkOperation();

  return {
    ...bulkOperation,
    mutate: ({ userIds, roleId }: { userIds: string[]; roleId: string }) =>
      bulkOperation.mutate({ operation: "assign_role", userIds, roleId }),
    mutateAsync: ({ userIds, roleId }: { userIds: string[]; roleId: string }) =>
      bulkOperation.mutateAsync({ operation: "assign_role", userIds, roleId }),
  };
}

// Hook for user search suggestions
export function useUserSuggestions(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...userKeys.all, "suggestions", query],
    queryFn: () => userApi.getUserSuggestions(query, 10),
    enabled: enabled && query.length >= 2, // Only search when query is at least 2 characters
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for prefetching next page
export function usePrefetchUsers() {
  const queryClient = useQueryClient();

  return (params: GetUsersParams) => {
    queryClient.prefetchQuery({
      queryKey: userKeys.list(params),
      queryFn: () => userApi.getUsers(params),
      staleTime: 2 * 60 * 1000,
    });
  };
}

// Hook for user count (useful for pagination)
export function useUsersCount(filters?: Partial<GetUsersParams>) {
  return useQuery({
    queryKey: [...userKeys.all, "count", filters],
    queryFn: () => userApi.getUsersCount(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
