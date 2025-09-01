import { useState, useEffect } from "react";

// Mobile-first breakpoints matching Tailwind CSS defaults
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook to detect current screen size and breakpoint
 */
export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint | "xs">(
    "xs"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });

      // Determine current breakpoint (mobile-first)
      if (width >= BREAKPOINTS["2xl"]) {
        setCurrentBreakpoint("2xl");
      } else if (width >= BREAKPOINTS.xl) {
        setCurrentBreakpoint("xl");
      } else if (width >= BREAKPOINTS.lg) {
        setCurrentBreakpoint("lg");
      } else if (width >= BREAKPOINTS.md) {
        setCurrentBreakpoint("md");
      } else if (width >= BREAKPOINTS.sm) {
        setCurrentBreakpoint("sm");
      } else {
        setCurrentBreakpoint("xs");
      }
    };

    // Set initial values
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper functions for breakpoint checks
  const isXs = currentBreakpoint === "xs";
  const isSm = currentBreakpoint === "sm";
  const isMd = currentBreakpoint === "md";
  const isLg = currentBreakpoint === "lg";
  const isXl = currentBreakpoint === "xl";
  const is2Xl = currentBreakpoint === "2xl";

  // Mobile-first responsive checks
  const isSmUp = screenSize.width >= BREAKPOINTS.sm;
  const isMdUp = screenSize.width >= BREAKPOINTS.md;
  const isLgUp = screenSize.width >= BREAKPOINTS.lg;
  const isXlUp = screenSize.width >= BREAKPOINTS.xl;
  const is2XlUp = screenSize.width >= BREAKPOINTS["2xl"];

  // Mobile-first responsive checks (down)
  const isSmDown = screenSize.width < BREAKPOINTS.sm;
  const isMdDown = screenSize.width < BREAKPOINTS.md;
  const isLgDown = screenSize.width < BREAKPOINTS.lg;
  const isXlDown = screenSize.width < BREAKPOINTS.xl;
  const is2XlDown = screenSize.width < BREAKPOINTS["2xl"];

  return {
    screenSize,
    currentBreakpoint,
    // Exact breakpoint checks
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    // Mobile-first up checks
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
    is2XlUp,
    // Mobile-first down checks
    isSmDown,
    isMdDown,
    isLgDown,
    isXlDown,
    is2XlDown,
  };
}
