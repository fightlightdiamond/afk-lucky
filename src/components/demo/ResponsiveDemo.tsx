"use client";

import React from "react";
import { useResponsive, useDeviceDetection, useMediaQuery } from "@/hooks";
import { responsive, visibility, touch, patterns } from "@/utils/responsive";
import { cn } from "@/utils/responsive";

export function ResponsiveDemo() {
  const {
    screenSize,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isSmUp,
    isMdUp,
    isLgUp,
  } = useResponsive();

  const deviceInfo = useDeviceDetection();
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );

  return (
    <div className={responsive.container()}>
      <div className="space-y-8">
        {/* Header */}
        <div className={patterns.hero}>
          <h1 className="text-fluid-3xl font-bold mb-4">
            Responsive Design Demo
          </h1>
          <p className="text-fluid-base text-muted-foreground">
            Testing mobile-first responsive utilities and device detection
          </p>
        </div>

        {/* Device Information */}
        <div className={responsive.card()}>
          <h2 className="text-fluid-xl font-semibold mb-4">
            Device Information
          </h2>
          <div className={responsive.grid()}>
            <div className="space-y-2">
              <h3 className="font-medium">Screen Size</h3>
              <p className="text-sm text-muted-foreground">
                {screenSize.width} × {screenSize.height}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Current Breakpoint</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {currentBreakpoint}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Device Type</h3>
              <p className="text-sm text-muted-foreground">
                {deviceInfo.isMobile
                  ? "Mobile"
                  : deviceInfo.isTablet
                  ? "Tablet"
                  : "Desktop"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Touch Device</h3>
              <p className="text-sm text-muted-foreground">
                {deviceInfo.isTouchDevice ? "Yes" : "No"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Orientation</h3>
              <p className="text-sm text-muted-foreground capitalize">
                {deviceInfo.orientation}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">
                {isDarkMode ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>

        {/* Breakpoint Status */}
        <div className={responsive.card()}>
          <h2 className="text-fluid-xl font-semibold mb-4">
            Breakpoint Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Mobile", active: isMobile },
              { name: "Tablet", active: isTablet },
              { name: "Desktop", active: isDesktop },
              { name: "SM+", active: isSmUp },
              { name: "MD+", active: isMdUp },
              { name: "LG+", active: isLgUp },
            ].map(({ name, active }) => (
              <div
                key={name}
                className={cn(
                  "p-3 rounded-lg text-center text-sm font-medium transition-colors",
                  active
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Responsive Grid Demo */}
        <div className={responsive.card()}>
          <h2 className="text-fluid-xl font-semibold mb-4">Responsive Grid</h2>
          <div className={patterns.cardGrid}>
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg text-center"
              >
                <div className="text-2xl font-bold mb-2">{i + 1}</div>
                <div className="text-sm opacity-90">Grid Item</div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsive Text Demo */}
        <div className={responsive.card()}>
          <h2 className="text-fluid-xl font-semibold mb-4">
            Responsive Typography
          </h2>
          <div className="space-y-4">
            <h1 className="text-fluid-3xl font-bold">Fluid Heading 1</h1>
            <h2 className="text-fluid-2xl font-semibold">Fluid Heading 2</h2>
            <h3 className="text-fluid-xl font-medium">Fluid Heading 3</h3>
            <p className="text-fluid-base">
              This is fluid body text that scales smoothly across different
              screen sizes. The text size adjusts automatically based on the
              viewport width using CSS clamp().
            </p>
            <p className="text-fluid-sm text-muted-foreground">
              This is smaller fluid text for captions and secondary information.
            </p>
          </div>
        </div>

        {/* Visibility Demo */}
        <div className={responsive.card()}>
          <h2 className="text-fluid-xl font-semibold mb-4">
            Responsive Visibility
          </h2>
          <div className="space-y-4">
            <div
              className={cn(
                "p-4 bg-red-100 text-red-800 rounded-lg",
                visibility.mobileOnly
              )}
            >
              📱 This is only visible on mobile devices
            </div>
            <div
              className={cn(
                "p-4 bg-yellow-100 text-yellow-800 rounded-lg",
                visibility.tabletOnly
              )}
            >
              📱 This is only visible on tablet devices
            </div>
            <div
              className={cn(
                "p-4 bg-green-100 text-green-800 rounded-lg",
                visibility.desktopOnly
              )}
            >
              🖥️ This is only visible on desktop devices
            </div>
            <div
              className={cn(
                "p-4 bg-blue-100 text-blue-800 rounded-lg",
                visibility.mobileAndTablet
              )}
            >
              📱📱 This is visible on mobile and tablet
            </div>
            <div
              className={cn(
                "p-4 bg-purple-100 text-purple-800 rounded-lg",
                visibility.tabletAndDesktop
              )}
            >
              📱🖥️ This is visible on tablet and desktop
            </div>
          </div>
        </div>

        {/* Touch-Friendly Demo */}
        <div className={responsive.card()}>
          <h2 className="text-fluid-xl font-semibold mb-4">
            Touch-Friendly Elements
          </h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <button
                className={cn(
                  "bg-blue-500 text-white rounded-lg font-medium transition-colors hover:bg-blue-600",
                  touch.target,
                  responsive.button()
                )}
              >
                Touch Button
              </button>
              <button
                className={cn(
                  "bg-green-500 text-white rounded-lg font-medium transition-colors hover:bg-green-600",
                  touch.target,
                  "px-6 py-3"
                )}
              >
                Large Button
              </button>
              <button
                className={cn(
                  "bg-purple-500 text-white rounded-full font-medium transition-colors hover:bg-purple-600",
                  touch.target,
                  "aspect-square"
                )}
              >
                ⭐
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              All buttons meet the minimum 44px touch target size for
              accessibility.
              {deviceInfo.isTouchDevice &&
                " Touch device detected - optimized for touch interaction."}
            </p>
          </div>
        </div>

        {/* Animation Demo */}
        <div className={responsive.card()}>
          <h2 className="text-fluid-xl font-semibold mb-4">
            Responsive Animations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Fade In", class: "animate-fade-in" },
              { name: "Slide Up", class: "animate-slide-up" },
              { name: "Scale In", class: "animate-scale-in" },
              { name: "Bounce", class: "animate-bounce-gentle" },
            ].map(({ name, class: animClass }) => (
              <div
                key={name}
                className={cn(
                  "p-6 bg-gradient-to-br from-pink-500 to-orange-500 text-white rounded-lg text-center",
                  !prefersReducedMotion && animClass
                )}
              >
                <div className="text-lg font-semibold">{name}</div>
                {prefersReducedMotion && (
                  <div className="text-xs mt-2 opacity-75">
                    Animation disabled (reduced motion)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Layout Patterns Demo */}
        <div className={responsive.card()}>
          <h2 className="text-fluid-xl font-semibold mb-4">Layout Patterns</h2>

          {/* Stack to Row */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Stack to Row</h3>
            <div className={cn(patterns.stackToRow, "gap-4")}>
              <div className="flex-1 p-4 bg-blue-100 text-blue-800 rounded-lg text-center">
                Item 1
              </div>
              <div className="flex-1 p-4 bg-green-100 text-green-800 rounded-lg text-center">
                Item 2
              </div>
              <div className="flex-1 p-4 bg-purple-100 text-purple-800 rounded-lg text-center">
                Item 3
              </div>
            </div>
          </div>

          {/* Responsive Navigation */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Responsive Navigation</h3>
            <nav className={patterns.nav}>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Home
              </a>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                About
              </a>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Services
              </a>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
