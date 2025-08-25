"use client";

import { ReactNode, useMemo, createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { AppAbility, createAbility } from "@/lib/ability";

// Create a context for the ability
export const AbilityContext = createContext<AppAbility | null>(null);

interface AbilityProviderProps {
  children: ReactNode;
}

export const AbilityProvider = ({ children }: AbilityProviderProps) => {
  const { data: session } = useSession();

  // Create ability instance and update it when session changes
  const ability = useMemo(() => {
    return createAbility(session);
  }, [session]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};

// Custom hook to use the ability context
export const useAbility = () => {
  const ability = useContext(AbilityContext);
  if (!ability) {
    throw new Error("useAbility must be used within an AbilityProvider");
  }
  return ability;
};
