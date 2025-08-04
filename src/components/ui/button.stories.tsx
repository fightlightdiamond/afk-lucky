import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";
import {
  Heart,
  Download,
  Settings,
  Plus,
  ArrowRight,
  Loader2,
} from "lucide-react";

/**
 * Button Stories showcasing the shadcn/ui Button component
 */

const meta: Meta<typeof Button> = {
  title: "UI Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A versatile button component built with Radix UI Slot and class-variance-authority for flexible styling.

## Features
- **Multiple Variants**: Default, destructive, outline, secondary, ghost, link
- **Size Options**: Default, small, large, icon
- **Flexible Rendering**: Can render as child element using asChild prop
- **Icon Support**: Works seamlessly with Lucide React icons
- **Accessibility**: Full keyboard navigation and screen reader support

## Usage
\`\`\`tsx
import { Button } from '@/components/ui/button'

// Basic usage
<Button>Click me</Button>

// With variant and size
<Button variant="destructive" size="lg">
  Delete Item
</Button>

// As child element (useful for links)
<Button asChild>
  <a href="/profile">Go to Profile</a>
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
      options: ["default", "sm", "lg", "icon"],
      description: "Size variant of the button",
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
    <div className="flex flex-wrap gap-4 items-center">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Heart className="h-4 w-4" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available button sizes displayed together for comparison.",
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
