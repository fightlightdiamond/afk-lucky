import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SelectField from "./SelectField";
import MultiSelectField from "./MultiSelectField";
import TreeSelectField from "./TreeSelectField";
import CustomInput from "./CustomInput";
import React, { useState } from "react";

const meta: Meta<typeof SelectField> = {
  title: "Select/Memoization Tests",
  component: SelectField,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Visual tests to verify memoization effectiveness in Select components. CustomInput is wrapped in React.memo, and all callbacks use useCallback for optimal performance.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SelectField>;

const testData = [
  { label: "Option 1", value: 1 },
  { label: "Option 2", value: 2 },
  { label: "Option 3", value: 3 },
];

export const CustomInputMemoTest: Story = {
  render: () => {
    const [parentState, setParentState] = useState(0);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "300px",
        }}
      >
        <div>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            Parent re-renders: {parentState}
          </p>
          <button
            onClick={() => setParentState((prev) => prev + 1)}
            style={{
              padding: "8px 16px",
              background: "#4A5568",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Trigger Parent Re-render
          </button>
        </div>
        <CustomInput
          data={testData}
          placeholder="Select an option..."
          value={null}
        />
        <p style={{ fontSize: "12px", color: "#787E95" }}>
          CustomInput is wrapped in React.memo. Click the button to trigger
          parent re-renders. The select component should remain stable since its
          props haven&apos;t changed.
        </p>
      </div>
    );
  },
};

export const SelectFieldStabilityTest: Story = {
  render: () => {
    const [externalState, setExternalState] = useState(0);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "300px",
        }}
      >
        <div>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            External state changes: {externalState}
          </p>
          <button
            onClick={() => setExternalState((prev) => prev + 1)}
            style={{
              padding: "8px 16px",
              background: "#4A5568",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Update External State
          </button>
        </div>

        <SelectField
          label="Stable SelectField"
          data={testData}
          placeholder="Select..."
          value={null}
          helpMessage="This field should remain stable"
        />

        <p style={{ fontSize: "12px", color: "#787E95" }}>
          SelectField wraps CustomInput. Both should remain stable when external
          state changes that don&apos;t affect their props.
        </p>
      </div>
    );
  },
};

export const MultiSelectStabilityTest: StoryObj<typeof MultiSelectField> = {
  render: () => {
    const [externalState, setExternalState] = useState(0);

    const largeData = React.useMemo(
      () =>
        Array.from({ length: 500 }, (_, i) => ({
          label: `Option ${i + 1}`,
          value: i + 1,
        })),
      []
    );

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "300px",
        }}
      >
        <div>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            External state: {externalState}
          </p>
          <button
            onClick={() => setExternalState((prev) => prev + 1)}
            style={{
              padding: "8px 16px",
              background: "#4A5568",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Update State
          </button>
        </div>

        <MultiSelectField
          label="Multi-select with 500 items"
          data={largeData}
          placeholder="Select multiple..."
          value={[]}
          searchable
        />

        <p style={{ fontSize: "12px", color: "#787E95" }}>
          Large dataset (500 items) is memoized with useMemo. Component should
          not re-render unnecessarily when external state changes.
        </p>
      </div>
    );
  },
};

export const TreeSelectStabilityTest: StoryObj<typeof TreeSelectField> = {
  render: () => {
    const [externalState, setExternalState] = useState(0);

    const treeData = React.useMemo(
      () => [
        {
          label: "Parent 1",
          value: "p1",
          children: Array.from({ length: 20 }, (_, i) => ({
            label: `Child 1.${i + 1}`,
            value: `c1.${i + 1}`,
          })),
        },
        {
          label: "Parent 2",
          value: "p2",
          children: Array.from({ length: 20 }, (_, i) => ({
            label: `Child 2.${i + 1}`,
            value: `c2.${i + 1}`,
          })),
        },
        {
          label: "Parent 3",
          value: "p3",
          children: Array.from({ length: 20 }, (_, i) => ({
            label: `Child 3.${i + 1}`,
            value: `c3.${i + 1}`,
          })),
        },
      ],
      []
    );

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "300px",
        }}
      >
        <div>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            External state: {externalState}
          </p>
          <button
            onClick={() => setExternalState((prev) => prev + 1)}
            style={{
              padding: "8px 16px",
              background: "#4A5568",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Update State
          </button>
        </div>

        <TreeSelectField
          label="Tree with 60 nodes"
          data={treeData}
          placeholder="Select from tree..."
          value={[]}
          searchable
        />

        <p style={{ fontSize: "12px", color: "#787E95" }}>
          Tree data structure is memoized with useMemo. Component should remain
          stable across parent re-renders.
        </p>
      </div>
    );
  },
};

export const MemoizationSummary: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "500px",
        padding: "24px",
      }}
    >
      <div>
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
          Memoization Implementation
        </h3>
        <div
          style={{
            padding: "16px",
            background: "#F1F3F8",
            borderRadius: "8px",
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: "12px", fontSize: "14px" }}>
            CustomInput Component
          </h4>
          <ul
            style={{
              fontSize: "13px",
              color: "#282C3B",
              marginTop: 0,
              paddingLeft: "20px",
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              Wrapped in <code>React.memo</code> to prevent unnecessary
              re-renders
            </li>
            <li style={{ marginBottom: "8px" }}>
              All callbacks use <code>useCallback</code> with proper
              dependencies
            </li>
            <li style={{ marginBottom: "8px" }}>
              <code>handleChange</code>: memoized with [onChange]
            </li>
            <li style={{ marginBottom: "8px" }}>
              <code>handleToggleClick</code>: memoized with [disabled]
            </li>
            <li style={{ marginBottom: "8px" }}>
              <code>handleOpen</code> and <code>handleClose</code>: memoized
              with []
            </li>
          </ul>
        </div>
      </div>

      <div
        style={{ padding: "16px", background: "#E3F2FD", borderRadius: "8px" }}
      >
        <h4 style={{ marginTop: 0, marginBottom: "12px", fontSize: "14px" }}>
          Performance Benefits
        </h4>
        <ul
          style={{
            fontSize: "13px",
            color: "#282C3B",
            marginTop: 0,
            paddingLeft: "20px",
          }}
        >
          <li style={{ marginBottom: "8px" }}>
            Components only re-render when their own props change
          </li>
          <li style={{ marginBottom: "8px" }}>
            Stable callback references prevent child re-renders
          </li>
          <li style={{ marginBottom: "8px" }}>
            Large datasets can be memoized with <code>useMemo</code>
          </li>
          <li>Efficient rendering even with 1000+ items</li>
        </ul>
      </div>

      <div
        style={{ padding: "16px", background: "#FFF3E0", borderRadius: "8px" }}
      >
        <h4 style={{ marginTop: 0, marginBottom: "12px", fontSize: "14px" }}>
          Testing Recommendations
        </h4>
        <ol
          style={{
            fontSize: "13px",
            color: "#282C3B",
            marginTop: 0,
            paddingLeft: "20px",
          }}
        >
          <li style={{ marginBottom: "8px" }}>
            Use React DevTools Profiler to measure render times
          </li>
          <li style={{ marginBottom: "8px" }}>
            Check &quot;Highlight updates when components render&quot; in
            DevTools
          </li>
          <li style={{ marginBottom: "8px" }}>
            Verify components don&apos;t flash when parent re-renders
          </li>
          <li>Monitor performance with large datasets (500+ items)</li>
        </ol>
      </div>
    </div>
  ),
};
