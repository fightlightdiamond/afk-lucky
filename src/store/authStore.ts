import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      login: (token, user) =>
        set({
          isAuthenticated: true,
          token,
          user,
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      }),
      skipHydration: true,
    }
  )
);
