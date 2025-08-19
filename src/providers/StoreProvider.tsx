"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store";
import { useSessionValidation } from "@/hooks/useAuth";

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  useEffect(() => {
    // Hydrate auth store on mount
    useAuthStore.persist.rehydrate();
  }, []);

  // Session validation
  useSessionValidation();

  return <>{children}</>;
}
