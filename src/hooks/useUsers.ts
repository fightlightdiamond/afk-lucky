import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { useUserStore } from "@/store";
import { toast } from "sonner";
import { useCallback, useMemo } from "react";
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
  UserManagementErrorCodes,
  ApiErrorResponse,
} from "@/types/user";

// Query keys factory
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: any) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Enhanced get users with filters - now uses server-side filtering with optimizations
export function useUsers(params?: Partial<GetUsersParams>) {
  // Use only the provided params, don't merge with store
  const queryParams: GetUsersParams = useMemo(
    () => ({
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
      search: params?.search || undefined,
      role: params?.role || undefined,
      status: params?.status || undefined,
      sortBy: params?.sortBy || "created_at",
      sortOrder: params?.sortOrder || "desc",
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo,
      activityDateFrom: params?.activityDateFrom,
      activityDateTo: params?.activityDateTo,
      hasAvatar: params?.hasAvatar,
      locale: params?.locale,
      group_id: params?.group_id,
      activity_status: params?.activity_status,
      // Enhanced query options
      includeRole: true,
      includePermissions: false, // Only include when needed
      includeActivity: true,
      includeStats: false, // Only include when needed
    }),
    [params]
  );

  // Enhanced error handling function
  const handleQueryError = useCallback((error: ApiErrorResponse) => {
    const errorCode = error.code as UserManagementErrorCodes;

    switch (errorCode) {
      case UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS:
      case UserManagementErrorCodes.UNAUTHORIZED:
        toast.error("You don't have permission to view users");
        break;
      case UserManagementErrorCodes.RATE_LIMIT_EXCEEDED:
        toast.error("Too many requests. Please wait a moment and try again");
        break;
      case UserManagementErrorCodes.SERVICE_UNAVAILABLE:
        toast.error("Service temporarily unavailable. Please try again later");
        break;
      default:
        toast.error(error.userMessage || error.error || "Failed to load users");
    }
  }, []);

  return useQuery({
    queryKey: userKeys.list(queryParams),
    queryFn: () => userApi.getUsers(queryParams),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    retry: (failureCount, error: ApiErrorResponse) => {
      // Don't retry on client errors (4xx)
      if (
        error?.statusCode &&
        error.statusCode >= 400 &&
        error.statusCode < 500
      ) {
        return false;
      }
      // Don't retry on specific error codes
      if (
        error?.code &&
        [
          UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
          UserManagementErrorCodes.UNAUTHORIZED,
          UserManagementErrorCodes.USER_NOT_FOUND,
        ].includes(error.code as UserManagementErrorCodes)
      ) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: handleQueryError,
    // Enable background refetch for better UX
    refetchIntervalInBackground: false,
    // Keep previous data while fetching new data
    keepPreviousData: true,
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

// Enhanced create user mutation with optimistic updates
export function useCreateUser() {
  const queryClient = useQueryClient();
  const { addOptimisticUpdate, removeOptimisticUpdate } = useUserStore();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.createUser(data),
    onMutate: async (newUser) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      // Create optimistic user object
      const optimisticUser: Partial<User> = {
        id: `temp-${Date.now()}`,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        full_name: `${newUser.first_name} ${newUser.last_name}`,
        display_name: `${newUser.first_name} ${newUser.last_name}`,
        is_active: newUser.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "active" as const,
        activity_status: "never" as const,
      };

      // Add optimistic update
      addOptimisticUpdate(optimisticUser.id!, optimisticUser);

      return { optimisticUser };
    },
    onSuccess: (response: UserMutationResponse, variables, context) => {
      // Remove optimistic update
      if (context?.optimisticUser?.id) {
        removeOptimisticUpdate(context.optimisticUser.id);
      }

      // Update cache with real data
      queryClient.setQueryData(userKeys.detail(response.user.id), {
        user: response.user,
      });

      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      toast.success(`User "${response.user.full_name}" created successfully!`);
    },
    onError: (error: ApiErrorResponse, variables, context) => {
      // Remove optimistic update on error
      if (context?.optimisticUser?.id) {
        removeOptimisticUpdate(context.optimisticUser.id);
      }

      const errorCode = error.code as UserManagementErrorCodes;
      let errorMessage = "Failed to create user";

      switch (errorCode) {
        case UserManagementErrorCodes.EMAIL_ALREADY_EXISTS:
          errorMessage = "Email address is already in use";
          break;
        case UserManagementErrorCodes.VALIDATION_ERROR:
          errorMessage = "Please check the form data and try again";
          break;
        case UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS:
          errorMessage = "You don't have permission to create users";
          break;
        default:
          errorMessage = error.userMessage || error.error || errorMessage;
      }

      toast.error(errorMessage);
    },
    // Enhanced retry logic
    retry: (failureCount, error: ApiErrorResponse) => {
      // Don't retry on validation or permission errors
      if (
        error?.code &&
        [
          UserManagementErrorCodes.EMAIL_ALREADY_EXISTS,
          UserManagementErrorCodes.VALIDATION_ERROR,
          UserManagementErrorCodes.INSUFFICIENT_PERMISSIONS,
        ].includes(error.code as UserManagementErrorCodes)
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
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
    onError: (error: unknown) => {
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
