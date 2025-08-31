"use client";

import React from "react";
import { ScrollToTopProvider } from "./scroll-to-top-provider";

/**
 * Global Scroll to Top component that can be used in root layout
 * Only shows on pages that don't have their own scroll to top implementation
 */
export function GlobalScrollToTop() {
  return (
    <ScrollToTopProvider
      threshold={400}
      className="z-50" // Higher z-index for global usage
    />
  );
}
