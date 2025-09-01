# Responsive Utilities Documentation

This document provides comprehensive documentation for the mobile-first responsive utilities implemented in the project.

## Overview

The responsive utilities follow a mobile-first approach, starting with mobile styles and progressively enhancing for larger screens. This approach ensures optimal performance and user experience across all devices.

## Table of Contents

1. [Hooks](#hooks)
2. [Utility Functions](#utility-functions)
3. [Constants](#constants)
4. [Tailwind Configuration](#tailwind-configuration)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

## Hooks

### useResponsive

A comprehensive hook for responsive design that provides screen size information and breakpoint detection.

```tsx
import { useResponsive } from "@/hooks";

function MyComponent() {
  const {
    screenSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isSmUp,
    isMdUp,
    isLgUp,
    // ... more breakpoint checks
  } = useResponsive();

  return (
    <div>
      <p>
        Screen: {screenSize.width} × {screenSize.height}
      </p>
      <p>Breakpoint: {currentBreakpoint}</p>
      {isMobile && <MobileComponent />}
      {isDesktop && <DesktopComponent />}
    </div>
  );
}
```

### useDeviceDetection

Detects device type, capabilities, and user preferences.

```tsx
import { useDeviceDetection, useReducedMotion, useColorScheme } from "@/hooks";

function MyComponent() {
  const deviceInfo = useDeviceDetection();
  const prefersReducedMotion = useReducedMotion();
  const colorScheme = useColorScheme();

  return (
    <div>
      <p>Device: {deviceInfo.isMobile ? "Mobile" : "Desktop"}</p>
      <p>Touch: {deviceInfo.isTouchDevice ? "Yes" : "No"}</p>
      <p>Orientation: {deviceInfo.orientation}</p>
      <p>Reduced Motion: {prefersReducedMotion ? "Yes" : "No"}</p>
      <p>Color Scheme: {colorScheme}</p>
    </div>
  );
}
```

### useMediaQuery

A flexible hook for custom media queries.

```tsx
import { useMediaQuery, useBreakpoint, useDevice } from "@/hooks";

function MyComponent() {
  // Custom media query
  const isLargeScreen = useMediaQuery("(min-width: 1200px)");

  // Predefined breakpoint hooks
  const isMd = useBreakpoint.md();
  const isTablet = useDevice.tablet();
  const canHover = useDevice.hover();

  return (
    <div>
      {isLargeScreen && <LargeScreenContent />}
      {isMd && <MediumScreenContent />}
      {isTablet && <TabletContent />}
      {canHover && <HoverEffects />}
    </div>
  );
}
```

## Utility Functions

### Responsive Class Generators

Pre-built responsive class generators for common patterns.

```tsx
import { responsive, visibility, touch, patterns } from "@/utils/responsive";

function MyComponent() {
  return (
    <div className={responsive.container()}>
      {/* Responsive grid */}
      <div className={responsive.grid()}>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>

      {/* Responsive card */}
      <div className={responsive.card()}>
        <h2>Card Title</h2>
        <p>Card content</p>
      </div>

      {/* Touch-friendly button */}
      <button
        className={cn(
          responsive.button(),
          touch.target,
          "bg-blue-500 text-white"
        )}
      >
        Touch Button
      </button>

      {/* Visibility utilities */}
      <div className={visibility.mobileOnly}>Mobile only</div>
      <div className={visibility.desktopOnly}>Desktop only</div>

      {/* Layout patterns */}
      <div className={patterns.stackToRow}>
        <div>Stacks on mobile</div>
        <div>Row on desktop</div>
      </div>
    </div>
  );
}
```

### Custom Responsive Classes

Generate custom responsive classes for specific needs.

```tsx
import { generateResponsiveClasses } from "@/utils/responsive";

const customClasses = generateResponsiveClasses({
  base: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
});

// Result: "text-sm sm:text-base md:text-lg lg:text-xl"
```

## Constants

### Breakpoints

```tsx
import { BREAKPOINTS, DEVICE_CATEGORIES } from "@/constants/responsive";

// Breakpoints (px)
BREAKPOINTS.xs; // 475
BREAKPOINTS.sm; // 640
BREAKPOINTS.md; // 768
BREAKPOINTS.lg; // 1024
BREAKPOINTS.xl; // 1280
BREAKPOINTS["2xl"]; // 1536

// Device categories
DEVICE_CATEGORIES.mobile; // 0-767px
DEVICE_CATEGORIES.tablet; // 768-1023px
DEVICE_CATEGORIES.desktop; // 1024px+
```

### Touch Targets

```tsx
import { TOUCH_TARGETS } from "@/constants/responsive";

TOUCH_TARGETS.minimum; // 44px (accessibility minimum)
TOUCH_TARGETS.comfortable; // 48px
TOUCH_TARGETS.large; // 56px
```

### Media Queries

```tsx
import { MEDIA_QUERIES } from "@/constants/responsive";

// Breakpoint queries
MEDIA_QUERIES.sm; // "(min-width: 640px)"
MEDIA_QUERIES.md; // "(min-width: 768px)"

// Device queries
MEDIA_QUERIES.mobile; // "(max-width: 767px)"
MEDIA_QUERIES.tablet; // "(min-width: 768px) and (max-width: 1023px)"
MEDIA_QUERIES.desktop; // "(min-width: 1024px)"

// Preference queries
MEDIA_QUERIES.darkMode; // "(prefers-color-scheme: dark)"
MEDIA_QUERIES.reducedMotion; // "(prefers-reduced-motion: reduce)"
```

## Tailwind Configuration

The project includes a comprehensive Tailwind configuration with mobile-first breakpoints and responsive utilities.

### Key Features

- **Mobile-first breakpoints**: xs, sm, md, lg, xl, 2xl
- **Responsive containers**: Automatic centering and padding
- **Fluid typography**: CSS clamp() for smooth scaling
- **Touch-friendly sizing**: Minimum 44px touch targets
- **Safe area support**: iOS safe area insets
- **Mobile-optimized animations**: Reduced motion support

### Custom Classes

```css
/* Fluid typography */
.text-fluid-sm    /* clamp(0.875rem, 2vw, 1rem) */
/* clamp(0.875rem, 2vw, 1rem) */
.text-fluid-base  /* clamp(1rem, 2.5vw, 1.125rem) */
.text-fluid-lg    /* clamp(1.125rem, 3vw, 1.25rem) */

/* Touch targets */
.min-h-touch      /* 44px minimum height */
.min-w-touch      /* 44px minimum width */

/* Safe areas */
.pt-safe-top      /* env(safe-area-inset-top) */
.pb-safe-bottom   /* env(safe-area-inset-bottom) */

/* Mobile shadows */
.shadow-mobile    /* Optimized for mobile */
.shadow-touch; /* Touch interaction shadow */
```

## Usage Examples

### Basic Responsive Component

```tsx
import { useResponsive } from "@/hooks";
import { responsive, patterns } from "@/utils/responsive";

function ResponsiveCard({ title, content }) {
  const { isMobile } = useResponsive();

  return (
    <div className={responsive.card()}>
      <h2 className="text-fluid-xl font-semibold mb-4">{title}</h2>

      {/* Responsive layout */}
      <div className={patterns.stackToRow}>
        <div className="flex-1">
          <p className="text-fluid-base">{content}</p>
        </div>

        {/* Conditional rendering based on device */}
        {!isMobile && (
          <div className="flex-shrink-0 ml-6">
            <DesktopSidebar />
          </div>
        )}
      </div>

      {/* Mobile-specific content */}
      {isMobile && <MobileCTA />}
    </div>
  );
}
```

### Responsive Navigation

```tsx
import { useDeviceDetection } from "@/hooks";
import { patterns, visibility } from "@/utils/responsive";

function Navigation() {
  const { isMobile } = useDeviceDetection();

  return (
    <nav className={patterns.nav}>
      {/* Always visible items */}
      <a href="/" className="font-semibold">
        Home
      </a>
      <a href="/about">About</a>

      {/* Desktop-only items */}
      <div className={visibility.desktopOnly}>
        <a href="/services">Services</a>
        <a href="/portfolio">Portfolio</a>
        <a href="/contact">Contact</a>
      </div>

      {/* Mobile menu button */}
      {isMobile && (
        <button className={cn(touch.target, "ml-auto p-2 rounded-lg")}>
          ☰
        </button>
      )}
    </nav>
  );
}
```

### Responsive Grid

```tsx
import { responsive } from "@/utils/responsive";

function ProductGrid({ products }) {
  return (
    <div className={responsive.container()}>
      <div
        className={responsive.grid({
          mobile: "grid-cols-1 gap-4",
          tablet: "sm:grid-cols-2 sm:gap-6",
          desktop: "lg:grid-cols-3 lg:gap-8 xl:grid-cols-4",
        })}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Mobile-First Approach

Always start with mobile styles and enhance for larger screens:

```tsx
// ✅ Good - Mobile first
<div className="text-sm sm:text-base lg:text-lg">

// ❌ Avoid - Desktop first
<div className="text-lg md:text-base sm:text-sm">
```

### 2. Touch-Friendly Design

Ensure interactive elements meet minimum touch target sizes:

```tsx
// ✅ Good - Touch friendly
<button className={cn(touch.target, 'px-4 py-2')}>

// ❌ Avoid - Too small for touch
<button className="px-1 py-1 text-xs">
```

### 3. Performance Considerations

Use conditional rendering for device-specific content:

```tsx
// ✅ Good - Conditional rendering
{isMobile ? <MobileComponent /> : <DesktopComponent />}

// ❌ Avoid - Always rendering both
<div className="block sm:hidden"><MobileComponent /></div>
<div className="hidden sm:block"><DesktopComponent /></div>
```

### 4. Accessibility

Consider user preferences and accessibility:

```tsx
import { useReducedMotion } from "@/hooks";

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "transition-transform",
        !prefersReducedMotion && "hover:scale-105"
      )}
    >
      Content
    </div>
  );
}
```

### 5. Semantic Breakpoints

Use semantic breakpoint names when possible:

```tsx
// ✅ Good - Semantic
const { isMobile, isTablet, isDesktop } = useResponsive();

// ✅ Also good - Specific breakpoints when needed
const { isLgUp } = useResponsive();
```

## Testing

Test responsive utilities across different devices and screen sizes:

1. **Browser DevTools**: Use responsive design mode
2. **Real Devices**: Test on actual mobile devices
3. **Accessibility**: Test with screen readers and keyboard navigation
4. **Performance**: Monitor performance on slower devices

## Demo

Visit `/demo/responsive` to see all responsive utilities in action with live examples and device detection.
