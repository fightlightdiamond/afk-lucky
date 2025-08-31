import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronUp, ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

const topButtonVariants = cva(
  "fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-[38px] w-[38px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface TopButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof topButtonVariants> {
  /**
   * Custom icon to display in the button
   */
  icon?: React.ReactNode;
  /**
   * Icon to display on hover state
   */
  hoverIcon?: React.ReactNode;
  /**
   * Whether the button is in hover state
   */
  isHovered?: boolean;
}

const TopButton = React.forwardRef<HTMLButtonElement, TopButtonProps>(
  ({ className, size, icon, hoverIcon, isHovered, ...props }, ref) => {
    const [internalHover, setInternalHover] = React.useState(false);

    // Use external hover state if provided, otherwise use internal state
    const showHoverState = isHovered !== undefined ? isHovered : internalHover;

    // Default icons
    const defaultIcon = icon || <ChevronUp className="h-6 w-6" />;
    const defaultHoverIcon = hoverIcon || <ArrowUp className="h-6 w-6" />;

    return (
      <button
        className={cn(
          topButtonVariants({ size, className }),
          "bg-foreground text-background hover:bg-foreground/90"
        )}
        ref={ref}
        onMouseEnter={() => setInternalHover(true)}
        onMouseLeave={() => setInternalHover(false)}
        {...props}
      >
        <span className="transition-all duration-200 ease-in-out">
          {showHoverState ? defaultHoverIcon : defaultIcon}
        </span>
      </button>
    );
  }
);
TopButton.displayName = "TopButton";

export { TopButton, topButtonVariants };
export type { TopButtonProps };
