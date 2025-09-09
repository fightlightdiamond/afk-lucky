"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/components/providers/QueryProvider";
import { AbilityProvider } from "@/context/AbilityContext";
import { Toaster } from "sonner";
import StoreHydration from "@/components/StoreHydration";

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <QueryProvider>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AbilityProvider>
            <StoreHydration />
            {children}
            <Toaster position="top-right" richColors />
          </AbilityProvider>
        </ThemeProvider>
      </SessionProvider>
    </QueryProvider>
  );
}
