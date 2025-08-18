import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Theme and appearance
  theme: "light" | "dark" | "system";
  sidebarCollapsed: boolean;

  // Loading states
  globalLoading: boolean;
  loadingMessage: string;

  // Modal states
  modals: {
    [key: string]: boolean;
  };

  // Notification preferences
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };

  // Actions
  setTheme: (theme: UIState["theme"]) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  setGlobalLoading: (loading: boolean, message?: string) => void;

  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;

  updateNotificationSettings: (
    settings: Partial<UIState["notifications"]>
  ) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: "system",
      sidebarCollapsed: false,
      globalLoading: false,
      loadingMessage: "",
      modals: {},
      notifications: {
        enabled: true,
        sound: true,
        desktop: false,
      },

      // Actions
      setTheme: (theme) => set({ theme }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setGlobalLoading: (loading, message = "") =>
        set({ globalLoading: loading, loadingMessage: message }),

      openModal: (modalId) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: true },
        })),

      closeModal: (modalId) =>
        set((state) => ({
          modals: { ...state.modals, [modalId]: false },
        })),

      toggleModal: (modalId) => {
        const { modals } = get();
        set({
          modals: { ...modals, [modalId]: !modals[modalId] },
        });
      },

      updateNotificationSettings: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        notifications: state.notifications,
      }),
    }
  )
);
