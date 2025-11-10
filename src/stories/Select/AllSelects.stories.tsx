import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SelectField from "./SelectField";
import TreeSelectField from "./TreeSelectField";
import MultiSelectField from "./MultiSelectField";

/**
 * All Select Components Showcase
 */

const meta: Meta = {
  title: "Form Components/All Selects",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Complete showcase of all select component types:
- Single Select (basic dropdown)
- Single Select with TreeNode (hierarchical single selection)
- Single Select with Option Value (single selection with values)
- Multi Select with Tree Node (hierarchical multi selection)
- Multi Select with Option Value (multi selection with values)
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

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

const optionData = [
  { label: "Item", value: 1 },
  { label: "Item", value: 2 },
  { label: "Item", value: 3 },
  { label: "Item", value: 4 },
];

// Showcase all select types as in the design
export const AllSelectTypes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8 bg-gray-50">
      {/* Row 1: Single Select */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-semibold mb-4 text-purple-600">
          TREE SELECT (MULTI)
        </h3>
        <TreeSelectField
          data={treeData}
          placeholder="Search"
          style={{ width: "100%" }}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-semibold mb-4 text-purple-600">
          SINGLE SELECT/OPTION VALUE
        </h3>
        <SelectField
          data={optionData}
          placeholder="Search"
          style={{ width: "100%" }}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-semibold mb-4 text-purple-600">
          MULTI SELECT/OPTION VALUE
        </h3>
        <MultiSelectField
          data={optionData}
          placeholder="Search"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Complete showcase of all select component types as shown in the design.",
      },
    },
  },
};

// Individual examples with labels
export const WithLabels: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <SelectField
        label="Single Select"
        data={optionData}
        placeholder="Select an option"
      />

      <TreeSelectField
        label="Tree Select"
        data={treeData}
        placeholder="Search"
      />

      <MultiSelectField
        label="Multi Select"
        data={optionData}
        placeholder="Select multiple"
      />
    </div>
  ),
};

// With values selected
export const WithSelectedValues: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <SelectField
        label="Single Select"
        data={optionData}
        value={2}
        placeholder="Select an option"
      />

      <TreeSelectField
        label="Tree Select"
        data={treeData}
        value={["item-1", "item-2"]}
      />

      <MultiSelectField
        label="Multi Select"
        data={optionData}
        value={[1, 3]}
        placeholder="Select multiple"
      />
    </div>
  ),
};

// Error states
export const ErrorStates: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <SelectField
        label="Single Select"
        data={optionData}
        error
        helpMessage="This field is required"
        required
      />

      <TreeSelectField
        label="Tree Select"
        data={treeData}
        error
        helpMessage="Please select an item"
        required
      />

      <MultiSelectField
        label="Multi Select"
        data={optionData}
        error
        helpMessage="Select at least one option"
        required
      />
    </div>
  ),
};

// Complete Design Showcase - matching the Figma design exactly
export const CompleteDesignShowcase: Story = {
  render: () => (
    <div className="p-8 bg-gray-50 space-y-12">
      {/* Top Section: Field States */}
      <div>
        <h2 className="text-lg font-bold mb-6">Select Field States</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-xs text-gray-500 mb-3">DEFAULT</p>
            <SelectField
              label="Label text"
              data={optionData}
              placeholder="Placeholder text"
            />
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-xs text-gray-500 mb-3">
              ACTIVE (SELECT FROM BOX)
            </p>
            <SelectField
              label="Label text"
              data={optionData}
              placeholder="Placeholder text"
              defaultOpen
            />
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-xs text-gray-500 mb-3">ACTIVE (HAS VALUE)</p>
            <SelectField
              label="Label text"
              value={2}
              data={optionData}
              placeholder="Placeholder text"
            />
          </div>
        </div>
      </div>

      {/* Bottom Section: All Select Types */}
      <div>
        <h2 className="text-lg font-bold mb-6">All Select Types</h2>
        <div className="grid grid-cols-2 gap-8">
          {/* Tree Select */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-4 text-purple-600">
              TREE SELECT (MULTI)
            </h3>
            <TreeSelectField
              label="Label text"
              data={treeData}
              placeholder="Search"
            />
          </div>

          {/* Single Select with Option Value */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-4 text-purple-600">
              SINGLE SELECT/OPTION VALUE
            </h3>
            <SelectField
              label="Label text"
              data={optionData}
              placeholder="Search"
            />
          </div>

          {/* Multi Select with Option Value */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-4 text-purple-600">
              MULTI SELECT/OPTION VALUE
            </h3>
            <MultiSelectField
              label="Label text"
              data={optionData}
              placeholder="Search"
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Complete design showcase matching the Figma specifications.",
      },
    },
  },
};

// Comprehensive State Comparison
export const AllStatesComparison: Story = {
  render: () => (
    <div className="p-8 bg-gray-50">
      <h2 className="text-lg font-bold mb-6">
        All States Across All Component Types
      </h2>
      <div className="grid grid-cols-3 gap-6">
        {/* Headers */}
        <div className="font-semibold text-center">SelectField</div>
        <div className="font-semibold text-center">MultiSelectField</div>
        <div className="font-semibold text-center">TreeSelectField</div>

        {/* Default State */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">DEFAULT</p>
          <SelectField label="Label" data={optionData} placeholder="Select" />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">DEFAULT</p>
          <MultiSelectField
            label="Label"
            data={optionData}
            placeholder="Select"
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">DEFAULT</p>
          <TreeSelectField label="Label" data={treeData} placeholder="Select" />
        </div>

        {/* With Value */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">WITH VALUE</p>
          <SelectField
            label="Label"
            value={1}
            data={optionData}
            placeholder="Select"
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">WITH VALUES</p>
          <MultiSelectField
            label="Label"
            value={[1, 2]}
            data={optionData}
            placeholder="Select"
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">WITH VALUES</p>
          <TreeSelectField
            label="Label"
            value={["item-1", "item-2"]}
            data={treeData}
            placeholder="Select"
          />
        </div>

        {/* Required */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">REQUIRED</p>
          <SelectField
            label="Label"
            required
            data={optionData}
            placeholder="Select"
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">REQUIRED</p>
          <MultiSelectField
            label="Label"
            required
            data={optionData}
            placeholder="Select"
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">REQUIRED</p>
          <TreeSelectField
            label="Label"
            required
            data={treeData}
            placeholder="Select"
          />
        </div>

        {/* With Help Message */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">WITH HELP</p>
          <SelectField
            label="Label"
            helpMessage="Help text"
            data={optionData}
            placeholder="Select"
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">WITH HELP</p>
          <MultiSelectField
            label="Label"
            helpMessage="Help text"
            data={optionData}
            placeholder="Select"
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">WITH HELP</p>
          <TreeSelectField
            label="Label"
            helpMessage="Help text"
            data={treeData}
            placeholder="Select"
          />
        </div>

        {/* Error State */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">ERROR</p>
          <SelectField
            label="Label"
            error
            helpMessage="Error message"
            data={optionData}
            placeholder="Select"
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">ERROR</p>
          <MultiSelectField
            label="Label"
            error
            helpMessage="Error message"
            data={optionData}
            placeholder="Select"
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">ERROR</p>
          <TreeSelectField
            label="Label"
            error
            helpMessage="Error message"
            data={treeData}
            placeholder="Select"
          />
        </div>

        {/* Disabled State */}
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">DISABLED</p>
          <SelectField
            label="Label"
            disabled
            value={1}
            data={optionData}
            placeholder="Select"
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">DISABLED</p>
          <MultiSelectField
            label="Label"
            disabled
            value={[1, 2]}
            data={optionData}
            placeholder="Select"
          />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-xs text-blue-600 mb-2">DISABLED</p>
          <TreeSelectField
            label="Label"
            disabled
            value={["item-1"]}
            data={treeData}
            placeholder="Select"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Side-by-side comparison of all states across all three select component types.",
      },
    },
  },
};
