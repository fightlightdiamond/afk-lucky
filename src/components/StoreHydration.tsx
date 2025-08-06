"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store";

export default function StoreHydration() {
  useEffect(() => {
    // Manually hydrate the auth store
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
