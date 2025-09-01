import { render, screen, fireEvent } from "@testing-library/react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Heart } from "lucide-react";

describe("Button Component", () => {
  // Basic rendering tests
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("min-h-touch"); // Mobile-first touch target
    });

    it("renders with custom className", () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("renders as child element when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole("link", { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
    });
  });

  // Variant tests
  describe("Variants", () => {
    const variants: Array<ButtonProps["variant"]> = [
      "default",
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link",
    ];

    variants.forEach((variant) => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Button variant={variant}>Button</Button>);
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
      });
    });
  });

  // Size tests
  describe("Sizes", () => {
    const sizes: Array<ButtonProps["size"]> = [
      "default",
      "sm",
      "lg",
      "icon",
      "icon-sm",
      "icon-lg",
    ];

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        render(
          <Button size={size}>
            {size?.includes("icon") ? <Heart className="h-4 w-4" /> : "Button"}
          </Button>
        );
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();

        // Check for mobile-first touch targets
        if (size === "sm") {
          expect(button).toHaveClass("min-h-[40px]");
        } else if (size === "lg") {
          expect(button).toHaveClass("min-h-[52px]");
        } else if (size?.includes("icon")) {
          expect(button).toHaveClass("aspect-square");
        } else {
          expect(button).toHaveClass("min-h-touch");
        }
      });
    });
  });

  // Mobile-first features
  describe("Mobile-First Features", () => {
    it("applies touch-manipulation class for better touch response", () => {
      render(<Button>Touch Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("touch-manipulation");
    });

    it("applies select-none to prevent text selection", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("select-none");
    });

    it("has minimum touch target height", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("min-h-touch");
    });

    it("renders full width when fullWidth prop is true", () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("w-full");
    });
  });

  // Loading state tests
  describe("Loading State", () => {
    it("shows loading spinner when loading is true", () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      const spinner = button.querySelector("svg");

      expect(button).toHaveAttribute("data-loading", "true");
      expect(button).toHaveClass("cursor-wait");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass("animate-spin");
    });

    it("is disabled when loading", () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("combines loading with disabled state", () => {
      render(
        <Button loading disabled>
          Loading
        </Button>
      );
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });

  // Interaction tests
  describe("Interactions", () => {
    it("calls onClick when clicked", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("does not call onClick when loading", () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} loading>
          Loading
        </Button>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("handles keyboard events", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole("button");
      fireEvent.keyDown(button, { key: "Enter" });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  // Accessibility tests
  describe("Accessibility", () => {
    it("has proper ARIA attributes when disabled", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("has proper ARIA attributes when loading", () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("maintains focus management", () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });

    it("has proper focus-visible styles", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus-visible:ring-[3px]");
    });
  });

  // Icon support tests
  describe("Icon Support", () => {
    it("renders with icon", () => {
      render(
        <Button>
          <Heart className="h-4 w-4" />
          With Icon
        </Button>
      );
      const button = screen.getByRole("button");
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("renders icon-only button", () => {
      render(
        <Button size="icon" aria-label="Like">
          <Heart className="h-4 w-4" />
        </Button>
      );
      const button = screen.getByRole("button", { name: /like/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("aspect-square");
    });
  });

  // Responsive behavior tests
  describe("Responsive Behavior", () => {
    it("has mobile-first classes", () => {
      render(<Button>Responsive</Button>);
      const button = screen.getByRole("button");

      // Mobile-first base classes
      expect(button).toHaveClass("text-base");
      expect(button).toHaveClass("min-h-touch");

      // Desktop enhancement classes
      expect(button).toHaveClass("sm:text-sm");
      expect(button).toHaveClass("sm:h-9");
    });

    it("applies mobile shadows that enhance on desktop", () => {
      render(<Button>Shadow Test</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("shadow-mobile");
      expect(button).toHaveClass("sm:shadow-xs");
    });
  });

  // Data attributes tests
  describe("Data Attributes", () => {
    it("has data-slot attribute", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-slot", "button");
    });

    it("has data-loading attribute when loading", () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-loading", "true");
    });

    it("has data-full-width attribute when fullWidth", () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-full-width", "true");
    });
  });
});
