import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive touch-manipulation select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-mobile border border-transparent hover:bg-primary/90 hover:shadow-touch active:bg-primary/95 active:shadow-touch-active active:scale-[0.98] sm:shadow-xs sm:hover:shadow-sm sm:active:scale-100",
        destructive:
          "bg-destructive text-white shadow-mobile border border-transparent hover:bg-destructive/90 hover:shadow-touch active:bg-destructive/95 active:shadow-touch-active active:scale-[0.98] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 sm:shadow-xs sm:hover:shadow-sm sm:active:scale-100",
        outline:
          "border border-input bg-background shadow-mobile hover:bg-accent hover:text-accent-foreground hover:border-accent hover:shadow-touch active:bg-accent/90 active:shadow-touch-active active:scale-[0.98] dark:bg-input/30 dark:border-input dark:hover:bg-input/50 sm:shadow-xs sm:hover:shadow-sm sm:active:scale-100",
        secondary:
          "bg-secondary text-secondary-foreground shadow-mobile border border-transparent hover:bg-secondary/80 hover:shadow-touch active:bg-secondary/90 active:shadow-touch-active active:scale-[0.98] sm:shadow-xs sm:hover:shadow-sm sm:active:scale-100",
        ghost:
          "border border-transparent hover:bg-accent hover:text-accent-foreground hover:shadow-touch active:bg-accent/90 active:shadow-touch-active active:scale-[0.98] dark:hover:bg-accent/50 sm:hover:shadow-none sm:active:scale-100",
        link: "text-primary underline-offset-4 border border-transparent hover:underline hover:text-primary/90 active:text-primary/80 active:scale-[0.98] sm:active:scale-100",
      },
      size: {
        default:
          "min-h-touch min-w-[80px] text-base px-4 py-2 gap-2 has-[>svg]:px-3 sm:h-9 sm:min-w-[64px] sm:text-sm sm:px-4 sm:py-2",
        sm: "min-h-[40px] min-w-[64px] text-sm px-3 py-2 gap-1.5 has-[>svg]:px-2.5 sm:h-8 sm:min-w-[48px] sm:text-xs sm:px-3 sm:py-1.5",
        lg: "min-h-[52px] min-w-[96px] text-lg px-6 py-3 gap-2.5 has-[>svg]:px-5 sm:h-10 sm:min-w-[80px] sm:text-base sm:px-6 sm:py-2.5",
        icon: "min-w-touch min-h-touch aspect-square p-0 flex-shrink-0 sm:size-9 sm:min-w-9 sm:min-h-9",
        "icon-sm":
          "min-w-[40px] min-h-[40px] aspect-square p-0 flex-shrink-0 sm:size-8 sm:min-w-8 sm:min-h-8",
        "icon-lg":
          "min-w-[52px] min-h-[52px] aspect-square p-0 flex-shrink-0 sm:size-10 sm:min-w-10 sm:min-h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // Determine if button should be disabled
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-loading={loading}
        data-full-width={fullWidth}
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && "w-full",
          loading && "cursor-wait",
          className
        )}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants, type ButtonProps };
