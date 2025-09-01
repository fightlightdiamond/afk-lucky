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
  Menu,
  X,
  Plus,
  Minus,
  Filter,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";

/**
 * Enhanced Top Button Stories showcasing advanced scroll-based visibility and positioning
 *
 * A highly configurable floating action button with advanced threshold-based visibility,
 * multiple positioning options, and comprehensive scroll behavior controls.
 */

const meta: Meta<typeof TopButton> = {
  title: "UI Components/Top Button",
  component: TopButton,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
An advanced floating action button component with sophisticated scroll-based visibility controls.

## Key Features
- **Advanced Threshold System**: Pixel, percentage, viewport height, and element-based triggers
- **Smart Positioning**: Four anchor points with custom offset support
- **Scroll Direction Awareness**: Show/hide based on scroll direction
- **Portal Rendering**: Render outside component tree for proper layering
- **Touch-Optimized**: Mobile-first design with proper touch targets
- **Flexible Styling**: Multiple sizes, tones, and customization options

## Threshold Types
- **Scalar**: \`300\`, \`"200px"\`, \`"50vh"\`, \`"25%"\`
- **From Edge**: \`{ from: "bottom", px: 100 }\`
- **Element-based**: \`{ element: "#footer", when: "enter" }\`
- **Function**: \`(ctx) => ctx.scrollTop > ctx.scrollRange * 0.5\`

## Usage Examples
\`\`\`tsx
// Auto-show with scroll threshold
<TopButton auto threshold={300} />

// Show only when scrolling up
<TopButton auto showOnScrollUp threshold="25%" />

// Element-based visibility
<TopButton auto threshold={{ element: "#footer", when: "enter" }} />

// Custom positioning
<TopButton anchor="tl" offset={{ x: 20, y: 20 }} />

// Different styles
<TopButton size="lg" tone="soft" />
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    // Appearance
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Button size variant",
    },
    tone: {
      control: { type: "select" },
      options: ["solid", "soft", "outline"],
      description: "Visual style tone",
    },
    anchor: {
      control: { type: "select" },
      options: ["br", "bl", "tr", "tl"],
      description:
        "Anchor position (bottom-right, bottom-left, top-right, top-left)",
    },

    // Behavior
    auto: {
      control: { type: "boolean" },
      description: "Enable automatic scroll-based visibility",
    },
    visible: {
      control: { type: "boolean" },
      description: "Manual visibility control (overrides auto)",
    },
    showOnScrollUp: {
      control: { type: "boolean" },
      description: "Only show when scrolling up",
    },
    portal: {
      control: { type: "boolean" },
      description: "Render in portal (recommended for proper layering)",
    },

    // Icons
    icon: {
      control: false,
      description: "Custom icon to display",
    },
    hoverIcon: {
      control: false,
      description: "Icon to display on hover",
    },
    isHovered: {
      control: { type: "boolean" },
      description: "External hover state control",
    },

    // Advanced
    debounceMs: {
      control: { type: "number", min: 0, max: 1000, step: 50 },
      description: "Scroll event debounce delay in milliseconds",
    },
    zIndex: {
      control: { type: "number", min: 1, max: 100 },
      description: "CSS z-index value",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    auto: true,
    threshold: 300,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Default auto-showing button that appears after scrolling 300px down.",
      },
    },
  },
};

export const ManualControl: Story = {
  args: {
    visible: true,
    portal: false,
    className:
      "relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static",
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "Manually controlled visibility - always visible for demonstration.",
      },
    },
  },
};

// Size and Tone Variants
export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center justify-center p-8">
      <TopButton
        size="sm"
        visible
        portal={false}
        className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
      />
      <TopButton
        size="md"
        visible
        portal={false}
        className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
      />
      <TopButton
        size="lg"
        visible
        portal={false}
        className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
      />
    </div>
  ),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "Different size variants: small (32px), medium (40px), large (48px).",
      },
    },
  },
};

export const Tones: Story = {
  render: () => (
    <div className="flex gap-4 items-center justify-center p-8">
      <TopButton
        tone="solid"
        visible
        portal={false}
        className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
      />
      <TopButton
        tone="soft"
        visible
        portal={false}
        className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
      />
      <TopButton
        tone="outline"
        visible
        portal={false}
        className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
      />
    </div>
  ),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "Different tone variants: solid, soft (with backdrop blur), outline.",
      },
    },
  },
};

export const CustomIcons: Story = {
  args: {
    icon: <Home className="h-5 w-5" />,
    hoverIcon: <Settings className="h-5 w-5" />,
    visible: true,
    portal: false,
    className:
      "relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static",
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story: "Custom icons - Home icon that changes to Settings on hover.",
      },
    },
  },
};

// Advanced Threshold Examples
export const ThresholdPixels: Story = {
  args: {
    auto: true,
    threshold: 500,
    icon: <ArrowUp className="h-5 w-5" />,
  },
  parameters: {
    docs: {
      description: {
        story: "Appears after scrolling 500 pixels from the top.",
      },
    },
  },
};

export const ThresholdPercentage: Story = {
  args: {
    auto: true,
    threshold: "25%",
    icon: <ChevronUp className="h-5 w-5" />,
    tone: "soft",
  },
  parameters: {
    docs: {
      description: {
        story: "Appears after scrolling 25% of the total scrollable content.",
      },
    },
  },
};

export const ThresholdViewportHeight: Story = {
  args: {
    auto: true,
    threshold: "100vh",
    icon: <ArrowUp className="h-5 w-5" />,
    tone: "outline",
  },
  parameters: {
    docs: {
      description: {
        story: "Appears after scrolling one full viewport height.",
      },
    },
  },
};

export const ThresholdFromBottom: Story = {
  args: {
    auto: true,
    threshold: { from: "bottom", px: 200 },
    icon: <ChevronUp className="h-5 w-5" />,
    size: "lg",
  },
  parameters: {
    docs: {
      description: {
        story: "Appears when within 200px of the bottom of the page.",
      },
    },
  },
};

export const ThresholdElementBased: Story = {
  args: {
    auto: true,
    threshold: { element: "#footer", when: "visible", offset: "10px" },
    icon: <ArrowUp className="h-5 w-5" />,
    tone: "soft",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Appears when the footer element becomes visible with 10px offset.",
      },
    },
  },
};

export const ThresholdMultipleConditions: Story = {
  args: {
    auto: true,
    threshold: {
      conditions: [
        300, // After 300px scroll
        { from: "bottom", px: 500 }, // And not within 500px of bottom
      ],
      operator: "and",
    },
    icon: <ChevronUp className="h-5 w-5" />,
    tone: "outline",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Appears when both conditions are met: scrolled 300px AND not within 500px of bottom.",
      },
    },
  },
};

export const ThresholdWithDelay: Story = {
  args: {
    auto: true,
    threshold: {
      after: 2000, // Wait 2 seconds
      condition: 200, // Then check if scrolled 200px
    },
    icon: <ArrowUp className="h-5 w-5" />,
    size: "lg",
  },
  parameters: {
    docs: {
      description: {
        story: "Appears after 2 seconds delay, then checks if scrolled 200px.",
      },
    },
  },
};

export const ThresholdFunction: Story = {
  args: {
    auto: true,
    threshold: (ctx) => {
      // Show when scrolled more than 50% of total content
      return ctx.scrollTop > ctx.scrollRange * 0.5;
    },
    icon: <Filter className="h-5 w-5" />,
    tone: "soft",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom function threshold - appears when scrolled more than 50% of total content.",
      },
    },
  },
};

export const ScrollDirectionAware: Story = {
  args: {
    auto: true,
    threshold: 300,
    showOnScrollUp: true,
    icon: <ArrowUp className="h-5 w-5" />,
    tone: "soft",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Only appears when scrolling up (after initial threshold is met).",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    visible: true,
    portal: false,
    className:
      "relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static",
    onClick: () => console.log("This won't fire"),
  },
  parameters: {
    layout: "centered",
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
    <div className="relative h-96 bg-gray-50 p-8 overflow-hidden">
      <h3 className="text-lg font-semibold mb-4">Multiple Top Buttons</h3>
      <p className="text-gray-600 mb-8">
        This example shows how multiple top buttons might look with different
        actions. In practice, you&apos;d typically use only one per page.
      </p>

      {/* Primary action */}
      <TopButton
        visible
        portal={false}
        onClick={() => console.log("Primary action")}
        className="!absolute bottom-6 right-6"
      />

      {/* Secondary action */}
      <TopButton
        icon={<MessageCircle className="h-6 w-6" />}
        hoverIcon={<Phone className="h-6 w-6" />}
        visible
        portal={false}
        onClick={() => console.log("Contact action")}
        className="!absolute bottom-6 right-20"
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
          visible
          portal={false}
          onClick={() => console.log("Normal state")}
          className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
        />
      </div>

      <div className="text-center">
        <p className="mb-4 text-sm text-gray-600">Hover State</p>
        <TopButton
          isHovered={true}
          visible
          portal={false}
          onClick={() => console.log("Hover state")}
          className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
        />
      </div>

      <div className="text-center">
        <p className="mb-4 text-sm text-gray-600">Disabled</p>
        <TopButton
          disabled={true}
          visible
          portal={false}
          onClick={() => console.log("Disabled")}
          className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
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
          visible
          portal={false}
          onClick={() => console.log("Default")}
          className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
        />
      </div>

      <div className="text-center">
        <p className="mb-4 text-sm text-gray-600">Custom Icons</p>
        <TopButton
          icon={<Heart className="h-6 w-6" />}
          hoverIcon={<Star className="h-6 w-6" />}
          visible
          portal={false}
          onClick={() => console.log("Custom")}
          className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
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

// Positioning Examples
export const AllPositions: Story = {
  render: () => (
    <div className="relative h-96 bg-gray-50 p-8 overflow-hidden">
      <h3 className="text-lg font-semibold mb-4">All Anchor Positions</h3>
      <p className="text-gray-600 mb-8">
        Demonstrates all four anchor positions with different icons.
      </p>

      <TopButton
        anchor="br"
        icon={<ChevronUp className="h-5 w-5" />}
        visible
        portal={false}
        onClick={() => console.log("Bottom Right")}
        className="!absolute"
      />

      <TopButton
        anchor="bl"
        icon={<Home className="h-5 w-5" />}
        visible
        portal={false}
        onClick={() => console.log("Bottom Left")}
        className="!absolute"
      />

      <TopButton
        anchor="tr"
        icon={<Settings className="h-5 w-5" />}
        visible
        portal={false}
        onClick={() => console.log("Top Right")}
        className="!absolute"
      />

      <TopButton
        anchor="tl"
        icon={<Menu className="h-5 w-5" />}
        visible
        portal={false}
        onClick={() => console.log("Top Left")}
        className="!absolute"
      />
    </div>
  ),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "All four anchor positions: bottom-right, bottom-left, top-right, top-left.",
      },
    },
  },
};

export const CustomOffsets: Story = {
  render: () => (
    <div className="relative h-96 bg-gray-50 p-8 overflow-hidden">
      <h3 className="text-lg font-semibold mb-4">Custom Offsets</h3>
      <p className="text-gray-600 mb-8">
        Buttons with custom positioning offsets.
      </p>

      <TopButton
        anchor="br"
        offset={50}
        icon={<Plus className="h-5 w-5" />}
        visible
        portal={false}
        onClick={() => console.log("Uniform offset")}
        className="!absolute"
      />

      <TopButton
        anchor="bl"
        offset={{ x: 20, y: 80 }}
        icon={<Minus className="h-5 w-5" />}
        visible
        portal={false}
        onClick={() => console.log("Custom x,y offset")}
        className="!absolute"
      />
    </div>
  ),
  parameters: {
    layout: "centered",
    docs: {
      description: {
        story:
          "Custom positioning with uniform offset (50px) and custom x,y offsets.",
      },
    },
  },
};

// Advanced Behavior Examples
const ScrollContainerComponent = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="p-8">
      <h3 className="text-lg font-semibold mb-4">Custom Scroll Container</h3>
      <div
        ref={containerRef}
        className="h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50"
      >
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="p-2 mb-2 bg-white rounded">
            Scrollable item {i + 1}
          </div>
        ))}
      </div>

      <TopButton
        auto
        threshold={100}
        scrollContainer={() => containerRef.current}
        icon={<ArrowUp className="h-5 w-5" />}
        anchor="br"
        offset={10}
        onClick={() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      />
    </div>
  );
};

export const ScrollContainerExample: Story = {
  render: () => <ScrollContainerComponent />,
  parameters: {
    docs: {
      description: {
        story:
          "TopButton that monitors a custom scroll container instead of the window.",
      },
    },
  },
};

export const DebounceComparison: Story = {
  render: () => (
    <div className="relative h-96 bg-gray-50 p-8 overflow-hidden">
      <h3 className="text-lg font-semibold mb-4">Debounce Comparison</h3>
      <p className="text-gray-600 mb-8">
        Two buttons with different debounce settings. Scroll to see the
        difference.
      </p>

      <TopButton
        auto
        threshold={200}
        debounceMs={0}
        icon={<Search className="h-4 w-4" />}
        size="sm"
        anchor="br"
        offset={{ x: 0, y: 0 }}
        tone="outline"
        portal={false}
        className="!absolute"
      />

      <TopButton
        auto
        threshold={200}
        debounceMs={500}
        icon={<Filter className="h-4 w-4" />}
        size="sm"
        anchor="br"
        offset={{ x: 50, y: 0 }}
        tone="soft"
        portal={false}
        className="!absolute"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Comparison of immediate response (0ms debounce) vs delayed response (500ms debounce).",
      },
    },
  },
};

// Real-world Usage
const RealWorldComponent = () => {
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
};

export const RealWorldExample: Story = {
  render: () => <RealWorldComponent />,
  parameters: {
    docs: {
      description: {
        story:
          "Real-world example with scroll-based visibility. The button appears after scrolling down 300px.",
      },
    },
  },
};
const ComprehensiveComponent = () => {
  const [activeThreshold, setActiveThreshold] = useState<string>("basic");

  const thresholds: Record<string, any> = {
    basic: 300,
    percentage: "25%" as const,
    viewport: "50vh" as const,
    fromBottom: { from: "bottom" as const, px: 200 },
    multiple: {
      conditions: [200, { from: "bottom" as const, px: 300 }],
      operator: "and" as const,
    },
    delayed: {
      after: 1500,
      condition: 150,
    },
    function: (ctx: any) => ctx.scrollTop > ctx.scrollRange * 0.3,
  };

  return (
    <div className="relative">
      <div className="p-8 space-y-6">
        <h2 className="text-2xl font-bold">Comprehensive TopButton Demo</h2>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Threshold Controls</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(thresholds).map((key) => (
              <button
                key={key}
                onClick={() => setActiveThreshold(key)}
                className={`px-3 py-1 rounded text-sm ${
                  activeThreshold === key
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-700 border"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Current: {activeThreshold} -{" "}
            {typeof thresholds[activeThreshold as keyof typeof thresholds] ===
            "object"
              ? JSON.stringify(
                  thresholds[activeThreshold as keyof typeof thresholds]
                )
              : String(thresholds[activeThreshold as keyof typeof thresholds])}
          </p>
        </div>

        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold">Section {i + 1}</h3>
            <p className="text-gray-600">
              Content section {i + 1}. Scroll to test different threshold
              behaviors.
              {i === 20 && (
                <span
                  id="footer"
                  className="block mt-2 text-blue-600 font-medium"
                >
                  📍 Footer marker for element-based thresholds
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      <TopButton
        auto
        threshold={thresholds[activeThreshold as keyof typeof thresholds]}
        showOnScrollUp={activeThreshold === "basic"}
        debounceMs={activeThreshold === "delayed" ? 200 : 100}
        size="lg"
        tone="soft"
        icon={<ChevronUp className="h-6 w-6" />}
        hoverIcon={<ArrowUp className="h-6 w-6" />}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
    </div>
  );
};

export const ComprehensiveExample: Story = {
  render: () => <ComprehensiveComponent />,
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demo showcasing all threshold types. Use the controls to switch between different threshold behaviors and see how they affect button visibility.",
      },
    },
  },
};
