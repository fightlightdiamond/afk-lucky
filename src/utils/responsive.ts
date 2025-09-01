import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes with responsive variants
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Responsive breakpoints constants
 */
export const RESPONSIVE_BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type ResponsiveBreakpoint = keyof typeof RESPONSIVE_BREAKPOINTS;

/**
 * Mobile-first responsive utility classes
 */
export const RESPONSIVE_CLASSES = {
  // Container classes
  container: {
    mobile: "px-4 mx-auto max-w-full",
    tablet: "sm:px-6 sm:max-w-screen-sm md:max-w-screen-md",
    desktop:
      "lg:px-8 lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl",
  },

  // Grid classes
  grid: {
    mobile: "grid grid-cols-1 gap-4",
    tablet: "sm:grid-cols-2 sm:gap-6 md:grid-cols-3",
    desktop: "lg:grid-cols-4 lg:gap-8 xl:grid-cols-5 2xl:grid-cols-6",
  },

  // Flex classes
  flex: {
    mobile: "flex flex-col space-y-4",
    tablet: "sm:flex-row sm:space-y-0 sm:space-x-4",
    desktop: "lg:space-x-6 xl:space-x-8",
  },

  // Text classes
  text: {
    mobile: "text-sm leading-relaxed",
    tablet: "sm:text-base md:text-lg",
    desktop: "lg:text-xl xl:text-2xl",
  },

  // Spacing classes
  spacing: {
    mobile: "p-4 m-2",
    tablet: "sm:p-6 sm:m-4 md:p-8",
    desktop: "lg:p-10 lg:m-6 xl:p-12 xl:m-8",
  },

  // Button classes
  button: {
    mobile: "px-4 py-2 text-sm min-h-touch min-w-touch",
    tablet: "sm:px-6 sm:py-3 sm:text-base",
    desktop: "lg:px-8 lg:py-4 lg:text-lg",
  },

  // Card classes
  card: {
    mobile: "p-4 rounded-lg shadow-mobile",
    tablet: "sm:p-6 sm:rounded-xl md:shadow-lg",
    desktop: "lg:p-8 lg:rounded-2xl lg:shadow-xl",
  },
} as const;

/**
 * Generate responsive class string from breakpoint object
 */
export function generateResponsiveClasses(
  classes: Partial<Record<ResponsiveBreakpoint | "base", string>>
): string {
  const classArray: string[] = [];

  // Add base classes (mobile-first)
  if (classes.base) {
    classArray.push(classes.base);
  }

  // Add responsive classes
  Object.entries(classes).forEach(([breakpoint, className]) => {
    if (breakpoint !== "base" && className) {
      classArray.push(`${breakpoint}:${className}`);
    }
  });

  return classArray.join(" ");
}

/**
 * Responsive utility class generators
 */
export const responsive = {
  /**
   * Generate responsive container classes
   */
  container: (
    customClasses?: Partial<Record<"mobile" | "tablet" | "desktop", string>>
  ) => {
    return cn(
      RESPONSIVE_CLASSES.container.mobile,
      RESPONSIVE_CLASSES.container.tablet,
      RESPONSIVE_CLASSES.container.desktop,
      customClasses?.mobile,
      customClasses?.tablet,
      customClasses?.desktop
    );
  },

  /**
   * Generate responsive grid classes
   */
  grid: (
    customClasses?: Partial<Record<"mobile" | "tablet" | "desktop", string>>
  ) => {
    return cn(
      RESPONSIVE_CLASSES.grid.mobile,
      RESPONSIVE_CLASSES.grid.tablet,
      RESPONSIVE_CLASSES.grid.desktop,
      customClasses?.mobile,
      customClasses?.tablet,
      customClasses?.desktop
    );
  },

  /**
   * Generate responsive flex classes
   */
  flex: (
    customClasses?: Partial<Record<"mobile" | "tablet" | "desktop", string>>
  ) => {
    return cn(
      RESPONSIVE_CLASSES.flex.mobile,
      RESPONSIVE_CLASSES.flex.tablet,
      RESPONSIVE_CLASSES.flex.desktop,
      customClasses?.mobile,
      customClasses?.tablet,
      customClasses?.desktop
    );
  },

  /**
   * Generate responsive text classes
   */
  text: (
    customClasses?: Partial<Record<"mobile" | "tablet" | "desktop", string>>
  ) => {
    return cn(
      RESPONSIVE_CLASSES.text.mobile,
      RESPONSIVE_CLASSES.text.tablet,
      RESPONSIVE_CLASSES.text.desktop,
      customClasses?.mobile,
      customClasses?.tablet,
      customClasses?.desktop
    );
  },

  /**
   * Generate responsive spacing classes
   */
  spacing: (
    customClasses?: Partial<Record<"mobile" | "tablet" | "desktop", string>>
  ) => {
    return cn(
      RESPONSIVE_CLASSES.spacing.mobile,
      RESPONSIVE_CLASSES.spacing.tablet,
      RESPONSIVE_CLASSES.spacing.desktop,
      customClasses?.mobile,
      customClasses?.tablet,
      customClasses?.desktop
    );
  },

  /**
   * Generate responsive button classes
   */
  button: (
    customClasses?: Partial<Record<"mobile" | "tablet" | "desktop", string>>
  ) => {
    return cn(
      RESPONSIVE_CLASSES.button.mobile,
      RESPONSIVE_CLASSES.button.tablet,
      RESPONSIVE_CLASSES.button.desktop,
      customClasses?.mobile,
      customClasses?.tablet,
      customClasses?.desktop
    );
  },

  /**
   * Generate responsive card classes
   */
  card: (
    customClasses?: Partial<Record<"mobile" | "tablet" | "desktop", string>>
  ) => {
    return cn(
      RESPONSIVE_CLASSES.card.mobile,
      RESPONSIVE_CLASSES.card.tablet,
      RESPONSIVE_CLASSES.card.desktop,
      customClasses?.mobile,
      customClasses?.tablet,
      customClasses?.desktop
    );
  },
};

/**
 * Responsive visibility utilities
 */
export const visibility = {
  mobileOnly: "block sm:hidden",
  tabletOnly: "hidden sm:block lg:hidden",
  desktopOnly: "hidden lg:block",
  mobileAndTablet: "block lg:hidden",
  tabletAndDesktop: "hidden sm:block",
  notMobile: "hidden sm:block",
  notDesktop: "block lg:hidden",
};

/**
 * Touch-friendly utilities
 */
export const touch = {
  target: "min-h-touch min-w-touch", // 44px minimum touch target
  friendly: "touch-manipulation select-none", // Optimize for touch
  scroll: "overflow-auto -webkit-overflow-scrolling-touch", // Smooth scrolling on iOS
  safe: "pb-safe-bottom pt-safe-top pl-safe-left pr-safe-right", // Safe area insets
};

/**
 * Common responsive patterns
 */
export const patterns = {
  // Stack on mobile, side-by-side on tablet+
  stackToRow: "flex flex-col sm:flex-row",

  // Center content with responsive padding
  centerContent: "flex items-center justify-center px-4 sm:px-6 lg:px-8",

  // Responsive modal/dialog
  modal:
    "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8",

  // Responsive card grid
  cardGrid:
    "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4",

  // Responsive navigation
  nav: "flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0",

  // Responsive hero section
  hero: "text-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 xl:py-24",

  // Responsive form
  form: "space-y-4 sm:space-y-6 max-w-md mx-auto sm:max-w-lg lg:max-w-xl",
};
