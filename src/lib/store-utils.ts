import {
  useAuthStore,
  useUserStore,
  useUIStore,
  type AuthState,
  type UserState,
  type UIState,
} from "@/store";

// Store reset utilities
export const resetAllStores = () => {
  useAuthStore.getState().logout();
  useUserStore.getState().clearSelection();
  useUserStore.getState().clearFilters();
  useUIStore.getState().setGlobalLoading(false);
};

// Store persistence utilities
export const clearStorageData = () => {
  localStorage.removeItem("auth-storage");
  localStorage.removeItem("ui-storage");
  localStorage.removeItem("user-store");
};

// Store debugging utilities (development only)
export const getStoreStates = () => {
  if (process.env.NODE_ENV !== "development") return;

  return {
    auth: useAuthStore.getState(),
    user: useUserStore.getState(),
    ui: useUIStore.getState(),
  };
};

// Store subscription utilities
export const subscribeToAuthChanges = (
  callback: (state: boolean, previousState: boolean) => void,
) => {
  return useAuthStore.subscribe(
    (state) => state.isAuthenticated,
    callback,
  );
};

export const subscribeToThemeChanges = (
  callback: (theme: UIState["theme"], previous: UIState["theme"]) => void,
) => {
  return useUIStore.subscribe((state) => state.theme, callback);
};

// Bulk operations utilities
export const performBulkUserOperation = async (
  operation: "delete" | "activate" | "deactivate",
  userIds: string[]
) => {
  const { setBulkOperationMode, clearSelection } = useUserStore.getState();
  const { setGlobalLoading } = useUIStore.getState();

  try {
    setBulkOperationMode(true);
    setGlobalLoading(
      true,
      `Đang ${operation === "delete" ? "xóa" : "cập nhật"} ${
        userIds.length
      } người dùng...`
    );

    // Perform operation (implement based on your API)
    // await bulkUserApi[operation](userIds);

    clearSelection();
    return true;
  } catch (error) {
    console.error(`Bulk ${operation} failed:`, error);
    return false;
  } finally {
    setBulkOperationMode(false);
    setGlobalLoading(false);
  }
};

// Session management utilities
export const checkSessionHealth = () => {
  const { isAuthenticated, isSessionValid, getTimeUntilExpiry } =
    useAuthStore.getState();

  if (!isAuthenticated) return { status: "unauthenticated" };

  const timeLeft = getTimeUntilExpiry();
  const isValid = isSessionValid();

  return {
    status: isValid ? "valid" : "expired",
    timeLeft,
    shouldRefresh: timeLeft < 5 * 60 * 1000, // Less than 5 minutes
  };
};

// Export store selectors for better performance
export const authSelectors = {
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  user: (state: AuthState) => state.user,
  token: (state: AuthState) => state.token,
  isInitializing: (state: AuthState) => state.isInitializing,
};

export const userSelectors = {
  selectedCount: (state: UserState) => state.selectedUserIds.length,
  hasFilters: (state: UserState) => state.hasActiveFilters(),
  viewMode: (state: UserState) => state.viewMode,
};

export const uiSelectors = {
  theme: (state: UIState) => state.theme,
  isLoading: (state: UIState) => state.globalLoading,
  sidebarCollapsed: (state: UIState) => state.sidebarCollapsed,
};
