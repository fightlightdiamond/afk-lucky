import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronUp, ArrowUp } from "lucide-react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const topButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation select-none",
  {
    variants: {
      size: {
        sm: "h-8 w-8 min-h-8 min-w-8",
        md: "h-10 w-10 min-h-10 min-w-10",
        lg: "h-12 w-12 min-h-12 min-w-12",
      },
      tone: {
        solid: "bg-foreground text-background hover:bg-foreground/90 shadow-lg",
        soft: "bg-background/80 text-foreground hover:bg-background/90 backdrop-blur-sm border shadow-md",
        outline:
          "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground border-2 shadow-sm",
      },
      anchor: {
        br: "bottom-6 right-6",
        bl: "bottom-6 left-6",
        tr: "top-6 right-6",
        tl: "top-6 left-6",
      },
    },
    defaultVariants: {
      size: "md",
      tone: "solid",
      anchor: "br",
    },
  }
);

// Advanced threshold system types
type PxString = `${number}px`;
type VhString = `${number}vh`;
type PercentString = `${number}%`;
type ThresholdScalar = number | PxString | VhString | PercentString;

type ThresholdFromEdge = {
  from?: "top" | "bottom";
  px?: number;
  vh?: number;
  percent?: number;
};

type ThresholdElement = {
  element: Element | string | (() => Element | null);
  when?: "enter" | "leave" | "center" | "visible" | "hidden";
  offset?: ThresholdScalar;
};

type ThresholdMultiple = {
  conditions: Threshold[];
  operator?: "and" | "or";
};

type ThresholdTime = {
  after?: number; // milliseconds
  before?: number; // milliseconds
  condition?: Threshold;
};

type VisibilityContext = {
  container: Element | Window;
  scrollTop: number;
  lastScrollTop: number;
  direction: "up" | "down" | "none";
  scrollHeight: number; // total content height
  clientHeight: number; // viewport height
  scrollRange: number; // scrollHeight - clientHeight
};

type Threshold =
  | ThresholdScalar
  | ThresholdFromEdge
  | ThresholdElement
  | ThresholdMultiple
  | ThresholdTime
  | ((ctx: VisibilityContext) => boolean);

// Component props
type Anchor = "br" | "bl" | "tr" | "tl";
type Size = "sm" | "md" | "lg";
type Tone = "solid" | "soft" | "outline";

export interface TopButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof topButtonVariants> {
  // Icons
  icon?: React.ReactNode;
  hoverIcon?: React.ReactNode;
  isHovered?: boolean;

  // Behavior
  visible?: boolean;
  auto?: boolean;
  threshold?: Threshold;
  showOnScrollUp?: boolean;
  debounceMs?: number;
  scrollContainer?: Element | Window | (() => Element | Window | null);

  // Layout
  anchor?: Anchor;
  offset?: number | { x: number; y: number };
  zIndex?: number;

  // Appearance
  size?: Size;
  tone?: Tone;
  iconClassName?: string;

  // Portal & Scroll behavior
  portal?: boolean;
  portalContainer?: Element | (() => Element | null);
  scrollTarget?: number | string | Element | (() => Element | null);
  scrollBehavior?: ScrollBehavior;
}

// Utility functions
const parseThresholdScalar = (
  value: ThresholdScalar,
  context: VisibilityContext
): number => {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    if (value.endsWith("px")) {
      return parseInt(value);
    } else if (value.endsWith("vh")) {
      return (parseInt(value) / 100) * context.clientHeight;
    } else if (value.endsWith("%")) {
      return (parseInt(value) / 100) * context.scrollRange;
    }
  }

  return 0;
};

const evaluateThreshold = (
  threshold: Threshold,
  context: VisibilityContext,
  startTime?: number
): boolean => {
  if (typeof threshold === "function") {
    return threshold(context);
  }

  if (typeof threshold === "number" || typeof threshold === "string") {
    const pixels = parseThresholdScalar(threshold, context);
    return context.scrollTop >= pixels;
  }

  if ("from" in threshold) {
    const { from = "top", px = 0, vh = 0, percent = 0 } = threshold;
    let pixels = px;

    if (vh > 0) pixels += (vh / 100) * context.clientHeight;
    if (percent > 0) pixels += (percent / 100) * context.scrollRange;

    if (from === "bottom") {
      return context.scrollTop >= context.scrollRange - pixels;
    }
    return context.scrollTop >= pixels;
  }

  if ("element" in threshold) {
    const { element, when = "enter", offset = 0 } = threshold;
    let targetElement: Element | null = null;

    if (typeof element === "string") {
      targetElement = document.querySelector(element);
    } else if (typeof element === "function") {
      targetElement = element();
    } else {
      targetElement = element;
    }

    if (!targetElement) return false;

    const rect = targetElement.getBoundingClientRect();
    const offsetPixels = parseThresholdScalar(offset, context);

    switch (when) {
      case "enter":
        return rect.top <= context.clientHeight + offsetPixels;
      case "leave":
        return rect.bottom <= offsetPixels;
      case "center":
        return (
          rect.top <= context.clientHeight / 2 + offsetPixels &&
          rect.bottom >= context.clientHeight / 2 - offsetPixels
        );
      case "visible":
        return (
          rect.bottom > offsetPixels &&
          rect.top < context.clientHeight - offsetPixels
        );
      case "hidden":
        return (
          rect.bottom <= offsetPixels ||
          rect.top >= context.clientHeight - offsetPixels
        );
      default:
        return false;
    }
  }

  if ("conditions" in threshold) {
    const { conditions, operator = "and" } = threshold;
    const results = conditions.map((condition) =>
      evaluateThreshold(condition, context, startTime)
    );

    return operator === "and" ? results.every(Boolean) : results.some(Boolean);
  }

  if (
    "after" in threshold ||
    "before" in threshold ||
    "condition" in threshold
  ) {
    const currentTime = Date.now();
    const { after, before, condition } = threshold;

    if (startTime) {
      const elapsed = currentTime - startTime;

      if (after && elapsed < after) return false;
      if (before && elapsed > before) return false;
    }

    if (condition) {
      return evaluateThreshold(condition, context, startTime);
    }

    return true;
  }

  return false;
};

const useScrollVisibility = (
  threshold: Threshold | undefined,
  auto: boolean,
  showOnScrollUp: boolean,
  debounceMs: number,
  scrollContainer?: Element | Window | (() => Element | Window | null)
) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [scrollDirection, setScrollDirection] = React.useState<
    "up" | "down" | "none"
  >("none");
  const lastScrollTop = React.useRef<number>(0);
  const debounceTimer = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const startTime = React.useRef<number>(Date.now());

  React.useEffect(() => {
    if (!auto) return;

    const getContainer = (): Element | Window => {
      if (!scrollContainer) return window;
      if (typeof scrollContainer === "function")
        return scrollContainer() || window;
      return scrollContainer;
    };

    const handleScroll = () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        const container = getContainer();
        const isWindow = container === window;

        const scrollTop = isWindow
          ? window.scrollY || document.documentElement.scrollTop
          : (container as Element).scrollTop;

        const scrollHeight = isWindow
          ? document.documentElement.scrollHeight
          : (container as Element).scrollHeight;

        const clientHeight = isWindow
          ? window.innerHeight
          : (container as Element).clientHeight;

        const direction =
          scrollTop > lastScrollTop.current
            ? "down"
            : scrollTop < lastScrollTop.current
            ? "up"
            : "none";

        setScrollDirection(direction);

        const context: VisibilityContext = {
          container,
          scrollTop,
          lastScrollTop: lastScrollTop.current,
          direction,
          scrollHeight,
          clientHeight,
          scrollRange: scrollHeight - clientHeight,
        };

        let shouldShow = false;

        if (threshold) {
          shouldShow = evaluateThreshold(threshold, context, startTime.current);
        } else {
          // Default behavior: show after scrolling 300px
          shouldShow = scrollTop > 300;
        }

        // Apply scroll direction filter
        if (
          showOnScrollUp &&
          direction !== "up" &&
          scrollTop > lastScrollTop.current
        ) {
          shouldShow = false;
        }

        setIsVisible(shouldShow);
        lastScrollTop.current = scrollTop;
      }, debounceMs);
    };

    const container = getContainer();
    container.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [threshold, auto, showOnScrollUp, debounceMs, scrollContainer]);

  return { isVisible, scrollDirection };
};

const TopButton = React.forwardRef<HTMLButtonElement, TopButtonProps>(
  (
    {
      className,
      size = "md",
      tone = "solid",
      anchor = "br",
      icon,
      hoverIcon,
      isHovered,
      visible,
      auto = false,
      threshold,
      showOnScrollUp = false,
      debounceMs = 100,
      scrollContainer,
      offset,
      zIndex = 50,
      iconClassName,
      portal = true,
      portalContainer,
      scrollTarget,
      scrollBehavior = "smooth",
      onClick,
      ...props
    },
    ref
  ) => {
    const [internalHover, setInternalHover] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    // Use external hover state if provided, otherwise use internal state
    const showHoverState = isHovered !== undefined ? isHovered : internalHover;

    // Handle scroll visibility
    const { isVisible: autoVisible } = useScrollVisibility(
      threshold,
      auto,
      showOnScrollUp,
      debounceMs,
      scrollContainer
    );

    // Determine final visibility
    const shouldShow =
      visible !== undefined ? visible : auto ? autoVisible : true;

    // Handle mounting for portal
    React.useEffect(() => {
      setMounted(true);
    }, []);

    // Default icons based on size
    const getDefaultIcons = () => {
      const iconSize =
        size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
      return {
        default: icon || <ChevronUp className={iconSize} />,
        hover: hoverIcon || <ArrowUp className={iconSize} />,
      };
    };

    const { default: defaultIcon, hover: defaultHoverIcon } = getDefaultIcons();

    // Handle scroll to target
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(event);
        return;
      }

      // Default scroll behavior
      let target: Element | number = 0;

      if (scrollTarget) {
        if (typeof scrollTarget === "number") {
          target = scrollTarget;
        } else if (typeof scrollTarget === "string") {
          const element = document.querySelector(scrollTarget);
          if (element) target = element;
        } else if (typeof scrollTarget === "function") {
          const element = scrollTarget();
          if (element) target = element;
        } else {
          target = scrollTarget;
        }
      }

      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: scrollBehavior });
      } else {
        target.scrollIntoView({ behavior: scrollBehavior });
      }
    };

    // Calculate position styles
    const getPositionStyles = (): React.CSSProperties => {
      const styles: React.CSSProperties = {
        position: "fixed",
        zIndex,
      };

      if (offset) {
        if (typeof offset === "number") {
          // Apply offset to the anchor position
          switch (anchor) {
            case "br":
              styles.bottom = `${24 + offset}px`;
              styles.right = `${24 + offset}px`;
              break;
            case "bl":
              styles.bottom = `${24 + offset}px`;
              styles.left = `${24 + offset}px`;
              break;
            case "tr":
              styles.top = `${24 + offset}px`;
              styles.right = `${24 + offset}px`;
              break;
            case "tl":
              styles.top = `${24 + offset}px`;
              styles.left = `${24 + offset}px`;
              break;
          }
        } else {
          // Custom x, y offset
          switch (anchor) {
            case "br":
              styles.bottom = `${24 + offset.y}px`;
              styles.right = `${24 + offset.x}px`;
              break;
            case "bl":
              styles.bottom = `${24 + offset.y}px`;
              styles.left = `${24 + offset.x}px`;
              break;
            case "tr":
              styles.top = `${24 + offset.y}px`;
              styles.right = `${24 + offset.x}px`;
              break;
            case "tl":
              styles.top = `${24 + offset.y}px`;
              styles.left = `${24 + offset.x}px`;
              break;
          }
        }
      }

      return styles;
    };

    const buttonElement = (
      <button
        className={cn(
          topButtonVariants({
            size,
            tone,
            anchor: offset ? undefined : anchor,
          }),
          shouldShow
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
          className
        )}
        style={offset ? getPositionStyles() : undefined}
        ref={ref}
        onMouseEnter={() => setInternalHover(true)}
        onMouseLeave={() => setInternalHover(false)}
        onClick={handleClick}
        {...props}
      >
        <span
          className={cn(
            "transition-all duration-200 ease-in-out",
            iconClassName
          )}
        >
          {showHoverState ? defaultHoverIcon : defaultIcon}
        </span>
      </button>
    );

    // Handle portal rendering
    if (portal && mounted) {
      const container = portalContainer
        ? typeof portalContainer === "function"
          ? portalContainer()
          : portalContainer
        : document.body;

      if (container) {
        return createPortal(buttonElement, container);
      }
    }

    return buttonElement;
  }
);

TopButton.displayName = "TopButton";

export { TopButton, topButtonVariants };
export type {
  Threshold,
  ThresholdScalar,
  ThresholdFromEdge,
  ThresholdElement,
  ThresholdMultiple,
  ThresholdTime,
  VisibilityContext,
  Anchor,
  Size,
  Tone,
};
