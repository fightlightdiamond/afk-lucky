import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SelectField from "./SelectField";
import MultiSelectField from "./MultiSelectField";
import TreeSelectField from "./TreeSelectField";
import React from "react";

const generateSelectData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    label: `Option ${i + 1}`,
    value: i + 1,
  }));
};

interface TreeNode {
  label: string;
  value: string;
  children?: TreeNode[];
}

const generateTreeData = (
  depth: number,
  childrenPerNode: number
): TreeNode[] => {
  const generateNode = (level: number, parentPath: string = ""): TreeNode[] => {
    if (level > depth) return [];

    return Array.from({ length: childrenPerNode }, (_, i) => {
      const value = `${parentPath}${level}-${i}`;
      const node: TreeNode = {
        label: `Level ${level} - Item ${i + 1}`,
        value,
      };

      if (level < depth) {
        node.children = generateNode(level + 1, `${value}-`);
      }

      return node;
    });
  };

  return generateNode(1);
};

const meta: Meta<typeof SelectField> = {
  title: "Select/Performance Tests",
  component: SelectField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SelectField>;

export const SelectWith1000Items: Story = {
  args: {
    label: "Select with 1000 items",
    placeholder: "Search from 1000 options...",
    data: generateSelectData(1000),
    searchable: true,
  },
};

export const SelectWith5000Items: Story = {
  args: {
    label: "Select with 5000 items",
    placeholder: "Search from 5000 options...",
    data: generateSelectData(5000),
    searchable: true,
  },
};

export const MultiSelectWith500Items: StoryObj<typeof MultiSelectField> = {
  render: (args) => <MultiSelectField {...args} />,
  args: {
    label: "Multi-select with 500 items",
    placeholder: "Select multiple options...",
    data: generateSelectData(500),
    searchable: true,
  },
};

export const MultiSelectWith1000Items: StoryObj<typeof MultiSelectField> = {
  render: (args) => <MultiSelectField {...args} />,
  args: {
    label: "Multi-select with 1000 items",
    placeholder: "Select multiple options...",
    data: generateSelectData(1000),
    searchable: true,
  },
};

export const TreeSelectWith3LevelsDeep: StoryObj<typeof TreeSelectField> = {
  render: (args) => <TreeSelectField {...args} />,
  args: {
    label: "Tree select - 3 levels, 10 children each",
    placeholder: "Select from tree...",
    data: generateTreeData(3, 10),
    searchable: true,
  },
};

export const TreeSelectWith4LevelsDeep: StoryObj<typeof TreeSelectField> = {
  render: (args) => <TreeSelectField {...args} />,
  args: {
    label: "Tree select - 4 levels, 8 children each",
    placeholder: "Select from tree...",
    data: generateTreeData(4, 8),
    searchable: true,
  },
};

export const TreeSelectWith5LevelsDeep: StoryObj<typeof TreeSelectField> = {
  render: (args) => <TreeSelectField {...args} />,
  args: {
    label: "Tree select - 5 levels, 5 children each",
    placeholder: "Select from tree...",
    data: generateTreeData(5, 5),
    searchable: true,
  },
};

export const PerformanceComparison: Story = {
  render: () => {
    const selectData = React.useMemo(() => generateSelectData(1000), []);
    const multiSelectData = React.useMemo(() => generateSelectData(500), []);
    const treeData = React.useMemo(() => generateTreeData(3, 10), []);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          width: "400px",
        }}
      >
        <div
          style={{
            padding: "16px",
            background: "#F1F3F8",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "12px", fontSize: "16px" }}>
            Performance Testing Guide
          </h3>
          <ol
            style={{
              fontSize: "13px",
              color: "#282C3B",
              paddingLeft: "20px",
              margin: 0,
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              Open browser DevTools (F12 or Cmd+Option+I)
            </li>
            <li style={{ marginBottom: "8px" }}>Go to the Performance tab</li>
            <li style={{ marginBottom: "8px" }}>
              Click Record and interact with the components below
            </li>
            <li style={{ marginBottom: "8px" }}>
              Stop recording and analyze the flame graph
            </li>
            <li>Look for render times and JavaScript execution</li>
          </ol>
        </div>

        <div>
          <h3 style={{ marginBottom: "8px", fontSize: "14px" }}>
            SelectField - 1000 items
          </h3>
          <SelectField
            label="Single Select"
            placeholder="Select an option..."
            data={selectData}
            searchable
          />
        </div>

        <div>
          <h3 style={{ marginBottom: "8px", fontSize: "14px" }}>
            MultiSelectField - 500 items
          </h3>
          <MultiSelectField
            label="Multi Select"
            placeholder="Select multiple..."
            data={multiSelectData}
            searchable
          />
        </div>

        <div>
          <h3 style={{ marginBottom: "8px", fontSize: "14px" }}>
            TreeSelectField - 3 levels deep
          </h3>
          <TreeSelectField
            label="Tree Select"
            placeholder="Select from tree..."
            data={treeData}
            searchable
          />
        </div>
      </div>
    );
  },
};
