/**
 * Accessibility utilities for admin user management components
 */

// ARIA live region announcements
export const announceToScreenReader = (
  message: string,
  priority: "polite" | "assertive" = "polite"
) => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management utilities
export const focusManagement = {
  // Store the last focused element before opening a dialog
  storeFocus: (): Element | null => {
    return document.activeElement;
  },

  // Restore focus to the previously focused element
  restoreFocus: (element: Element | null) => {
    if (element && "focus" in element && typeof element.focus === "function") {
      (element as HTMLElement).focus();
    }
  },

  // Focus the first focusable element in a container
  focusFirst: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  },

  // Trap focus within a container (for modals/dialogs)
  trapFocus: (container: HTMLElement, event: KeyboardEvent) => {
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    if (event.key === "Tab") {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  },
};

// Keyboard navigation utilities
export const keyboardNavigation = {
  // Handle arrow key navigation in lists/tables
  handleArrowNavigation: (
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onNavigate: (newIndex: number) => void,
    orientation: "horizontal" | "vertical" | "both" = "vertical"
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case "ArrowUp":
        if (orientation === "vertical" || orientation === "both") {
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        }
        break;
      case "ArrowDown":
        if (orientation === "vertical" || orientation === "both") {
          event.preventDefault();
          newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        }
        break;
      case "ArrowLeft":
        if (orientation === "horizontal" || orientation === "both") {
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        }
        break;
      case "ArrowRight":
        if (orientation === "horizontal" || orientation === "both") {
          event.preventDefault();
          newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        }
        break;
      case "Home":
        event.preventDefault();
        newIndex = 0;
        break;
      case "End":
        event.preventDefault();
        newIndex = totalItems - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      onNavigate(newIndex);
    }
  },

  // Handle Enter/Space activation
  handleActivation: (event: KeyboardEvent, callback: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      callback();
    }
  },
};

// ARIA label generators
export const ariaLabels = {
  // Generate descriptive labels for user actions
  userAction: (action: string, userName: string) => {
    return `${action} user ${userName}`;
  },

  // Generate labels for bulk operations
  bulkAction: (action: string, count: number) => {
    return `${action} ${count} selected user${count === 1 ? "" : "s"}`;
  },

  // Generate labels for sort buttons
  sortButton: (
    column: string,
    currentSort?: string,
    currentOrder?: "asc" | "desc"
  ) => {
    if (currentSort === column) {
      return `Sort ${column} ${
        currentOrder === "asc" ? "descending" : "ascending"
      }`;
    }
    return `Sort by ${column}`;
  },

  // Generate labels for pagination
  pagination: {
    page: (pageNumber: number, isCurrentPage: boolean = false) => {
      return isCurrentPage
        ? `Current page, page ${pageNumber}`
        : `Go to page ${pageNumber}`;
    },
    previous: (isDisabled: boolean = false) => {
      return isDisabled ? "Previous page, disabled" : "Go to previous page";
    },
    next: (isDisabled: boolean = false) => {
      return isDisabled ? "Next page, disabled" : "Go to next page";
    },
    first: (isDisabled: boolean = false) => {
      return isDisabled ? "First page, disabled" : "Go to first page";
    },
    last: (isDisabled: boolean = false) => {
      return isDisabled ? "Last page, disabled" : "Go to last page";
    },
  },

  // Generate labels for filters
  filter: {
    search: (hasValue: boolean, value?: string) => {
      return hasValue
        ? `Search users, current search: ${value}`
        : "Search users by name, email, or other criteria";
    },
    role: (selectedRole?: string) => {
      return selectedRole
        ? `Filter by role, currently: ${selectedRole}`
        : "Filter users by role";
    },
    status: (selectedStatus?: string) => {
      return selectedStatus
        ? `Filter by status, currently: ${selectedStatus}`
        : "Filter users by status";
    },
  },
};

// Screen reader utilities
export const screenReader = {
  // Announce loading states
  announceLoading: (operation: string) => {
    announceToScreenReader(`Loading ${operation}`, "polite");
  },

  // Announce completion
  announceComplete: (operation: string, result?: string) => {
    const message = result
      ? `${operation} completed: ${result}`
      : `${operation} completed`;
    announceToScreenReader(message, "polite");
  },

  // Announce errors
  announceError: (operation: string, error: string) => {
    announceToScreenReader(`Error in ${operation}: ${error}`, "assertive");
  },

  // Announce selection changes
  announceSelection: (count: number, total: number) => {
    if (count === 0) {
      announceToScreenReader("No users selected", "polite");
    } else if (count === total) {
      announceToScreenReader(`All ${total} users selected`, "polite");
    } else {
      announceToScreenReader(`${count} of ${total} users selected`, "polite");
    }
  },

  // Announce filter changes
  announceFilterChange: (filterType: string, value: string | null) => {
    if (value) {
      announceToScreenReader(
        `Filter applied: ${filterType} set to ${value}`,
        "polite"
      );
    } else {
      announceToScreenReader(`Filter cleared: ${filterType}`, "polite");
    }
  },
};

// Accessibility validation utilities
export const a11yValidation = {
  // Check if element has accessible name
  hasAccessibleName: (element: HTMLElement): boolean => {
    return !!(
      element.getAttribute("aria-label") ||
      element.getAttribute("aria-labelledby") ||
      element.textContent?.trim() ||
      element.getAttribute("title")
    );
  },

  // Check if interactive element has proper role
  hasProperRole: (element: HTMLElement): boolean => {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute("role");

    // Interactive elements that should have proper roles
    const interactiveElements = ["button", "a", "input", "select", "textarea"];

    if (interactiveElements.includes(tagName)) {
      return true; // Native elements have implicit roles
    }

    if (
      role &&
      ["button", "link", "menuitem", "tab", "option"].includes(role)
    ) {
      return true;
    }

    return false;
  },
};

// High contrast and reduced motion utilities
export const preferences = {
  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  // Check if user prefers high contrast
  prefersHighContrast: (): boolean => {
    return window.matchMedia("(prefers-contrast: high)").matches;
  },

  // Apply motion preferences to animations
  respectMotionPreference: (element: HTMLElement, animationClass: string) => {
    if (!preferences.prefersReducedMotion()) {
      element.classList.add(animationClass);
    }
  },
};

export default {
  announceToScreenReader,
  focusManagement,
  keyboardNavigation,
  ariaLabels,
  screenReader,
  a11yValidation,
  preferences,
};
