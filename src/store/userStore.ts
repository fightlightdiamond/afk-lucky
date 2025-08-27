import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  UserFilters,
  BulkOperationState,
  UserTableState,
  DEFAULT_FILTER_PRESETS,
  FilterPreset,
  PAGINATION_LIMITS,
  PaginationParams,
  BulkOperationProgress,
  SortableUserField,
  SortOrder,
} from "../types/user";

interface UserState {
  // Selection state
  selectedUserId: string | null;
  selectedUserIds: string[]; // For bulk operations

  // Filters and sorting
  userFilters: UserFilters;

  // Enhanced pagination state
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  // View preferences and settings
  viewMode: "table" | "grid" | "list";
  tableSettings: {
    density: "compact" | "comfortable" | "spacious";
    showAvatars: boolean;
    showRoleBadges: boolean;
    showActivityStatus: boolean;
    stickyHeader: boolean;
    autoRefresh: boolean;
    refreshInterval: number; // in seconds
  };

  // Column visibility and ordering
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  columnWidths: Record<string, number>;

  // Bulk operations
  bulkOperationMode: boolean;
  bulkOperationState: BulkOperationState;
  bulkOperationProgress: BulkOperationProgress | null;

  // Filter presets and search history
  filterPresets: FilterPreset[];
  activePreset: string | null;
  searchHistory: string[];
  recentFilters: Partial<UserFilters>[];

  // UI state and performance
  loading: boolean;
  error: string | null;
  lastRefresh: string | null;
  optimisticUpdates: Record<string, Partial<any>>; // For optimistic UI updates

  // Selection actions
  setSelectedUser: (id: string | null) => void;
  toggleUserSelection: (id: string) => void;
  selectAllUsers: (ids: string[]) => void;
  clearSelection: () => void;

  // Filter and search actions
  setUserFilters: (filters: Partial<UserFilters>) => void;
  clearFilters: () => void;
  applyFilterPreset: (presetId: string) => void;
  saveFilterPreset: (preset: Omit<FilterPreset, "id">) => void;
  deleteFilterPreset: (presetId: string) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  saveRecentFilter: (filters: Partial<UserFilters>) => void;

  // Pagination actions
  setPagination: (pagination: Partial<UserState["pagination"]>) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;

  // View and table settings actions
  setViewMode: (mode: UserState["viewMode"]) => void;
  setTableSettings: (settings: Partial<UserState["tableSettings"]>) => void;
  setColumnVisibility: (column: string, visible: boolean) => void;
  setColumnOrder: (order: string[]) => void;
  setColumnWidth: (column: string, width: number) => void;
  resetTableSettings: () => void;

  // Bulk operations actions
  setBulkOperationMode: (enabled: boolean) => void;
  setBulkOperationState: (state: Partial<BulkOperationState>) => void;
  setBulkOperationProgress: (progress: BulkOperationProgress | null) => void;
  cancelBulkOperation: () => void;

  // UI state actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastRefresh: (timestamp: string) => void;
  addOptimisticUpdate: (id: string, update: Partial<any>) => void;
  removeOptimisticUpdate: (id: string) => void;
  clearOptimisticUpdates: () => void;

  // Helper methods
  isUserSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  hasActiveFilters: () => boolean;
  canSelectMore: () => boolean;
  getMaxSelectionCount: () => number;
  canGoToNextPage: () => boolean;
  canGoToPreviousPage: () => boolean;
  getTotalPages: () => number;
  getCurrentPageRange: () => { start: number; end: number };
  getVisibleColumns: () => string[];
  shouldAutoRefresh: () => boolean;
}

const defaultFilters: UserFilters = {
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
};

const defaultPagination = {
  currentPage: 1,
  pageSize: PAGINATION_LIMITS.DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const defaultTableSettings = {
  density: "comfortable" as const,
  showAvatars: true,
  showRoleBadges: true,
  showActivityStatus: true,
  stickyHeader: true,
  autoRefresh: false,
  refreshInterval: 30, // 30 seconds
};

const defaultColumnVisibility = {
  avatar: true,
  full_name: true,
  email: true,
  role: true,
  status: true,
  activity_status: true,
  created_at: true,
  last_login: true,
  actions: true,
  // Optional columns (hidden by default)
  updated_at: false,
  address: false,
  locale: false,
  group_id: false,
  coin: false,
  sex: false,
  birthday: false,
};

const defaultColumnOrder = [
  "avatar",
  "full_name",
  "email",
  "role",
  "status",
  "activity_status",
  "created_at",
  "last_login",
  "actions",
];

const defaultBulkOperationState: BulkOperationState = {
  selectedUsers: [],
  loading: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedUserId: null,
      selectedUserIds: [],
      userFilters: defaultFilters,
      pagination: defaultPagination,
      viewMode: "table",
      tableSettings: defaultTableSettings,
      columnVisibility: defaultColumnVisibility,
      columnOrder: defaultColumnOrder,
      columnWidths: {},
      bulkOperationMode: false,
      bulkOperationState: defaultBulkOperationState,
      bulkOperationProgress: null,
      filterPresets: DEFAULT_FILTER_PRESETS,
      activePreset: null,
      searchHistory: [],
      recentFilters: [],
      loading: false,
      error: null,
      lastRefresh: null,
      optimisticUpdates: {},

      // Selection actions
      setSelectedUser: (id) => set({ selectedUserId: id }),

      toggleUserSelection: (id) =>
        set((state) => {
          const isSelected = state.selectedUserIds.includes(id);
          const newSelection = isSelected
            ? state.selectedUserIds.filter((userId) => userId !== id)
            : state.selectedUserIds.length <
              PAGINATION_LIMITS.MAX_BULK_SELECTION
            ? [...state.selectedUserIds, id]
            : state.selectedUserIds; // Don't add if at max

          return {
            selectedUserIds: newSelection,
            bulkOperationState: {
              ...state.bulkOperationState,
              selectedUsers: newSelection,
            },
          };
        }),

      selectAllUsers: (ids) => {
        const limitedIds = ids.slice(0, PAGINATION_LIMITS.MAX_BULK_SELECTION);
        set((state) => ({
          selectedUserIds: limitedIds,
          bulkOperationState: {
            ...state.bulkOperationState,
            selectedUsers: limitedIds,
          },
        }));
      },

      clearSelection: () =>
        set({
          selectedUserId: null,
          selectedUserIds: [],
          bulkOperationMode: false,
          bulkOperationState: defaultBulkOperationState,
          bulkOperationProgress: null,
        }),

      // Filter and search actions
      setUserFilters: (filters) =>
        set((state) => {
          const newFilters = { ...state.userFilters, ...filters };
          // Reset to first page when filters change
          const newPagination = { ...state.pagination, currentPage: 1 };

          return {
            userFilters: newFilters,
            pagination: newPagination,
            activePreset: null, // Clear active preset when manually changing filters
          };
        }),

      clearFilters: () =>
        set((state) => ({
          userFilters: defaultFilters,
          activePreset: null,
          pagination: { ...state.pagination, currentPage: 1 },
        })),

      applyFilterPreset: (presetId) => {
        const preset = get().filterPresets.find((p) => p.id === presetId);
        if (preset) {
          set((state) => ({
            userFilters: { ...defaultFilters, ...preset.filters },
            activePreset: presetId,
            pagination: { ...state.pagination, currentPage: 1 },
          }));
        }
      },

      saveFilterPreset: (preset) => {
        const newPreset: FilterPreset = {
          ...preset,
          id: `custom_${Date.now()}`,
        };
        set((state) => ({
          filterPresets: [...state.filterPresets, newPreset],
        }));
      },

      deleteFilterPreset: (presetId) => {
        set((state) => ({
          filterPresets: state.filterPresets.filter((p) => p.id !== presetId),
          activePreset:
            state.activePreset === presetId ? null : state.activePreset,
        }));
      },

      addToSearchHistory: (query) => {
        if (!query.trim()) return;

        set((state) => {
          const newHistory = [
            query,
            ...state.searchHistory.filter((item) => item !== query),
          ].slice(0, 10); // Keep only last 10 searches

          return { searchHistory: newHistory };
        });
      },

      clearSearchHistory: () => set({ searchHistory: [] }),

      saveRecentFilter: (filters) => {
        set((state) => {
          const newRecentFilters = [
            filters,
            ...state.recentFilters.filter(
              (item) => JSON.stringify(item) !== JSON.stringify(filters)
            ),
          ].slice(0, 5); // Keep only last 5 filter combinations

          return { recentFilters: newRecentFilters };
        });
      },

      // Pagination actions
      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      setCurrentPage: (page) =>
        set((state) => ({
          pagination: { ...state.pagination, currentPage: Math.max(1, page) },
        })),

      setPageSize: (size) => {
        const validSize = Math.min(
          Math.max(size, PAGINATION_LIMITS.MIN_PAGE_SIZE),
          PAGINATION_LIMITS.MAX_PAGE_SIZE
        );
        set((state) => ({
          pagination: {
            ...state.pagination,
            pageSize: validSize,
            currentPage: 1, // Reset to first page when page size changes
          },
        }));
      },

      goToFirstPage: () =>
        set((state) => ({
          pagination: { ...state.pagination, currentPage: 1 },
        })),

      goToLastPage: () =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            currentPage: state.pagination.totalPages || 1,
          },
        })),

      goToNextPage: () =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            currentPage: Math.min(
              state.pagination.currentPage + 1,
              state.pagination.totalPages || 1
            ),
          },
        })),

      goToPreviousPage: () =>
        set((state) => ({
          pagination: {
            ...state.pagination,
            currentPage: Math.max(state.pagination.currentPage - 1, 1),
          },
        })),

      // View and table settings actions
      setViewMode: (mode) => set({ viewMode: mode }),

      setTableSettings: (settings) =>
        set((state) => ({
          tableSettings: { ...state.tableSettings, ...settings },
        })),

      setColumnVisibility: (column, visible) =>
        set((state) => ({
          columnVisibility: { ...state.columnVisibility, [column]: visible },
        })),

      setColumnOrder: (order) => set({ columnOrder: order }),

      setColumnWidth: (column, width) =>
        set((state) => ({
          columnWidths: { ...state.columnWidths, [column]: width },
        })),

      resetTableSettings: () =>
        set({
          tableSettings: defaultTableSettings,
          columnVisibility: defaultColumnVisibility,
          columnOrder: defaultColumnOrder,
          columnWidths: {},
        }),

      // Bulk operations actions
      setBulkOperationMode: (enabled) =>
        set((state) => ({
          bulkOperationMode: enabled,
          selectedUserIds: enabled ? state.selectedUserIds : [],
          bulkOperationProgress: enabled ? state.bulkOperationProgress : null,
        })),

      setBulkOperationState: (newState) =>
        set((currentState) => ({
          bulkOperationState: {
            ...currentState.bulkOperationState,
            ...newState,
          },
        })),

      setBulkOperationProgress: (progress) =>
        set({ bulkOperationProgress: progress }),

      cancelBulkOperation: () =>
        set({
          bulkOperationMode: false,
          bulkOperationProgress: null,
          selectedUserIds: [],
          bulkOperationState: defaultBulkOperationState,
        }),

      // UI state actions
      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      setLastRefresh: (timestamp) => set({ lastRefresh: timestamp }),

      addOptimisticUpdate: (id, update) =>
        set((state) => ({
          optimisticUpdates: { ...state.optimisticUpdates, [id]: update },
        })),

      removeOptimisticUpdate: (id) =>
        set((state) => {
          const { [id]: removed, ...rest } = state.optimisticUpdates;
          return { optimisticUpdates: rest };
        }),

      clearOptimisticUpdates: () => set({ optimisticUpdates: {} }),

      // Helper methods
      isUserSelected: (id) => get().selectedUserIds.includes(id),

      getSelectedCount: () => get().selectedUserIds.length,

      hasActiveFilters: () => {
        const { userFilters } = get();
        return (
          userFilters.search !== "" ||
          userFilters.role !== null ||
          userFilters.status !== null ||
          userFilters.dateRange !== null ||
          userFilters.activityDateRange !== null ||
          userFilters.hasAvatar !== null ||
          userFilters.locale !== null ||
          userFilters.group_id !== null ||
          userFilters.activity_status !== null
        );
      },

      canSelectMore: () => {
        return (
          get().selectedUserIds.length < PAGINATION_LIMITS.MAX_BULK_SELECTION
        );
      },

      getMaxSelectionCount: () => PAGINATION_LIMITS.MAX_BULK_SELECTION,

      canGoToNextPage: () => {
        const { pagination } = get();
        return pagination.currentPage < pagination.totalPages;
      },

      canGoToPreviousPage: () => {
        const { pagination } = get();
        return pagination.currentPage > 1;
      },

      getTotalPages: () => {
        const { pagination } = get();
        return pagination.totalPages;
      },

      getCurrentPageRange: () => {
        const { pagination } = get();
        const start = (pagination.currentPage - 1) * pagination.pageSize + 1;
        const end = Math.min(
          pagination.currentPage * pagination.pageSize,
          pagination.total
        );
        return { start, end };
      },

      getVisibleColumns: () => {
        const { columnVisibility, columnOrder } = get();
        return columnOrder.filter((column) => columnVisibility[column]);
      },

      shouldAutoRefresh: () => {
        const { tableSettings, lastRefresh } = get();
        if (!tableSettings.autoRefresh || !lastRefresh) return false;

        const now = new Date().getTime();
        const lastRefreshTime = new Date(lastRefresh).getTime();
        const intervalMs = tableSettings.refreshInterval * 1000;

        return now - lastRefreshTime >= intervalMs;
      },
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        // Persist user preferences and settings
        userFilters: state.userFilters,
        viewMode: state.viewMode,
        tableSettings: state.tableSettings,
        columnVisibility: state.columnVisibility,
        columnOrder: state.columnOrder,
        columnWidths: state.columnWidths,
        pagination: {
          pageSize: state.pagination.pageSize, // Only persist page size, not current page
        },
        filterPresets: state.filterPresets.filter((p) =>
          p.id.startsWith("custom_")
        ), // Only persist custom presets
        searchHistory: state.searchHistory,
        recentFilters: state.recentFilters,
      }),
    }
  )
);
