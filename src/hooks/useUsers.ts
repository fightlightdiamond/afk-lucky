import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { useUserStore } from "@/store";
import { toast } from "sonner";
import { useCallback, useMemo, useRef } from "react";
import { useErrorHandler, createRetryHandler } from "@/lib/error-handling";
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
  const { handleError } = useErrorHandler();
  const previousParamsRef = useRef<GetUsersParams>();

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
  const handleQueryError = useCallback(
    (error: ApiErrorResponse) => {
      handleError(error, "users-fetch", [
        {
          label: "Retry",
          action: () => window.location.reload(),
        },
        {
          label: "Go to Admin",
          action: () => (window.location.href = "/admin"),
        },
      ]);
    },
    [handleError]
  );

  // Determine if this is a filter change vs pagination change for better caching
  const isFilterChange = useMemo(() => {
    if (!previousParamsRef.current) return false;

    const prev = previousParamsRef.current;
    const current = queryParams;

    // Check if only page changed (pagination)
    const onlyPageChanged =
      prev.search === current.search &&
      prev.role === current.role &&
      prev.status === current.status &&
      prev.sortBy === current.sortBy &&
      prev.sortOrder === current.sortOrder &&
      prev.dateFrom === current.dateFrom &&
      prev.dateTo === current.dateTo &&
      prev.page !== current.page;

    return !onlyPageChanged;
  }, [queryParams]);

  // Update previous params ref
  previousParamsRef.current = queryParams;

  return useQuery({
    queryKey: userKeys.list(queryParams),
    queryFn: () => userApi.getUsers(queryParams),
    staleTime: isFilterChange ? 30 * 1000 : 2 * 60 * 1000, // Shorter stale time for filter changes
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
    // Keep previous data while fetching new data for better UX
    placeholderData: (previousData) => previousData,
    // Enable optimistic updates
    optimisticResults: true,
  });
}

// Infinite query for virtual scrolling with large datasets
export function useUsersInfinite(params?: Partial<GetUsersParams>) {
  const { handleError } = useErrorHandler();

  const baseParams = useMemo(
    () => ({
      pageSize: params?.pageSize || 50, // Larger page size for infinite scroll
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
      includeRole: true,
      includePermissions: false,
      includeActivity: true,
      includeStats: false,
    }),
    [params]
  );

  return useInfiniteQuery({
    queryKey: [...userKeys.lists(), "infinite", baseParams],
    queryFn: ({ pageParam = 1 }) =>
      userApi.getUsers({ ...baseParams, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const { pagination } = lastPage;
      if (pagination.page < Math.ceil(pagination.total / pagination.pageSize)) {
        return pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (error: ApiErrorResponse) => {
      handleError(error, "users-infinite-fetch");
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
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: createRetryHandler(
      (data: CreateUserRequest) => userApi.createUser(data),
      2, // max retries
      1000 // delay
    ),
    onMutate: async (newUser) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueriesData({
        queryKey: userKeys.lists(),
      });

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
        role: newUser.role_id
          ? {
              id: newUser.role_id,
              name: "Loading...",
              permissions: [],
            }
          : undefined,
      };

      // Optimistically update all user list queries
      queryClient.setQueriesData(
        { queryKey: userKeys.lists() },
        (old: UsersResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            users: [optimisticUser as User, ...old.users],
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
            },
          };
        }
      );

      // Add optimistic update to store
      addOptimisticUpdate(optimisticUser.id!, optimisticUser);

      return { optimisticUser, previousUsers };
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

      // Update the optimistic entry with real data
      queryClient.setQueriesData(
        { queryKey: userKeys.lists() },
        (old: UsersResponse | undefined) => {
          if (!old) return old;

          return {
            ...old,
            users: old.users.map((user) =>
              user.id === context?.optimisticUser?.id ? response.user : user
            ),
          };
        }
      );

      handleSuccess(
        "USER_CREATED",
        `User "${response.user.full_name}" created successfully!`
      );
    },
    onError: (error: ApiErrorResponse, variables, context) => {
      // Remove optimistic update on error
      if (context?.optimisticUser?.id) {
        removeOptimisticUpdate(context.optimisticUser.id);
      }

      // Rollback optimistic updates
      if (context?.previousUsers) {
        context.previousUsers.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      handleError(error, "user-create", [
        {
          label: "Try Again",
          action: () => {
            // This would need to be handled by the calling component
            console.log("Retry create user");
          },
        },
      ]);
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: createRetryHandler(
      ({ id, data }: { id: string; data: UpdateUserRequest }) =>
        userApi.updateUser(id, data),
      2,
      1000
    ),
    onSuccess: (response: UserMutationResponse, variables) => {
      // Update cache
      queryClient.setQueryData(userKeys.detail(variables.id), {
        user: response.user,
      });

      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      handleSuccess("USER_UPDATED", "User updated successfully!");
    },
    onError: (error: any, variables) => {
      handleError(error, "user-update", [
        {
          label: "Try Again",
          action: () => {
            console.log("Retry update user");
          },
        },
      ]);
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { clearSelection } = useUserStore();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: createRetryHandler(
      (userId: string) => userApi.deleteUser(userId),
      1, // Only retry once for delete operations
      1000
    ),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // Clear selection if deleted user was selected
      clearSelection();

      handleSuccess("USER_DELETED", "User deleted successfully!");
    },
    onError: (error: any, deletedId) => {
      handleError(error, "user-delete", [
        {
          label: "Try Again",
          action: () => {
            console.log("Retry delete user");
          },
        },
      ]);
    },
  });
}

// Enhanced bulk operations hooks
export function useBulkOperation() {
  const queryClient = useQueryClient();
  const { clearSelection } = useUserStore();
  const { handleError, handleSuccess, handleWarning } = useErrorHandler();

  return useMutation({
    mutationFn: createRetryHandler(
      (request: BulkOperationRequest) => userApi.bulkOperation(request),
      2,
      1000
    ),
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
        handleSuccess(
          "BULK_OPERATION_SUCCESS",
          `Successfully ${operation}ed ${successCount} user${
            successCount > 1 ? "s" : ""
          }!`
        );
      } else {
        handleWarning(
          `${operation} completed: ${successCount} successful, ${failedCount} failed`,
          result.errors?.join(", ")
        );
      }
    },
    onError: (error: unknown, variables) => {
      handleError(error, "bulk-operation", [
        {
          label: "Try Again",
          action: () => {
            console.log("Retry bulk operation");
          },
        },
        {
          label: "Clear Selection",
          action: () => clearSelection(),
        },
      ]);
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
// Performance monitoring hook
export function useUsersPerformance() {
  const performanceRef = useRef<{
    queryStartTime: number;
    renderStartTime: number;
  }>({
    queryStartTime: 0,
    renderStartTime: 0,
  });

  const startQueryTimer = useCallback(() => {
    performanceRef.current.queryStartTime = performance.now();
  }, []);

  const endQueryTimer = useCallback(() => {
    const duration = performance.now() - performanceRef.current.queryStartTime;
    if (duration > 1000) {
      console.warn(`Slow user query detected: ${duration.toFixed(2)}ms`);
    }
    return duration;
  }, []);

  const startRenderTimer = useCallback(() => {
    performanceRef.current.renderStartTime = performance.now();
  }, []);

  const endRenderTimer = useCallback(() => {
    const duration = performance.now() - performanceRef.current.renderStartTime;
    if (duration > 100) {
      console.warn(`Slow user table render detected: ${duration.toFixed(2)}ms`);
    }
    return duration;
  }, []);

  return {
    startQueryTimer,
    endQueryTimer,
    startRenderTimer,
    endRenderTimer,
  };
}

// Enhanced prefetching with intelligent prediction
export function useIntelligentPrefetch() {
  const queryClient = useQueryClient();
  const prefetchedPages = useRef<Set<string>>(new Set());

  const prefetchNextPage = useCallback(
    (currentParams: GetUsersParams) => {
      const nextPageParams = { ...currentParams, page: currentParams.page + 1 };
      const queryKey = JSON.stringify(userKeys.list(nextPageParams));

      if (!prefetchedPages.current.has(queryKey)) {
        queryClient.prefetchQuery({
          queryKey: userKeys.list(nextPageParams),
          queryFn: () => userApi.getUsers(nextPageParams),
          staleTime: 2 * 60 * 1000,
        });
        prefetchedPages.current.add(queryKey);
      }
    },
    [queryClient]
  );

  const prefetchUserDetails = useCallback(
    (userIds: string[]) => {
      userIds.forEach((userId) => {
        queryClient.prefetchQuery({
          queryKey: userKeys.detail(userId),
          queryFn: () => userApi.getUser(userId),
          staleTime: 5 * 60 * 1000,
        });
      });
    },
    [queryClient]
  );

  const prefetchRelatedData = useCallback(
    (users: User[]) => {
      // Prefetch role details for users that have roles
      const roleIds = [
        ...new Set(users.map((u) => u.role?.id).filter(Boolean)),
      ];
      roleIds.forEach((roleId) => {
        // This would require a role API
        // queryClient.prefetchQuery({
        //   queryKey: ['roles', roleId],
        //   queryFn: () => roleApi.getRole(roleId),
        //   staleTime: 10 * 60 * 1000,
        // });
      });
    },
    [queryClient]
  );

  return {
    prefetchNextPage,
    prefetchUserDetails,
    prefetchRelatedData,
  };
}

// Hook for optimized bulk operations with progress tracking
export function useOptimizedBulkOperation() {
  const queryClient = useQueryClient();
  const { clearSelection } = useUserStore();
  const { handleError, handleSuccess, handleWarning } = useErrorHandler();
  const [progress, setProgress] = useState<{
    total: number;
    completed: number;
    failed: number;
    isRunning: boolean;
  }>({
    total: 0,
    completed: 0,
    failed: 0,
    isRunning: false,
  });

  const bulkOperation = useMutation({
    mutationFn: createRetryHandler(
      async (request: BulkOperationRequest) => {
        setProgress({
          total: request.userIds.length,
          completed: 0,
          failed: 0,
          isRunning: true,
        });

        // For large operations, process in batches
        const batchSize = 10;
        const batches = [];
        for (let i = 0; i < request.userIds.length; i += batchSize) {
          batches.push(request.userIds.slice(i, i + batchSize));
        }

        let totalCompleted = 0;
        let totalFailed = 0;
        const errors: string[] = [];

        for (const batch of batches) {
          try {
            const batchRequest = { ...request, userIds: batch };
            const result = await userApi.bulkOperation(batchRequest);

            totalCompleted += result.success;
            totalFailed += result.failed;

            if (result.errors) {
              errors.push(...result.errors);
            }

            setProgress((prev) => ({
              ...prev,
              completed: totalCompleted,
              failed: totalFailed,
            }));
          } catch (error) {
            totalFailed += batch.length;
            errors.push(`Batch failed: ${error}`);

            setProgress((prev) => ({
              ...prev,
              failed: totalFailed,
            }));
          }
        }

        setProgress((prev) => ({ ...prev, isRunning: false }));

        return {
          success: totalCompleted,
          failed: totalFailed,
          errors,
        };
      },
      1, // Don't retry bulk operations
      0
    ),
    onSuccess: (result: BulkOperationResult, variables) => {
      // Invalidate lists to refresh data
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // Clear selection
      clearSelection();

      // Show appropriate success message
      const { operation } = variables;
      const successCount = result.success;
      const failedCount = result.failed;

      if (failedCount === 0) {
        handleSuccess(
          "BULK_OPERATION_SUCCESS",
          `Successfully ${operation}ed ${successCount} user${
            successCount > 1 ? "s" : ""
          }!`
        );
      } else {
        handleWarning(
          `${operation} completed: ${successCount} successful, ${failedCount} failed`,
          result.errors?.join(", ")
        );
      }
    },
    onError: (error: unknown, variables) => {
      setProgress((prev) => ({ ...prev, isRunning: false }));

      handleError(error, "bulk-operation", [
        {
          label: "Try Again",
          action: () => {
            console.log("Retry bulk operation");
          },
        },
        {
          label: "Clear Selection",
          action: () => clearSelection(),
        },
      ]);
    },
  });

  return {
    ...bulkOperation,
    progress,
  };
}
