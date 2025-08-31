"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { UserTableOptimized } from "./UserTableOptimized";
import { UserFilters } from "./UserFilters";
import { UserDialog } from "./UserDialog";
import { BulkOperations } from "./BulkOperations";
import { UserPagination } from "./UserPagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, BarChart3 } from "lucide-react";
import {
  useUsers,
  useUsersInfinite,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useIntelligentPrefetch,
  useUsersPerformance,
} from "@/hooks/useUsers";
import { useUserManagement } from "./UserManagementProvider";
import { useResponsive } from "@/hooks/useResponsive";
import {
  useOptimizedCallback,
  usePerformanceMonitor,
} from "@/lib/performance-utils";
import { User, UserFilters as UserFiltersType, UserStatus } from "@/types/user";
import { LoadingStateWrapper } from "@/components/ui/loading";
import { useErrorHandler } from "@/lib/error-handling";
import { PermissionGuard } from "@/components/auth/permission-guard";

interface UserManagementPageOptimizedProps {
  enableVirtualScrolling?: boolean;
  enableInfiniteScroll?: boolean;
  containerHeight?: number;
  itemHeight?: number;
}

export const UserManagementPageOptimized =
  React.memo<UserManagementPageOptimizedProps>(
    ({
      enableVirtualScrolling = false,
      enableInfiniteScroll = false,
      containerHeight = 600,
      itemHeight = 73,
    }) => {
      // Performance monitoring
      const { startTimer, recordMetric } = usePerformanceMonitor();
      const {
        startQueryTimer,
        endQueryTimer,
        startRenderTimer,
        endRenderTimer,
      } = useUsersPerformance();
      const { prefetchNextPage, prefetchUserDetails } =
        useIntelligentPrefetch();

      // Responsive design
      const { isMobile, isTablet } = useResponsive();

      // State management
      const [filters, setFilters] = useState<UserFiltersType>({
        search: "",
        role: null,
        status: null,
        dateRange: null,
        activityDateRange: null,
        sortBy: "created_at",
        sortOrder: "desc",
        hasAvatar: null,
        locale: null,
        group_id: null,
        activity_status: null,
      });

      const [pagination, setPagination] = useState({
        page: 1,
        pageSize: isMobile ? 10 : 20,
      });

      const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
      const [editingUser, setEditingUser] = useState<User | null>(null);

      // Store state
      // Context state
      const {
        selectedUsers,
        toggleUserSelection,
        selectAllUsers,
        clearSelection,
      } = useUserManagement();

      // Determine which query to use based on configuration
      const shouldUseInfiniteQuery = enableInfiniteScroll && !isMobile;

      // Regular paginated query
      const {
        data: usersData,
        isLoading: isUsersLoading,
        error: usersError,
        isFetching: isUsersFetching,
      } = useUsers(
        shouldUseInfiniteQuery
          ? undefined
          : {
              ...filters,
              ...pagination,
            }
      );

      // Infinite scroll query
      const {
        data: infiniteData,
        isLoading: isInfiniteLoading,
        error: infiniteError,
        isFetching: isInfiniteFetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
      } = useUsersInfinite(shouldUseInfiniteQuery ? filters : undefined);

      // Mutations
      const createUserMutation = useCreateUser();
      const updateUserMutation = useUpdateUser();
      const deleteUserMutation = useDeleteUser();

      // Memoized data processing
      const { users, totalUsers, isLoading, error } = useMemo(() => {
        if (shouldUseInfiniteQuery) {
          const allUsers =
            infiniteData?.pages.flatMap((page) => page.users) || [];
          return {
            users: allUsers,
            totalUsers: infiniteData?.pages[0]?.pagination.total || 0,
            isLoading: isInfiniteLoading,
            error: infiniteError,
          };
        } else {
          return {
            users: usersData?.users || [],
            totalUsers: usersData?.pagination.total || 0,
            isLoading: isUsersLoading,
            error: usersError,
          };
        }
      }, [
        shouldUseInfiniteQuery,
        infiniteData,
        usersData,
        isInfiniteLoading,
        isUsersLoading,
        infiniteError,
        usersError,
      ]);

      // Performance-optimized callbacks
      const handleFiltersChange = useOptimizedCallback(
        (newFilters: UserFiltersType) => {
          const endTimer = startTimer("filters-change");
          setFilters(newFilters);
          setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
          endTimer();
        },
        [startTimer],
        {
          debounce: 300,
          trackPerformance: true,
          performanceKey: "filters-change",
        }
      );

      const handlePaginationChange = useOptimizedCallback(
        (newPagination: { page: number; pageSize: number }) => {
          const endTimer = startTimer("pagination-change");
          setPagination(newPagination);

          // Prefetch next page
          if (newPagination.page > pagination.page) {
            prefetchNextPage({ ...filters, ...newPagination });
          }

          endTimer();
        },
        [filters, pagination, prefetchNextPage, startTimer],
        {
          trackPerformance: true,
          performanceKey: "pagination-change",
        }
      );

      const handleUserSelection = useOptimizedCallback(
        (userId: string, selected: boolean) => {
          const endTimer = startTimer("user-selection");
          toggleUserSelection(userId);
          endTimer();
        },
        [toggleUserSelection, startTimer],
        {
          trackPerformance: true,
          performanceKey: "user-selection",
        }
      );

      const handleSelectAll = useOptimizedCallback(
        (selected: boolean) => {
          const endTimer = startTimer("select-all");
          if (selected && users) {
            selectAllUsers(users.map((u) => u.id));
          } else {
            clearSelection();
          }
          endTimer();
        },
        [users, selectAllUsers, clearSelection, startTimer],
        {
          trackPerformance: true,
          performanceKey: "select-all",
        }
      );

      const handleEditUser = useCallback((user: User) => {
        setEditingUser(user);
        setIsUserDialogOpen(true);
      }, []);

      const handleDeleteUser = useCallback(
        (userId: string) => {
          deleteUserMutation.mutate(userId);
        },
        [deleteUserMutation]
      );

      const handleToggleStatus = useCallback(
        (userId: string, currentStatus: boolean) => {
          const user = users?.find((u) => u.id === userId);
          if (user) {
            updateUserMutation.mutate({
              id: userId,
              data: { is_active: !currentStatus },
            });
          }
        },
        [users, updateUserMutation]
      );

      const handleStatusChange = useCallback(
        async (userId: string, newStatus: UserStatus, reason?: string) => {
          const user = users?.find((u) => u.id === userId);
          if (user) {
            await updateUserMutation.mutateAsync({
              id: userId,
              data: {
                is_active: newStatus === "active",
                // Add reason to audit log if available
              },
            });
          }
        },
        [users, updateUserMutation]
      );

      const handleCreateUser = useCallback(() => {
        setEditingUser(null);
        setIsUserDialogOpen(true);
      }, []);

      const handleUserDialogSave = useCallback(
        (userData: any) => {
          if (editingUser) {
            updateUserMutation.mutate({
              id: editingUser.id,
              data: userData,
            });
          } else {
            createUserMutation.mutate(userData);
          }
          setIsUserDialogOpen(false);
          setEditingUser(null);
        },
        [editingUser, updateUserMutation, createUserMutation]
      );

      // Prefetch user details when hovering over rows
      const handleUserHover = useCallback(
        (userId: string) => {
          prefetchUserDetails([userId]);
        },
        [prefetchUserDetails]
      );

      // Performance monitoring effects
      useEffect(() => {
        if (isLoading) {
          startQueryTimer();
        } else {
          endQueryTimer();
        }
      }, [isLoading, startQueryTimer, endQueryTimer]);

      useEffect(() => {
        startRenderTimer();
        return () => {
          endRenderTimer();
        };
      });

      // Infinite scroll effect
      useEffect(() => {
        if (shouldUseInfiniteQuery && hasNextPage && !isFetchingNextPage) {
          const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } =
              document.documentElement;
            if (scrollTop + clientHeight >= scrollHeight - 1000) {
              fetchNextPage();
            }
          };

          window.addEventListener("scroll", handleScroll);
          return () => window.removeEventListener("scroll", handleScroll);
        }
      }, [
        shouldUseInfiniteQuery,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
      ]);

      // Memoized components
      const userFiltersComponent = useMemo(
        () => (
          <UserFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            roles={usersData?.metadata?.availableRoles || []}
            isLoading={isLoading}
            totalRecords={totalUsers}
          />
        ),
        [
          filters,
          handleFiltersChange,
          usersData?.metadata?.availableRoles,
          isLoading,
          totalUsers,
        ]
      );

      const bulkOperationsComponent = useMemo(() => {
        if (selectedUsers.size === 0) return null;

        return (
          <BulkOperations
            selectedUserIds={Array.from(selectedUsers)}
            onClearSelection={clearSelection}
          />
        );
      }, [selectedUsers, clearSelection]);

      const paginationComponent = useMemo(() => {
        if (shouldUseInfiniteQuery) return null;

        return (
          <UserPagination
            currentPage={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={totalUsers}
            onPageChange={(page) =>
              handlePaginationChange({ ...pagination, page })
            }
            onPageSizeChange={(pageSize) =>
              handlePaginationChange({ page: 1, pageSize })
            }
            isLoading={isLoading}
          />
        );
      }, [
        shouldUseInfiniteQuery,
        pagination,
        totalUsers,
        handlePaginationChange,
        isLoading,
      ]);

      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                User Management
              </h1>
              <p className="text-muted-foreground">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PermissionGuard requiredPermissions={["user:create"]}>
                <Button onClick={handleCreateUser} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add User
                </Button>
              </PermissionGuard>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          {userFiltersComponent}

          {/* Bulk Operations */}
          {bulkOperationsComponent}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalUsers.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Selected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedUsers.size}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users?.filter((u) => u.is_active).length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Online Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users?.filter((u) => u.activity_status === "online")
                    .length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Table */}
          <Card>
            <CardContent className="p-0">
              <UserTableOptimized
                users={users}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleStatus}
                onStatusChange={handleStatusChange}
                isLoading={isLoading}
                selectedUsers={selectedUsers}
                onUserSelection={handleUserSelection}
                onSelectAll={handleSelectAll}
                enableVirtualScrolling={enableVirtualScrolling}
                containerHeight={containerHeight}
                itemHeight={itemHeight}
              />
            </CardContent>
          </Card>

          {/* Pagination */}
          {paginationComponent}

          {/* Infinite scroll loading indicator */}
          {shouldUseInfiniteQuery && isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* User Dialog */}
          <UserDialog
            user={editingUser}
            open={isUserDialogOpen}
            onClose={() => {
              setIsUserDialogOpen(false);
              setEditingUser(null);
            }}
            onSave={handleUserDialogSave}
            roles={usersData?.metadata?.availableRoles || []}
          />
        </div>
      );
    }
  );

UserManagementPageOptimized.displayName = "UserManagementPageOptimized";
