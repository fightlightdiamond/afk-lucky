import { useCallback, useRef, useMemo, useState } from "react";

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(key: string): () => number {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(key, duration);
      return duration;
    };
  }

  recordMetric(key: string, value: number): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const values = this.metrics.get(key)!;
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(key: string): {
    average: number;
    min: number;
    max: number;
    count: number;
  } | null {
    const values = this.metrics.get(key);
    if (!values || values.length === 0) return null;

    return {
      average: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  }

  logSlowOperations(threshold: number = 100): void {
    this.metrics.forEach((values, key) => {
      const recent = values.slice(-10); // Last 10 measurements
      const average = recent.reduce((sum, val) => sum + val, 0) / recent.length;

      if (average > threshold) {
        console.warn(
          `Slow operation detected: ${key} - Average: ${average.toFixed(2)}ms`
        );
      }
    });
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();

  const startTimer = useCallback(
    (key: string) => monitor.startTimer(key),
    [monitor]
  );

  const recordMetric = useCallback(
    (key: string, value: number) => monitor.recordMetric(key, value),
    [monitor]
  );

  const getMetrics = useCallback(
    (key: string) => monitor.getMetrics(key),
    [monitor]
  );

  return { startTimer, recordMetric, getMetrics };
}

// Debounce utility with performance tracking
export function createOptimizedDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
    trackPerformance?: boolean;
    performanceKey?: string;
  } = {}
): T & { cancel: () => void; flush: () => void } {
  const {
    leading = false,
    trailing = true,
    maxWait,
    trackPerformance = false,
    performanceKey = "debounced-function",
  } = options;

  let timeoutId: NodeJS.Timeout | null = null;
  let maxTimeoutId: NodeJS.Timeout | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let result: ReturnType<T>;

  const monitor = trackPerformance ? PerformanceMonitor.getInstance() : null;

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs!;
    lastArgs = null;
    lastInvokeTime = time;

    if (monitor) {
      const endTimer = monitor.startTimer(performanceKey);
      result = func.apply(null, args);
      endTimer();
    } else {
      result = func.apply(null, args);
    }

    return result;
  }

  function leadingEdge(time: number): ReturnType<T> {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, delay);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - lastCallTime!;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - lastCallTime!;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === null ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired(): ReturnType<T> | void {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time: number): ReturnType<T> {
    timeoutId = null;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    return result;
  }

  function cancel(): void {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId);
    }
    lastInvokeTime = 0;
    lastArgs = null;
    lastCallTime = null;
    timeoutId = null;
    maxTimeoutId = null;
  }

  function flush(): ReturnType<T> {
    return timeoutId === null ? result : trailingEdge(Date.now());
  }

  function debounced(...args: Parameters<T>): ReturnType<T> {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, delay);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, delay);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced as T & { cancel: () => void; flush: () => void };
}

// Throttle utility with performance tracking
export function createOptimizedThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    trackPerformance?: boolean;
    performanceKey?: string;
  } = {}
): T & { cancel: () => void; flush: () => void } {
  return createOptimizedDebounce(func, delay, {
    ...options,
    maxWait: delay,
  });
}

// Memoization with performance tracking
export function createPerformanceMemo<T extends (...args: any[]) => any>(
  func: T,
  options: {
    maxSize?: number;
    trackPerformance?: boolean;
    performanceKey?: string;
  } = {}
): T {
  const {
    maxSize = 100,
    trackPerformance = false,
    performanceKey = "memoized-function",
  } = options;

  const cache = new Map<string, ReturnType<T>>();
  const monitor = trackPerformance ? PerformanceMonitor.getInstance() : null;

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      if (monitor) {
        monitor.recordMetric(`${performanceKey}-cache-hit`, 0);
      }
      return cache.get(key)!;
    }

    if (monitor) {
      const endTimer = monitor.startTimer(`${performanceKey}-cache-miss`);
      const result = func(...args);
      endTimer();

      cache.set(key, result);

      // Limit cache size
      if (cache.size > maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }

      return result;
    } else {
      const result = func(...args);
      cache.set(key, result);

      if (cache.size > maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }

      return result;
    }
  }) as T;
}

// React hook for optimized callbacks
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: {
    debounce?: number;
    throttle?: number;
    trackPerformance?: boolean;
    performanceKey?: string;
  } = {}
): T {
  const {
    debounce,
    throttle,
    trackPerformance = false,
    performanceKey = "callback",
  } = options;

  const memoizedCallback = useCallback(callback, deps);

  const optimizedCallback = useMemo(() => {
    if (debounce) {
      return createOptimizedDebounce(memoizedCallback, debounce, {
        trackPerformance,
        performanceKey: `${performanceKey}-debounced`,
      });
    }

    if (throttle) {
      return createOptimizedThrottle(memoizedCallback, throttle, {
        trackPerformance,
        performanceKey: `${performanceKey}-throttled`,
      });
    }

    return memoizedCallback;
  }, [memoizedCallback, debounce, throttle, trackPerformance, performanceKey]);

  return optimizedCallback;
}

// React hook for optimized memoization
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    trackPerformance?: boolean;
    performanceKey?: string;
  } = {}
): T {
  const { trackPerformance = false, performanceKey = "memo" } = options;
  const monitor = trackPerformance ? PerformanceMonitor.getInstance() : null;

  return useMemo(() => {
    if (monitor) {
      const endTimer = monitor.startTimer(performanceKey);
      const result = factory();
      endTimer();
      return result;
    }
    return factory();
  }, deps);
}

// Intersection Observer hook for virtual scrolling optimization
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): {
  ref: (node: Element | null) => void;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
} {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: Element | null) => {
      if (observer.current) {
        observer.current.disconnect();
      }

      if (node) {
        observer.current = new IntersectionObserver(([entry]) => {
          setIsIntersecting(entry.isIntersecting);
          setEntry(entry);
        }, options);
        observer.current.observe(node);
      }
    },
    [options]
  );

  return { ref, isIntersecting, entry };
}
