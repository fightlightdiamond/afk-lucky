import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import MultiSelectField from "./MultiSelectField";
import React from "react";

const meta: Meta<typeof MultiSelectField> = {
  title: "Form Components/MultiSelectField",
  component: MultiSelectField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A multi-select field component for selecting multiple options with checkboxes.

## Features
- Multiple selection with checkboxes
- Search functionality
- Visual feedback for selected items
- Error states and help messages

## Usage
\`\`\`tsx
import MultiSelectField from '@/stories/Select/MultiSelectField'

<MultiSelectField
  label="Select options"
  data={[
    { label: "Option 1", value: 1 },
    { label: "Option 2", value: 2 }
  ]}
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
      description: "Label text",
      table: { category: "Basic" },
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
      table: { category: "Basic" },
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the field",
      table: { category: "Basic" },
    },
    value: {
      control: { type: "object" },
      description: "Array of selected values",
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
      description: "Error state",
      table: { category: "Label & Help" },
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
      description: "Custom render function for selected values display",
      table: {
        category: "Custom Rendering",
        type: { summary: "(value: any[], items: ItemDataType[]) => ReactNode" },
      },
    },

    // Select Behavior
    searchable: {
      control: { type: "boolean" },
      description: "Enable search functionality",
      table: {
        category: "Select Behavior",
        defaultValue: { summary: "true" },
      },
    },
    countable: {
      control: { type: "boolean" },
      description: "Show count of selected items",
      table: {
        category: "Select Behavior",
        defaultValue: { summary: "false" },
      },
    },
    sticky: {
      control: { type: "boolean" },
      description: "Make selected items sticky at top",
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
    showSelectAll: {
      control: { type: "boolean" },
      description: "Show 'Select All' footer to select/deselect all items",
      table: {
        category: "Select Behavior",
        defaultValue: { summary: "false" },
      },
    },
    renderMenu: {
      description: "Custom render for dropdown menu (e.g., add header)",
      table: {
        category: "Select Behavior",
        type: { summary: "(menu: ReactNode) => ReactNode" },
      },
    },

    // Dropdown Menu
    placement: {
      control: { type: "select" },
      options: ["bottomStart", "bottomEnd", "topStart", "topEnd", "auto"],
      description: "Dropdown menu placement",
      table: {
        category: "Dropdown Menu",
        defaultValue: { summary: "bottomStart" },
      },
    },
    menuMaxHeight: {
      control: { type: "number" },
      description: "Max height of dropdown menu",
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
      { label: "Item 1", value: 1 },
      { label: "Item 2", value: 2 },
      { label: "Item 3", value: 3 },
      { label: "Item 4", value: 4 },
    ],
    placeholder: "Search",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Multi Select Field",
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

// Loading state
export const Loading: Story = {
  args: {
    label: "Multi Select (Loading)",
    loading: true,
    placeholder: "Select options",
    data: [
      { label: "Item 1", value: 1 },
      { label: "Item 2", value: 2 },
      { label: "Item 3", value: 3 },
      { label: "Item 4", value: 4 },
      { label: "Item 5", value: 5 },
    ],
  },
};

// With header
export const WithHeader: Story = {
  args: {
    label: "Multi Select with Header",
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
          }}
        >
          Header
        </div>
        {menu}
      </div>
    ),
  },
};

// With header and loading (like design)
export const WithHeaderAndLoading: Story = {
  args: {
    label: "Multi Select with Header & Loading",
    loading: true,
    placeholder: "Select options",
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

// Example with icons
export const WithIcons: Story = {
  args: {
    label: "Multi Select with Icons",
    data: [
      { label: "Item 1", value: 1 },
      { label: "Item 2", value: 2 },
      { label: "Item 3", value: 3 },
    ],
    renderMenuItem: (label: React.ReactNode) => (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" fill="#FF9900" />
        </svg>
        <span>{label}</span>
      </div>
    ),
  },
};

// With Select All
export const WithSelectAll: Story = {
  args: {
    label: "Multi Select with Select All",
    showSelectAll: true,
    data: [
      { label: "Item 1", value: 1 },
      { label: "Item 2", value: 2 },
      { label: "Item 3", value: 3 },
      { label: "Item 4", value: 4 },
      { label: "Item 5", value: 5 },
    ],
  },
};

// With Select All and Loading
export const WithSelectAllAndLoading: Story = {
  args: {
    label: "Multi Select with Select All & Loading",
    showSelectAll: true,
    loading: true,
    placeholder: "Select options",
    data: [
      { label: "Item 1", value: 1 },
      { label: "Item 2", value: 2 },
      { label: "Item 3", value: 3 },
      { label: "Item 4", value: 4 },
      { label: "Item 5", value: 5 },
    ],
  },
};
