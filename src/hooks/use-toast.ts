"use client";

import { useCallback } from "react";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    // Use the global toast function if available
    if (typeof window !== "undefined" && (window as any).toast) {
      (window as any).toast(options);
    } else {
      // Fallback to console for server-side or if toast not available
      console.log("Toast:", options);
    }
  }, []);

  return { toast };
}
