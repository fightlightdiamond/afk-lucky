import { useEffect } from "react";
import { useAuthStore, useUIStore } from "@/store";

// Custom hook for auth store with session management
export function useAuthSession() {
  const {
    isAuthenticated,
    user,
    token,
    isSessionValid,
    getTimeUntilExpiry,
    updateLastActivity,
    logout,
    isInitializing,
  } = useAuthStore();

  // Auto-logout when session expires
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      if (!isSessionValid()) {
        logout();
        return;
      }

      // Update activity on user interaction
      updateLastActivity();
    };

    // Check session every minute
    const interval = setInterval(checkSession, 60 * 1000);

    // Listen for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const handleActivity = () => updateLastActivity();

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      clearInterval(interval);
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated, isSessionValid, updateLastActivity, logout]);

  return {
    isAuthenticated,
    user,
    token,
    isInitializing,
    timeUntilExpiry: getTimeUntilExpiry(),
    isSessionValid: isSessionValid(),
  };
}

// Custom hook for UI store with theme management
export function useTheme() {
  const { theme, setTheme } = useUIStore();

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme]);

  return { theme, setTheme };
}

// Custom hook for modal management
export function useModal(modalId: string) {
  const { modals, openModal, closeModal, toggleModal } = useUIStore();

  return {
    isOpen: modals[modalId] || false,
    open: () => openModal(modalId),
    close: () => closeModal(modalId),
    toggle: () => toggleModal(modalId),
  };
}

// Custom hook for global loading state
export function useGlobalLoading() {
  const { globalLoading, loadingMessage, setGlobalLoading } = useUIStore();

  return {
    isLoading: globalLoading,
    message: loadingMessage,
    setLoading: setGlobalLoading,
  };
}
