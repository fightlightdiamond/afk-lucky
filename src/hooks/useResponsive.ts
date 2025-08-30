"use client";

import { useState, useEffect } from "react";

export interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
}

export function useResponsive(): ResponsiveBreakpoints {
  const [breakpoints, setBreakpoints] = useState<ResponsiveBreakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLarge: false,
  });

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1280,
        isLarge: width >= 1280,
      });
    };

    // Check on mount
    checkBreakpoints();

    // Add event listener
    window.addEventListener("resize", checkBreakpoints);

    // Cleanup
    return () => window.removeEventListener("resize", checkBreakpoints);
  }, []);

  return breakpoints;
}

// Convenience hooks for specific breakpoints
export function useIsMobile(): boolean {
  const { isMobile } = useResponsive();
  return isMobile;
}

export function useIsTablet(): boolean {
  const { isTablet } = useResponsive();
  return isTablet;
}

export function useIsDesktop(): boolean {
  const { isDesktop, isLarge } = useResponsive();
  return isDesktop || isLarge;
}

// Touch-friendly size utilities
export const touchFriendlyClasses = {
  button: "min-h-[44px] min-w-[44px]",
  input: "min-h-[44px]",
  select: "min-h-[44px]",
  checkbox: "min-h-[20px] min-w-[20px]",
  // Apply only on mobile
  mobileButton: "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0",
  mobileInput: "min-h-[44px] sm:min-h-0",
  mobileSelect: "min-h-[44px] sm:min-h-0",
};

// Responsive grid utilities
export const responsiveGrid = {
  // Standard responsive grids
  cols1to2: "grid-cols-1 md:grid-cols-2",
  cols1to3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  cols1to4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  cols2to4: "grid-cols-2 md:grid-cols-4",

  // Mobile-first approach
  mobileStack: "flex flex-col sm:flex-row",
  mobileCenter: "items-center justify-center sm:justify-start",

  // Gap utilities
  gapResponsive: "gap-2 sm:gap-4 lg:gap-6",
  paddingResponsive: "p-2 sm:p-4 lg:p-6",
  marginResponsive: "m-2 sm:m-4 lg:m-6",
};

// Text size utilities for responsive design
export const responsiveText = {
  heading: "text-lg sm:text-xl lg:text-2xl",
  subheading: "text-base sm:text-lg",
  body: "text-sm sm:text-base",
  caption: "text-xs sm:text-sm",
};
