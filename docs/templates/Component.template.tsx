"use client";

import React from "react";
import type { ComponentNameProps } from "./types";

/**
 * ComponentName - Brief description of what this component does
 *
 * @param props - The component props
 * @returns JSX element
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  children,
  className = "",
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  ...rest
}) => {
  // Component state and logic here

  return (
    <div
      className={className}
      data-variant={variant}
      data-size={size}
      aria-disabled={disabled || undefined}
      data-loading={loading || undefined}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};
};

// Default props if needed
ComponentName.defaultProps = {
  className: "",
};
