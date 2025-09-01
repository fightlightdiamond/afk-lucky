import { useState, useEffect } from "react";

/**
 * Hook to track media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Use modern addEventListener (addListener/removeListener are deprecated)
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

/**
 * Predefined media query hooks for common breakpoints
 */
export const useBreakpoint = {
  xs: () => useMediaQuery("(min-width: 475px)"),
  sm: () => useMediaQuery("(min-width: 640px)"),
  md: () => useMediaQuery("(min-width: 768px)"),
  lg: () => useMediaQuery("(min-width: 1024px)"),
  xl: () => useMediaQuery("(min-width: 1280px)"),
  "2xl": () => useMediaQuery("(min-width: 1536px)"),

  // Max-width queries (mobile-first approach)
  maxXs: () => useMediaQuery("(max-width: 474px)"),
  maxSm: () => useMediaQuery("(max-width: 639px)"),
  maxMd: () => useMediaQuery("(max-width: 767px)"),
  maxLg: () => useMediaQuery("(max-width: 1023px)"),
  maxXl: () => useMediaQuery("(max-width: 1279px)"),
  max2Xl: () => useMediaQuery("(max-width: 1535px)"),

  // Range queries
  smToMd: () => useMediaQuery("(min-width: 640px) and (max-width: 767px)"),
  mdToLg: () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)"),
  lgToXl: () => useMediaQuery("(min-width: 1024px) and (max-width: 1279px)"),
  xlTo2Xl: () => useMediaQuery("(min-width: 1280px) and (max-width: 1535px)"),
};

/**
 * Device-specific media query hooks
 */
export const useDevice = {
  mobile: () => useMediaQuery("(max-width: 767px)"),
  tablet: () => useMediaQuery("(min-width: 768px) and (max-width: 1023px)"),
  desktop: () => useMediaQuery("(min-width: 1024px)"),

  // Orientation
  portrait: () => useMediaQuery("(orientation: portrait)"),
  landscape: () => useMediaQuery("(orientation: landscape)"),

  // Touch capabilities
  touch: () => useMediaQuery("(pointer: coarse)"),
  mouse: () => useMediaQuery("(pointer: fine)"),

  // Display preferences
  darkMode: () => useMediaQuery("(prefers-color-scheme: dark)"),
  lightMode: () => useMediaQuery("(prefers-color-scheme: light)"),
  reducedMotion: () => useMediaQuery("(prefers-reduced-motion: reduce)"),
  highContrast: () => useMediaQuery("(prefers-contrast: high)"),

  // Display density
  retina: () =>
    useMediaQuery(
      "(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)"
    ),

  // Hover capabilities
  hover: () => useMediaQuery("(hover: hover)"),
  noHover: () => useMediaQuery("(hover: none)"),
};

/**
 * Combined responsive hook that provides multiple breakpoint states
 */
export function useResponsiveBreakpoints() {
  const isXs = useBreakpoint.xs();
  const isSm = useBreakpoint.sm();
  const isMd = useBreakpoint.md();
  const isLg = useBreakpoint.lg();
  const isXl = useBreakpoint.xl();
  const is2Xl = useBreakpoint["2xl"]();

  const isMobile = useDevice.mobile();
  const isTablet = useDevice.tablet();
  const isDesktop = useDevice.desktop();

  return {
    // Breakpoint states
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,

    // Device states
    isMobile,
    isTablet,
    isDesktop,

    // Current breakpoint (mobile-first)
    currentBreakpoint: is2Xl
      ? "2xl"
      : isXl
      ? "xl"
      : isLg
      ? "lg"
      : isMd
      ? "md"
      : isSm
      ? "sm"
      : "xs",

    // Device type
    deviceType: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
  };
}
