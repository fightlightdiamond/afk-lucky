import React from "react";

// Mock Radix UI Select components for testing
interface SelectProps {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  value?: string;
}

export const Select = ({ children, onValueChange, value }: SelectProps) => (
  <div data-testid="select-root" data-value={value}>
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, { onValueChange, value });
      }
      return child;
    })}
  </div>
);

interface SelectTriggerProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

export const SelectTrigger = ({ children, ...props }: SelectTriggerProps) => (
  <button
    {...props}
    data-testid="select-trigger"
    role="combobox"
    aria-expanded="false"
    aria-controls="select-content"
  >
    {children}
  </button>
);

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue = ({ placeholder }: SelectValueProps) => (
  <span data-testid="select-value">{placeholder}</span>
);

interface SelectContentProps {
  children: React.ReactNode;
}

export const SelectContent = ({ children }: SelectContentProps) => (
  <div data-testid="select-content" role="listbox">
    {children}
  </div>
);

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  [key: string]: unknown;
}

export const SelectItem = ({ children, value, ...props }: SelectItemProps) => (
  <div
    {...props}
    data-testid="select-item"
    data-value={value}
    role="option"
    aria-selected="false"
    onClick={() => {
      // Simulate selection
      const event = new CustomEvent("select", { detail: { value } });
      document.dispatchEvent(event);
    }}
  >
    {children}
  </div>
);
