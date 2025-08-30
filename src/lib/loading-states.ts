/**
 * Loading state management utilities for async operations
 * Provides consistent loading indicators and state management
 */

import { useState, useCallback, useRef, useEffect } from "react";

// Loading state types
export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  data: any;
}

export interface AsyncOperationState<T = any> {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: T | null;
  progress?: number;
}

// Loading context for different operations
export type LoadingContext =
  | "users-fetch"
  | "user-create"
  | "user-update"
  | "user-delete"
  | "bulk-operation"
  | "export"
  | "import"
  | "role-assignment"
  | "status-toggle"
  | "search"
  | "filter"
  | "pagination";

// Global loading state manager
class LoadingStateManager {
  private loadingStates = new Map<string, boolean>();
  private listeners = new Set<(states: Map<string, boolean>) => void>();

  setLoading(context: LoadingContext, isLoading: boolean) {
    this.loadingStates.set(context, isLoading);
    this.notifyListeners();
  }

  isLoading(context: LoadingContext): boolean {
    return this.loadingStates.get(context) || false;
  }

  isAnyLoading(): boolean {
    return Array.from(this.loadingStates.values()).some(Boolean);
  }

  subscribe(listener: (states: Map<string, boolean>) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(new Map(this.loadingStates)));
  }

  clear() {
    this.loadingStates.clear();
    this.notifyListeners();
  }
}

export const loadingStateManager = new LoadingStateManager();

// Hook for managing async operation states
export function useAsyncOperation<T = any>(
  context: LoadingContext
): [
  AsyncOperationState<T>,
  {
    execute: (operation: () => Promise<T>) => Promise<T>;
    reset: () => void;
    setProgress: (progress: number) => void;
  }
] {
  const [state, setState] = useState<AsyncOperationState<T>>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: null,
    progress: 0,
  });

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
        progress: 0,
      }));

      loadingStateManager.setLoading(context, true);

      try {
        const result = await operation();

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isSuccess: true,
          isError: false,
          data: result,
          progress: 100,
        }));

        loadingStateManager.setLoading(context, false);
        return result;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: errorObj,
          progress: 0,
        }));

        loadingStateManager.setLoading(context, false);
        throw error;
      }
    },
    [context]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: null,
      progress: 0,
    });
    loadingStateManager.setLoading(context, false);
  }, [context]);

  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  return [state, { execute, reset, setProgress }];
}

// Hook for tracking multiple loading states
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(
    new Map()
  );

  useEffect(() => {
    return loadingStateManager.subscribe(setLoadingStates);
  }, []);

  return {
    loadingStates,
    isLoading: (context: LoadingContext) => loadingStates.get(context) || false,
    isAnyLoading: () => Array.from(loadingStates.values()).some(Boolean),
  };
}

// Hook for debounced loading states (useful for search)
export function useDebouncedLoading(delay: number = 300) {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setLoading = useCallback(
    (loading: boolean) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (loading) {
        setIsLoading(true);
      } else {
        timeoutRef.current = setTimeout(() => {
          setIsLoading(false);
        }, delay);
      }
    },
    [delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [isLoading, setLoading] as const;
}

// Progress tracking for long operations
export class ProgressTracker {
  private progress = 0;
  private total = 0;
  private listeners = new Set<(progress: number, total: number) => void>();

  constructor(total: number = 100) {
    this.total = total;
  }

  setTotal(total: number) {
    this.total = total;
    this.notifyListeners();
  }

  increment(amount: number = 1) {
    this.progress = Math.min(this.total, this.progress + amount);
    this.notifyListeners();
  }

  setProgress(progress: number) {
    this.progress = Math.max(0, Math.min(this.total, progress));
    this.notifyListeners();
  }

  getProgress(): number {
    return this.progress;
  }

  getPercentage(): number {
    return this.total > 0 ? Math.round((this.progress / this.total) * 100) : 0;
  }

  isComplete(): boolean {
    return this.progress >= this.total;
  }

  reset() {
    this.progress = 0;
    this.notifyListeners();
  }

  subscribe(listener: (progress: number, total: number) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.progress, this.total));
  }
}

// Hook for progress tracking
export function useProgressTracker(total: number = 100) {
  const [tracker] = useState(() => new ProgressTracker(total));
  const [progress, setProgress] = useState(0);
  const [totalValue, setTotalValue] = useState(total);

  useEffect(() => {
    return tracker.subscribe((prog, tot) => {
      setProgress(prog);
      setTotalValue(tot);
    });
  }, [tracker]);

  return {
    progress,
    total: totalValue,
    percentage: tracker.getPercentage(),
    isComplete: tracker.isComplete(),
    increment: tracker.increment.bind(tracker),
    setProgress: tracker.setProgress.bind(tracker),
    setTotal: tracker.setTotal.bind(tracker),
    reset: tracker.reset.bind(tracker),
  };
}

// Loading state utilities for common operations
export const LoadingUtils = {
  // Create a loading wrapper for async functions
  withLoading: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: LoadingContext
  ) => {
    return async (...args: T): Promise<R> => {
      loadingStateManager.setLoading(context, true);
      try {
        const result = await fn(...args);
        return result;
      } finally {
        loadingStateManager.setLoading(context, false);
      }
    };
  },

  // Create a timeout wrapper for operations
  withTimeout: <T>(
    promise: Promise<T>,
    timeoutMs: number = 30000,
    timeoutMessage: string = "Operation timed out"
  ): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      }),
    ]);
  },

  // Batch operations with progress tracking
  batchWithProgress: async <T, R>(
    items: T[],
    operation: (item: T, index: number) => Promise<R>,
    onProgress?: (completed: number, total: number) => void,
    batchSize: number = 5
  ): Promise<R[]> => {
    const results: R[] = [];
    const total = items.length;
    let completed = 0;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map((item, batchIndex) =>
        operation(item, i + batchIndex)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, batchIndex) => {
        if (result.status === "fulfilled") {
          results[i + batchIndex] = result.value;
        } else {
          // Handle individual failures
          console.error(
            `Operation failed for item ${i + batchIndex}:`,
            result.reason
          );
        }

        completed++;
        onProgress?.(completed, total);
      });
    }

    return results;
  },
};

// Loading state constants
export const LOADING_MESSAGES = {
  LOADING_USERS: "Loading users...",
  CREATING_USER: "Creating user...",
  UPDATING_USER: "Updating user...",
  DELETING_USER: "Deleting user...",
  BULK_OPERATION: "Processing bulk operation...",
  EXPORTING_DATA: "Exporting data...",
  IMPORTING_DATA: "Importing data...",
  SEARCHING: "Searching...",
  FILTERING: "Applying filters...",
  SAVING_CHANGES: "Saving changes...",
} as const;

// Minimum loading time to prevent flashing
export const MIN_LOADING_TIME = 300; // ms

// Helper to ensure minimum loading time
export function withMinimumLoadingTime<T>(
  promise: Promise<T>,
  minTime: number = MIN_LOADING_TIME
): Promise<T> {
  const startTime = Date.now();

  return promise.then(async (result) => {
    const elapsed = Date.now() - startTime;
    if (elapsed < minTime) {
      await new Promise((resolve) => setTimeout(resolve, minTime - elapsed));
    }
    return result;
  });
}
