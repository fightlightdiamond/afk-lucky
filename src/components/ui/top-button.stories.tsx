import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TopButton } from "./top-button";
import {
  ChevronUp,
  ArrowUp,
  Home,
  Settings,
  Heart,
  Star,
  MessageCircle,
  Phone,
} from "lucide-react";
import {useEffect, useState} from "react";

/**
 * Top Button Stories showcasing the Top Button component
 *
 * A fixed-position button designed to be anchored at the bottom-right corner of the screen.
 * Features a rounded design with hover state interactions and icon switching capabilities.
 */

const meta: Meta<typeof TopButton> = {
  title: "UI Components/Top Button",
  component: TopButton,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A specialized button component designed for "scroll to top" functionality and similar actions.

## Features
- **Fixed Position**: Anchored at bottom-right corner with 24px spacing
- **Rounded Design**: 38x38px circular button with solid fill
- **Icon Support**: 24x24px icons with hover state switching
- **Interactive States**: Visual feedback on hover interactions
- **Accessibility**: Full keyboard navigation and screen reader support

## Design Specifications
- **Dimensions**: 38x38px fixed size
- **Position**: Fixed at bottom-right (24px from edges)
- **Colors**: Body/Black background with Body/White icons
- **Icon Size**: 24x24px centered icons
- **Hover Behavior**: Icon switches on hover state

## Usage
\`\`\`tsx
import { TopButton } from '@/components/ui/top-button'

// Basic scroll to top button
<TopButton onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />

// Custom icons
<TopButton 
  icon={<Home className="h-6 w-6" />}
  hoverIcon={<Settings className="h-6 w-6" />}
  onClick={handleAction}
/>

// Controlled hover state
<TopButton 
  isHovered={isHovered}
  onClick={handleClick}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: false,
      description: "Custom icon to display in the button (24x24px recommended)",
    },
    hoverIcon: {
      control: false,
      description: "Icon to display on hover state (24x24px recommended)",
    },
    isHovered: {
      control: { type: "boolean" },
      description: "External control for hover state",
    },
    onClick: {
      action: "clicked",
      description: "Click handler function",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the button",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    onClick: () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      console.log("Scrolling to top");
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default top button with chevron up icon that changes to arrow up on hover.",
      },
    },
  },
};

export const CustomIcons: Story = {
  args: {
    icon: <Home className="h-6 w-6" />,
    hoverIcon: <Settings className="h-6 w-6" />,
    onClick: () => console.log("Custom action"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Top button with custom icons - Home icon that changes to Settings on hover.",
      },
    },
  },
};

export const ControlledHover: Story = {
  args: {
    isHovered: true,
    icon: <Heart className="h-6 w-6" />,
    hoverIcon: <Star className="h-6 w-6" />,
    onClick: () => console.log("Controlled hover"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Top button with externally controlled hover state showing the hover icon.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onClick: () => console.log("This won't fire"),
  },
  parameters: {
    docs: {
      description: {
        story: "Disabled state of the top button with reduced opacity.",
      },
    },
  },
};

// Interactive Examples
export const ScrollToTop: Story = {
  render: () => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    return (
      <div className="relative h-screen">
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Scroll Down to Test</h2>
          <div className="space-y-4">
            {Array.from({ length: 50 }, (_, i) => (
              <p key={i} className="text-gray-600">
                This is paragraph {i + 1}. Scroll down to see more content and
                test the scroll to top functionality.
              </p>
            ))}
          </div>
        </div>
        <TopButton onClick={scrollToTop} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive example showing the top button in a scrollable context. Scroll down and click the button to return to top.",
      },
    },
  },
};

export const MultipleActions: Story = {
  render: () => (
    <div className="relative h-96 bg-gray-50 p-8">
      <h3 className="text-lg font-semibold mb-4">Multiple Top Buttons</h3>
      <p className="text-gray-600 mb-8">
        This example shows how multiple top buttons might look with different
        actions. In practice, you'd typically use only one per page.
      </p>

      {/* Primary action */}
      <TopButton
        onClick={() => console.log("Primary action")}
        className="bottom-6 right-6"
      />

      {/* Secondary action */}
      <TopButton
        icon={<MessageCircle className="h-6 w-6" />}
        hoverIcon={<Phone className="h-6 w-6" />}
        onClick={() => console.log("Contact action")}
        className="bottom-6 right-20"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Example showing multiple top buttons with different actions. Note: typically only one would be used per page.",
      },
    },
  },
};

// State Demonstrations
export const HoverStates: Story = {
  render: () => (
    <div className="flex gap-8 items-center justify-center p-8">
      <div className="text-center">
        <p className="mb-4 text-sm text-gray-600">Normal State</p>
        <TopButton
          isHovered={false}
          onClick={() => console.log("Normal state")}
          className="relative"
        />
      </div>

      <div className="text-center">
        <p className="mb-4 text-sm text-gray-600">Hover State</p>
        <TopButton
          isHovered={true}
          onClick={() => console.log("Hover state")}
          className="relative"
        />
      </div>

      <div className="text-center">
        <p className="mb-4 text-sm text-gray-600">Disabled</p>
        <TopButton
          disabled={true}
          onClick={() => console.log("Disabled")}
          className="relative"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "Comparison of different button states: normal, hover, and disabled.",
      },
    },
  },
};

// Icon Variations
export const IconVariations: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="text-center">
        <p className="mb-4 text-sm text-gray-600">Default Icons</p>
        <TopButton
          onClick={() => console.log("Default")}
          className="relative"
        />
      </div>

      <div className="text-center">
        <p className="mb-4 text-sm text-gray-600">Custom Icons</p>
        <TopButton
          icon={<Heart className="h-6 w-6" />}
          hoverIcon={<Star className="h-6 w-6" />}
          onClick={() => console.log("Custom")}
          className="relative"
        />
      </div>
    </div>
  ),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story: "Comparison of default icons vs custom icons.",
      },
    },
  },
};

// Real-world Usage
export const RealWorldExample: Story = {
  render: () => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
      const handleScroll = () => {
        setShowButton(window.scrollY > 300);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    return (
      <div className="relative">
        <div className="p-8 space-y-6">
          <h2 className="text-2xl font-bold">Real-world Implementation</h2>
          <p className="text-gray-600">
            This example shows a typical implementation where the button appears
            after scrolling down 300px.
          </p>

          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold">Section {i + 1}</h3>
              <p className="text-gray-600">
                Content section {i + 1}. Keep scrolling to see the top button
                appear.
              </p>
            </div>
          ))}
        </div>

        {showButton && (
          <TopButton
            onClick={scrollToTop}
            className="transition-opacity duration-300"
          />
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Real-world example with scroll-based visibility. The button appears after scrolling down 300px.",
      },
    },
  },
};
