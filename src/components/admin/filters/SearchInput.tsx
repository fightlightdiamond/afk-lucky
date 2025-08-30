"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
}

export const SearchInput = React.memo<SearchInputProps>(
  ({
    value,
    onChange,
    placeholder = "Search users by name, email...",
    debounceMs = 500,
    disabled = false,
    className = "",
    onFocus,
    onBlur,
    autoFocus = false,
  }) => {
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    // Use the existing debounce hook for better performance
    const debouncedValue = useDebounce(localValue, debounceMs);

    // Update local value when prop changes (external updates)
    useEffect(() => {
      if (value !== localValue) {
        setLocalValue(value);
      }
    }, [localValue, value]);

    // Call onChange when debounced value changes
    useEffect(() => {
      if (debouncedValue !== value) {
        onChange(debouncedValue);
      }
    }, [debouncedValue, value, onChange]);

    // Memoized handlers to prevent unnecessary re-renders
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
      },
      []
    );

    const handleClear = useCallback(() => {
      setLocalValue("");
      onChange("");
      // Focus back to input after clearing
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [onChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Clear on Escape key
        if (e.key === "Escape" && localValue) {
          e.preventDefault();
          handleClear();
        }
      },
      [localValue, handleClear]
    );

    // Memoized clear button to prevent unnecessary re-renders
    const clearButton = useMemo(() => {
      if (!localValue || disabled) return null;

      return (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
          disabled={disabled}
          aria-label="Clear search"
          tabIndex={-1} // Prevent tab focus, use click or keyboard shortcut instead
        >
          <X className="w-4 h-4" />
        </button>
      );
    }, [localValue, disabled, handleClear]);

    return (
      <div className={`relative ${className}`}>
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className="pl-10 pr-10"
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label="Search users"
          aria-describedby="search-help"
        />
        <div id="search-help" className="sr-only">
          Search through users by name, email, or other information. Press
          Escape to clear.
        </div>
        {clearButton}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
