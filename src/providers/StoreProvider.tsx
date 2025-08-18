"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store";
import { useSessionValidation } from "@/hooks/useAuth";

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { setInitializing } = useAuthStore();

  // Initialize auth store hydration
  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setInitializing(false);
    });

    return unsubscribe;
  }, [setInitializing]);

  // Session validation
  useSessionValidation();

  return <>{children}</>;
}
