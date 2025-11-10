import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SelectField from "./SelectField";
import MultiSelectField from "./MultiSelectField";
import TreeSelectField from "./TreeSelectField";
import React from "react";

const meta: Meta = {
  title: "Form Components/Select Sizes",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Size comparison for all Select components.

## Available Sizes
- **xs**: 24px height - Extra small for compact UIs
- **sm**: 28px height - Small for dense layouts
- **md**: 32px height - Default/Medium size
- **lg**: 40px height - Large for prominent inputs
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { label: "Option 1", value: 1 },
  { label: "Option 2", value: 2 },
  { label: "Option 3", value: 3 },
  { label: "Option 4", value: 4 },
];

const treeData = [
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
];

// All sizes comparison for SelectField
export const SelectFieldSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ width: "300px" }}>
        <SelectField
          label="Extra Small (XS)"
          size="xs"
          data={data}
          placeholder="Placeholder text"
        />
      </div>
      <div style={{ width: "300px" }}>
        <SelectField
          label="Small (SM)"
          size="sm"
          data={data}
          placeholder="Placeholder text"
        />
      </div>
      <div style={{ width: "300px" }}>
        <SelectField
          label="Medium (MD) - Default"
          size="md"
          data={data}
          placeholder="Placeholder text"
        />
      </div>
      <div style={{ width: "300px" }}>
        <SelectField
          label="Large (LG)"
          size="lg"
          data={data}
          placeholder="Placeholder text"
        />
      </div>
    </div>
  ),
};

// All sizes comparison for MultiSelectField
export const MultiSelectFieldSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ width: "300px" }}>
        <MultiSelectField
          label="Extra Small (XS)"
          size="xs"
          data={data}
          placeholder="Placeholder text"
        />
      </div>
      <div style={{ width: "300px" }}>
        <MultiSelectField
          label="Small (SM)"
          size="sm"
          data={data}
          placeholder="Placeholder text"
        />
      </div>
      <div style={{ width: "300px" }}>
        <MultiSelectField
          label="Medium (MD) - Default"
          size="md"
          data={data}
          placeholder="Placeholder text"
        />
      </div>
      <div style={{ width: "300px" }}>
        <MultiSelectField
          label="Large (LG)"
          size="lg"
          data={data}
          placeholder="Placeholder text"
        />
      </div>
    </div>
  ),
};

// All sizes comparison for TreeSelectField
export const TreeSelectFieldSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ width: "300px" }}>
        <TreeSelectField
          label="Extra Small (XS)"
          size="xs"
          data={treeData}
          placeholder="Placeholder text"
        />
      </div>
      <div style={{ width: "300px" }}>
        <TreeSelectField
          label="Small (SM)"
          size="sm"
          data={treeData}
          placeholder="Placeholder text"
        />
      </div>
      <div style={{ width: "300px" }}>
        <TreeSelectField
          label="Medium (MD) - Default"
          size="md"
          data={treeData}
          placeholder="Placeholder text"
        />
      </div>
      <div style={{ width: "300px" }}>
        <TreeSelectField
          label="Large (LG)"
          size="lg"
          data={treeData}
          placeholder="Placeholder text"
        />
      </div>
    </div>
  ),
};

// Side by side comparison
export const AllSizesSideBySide: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px" }}>
      <div style={{ width: "250px" }}>
        <h3 style={{ fontSize: "14px", marginBottom: "16px" }}>XS (24px)</h3>
        <SelectField
          size="xs"
          data={data}
          placeholder="Placeholder text"
          helpMessage="Help message"
        />
      </div>
      <div style={{ width: "250px" }}>
        <h3 style={{ fontSize: "14px", marginBottom: "16px" }}>SM (28px)</h3>
        <SelectField
          size="sm"
          data={data}
          placeholder="Placeholder text"
          helpMessage="Help message"
        />
      </div>
      <div style={{ width: "250px" }}>
        <h3 style={{ fontSize: "14px", marginBottom: "16px" }}>MD (32px)</h3>
        <SelectField
          size="md"
          data={data}
          placeholder="Placeholder text"
          helpMessage="Help message"
        />
      </div>
      <div style={{ width: "250px" }}>
        <h3 style={{ fontSize: "14px", marginBottom: "16px" }}>LG (40px)</h3>
        <SelectField
          size="lg"
          data={data}
          placeholder="Placeholder text"
          helpMessage="Help message"
        />
      </div>
    </div>
  ),
};

// With badges at different sizes
export const WithBadgesSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ width: "300px" }}>
        <SelectField
          label="XS with Badge"
          size="xs"
          data={data}
          placeholder="Placeholder text"
          badge="NEW"
          value={1}
        />
      </div>
      <div style={{ width: "300px" }}>
        <SelectField
          label="SM with Badge"
          size="sm"
          data={data}
          placeholder="Placeholder text"
          badge="NEW"
          value={1}
        />
      </div>
      <div style={{ width: "300px" }}>
        <SelectField
          label="MD with Badge"
          size="md"
          data={data}
          placeholder="Placeholder text"
          badge="NEW"
          value={1}
        />
      </div>
      <div style={{ width: "300px" }}>
        <SelectField
          label="LG with Badge"
          size="lg"
          data={data}
          placeholder="Placeholder text"
          badge="NEW"
          value={1}
        />
      </div>
    </div>
  ),
};
