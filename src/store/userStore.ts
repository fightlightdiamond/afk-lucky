import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserFilters {
  search: string;
  role: string | null;
  status: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  } | null;
  sortBy: "name" | "email" | "createdAt" | "lastActivity";
  sortOrder: "asc" | "desc";
}

interface UserState {
  // Selection state
  selectedUserId: string | null;
  selectedUserIds: string[]; // For bulk operations

  // Filters and sorting
  userFilters: UserFilters;

  // View preferences
  viewMode: "table" | "grid" | "list";
  pageSize: number;

  // Bulk operations
  bulkOperationMode: boolean;

  // Actions
  setSelectedUser: (id: string | null) => void;
  toggleUserSelection: (id: string) => void;
  selectAllUsers: (ids: string[]) => void;
  clearSelection: () => void;

  setUserFilters: (filters: Partial<UserFilters>) => void;
  clearFilters: () => void;

  setViewMode: (mode: UserState["viewMode"]) => void;
  setPageSize: (size: number) => void;

  setBulkOperationMode: (enabled: boolean) => void;

  // Helper methods
  isUserSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  hasActiveFilters: () => boolean;
}

const defaultFilters: UserFilters = {
  search: "",
  role: null,
  status: null,
  dateRange: null,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedUserId: null,
      selectedUserIds: [],
      userFilters: defaultFilters,
      viewMode: "table",
      pageSize: 20,
      bulkOperationMode: false,

      // Actions
      setSelectedUser: (id) => set({ selectedUserId: id }),

      toggleUserSelection: (id) =>
        set((state) => ({
          selectedUserIds: state.selectedUserIds.includes(id)
            ? state.selectedUserIds.filter((userId) => userId !== id)
            : [...state.selectedUserIds, id],
        })),

      selectAllUsers: (ids) => set({ selectedUserIds: ids }),

      clearSelection: () =>
        set({
          selectedUserId: null,
          selectedUserIds: [],
          bulkOperationMode: false,
        }),

      setUserFilters: (filters) =>
        set((state) => ({
          userFilters: { ...state.userFilters, ...filters },
        })),

      clearFilters: () => set({ userFilters: defaultFilters }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setPageSize: (size) => set({ pageSize: size }),

      setBulkOperationMode: (enabled) =>
        set({
          bulkOperationMode: enabled,
          selectedUserIds: enabled ? get().selectedUserIds : [],
        }),

      // Helper methods
      isUserSelected: (id) => get().selectedUserIds.includes(id),

      getSelectedCount: () => get().selectedUserIds.length,

      hasActiveFilters: () => {
        const { userFilters } = get();
        return (
          userFilters.search !== "" ||
          userFilters.role !== null ||
          userFilters.status !== null ||
          userFilters.dateRange !== null
        );
      },
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        userFilters: state.userFilters,
        viewMode: state.viewMode,
        pageSize: state.pageSize,
      }),
    }
  )
);
