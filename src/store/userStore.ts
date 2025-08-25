import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  UserFilters,
  BulkOperationState,
  UserTableState,
  DEFAULT_FILTER_PRESETS,
  FilterPreset,
  PAGINATION_LIMITS,
} from "@/types/user";

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
  bulkOperationState: BulkOperationState;

  // Filter presets
  filterPresets: FilterPreset[];
  activePreset: string | null;

  // UI state
  loading: boolean;
  error: string | null;

  // Actions
  setSelectedUser: (id: string | null) => void;
  toggleUserSelection: (id: string) => void;
  selectAllUsers: (ids: string[]) => void;
  clearSelection: () => void;

  setUserFilters: (filters: Partial<UserFilters>) => void;
  clearFilters: () => void;
  applyFilterPreset: (presetId: string) => void;
  saveFilterPreset: (preset: Omit<FilterPreset, "id">) => void;
  deleteFilterPreset: (presetId: string) => void;

  setViewMode: (mode: UserState["viewMode"]) => void;
  setPageSize: (size: number) => void;

  setBulkOperationMode: (enabled: boolean) => void;
  setBulkOperationState: (state: Partial<BulkOperationState>) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Helper methods
  isUserSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  hasActiveFilters: () => boolean;
  canSelectMore: () => boolean;
  getMaxSelectionCount: () => number;
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
      viewMode: "table",
      pageSize: PAGINATION_LIMITS.DEFAULT_PAGE_SIZE,
      bulkOperationMode: false,
      bulkOperationState: defaultBulkOperationState,
      filterPresets: DEFAULT_FILTER_PRESETS,
      activePreset: null,
      loading: false,
      error: null,

      // Actions
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
        }),

      setUserFilters: (filters) =>
        set((state) => ({
          userFilters: { ...state.userFilters, ...filters },
          activePreset: null, // Clear active preset when manually changing filters
        })),

      clearFilters: () =>
        set({
          userFilters: defaultFilters,
          activePreset: null,
        }),

      applyFilterPreset: (presetId) => {
        const preset = get().filterPresets.find((p) => p.id === presetId);
        if (preset) {
          set({
            userFilters: { ...defaultFilters, ...preset.filters },
            activePreset: presetId,
          });
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

      setViewMode: (mode) => set({ viewMode: mode }),

      setPageSize: (size) => {
        const validSize = Math.min(
          Math.max(size, PAGINATION_LIMITS.MIN_PAGE_SIZE),
          PAGINATION_LIMITS.MAX_PAGE_SIZE
        );
        set({ pageSize: validSize });
      },

      setBulkOperationMode: (enabled) =>
        set({
          bulkOperationMode: enabled,
          selectedUserIds: enabled ? get().selectedUserIds : [],
        }),

      setBulkOperationState: (state) =>
        set((currentState) => ({
          bulkOperationState: { ...currentState.bulkOperationState, ...state },
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

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
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        userFilters: state.userFilters,
        viewMode: state.viewMode,
        pageSize: state.pageSize,
        filterPresets: state.filterPresets.filter((p) =>
          p.id.startsWith("custom_")
        ), // Only persist custom presets
      }),
    }
  )
);
