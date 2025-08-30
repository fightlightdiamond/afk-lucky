"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onScroll,
  getItemKey = (_, index) => index,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscan
    );
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      key: getItemKey(item, startIndex + index),
    }));
  }, [items, visibleRange, getItemKey]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll]
  );

  // Scroll to specific index
  const scrollToIndex = useCallback(
    (index: number, align: "start" | "center" | "end" = "start") => {
      if (!scrollElementRef.current) return;

      let scrollTop: number;
      switch (align) {
        case "center":
          scrollTop = index * itemHeight - containerHeight / 2 + itemHeight / 2;
          break;
        case "end":
          scrollTop = index * itemHeight - containerHeight + itemHeight;
          break;
        default:
          scrollTop = index * itemHeight;
      }

      scrollElementRef.current.scrollTop = Math.max(0, scrollTop);
    },
    [itemHeight, containerHeight]
  );

  // Expose scroll methods via ref
  React.useImperativeHandle(
    scrollElementRef,
    () => ({
      scrollToIndex,
      scrollToTop: () => scrollElementRef.current?.scrollTo({ top: 0 }),
      scrollToBottom: () =>
        scrollElementRef.current?.scrollTo({ top: totalHeight }),
    }),
    [scrollToIndex, totalHeight]
  );

  return (
    <div
      ref={scrollElementRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      role="grid"
      aria-rowcount={items.length}
      aria-label="Virtual scrolling list"
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            transform: `translateY(${visibleRange.startIndex * itemHeight}px)`,
          }}
        >
          {visibleItems.map(({ item, index, key }) => (
            <div
              key={key}
              style={{ height: itemHeight }}
              role="gridcell"
              aria-rowindex={index + 1}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for virtual scrolling with dynamic item heights
export function useVirtualScroll<T>({
  items,
  estimatedItemHeight = 50,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  estimatedItemHeight?: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(
    new Map()
  );
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate total height based on measured heights
  const totalHeight = useMemo(() => {
    let height = 0;
    for (let i = 0; i < items.length; i++) {
      height += itemHeights.get(i) || estimatedItemHeight;
    }
    return height;
  }, [items.length, itemHeights, estimatedItemHeight]);

  // Calculate visible range with dynamic heights
  const visibleRange = useMemo(() => {
    let currentHeight = 0;
    let startIndex = 0;
    let endIndex = items.length - 1;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const itemHeight = itemHeights.get(i) || estimatedItemHeight;
      if (currentHeight + itemHeight > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      currentHeight += itemHeight;
    }

    // Find end index
    currentHeight = 0;
    for (let i = 0; i < items.length; i++) {
      const itemHeight = itemHeights.get(i) || estimatedItemHeight;
      currentHeight += itemHeight;
      if (currentHeight > scrollTop + containerHeight) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    return { startIndex, endIndex };
  }, [
    scrollTop,
    containerHeight,
    items.length,
    itemHeights,
    estimatedItemHeight,
    overscan,
  ]);

  const measureItem = useCallback((index: number, height: number) => {
    setItemHeights((prev) => {
      const newMap = new Map(prev);
      newMap.set(index, height);
      return newMap;
    });
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    scrollTop,
    totalHeight,
    visibleRange,
    measureItem,
    handleScroll,
    scrollElementRef,
  };
}

// Virtualized table component specifically for user tables
interface VirtualizedTableProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderHeader: () => ReactNode;
  renderRow: (item: T, index: number) => ReactNode;
  className?: string;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualizedTable<T>({
  items,
  itemHeight,
  containerHeight,
  renderHeader,
  renderRow,
  className,
  getItemKey = (_, index) => index,
}: VirtualizedTableProps<T>) {
  return (
    <div className={cn("border rounded-md", className)}>
      {/* Fixed header */}
      <div className="border-b bg-muted/50">{renderHeader()}</div>

      {/* Virtualized body */}
      <VirtualScroll
        items={items}
        itemHeight={itemHeight}
        containerHeight={containerHeight - 40} // Account for header height
        renderItem={renderRow}
        getItemKey={getItemKey}
        className="border-0"
      />
    </div>
  );
}
