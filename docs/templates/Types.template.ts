import type { ReactNode } from "react";

// Base component props interface
export interface ComponentNameProps {
  /**
   * Child elements to render inside the component
   */
  children?: ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Component variant
   */
  variant?: "default" | "primary" | "secondary";

  /**
   * Component size
   */
  size?: "sm" | "md" | "lg";

  /**
   * Whether the component is disabled
   */
  disabled?: boolean;

  /**
   * Whether the component is in loading state
   */
  loading?: boolean;

  /**
   * Click handler
   */
  onClick?: () => void;
}

// Hook options interface
export interface HookOptions {
  /**
   * Initial value for the hook
   */
  initialValue?: any;

  /**
   * Whether to auto-fetch data
   */
  autoFetch?: boolean;
}

// Hook return type interface
export interface HookReturnType {
  /**
   * Current state value
   */
  state: any;

  /**
   * Whether an operation is in progress
   */
  loading: boolean;

  /**
   * Error state if any
   */
  error: Error | null;

  /**
   * Function to trigger an action
   */
  handleAction: () => Promise<void>;
}
