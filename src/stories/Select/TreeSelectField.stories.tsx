import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import TreeSelectField from "./TreeSelectField";
import React from "react";

interface TreeNodeData {
  label?: React.ReactNode;
  value?: string | number;
  children?: TreeNodeData[];
}

const treeData = [
  {
    label: "Header",
    value: "header",
    children: [
      { label: "Item 1", value: "item-1" },
      { label: "Item 2", value: "item-2" },
      { label: "Item 3", value: "item-3" },
    ],
  },
  {
    label: "Header 2",
    value: "header-2",
    children: [
      { label: "Item 4", value: "item-4" },
      { label: "Item 5", value: "item-5" },
    ],
  },
];

const meta: Meta<typeof TreeSelectField> = {
  title: "Form Components/TreeSelectField",
  component: TreeSelectField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A tree select field component for hierarchical data selection with parent-child relationships.

## Features
- Tree structure with expandable nodes
- Cascade selection (check parent → check all children)
- Search functionality
- Multiple selection with checkboxes

## Usage
\`\`\`tsx
import TreeSelectField from '@/stories/Select/TreeSelectField'

<TreeSelectField
  label="Select items"
  data={treeData}
  cascade={true}
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
    renderTreeNode: {
      description: "Custom render function for tree nodes (e.g., add icons)",
      table: {
        category: "Custom Rendering",
        type: { summary: "(nodeData: ItemDataType) => ReactNode" },
      },
    },
    renderValue: {
      description: "Custom render function for selected values display",
      table: {
        category: "Custom Rendering",
        type: { summary: "(value: any[], items: ItemDataType[]) => ReactNode" },
      },
    },

    // Tree Behavior
    cascade: {
      control: { type: "boolean" },
      description: "Enable cascade selection (parent-child relationship)",
      table: {
        category: "Tree Behavior",
        defaultValue: { summary: "true" },
      },
    },
    defaultExpandAll: {
      control: { type: "boolean" },
      description: "Expand all nodes by default",
      table: {
        category: "Tree Behavior",
        defaultValue: { summary: "false" },
      },
    },
    expandItemValues: {
      control: { type: "object" },
      description: "Array of values for expanded nodes",
      table: { category: "Tree Behavior" },
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
    data: treeData,
    placeholder: "Search",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Tree Select Field",
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
    label: "Tree Select (Loading)",
    loading: true,
    placeholder: "Select options",
    data: treeData,
  },
};

// With header
export const WithHeader: Story = {
  args: {
    label: "Tree Select with Header",
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
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid #E8EAED",
            background: "#F5F6F8",
            fontSize: "12px",
            color: "#787E95",
          }}
        >
          Select All
        </div>
      </div>
    ),
  },
};

// Example with icons
export const WithIcons: Story = {
  args: {
    label: "Tree Select with Icons",
    data: [
      {
        label: "Category 1",
        value: "cat1",
        children: [
          { label: "Item 1", value: "item1" },
          { label: "Item 2", value: "item2" },
        ],
      },
      {
        label: "Category 2",
        value: "cat2",
        children: [
          { label: "Item 3", value: "item3" },
          { label: "Item 4", value: "item4" },
        ],
      },
    ],
    renderTreeNode: (nodeData: TreeNodeData) => (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle
            cx="8"
            cy="8"
            r="6"
            fill={nodeData.children ? "#2196F3" : "#FF9900"}
          />
        </svg>
        <span>{nodeData.label}</span>
      </div>
    ),
  },
};

// With Select All
export const WithSelectAll: Story = {
  args: {
    label: "Tree Select with Select All",
    showSelectAll: true,
    data: treeData,
  },
};

// With Select All and Loading
export const WithSelectAllAndLoading: Story = {
  args: {
    label: "Tree Select with Select All & Loading",
    showSelectAll: true,
    loading: true,
    placeholder: "Select options",
    data: treeData,
  },
};
