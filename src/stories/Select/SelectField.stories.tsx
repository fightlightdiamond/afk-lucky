import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SelectField from "./SelectField";
import React from "react";

interface ItemData {
  label?: React.ReactNode;
  value?: string | number;
}

const meta: Meta<typeof SelectField> = {
  title: "Form Components/SelectField",
  component: SelectField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A custom select field component built on top of rsuite SelectPicker with custom styling.

## Features
- Label with optional required indicator
- Prefix options (text or icon, inside or outside border)
- Help messages with icons
- Error states
- Badge support for selected values
- Disabled state support

## Usage
\`\`\`tsx
import SelectField from '@/stories/Select/SelectField'

<SelectField
  label="Select an option"
  data={[
    { label: "Option 1", value: 1 },
    { label: "Option 2", value: 2 }
  ]}
  placeholder="Choose..."
/>
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    // Basic
    label: {
      control: { type: "text" },
      description: "Label text for the select field",
      table: { category: "Basic" },
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
      table: { category: "Basic" },
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the select field",
      table: { category: "Basic" },
    },
    value: {
      control: { type: "text" },
      description: "Selected value",
      table: { category: "Basic" },
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg"],
      description: "Size of the select field",
      table: { category: "Basic", defaultValue: { summary: "md" } },
    },

    // Label & Help
    required: {
      control: { type: "boolean" },
      description: "Shows required indicator (*)",
      table: { category: "Label & Help" },
    },
    helpMessage: {
      control: { type: "text" },
      description: "Help text displayed below the field",
      table: { category: "Label & Help" },
    },
    error: {
      control: { type: "boolean" },
      description: "Error state styling",
      table: { category: "Label & Help" },
    },

    // Prefix
    prefixText: {
      control: { type: "text" },
      description: "Text prefix for the input",
      table: { category: "Prefix" },
    },
    prefixInside: {
      control: { type: "boolean" },
      description:
        "Places prefix inside the input border (with background #F1F3F8)",
      table: { category: "Prefix", defaultValue: { summary: "false" } },
    },

    // Badge
    badge: {
      control: { type: "text" },
      description: "Badge text shown when value is selected",
      table: { category: "Badge" },
    },

    // Select Behavior
    searchable: {
      control: { type: "boolean" },
      description: "Enable search functionality in dropdown",
      table: {
        category: "Select Behavior",
        defaultValue: { summary: "false" },
      },
    },
    virtualized: {
      control: { type: "boolean" },
      description: "Use virtualized list for large datasets (500+ items)",
      table: {
        category: "Select Behavior",
        defaultValue: { summary: "false" },
      },
    },
    loading: {
      control: { type: "boolean" },
      description: "Show loading state when fetching data from API",
      table: {
        category: "Select Behavior",
        defaultValue: { summary: "false" },
      },
    },
    renderMenu: {
      description: "Custom render for dropdown menu (e.g., add header, footer)",
      table: {
        category: "Select Behavior",
        type: { summary: "(menu: ReactNode) => ReactNode" },
      },
    },

    // Custom Rendering
    renderMenuItem: {
      description: "Custom render function for menu items (e.g., add icons)",
      table: {
        category: "Custom Rendering",
        type: {
          summary: "(label: ReactNode, item: ItemDataType) => ReactNode",
        },
      },
    },
    renderValue: {
      description: "Custom render function for selected value display",
      table: {
        category: "Custom Rendering",
        type: { summary: "(value: any, item: ItemDataType) => ReactNode" },
      },
    },

    // Dropdown Menu
    placement: {
      control: { type: "select" },
      options: [
        "bottomStart",
        "bottomEnd",
        "topStart",
        "topEnd",
        "leftStart",
        "leftEnd",
        "rightStart",
        "rightEnd",
        "auto",
        "autoVerticalStart",
        "autoVerticalEnd",
      ],
      description:
        "Dropdown menu placement (auto recommended for responsive behavior)",
      table: {
        category: "Dropdown Menu",
        defaultValue: { summary: "bottomStart" },
      },
    },
    menuMaxHeight: {
      control: { type: "number" },
      description: "Max height of dropdown menu in pixels",
      table: {
        category: "Dropdown Menu",
        defaultValue: { summary: "320" },
      },
    },
    preventOverflow: {
      control: { type: "boolean" },
      description: "Prevent dropdown from overflowing viewport",
      table: {
        category: "Dropdown Menu",
        defaultValue: { summary: "true" },
      },
    },
  },
  args: {
    data: [
      { label: "Option 1", value: 1 },
      { label: "Option 2", value: 2 },
      { label: "Option 3", value: 3 },
      { label: "Option 4", value: 4 },
    ],
    placeholder: "Select an option",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - main example
export const Default: Story = {
  args: {
    label: "Select Field",
  },
};

// Size variants
export const SizeXS: Story = {
  args: {
    label: "Extra Small (XS)",
    size: "xs",
  },
};

export const SizeSM: Story = {
  args: {
    label: "Small (SM)",
    size: "sm",
  },
};

export const SizeMD: Story = {
  args: {
    label: "Medium (MD) - Default",
    size: "md",
  },
};

export const SizeLG: Story = {
  args: {
    label: "Large (LG)",
    size: "lg",
  },
};

// Loading state example
export const Loading: Story = {
  args: {
    label: "Select Field (Loading)",
    loading: true,
    placeholder: "Select an option",
    data: [
      { label: "Item 1", value: 1 },
      { label: "Item 2", value: 2 },
      { label: "Item 3", value: 3 },
    ],
  },
};

// With header in dropdown menu
export const WithHeader: Story = {
  args: {
    label: "Select with Header",
    data: [
      { label: "Item 1", value: 1 },
      { label: "Item 2", value: 2 },
      { label: "Item 3", value: 3 },
    ],
    renderMenu: (menu: React.ReactNode) => (
      <div>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #E8EAED",
            background: "#F5F6F8",
            fontWeight: 600,
            fontSize: "13px",
            color: "#282C3B",
          }}
        >
          Header Section
        </div>
        {menu}
      </div>
    ),
  },
};

// With header and loading (like design)
export const WithHeaderAndLoading: Story = {
  args: {
    label: "Select with Header & Loading",
    loading: true,
    placeholder: "Select an option",
    data: [
      { label: "Item 1", value: 1 },
      { label: "Item 2", value: 2 },
      { label: "Item 3", value: 3 },
      { label: "Item 4", value: 4 },
      { label: "Item 5", value: 5 },
    ],
    renderMenu: (menu: React.ReactNode) => (
      <div>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #E8EAED",
            background: "#FFFFFF",
            fontWeight: 400,
            fontSize: "13px",
            color: "#787E95",
          }}
        >
          Header
        </div>
        {menu}
      </div>
    ),
  },
};

// Example with icons in menu items
export const WithIcons: Story = {
  args: {
    label: "Select with Icons",
    data: [
      { label: "Item 1", value: 1 },
      { label: "Item 2", value: 2 },
      { label: "Item 3", value: 3 },
    ],
    renderMenuItem: (label: React.ReactNode, item: ItemData) => (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" fill="#FF9900" />
          <text
            x="10"
            y="14"
            fontSize="10"
            fill="white"
            textAnchor="middle"
            fontWeight="bold"
          >
            {item.value}
          </text>
        </svg>
        <span>{label}</span>
      </div>
    ),
  },
};
