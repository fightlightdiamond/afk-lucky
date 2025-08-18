import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  // Auth state
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;

  // Session management
  lastActivity: number;
  sessionExpiry: number | null;

  // Loading states
  isInitializing: boolean;
  isRefreshing: boolean;

  // Actions
  login: (token: string, user: User, expiresIn?: number) => void;
  logout: () => void;
  setUser: (user: User) => void;
  updateLastActivity: () => void;
  setInitializing: (initializing: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;

  // Session helpers
  isSessionValid: () => boolean;
  getTimeUntilExpiry: () => number;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        isAuthenticated: false,
        token: null,
        user: null,
        lastActivity: Date.now(),
        sessionExpiry: null,
        isInitializing: true,
        isRefreshing: false,

        // Actions
        login: (token, user, expiresIn = 24 * 60 * 60 * 1000) => {
          // Default 24h
          const now = Date.now();
          set({
            isAuthenticated: true,
            token,
            user,
            lastActivity: now,
            sessionExpiry: now + expiresIn,
            isInitializing: false,
          });
        },

        logout: () =>
          set({
            isAuthenticated: false,
            token: null,
            user: null,
            sessionExpiry: null,
            isRefreshing: false,
          }),

        setUser: (user) => set({ user }),

        updateLastActivity: () => set({ lastActivity: Date.now() }),

        setInitializing: (initializing) =>
          set({ isInitializing: initializing }),

        setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),

        // Session helpers
        isSessionValid: () => {
          const { sessionExpiry } = get();
          return sessionExpiry ? Date.now() < sessionExpiry : false;
        },

        getTimeUntilExpiry: () => {
          const { sessionExpiry } = get();
          return sessionExpiry ? Math.max(0, sessionExpiry - Date.now()) : 0;
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          token: state.token,
          user: state.user,
          sessionExpiry: state.sessionExpiry,
          lastActivity: state.lastActivity,
        }),
        skipHydration: true,

        // Handle storage events for multi-tab sync
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setInitializing(false);

            // Check if session is still valid
            if (state.isAuthenticated && !state.isSessionValid()) {
              state.logout();
            }
          }
        },
      }
    )
  )
);
