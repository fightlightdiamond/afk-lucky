"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserFilters } from "@/types/user";

interface UserManagementContextType {
  // Dialog states
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;

  // Filters
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;

  // Selection
  selectedUsers: Set<string>;
  setSelectedUsers: (users: Set<string>) => void;
  toggleUserSelection: (userId: string) => void;
  selectAllUsers: (userIds: string[]) => void;
  clearSelection: () => void;

  // Actions
  openCreateDialog: () => void;
  openEditDialog: (user: User) => void;
  closeDialogs: () => void;
}

const UserManagementContext = createContext<
  UserManagementContextType | undefined
>(undefined);

export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error(
      "useUserManagement must be used within UserManagementProvider"
    );
  }
  return context;
}

interface UserManagementProviderProps {
  children: ReactNode;
}

export function UserManagementProvider({
  children,
}: UserManagementProviderProps) {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filters
  const [filters, setFilters] = useState<UserFilters>({
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAllUsers = (userIds: string[]) => {
    if (selectedUsers.size === userIds.length) {
      // If all are selected, deselect all
      setSelectedUsers(new Set());
    } else {
      // Select all
      setSelectedUsers(new Set(userIds));
    }
  };

  const clearSelection = () => {
    setSelectedUsers(new Set());
  };

  // Actions
  const openCreateDialog = () => {
    setSelectedUser(null);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const closeDialogs = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const value: UserManagementContextType = {
    // Dialog states
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedUser,
    setSelectedUser,

    // Filters
    filters,
    setFilters,

    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,

    // Selection
    selectedUsers,
    setSelectedUsers,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,

    // Actions
    openCreateDialog,
    openEditDialog,
    closeDialogs,
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
}
