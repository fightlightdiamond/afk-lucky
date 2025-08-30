import React from "react";

// Mock Radix UI Select components for testing
export const Select = ({ children, onValueChange, value }: any) => (
  <div data-testid="select-root" data-value={value}>
    {React.Children.map(children, (child) =>
      React.cloneElement(child, { onValueChange, value })
    )}
  </div>
);

export const SelectTrigger = ({ children, ...props }: any) => (
  <button
    {...props}
    data-testid="select-trigger"
    role="combobox"
    aria-expanded="false"
  >
    {children}
  </button>
);

export const SelectValue = ({ placeholder }: any) => (
  <span data-testid="select-value">{placeholder}</span>
);

export const SelectContent = ({ children }: any) => (
  <div data-testid="select-content" role="listbox">
    {children}
  </div>
);

export const SelectItem = ({ children, value, ...props }: any) => (
  <div
    {...props}
    data-testid="select-item"
    data-value={value}
    role="option"
    onClick={() => {
      // Simulate selection
      const event = new CustomEvent("select", { detail: { value } });
      document.dispatchEvent(event);
    }}
  >
    {children}
  </div>
);
