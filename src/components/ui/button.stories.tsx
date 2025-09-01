import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";
import {
  Heart,
  Download,
  Settings,
  Plus,
  ArrowRight,
  Loader2,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";

/**
 * Mobile-First Button Stories showcasing touch-optimized interactions
 */

const meta: Meta<typeof Button> = {
  title: "UI Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A mobile-first button component optimized for touch interactions with responsive design.

## Mobile-First Features
- **Touch Targets**: Minimum 44px touch targets for accessibility (WCAG compliance)
- **Responsive Sizing**: Mobile-first sizing that adapts to desktop
- **Touch Feedback**: Enhanced active states and touch-friendly animations
- **Progressive Enhancement**: Mobile styles as base, desktop enhancements via breakpoints
- **Loading States**: Built-in loading spinner and disabled states
- **Full Width**: Optional full-width mode for mobile layouts

## Variants & Sizes
- **Variants**: Default, destructive, outline, secondary, ghost, link
- **Sizes**: Default, small, large, icon (with sm/lg variants)
- **Touch Optimization**: All sizes meet minimum touch target requirements

## Usage
\`\`\`tsx
import { Button } from '@/components/ui/button'

// Mobile-optimized button
<Button>Touch-Friendly Button</Button>

// With loading state
<Button loading>Processing...</Button>

// Full width for mobile
<Button fullWidth>Full Width Button</Button>

// Icon variants with proper touch targets
<Button size="icon">
  <Heart className="h-4 w-4" />
</Button>
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      description: "Visual style variant of the button",
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"],
      description: "Size variant with mobile-first touch targets",
    },
    loading: {
      control: { type: "boolean" },
      description: "Shows loading spinner and disables interaction",
    },
    fullWidth: {
      control: { type: "boolean" },
      description: "Makes button full width (useful for mobile)",
    },
    asChild: {
      control: { type: "boolean" },
      description: "Renders as child element instead of button",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the button",
    },
  },
  args: {
    onClick: () => console.log("Button clicked"),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
};

// Size Variants
export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  },
};

export const Icon: Story = {
  args: {
    size: "icon",
    children: <Heart className="h-4 w-4" />,
  },
};

// Mobile-First Features
export const TouchTargets: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        All buttons meet 44px minimum touch target (WCAG compliance)
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button size="sm">Small (40px min)</Button>
        <Button size="default">Default (44px min)</Button>
        <Button size="lg">Large (52px min)</Button>
      </div>
      <div className="flex gap-3">
        <Button size="icon-sm">
          <Smartphone className="h-4 w-4" />
        </Button>
        <Button size="icon">
          <Tablet className="h-4 w-4" />
        </Button>
        <Button size="icon-lg">
          <Monitor className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Touch-friendly buttons with minimum 44px touch targets for accessibility.",
      },
    },
  },
};

export const LoadingStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Button loading>Loading...</Button>
      <Button loading variant="outline">
        Processing
      </Button>
      <Button loading variant="destructive">
        Deleting
      </Button>
      <Button loading size="icon">
        <span className="sr-only">Loading</span>
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Buttons with built-in loading states and spinners.",
      },
    },
  },
};

export const FullWidth: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-3">
      <Button fullWidth>Full Width Primary</Button>
      <Button fullWidth variant="outline">
        Full Width Outline
      </Button>
      <Button fullWidth variant="secondary">
        Full Width Secondary
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Full-width buttons ideal for mobile layouts and forms.",
      },
    },
  },
};

// With Icons
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Download className="h-4 w-4" />
        Download
      </>
    ),
  },
};

export const IconRight: Story = {
  args: {
    children: (
      <>
        Continue
        <ArrowRight className="h-4 w-4" />
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    size: "icon",
    variant: "outline",
    children: <Settings className="h-4 w-4" />,
  },
};

// States
export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </>
    ),
  },
};

// Showcase All Variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "All available button variants displayed together for comparison.",
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="flex gap-4 items-center">
        <Button size="icon-sm">
          <Heart className="h-3 w-3" />
        </Button>
        <Button size="icon">
          <Heart className="h-4 w-4" />
        </Button>
        <Button size="icon-lg">
          <Heart className="h-5 w-5" />
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "All available button sizes including icon variants with proper touch targets.",
      },
    },
  },
};

// Real-world Examples
export const ActionButtons: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="default">
        <Plus className="h-4 w-4" />
        Add Item
      </Button>
      <Button variant="outline">
        <Settings className="h-4 w-4" />
        Settings
      </Button>
      <Button variant="destructive">Delete</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Common action buttons used in applications.",
      },
    },
  },
};

export const ButtonGroup: Story = {
  render: () => (
    <div className="inline-flex rounded-md shadow-sm" role="group">
      <Button variant="outline" className="rounded-r-none">
        Left
      </Button>
      <Button variant="outline" className="rounded-none border-l-0">
        Middle
      </Button>
      <Button variant="outline" className="rounded-l-none border-l-0">
        Right
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Grouped buttons for related actions.",
      },
    },
  },
};

// Mobile-First Layout Examples
export const MobileLayout: Story = {
  render: () => (
    <div className="w-full max-w-sm mx-auto space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Mobile-First Button Layout</h3>

      {/* Primary action - full width on mobile */}
      <Button fullWidth size="lg">
        <Plus className="h-4 w-4" />
        Create New Item
      </Button>

      {/* Secondary actions - stack on mobile, row on desktop */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" fullWidth className="sm:flex-1">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button variant="secondary" fullWidth className="sm:flex-1">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Icon actions with proper touch targets */}
      <div className="flex justify-center gap-2">
        <Button size="icon" variant="ghost">
          <Heart className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost">
          <Settings className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Mobile-first button layout patterns with responsive behavior.",
      },
    },
  },
};

export const TouchFeedback: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Tap buttons to see touch-optimized feedback (scale animation, shadow
        changes)
      </div>
      <div className="flex flex-wrap gap-4">
        <Button>Touch Me</Button>
        <Button variant="outline">Press & Hold</Button>
        <Button variant="secondary">Tap Feedback</Button>
        <Button size="icon">
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Buttons with enhanced touch feedback including scale animations and shadow changes.",
      },
    },
  },
};

// AsChild Example
export const AsChildLink: Story = {
  render: () => (
    <Button asChild>
      <a href="#" className="no-underline">
        <ArrowRight className="h-4 w-4" />
        Go to Profile
      </a>
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: "Button rendered as a link using the asChild prop.",
      },
    },
  },
};
