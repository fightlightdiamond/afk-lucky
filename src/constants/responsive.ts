/**
 * Responsive design constants and configurations
 */

// Mobile-first breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Device categories based on screen width
export const DEVICE_CATEGORIES = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Infinity },
} as const;

// Touch target sizes (following accessibility guidelines)
export const TOUCH_TARGETS = {
  minimum: 44, // Minimum touch target size in pixels
  comfortable: 48, // Comfortable touch target size
  large: 56, // Large touch target size
} as const;

// Safe area insets for mobile devices
export const SAFE_AREAS = {
  top: "env(safe-area-inset-top)",
  bottom: "env(safe-area-inset-bottom)",
  left: "env(safe-area-inset-left)",
  right: "env(safe-area-inset-right)",
} as const;

// Common responsive spacing scale
export const RESPONSIVE_SPACING = {
  xs: {
    padding: "0.5rem", // 8px
    margin: "0.25rem", // 4px
    gap: "0.5rem", // 8px
  },
  sm: {
    padding: "0.75rem", // 12px
    margin: "0.5rem", // 8px
    gap: "0.75rem", // 12px
  },
  md: {
    padding: "1rem", // 16px
    margin: "0.75rem", // 12px
    gap: "1rem", // 16px
  },
  lg: {
    padding: "1.5rem", // 24px
    margin: "1rem", // 16px
    gap: "1.5rem", // 24px
  },
  xl: {
    padding: "2rem", // 32px
    margin: "1.5rem", // 24px
    gap: "2rem", // 32px
  },
  "2xl": {
    padding: "3rem", // 48px
    margin: "2rem", // 32px
    gap: "3rem", // 48px
  },
} as const;

// Responsive typography scale
export const RESPONSIVE_TYPOGRAPHY = {
  xs: {
    fontSize: "0.75rem", // 12px
    lineHeight: "1rem", // 16px
  },
  sm: {
    fontSize: "0.875rem", // 14px
    lineHeight: "1.25rem", // 20px
  },
  base: {
    fontSize: "1rem", // 16px
    lineHeight: "1.5rem", // 24px
  },
  lg: {
    fontSize: "1.125rem", // 18px
    lineHeight: "1.75rem", // 28px
  },
  xl: {
    fontSize: "1.25rem", // 20px
    lineHeight: "1.75rem", // 28px
  },
  "2xl": {
    fontSize: "1.5rem", // 24px
    lineHeight: "2rem", // 32px
  },
  "3xl": {
    fontSize: "1.875rem", // 30px
    lineHeight: "2.25rem", // 36px
  },
  "4xl": {
    fontSize: "2.25rem", // 36px
    lineHeight: "2.5rem", // 40px
  },
} as const;

// Container max-widths for different breakpoints
export const CONTAINER_SIZES = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1400px", // Slightly smaller than breakpoint for better readability
} as const;

// Grid system configurations
export const GRID_SYSTEMS = {
  mobile: {
    columns: 1,
    gap: "1rem",
    padding: "1rem",
  },
  tablet: {
    columns: 2,
    gap: "1.5rem",
    padding: "1.5rem",
  },
  desktop: {
    columns: 3,
    gap: "2rem",
    padding: "2rem",
  },
  wide: {
    columns: 4,
    gap: "2.5rem",
    padding: "2.5rem",
  },
} as const;

// Animation durations for different screen sizes
export const ANIMATION_DURATIONS = {
  mobile: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
  },
  desktop: {
    fast: "200ms",
    normal: "300ms",
    slow: "500ms",
  },
} as const;

// Z-index scale for layering
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// Common media queries
export const MEDIA_QUERIES = {
  // Breakpoint queries
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  "2xl": `(min-width: ${BREAKPOINTS["2xl"]}px)`,

  // Max-width queries
  maxXs: `(max-width: ${BREAKPOINTS.xs - 1}px)`,
  maxSm: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  maxMd: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  maxLg: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  maxXl: `(max-width: ${BREAKPOINTS.xl - 1}px)`,
  max2Xl: `(max-width: ${BREAKPOINTS["2xl"] - 1}px)`,

  // Device queries
  mobile: `(max-width: ${DEVICE_CATEGORIES.mobile.max}px)`,
  tablet: `(min-width: ${DEVICE_CATEGORIES.tablet.min}px) and (max-width: ${DEVICE_CATEGORIES.tablet.max}px)`,
  desktop: `(min-width: ${DEVICE_CATEGORIES.desktop.min}px)`,

  // Orientation queries
  portrait: "(orientation: portrait)",
  landscape: "(orientation: landscape)",

  // Interaction queries
  touch: "(pointer: coarse)",
  mouse: "(pointer: fine)",
  hover: "(hover: hover)",
  noHover: "(hover: none)",

  // Preference queries
  darkMode: "(prefers-color-scheme: dark)",
  lightMode: "(prefers-color-scheme: light)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
  highContrast: "(prefers-contrast: high)",

  // Display density
  retina: "(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)",
} as const;

// Responsive image sizes
export const IMAGE_SIZES = {
  avatar: {
    mobile: "32px",
    tablet: "40px",
    desktop: "48px",
  },
  thumbnail: {
    mobile: "64px",
    tablet: "80px",
    desktop: "96px",
  },
  card: {
    mobile: "100%",
    tablet: "200px",
    desktop: "240px",
  },
  hero: {
    mobile: "100vw",
    tablet: "80vw",
    desktop: "60vw",
  },
} as const;

// Common responsive patterns
export const RESPONSIVE_PATTERNS = {
  // Stack on mobile, row on desktop
  stackToRow: {
    mobile: "flex-col",
    desktop: "sm:flex-row",
  },

  // Hide on mobile, show on desktop
  hideOnMobile: {
    mobile: "hidden",
    desktop: "sm:block",
  },

  // Show on mobile, hide on desktop
  showOnMobile: {
    mobile: "block",
    desktop: "sm:hidden",
  },

  // Center on mobile, left-align on desktop
  centerToLeft: {
    mobile: "text-center",
    desktop: "sm:text-left",
  },

  // Full width on mobile, auto on desktop
  fullToAuto: {
    mobile: "w-full",
    desktop: "sm:w-auto",
  },
} as const;
