import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SelectField from "./SelectField";

/**
 * SelectField Stories - A custom select field component with label, help message, and error states
 */

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
- **Label Support**: Optional label with required indicator
- **Prefix Options**: Text or icon prefix, inside or outside the input
- **Help Messages**: Contextual help text with icons
- **Error States**: Visual error indication with custom styling
- **Badge Support**: Display badge for selected values
- **Disabled State**: Full disabled state support

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
    label: {
      control: { type: "text" },
      description: "Label text for the select field",
    },
    required: {
      control: { type: "boolean" },
      description: "Shows required indicator (*)",
    },
    helpMessage: {
      control: { type: "text" },
      description: "Help text displayed below the field",
    },
    error: {
      control: { type: "boolean" },
      description: "Error state styling",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disables the select field",
    },
    prefixText: {
      control: { type: "text" },
      description: "Text prefix for the input",
    },
    prefixInside: {
      control: { type: "boolean" },
      description: "Places prefix inside the input border",
    },
    badge: {
      control: { type: "text" },
      description: "Badge text shown when value is selected",
    },
    placeholder: {
      control: { type: "text" },
      description: "Placeholder text",
    },
    searchable: {
      control: { type: "boolean" },
      description: "Enable search functionality in dropdown",
      table: {
        defaultValue: { summary: "false" },
      },
    },
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
        "autoHorizontalStart",
        "autoHorizontalEnd",
      ],
      description: "Dropdown menu placement (rsuite prop)",
      table: {
        defaultValue: { summary: "bottomStart" },
      },
    },
    menuMaxHeight: {
      control: { type: "number" },
      description: "Max height of dropdown menu",
      table: {
        defaultValue: { summary: "320" },
      },
    },
    menuClassName: {
      control: { type: "text" },
      description: "Custom className for dropdown menu",
    },
    menuStyle: {
      control: { type: "object" },
      description: "Custom style for dropdown menu",
    },
    preventOverflow: {
      control: { type: "boolean" },
      description: "Prevent dropdown from overflowing viewport",
      table: {
        defaultValue: { summary: "true" },
      },
    },
    virtualized: {
      control: { type: "boolean" },
      description: "Use virtualized list for large datasets",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    renderMenu: {
      description: "Custom render function for dropdown menu",
      table: {
        type: { summary: "(menu: ReactNode) => ReactNode" },
      },
    },
    renderMenuItem: {
      description: "Custom render function for menu items",
      table: {
        type: {
          summary: "(label: ReactNode, item: ItemDataType) => ReactNode",
        },
      },
    },
    renderValue: {
      description: "Custom render function for selected value",
      table: {
        type: { summary: "(value: any, item: ItemDataType) => ReactNode" },
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

// Basic Examples
export const Default: Story = {
  args: {
    label: "Select Field",
  },
};

export const WithValue: Story = {
  args: {
    label: "Select Field",
    value: 2,
  },
};

export const Required: Story = {
  args: {
    label: "Select Field",
    required: true,
  },
};

export const WithHelpMessage: Story = {
  args: {
    label: "Select Field",
    helpMessage: "This is a help message",
  },
};

export const WithError: Story = {
  args: {
    label: "Select Field",
    error: true,
    helpMessage: "This field has an error",
  },
};

export const Disabled: Story = {
  args: {
    label: "Select Field",
    disabled: true,
    value: 1,
  },
};

// Prefix Examples
export const WithPrefixText: Story = {
  args: {
    label: "Select Field",
    prefixText: "Prefix",
  },
};

export const WithPrefixTextInside: Story = {
  args: {
    label: "Select Field",
    prefixText: "Prefix",
    prefixInside: true,
  },
};

export const WithPrefixIcon: Story = {
  args: {
    label: "Select Field with Icon",
    prefixIcon: (
      <svg className="block size-full" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="#282C3B" />
      </svg>
    ),
  },
};

export const WithPrefixIconInside: Story = {
  args: {
    label: "Select Field",
    prefixIcon: (
      <svg className="block size-full" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6" fill="#282C3B" />
      </svg>
    ),
    prefixInside: true,
  },
};

// Badge Examples
export const WithBadge: Story = {
  args: {
    label: "Select Field",
    value: 2,
    badge: "NEW",
  },
};

export const WithBadgeAndPrefix: Story = {
  args: {
    label: "Select Field",
    value: 2,
    badge: "PRO",
    prefixText: "Type",
  },
};

// Complex Examples
export const CompleteExample: Story = {
  args: {
    label: "Complete Select Field",
    required: true,
    helpMessage: "Please select an option from the list",
    prefixText: "Category",
    value: 1,
    badge: "NEW",
  },
};

export const ErrorWithAllFeatures: Story = {
  args: {
    label: "Select Field with Error",
    required: true,
    error: true,
    helpMessage: "This field is required",
    prefixText: "Type",
    prefixInside: true,
  },
};

// Dropdown States Demo
export const DropdownStates: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8 p-8">
      {/* Default State */}
      <div>
        <h4 className="text-xs font-semibold mb-2 text-gray-500">DEFAULT</h4>
        <SelectField
          label="Label text"
          data={[
            { label: "Item 1", value: 1 },
            { label: "Item 2", value: 2 },
            { label: "Item 3", value: 3 },
          ]}
          placeholder="Placeholder text"
        />
      </div>

      {/* Active (Select from Box) */}
      <div>
        <h4 className="text-xs font-semibold mb-2 text-gray-500">
          ACTIVE (SELECT FROM BOX)
        </h4>
        <SelectField
          label="Label text"
          data={[
            { label: "Item 1", value: 1 },
            { label: "Item 2", value: 2 },
            { label: "Item 3", value: 3 },
            { label: "Item 4", value: 4 },
            { label: "Item 5", value: 5 },
          ]}
          placeholder="Placeholder text"
          defaultOpen
        />
      </div>

      {/* Active (Has Value) */}
      <div>
        <h4 className="text-xs font-semibold mb-2 text-gray-500">
          ACTIVE (HAS VALUE)
        </h4>
        <SelectField
          label="Label text"
          value={2}
          data={[
            { label: "Item 1", value: 1 },
            { label: "Item 2", value: 2 },
            { label: "Item 3", value: 3 },
          ]}
          placeholder="Placeholder text"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Different states of the select field as shown in the design.",
      },
    },
  },
};

// Item States in Dropdown
export const ItemStates: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      {/* Single Select */}
      <div>
        <h4 className="text-xs font-semibold mb-4 text-purple-600">
          SINGLE SELECT
        </h4>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-blue-600 mb-2">DEFAULT</p>
            <SelectField
              data={[{ label: "Item", value: 1 }]}
              placeholder="Search"
            />
          </div>
          <div>
            <p className="text-xs text-blue-600 mb-2">HOVER+TRUE</p>
            <SelectField
              data={[{ label: "Item", value: 1 }]}
              placeholder="Search"
            />
          </div>
          <div>
            <p className="text-xs text-blue-600 mb-2">ACTIVE+TRUE</p>
            <SelectField
              data={[{ label: "Item", value: 1 }]}
              value={1}
              placeholder="Search"
            />
          </div>
        </div>
      </div>

      {/* Multi Select */}
      <div>
        <h4 className="text-xs font-semibold mb-4 text-purple-600">
          MULTI SELECT/TREE NODE
        </h4>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-blue-600 mb-2">DEFAULT</p>
            <SelectField
              data={[
                { label: "Item", value: 1 },
                { label: "Item", value: 2 },
              ]}
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
        story: "Different item states within the dropdown menu.",
      },
    },
  },
};

// Showcase All States
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[300px]">
      <SelectField
        label="Default"
        data={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
        ]}
      />
      <SelectField
        label="With Value"
        value={1}
        data={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
        ]}
      />
      <SelectField
        label="Required"
        required
        data={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
        ]}
      />
      <SelectField
        label="With Help"
        helpMessage="This is a help message"
        data={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
        ]}
      />
      <SelectField
        label="Error State"
        error
        helpMessage="This field has an error"
        data={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
        ]}
      />
      <SelectField
        label="Disabled"
        disabled
        value={1}
        data={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All available states displayed together for comparison.",
      },
    },
  },
};

// Prefix All Variants - Complete Overview
export const PrefixAllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-[900px] p-6">
      <div className="grid grid-cols-2 gap-8">
        {/* insidePrefixe = false (Outside Border) */}
        <div className="border-2 border-blue-200 p-4 rounded">
          <h3 className="text-lg font-bold mb-4 text-blue-600">
            insidePrefixe = FALSE (Outside Border)
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">
                HASTEXT? = FALSE (Icon)
              </p>
              <SelectField
                label="Label text"
                prefixIcon={
                  <svg
                    className="block size-full"
                    fill="none"
                    viewBox="0 0 16 16"
                  >
                    <circle cx="8" cy="8" r="6" fill="#282C3B" />
                  </svg>
                }
                prefixInside={false}
                data={[
                  { label: "Option 1", value: 1 },
                  { label: "Option 2", value: 2 },
                ]}
                placeholder="Placeholder text"
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">
                HASTEXT? = TRUE (Text)
              </p>
              <SelectField
                label="Label text"
                prefixText="Text"
                prefixInside={false}
                data={[
                  { label: "Option 1", value: 1 },
                  { label: "Option 2", value: 2 },
                ]}
                placeholder="Placeholder text"
              />
            </div>
          </div>
        </div>

        {/* insideTrue (Inside Border) */}
        <div className="border-2 border-green-200 p-4 rounded">
          <h3 className="text-lg font-bold mb-4 text-green-600">
            insideTrue (Inside Border)
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">
                HASTEXT? = FALSE (Icon)
              </p>
              <SelectField
                label="Label text"
                prefixIcon={
                  <svg
                    className="block size-full"
                    fill="none"
                    viewBox="0 0 16 16"
                  >
                    <circle cx="8" cy="8" r="6" fill="#282C3B" />
                  </svg>
                }
                prefixInside={true}
                data={[
                  { label: "Option 1", value: 1 },
                  { label: "Option 2", value: 2 },
                ]}
                placeholder="Placeholder text"
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">
                HASTEXT? = TRUE (Text)
              </p>
              <SelectField
                label="Label text"
                prefixText="Text"
                prefixInside={true}
                data={[
                  { label: "Option 1", value: 1 },
                  { label: "Option 2", value: 2 },
                ]}
                placeholder="Placeholder text"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Complete overview of all prefix variants: Outside/Inside border × Icon/Text combinations",
      },
    },
  },
};

// Prefix Testing Stories - Task 7.1 & 7.2
export const PrefixTextVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-[400px] p-6">
      <div>
        <h4 className="text-sm font-semibold mb-4 text-gray-700">
          Prefix Text - Outside Border (prefixInside=false)
        </h4>
        <div className="flex flex-col gap-4">
          <SelectField
            label="Default State"
            prefixText="USD"
            prefixInside={false}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
            placeholder="Select amount"
          />
          <SelectField
            label="With Value"
            prefixText="USD"
            prefixInside={false}
            value={1}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
          />
          <SelectField
            label="Disabled"
            prefixText="USD"
            prefixInside={false}
            disabled
            value={1}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-4 text-gray-700">
          Prefix Text - Inside Border (prefixInside=true, background #F1F3F8)
        </h4>
        <div className="flex flex-col gap-4">
          <SelectField
            label="Default State"
            prefixText="USD"
            prefixInside={true}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
            placeholder="Select amount"
          />
          <SelectField
            label="With Value"
            prefixText="USD"
            prefixInside={true}
            value={1}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
          />
          <SelectField
            label="Disabled"
            prefixText="USD"
            prefixInside={true}
            disabled
            value={1}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Testing prefix text variants with prefixInside=true (background #F1F3F8, inside border) and prefixInside=false (no background, outside border). Requirements: 6.1, 6.3, 6.4",
      },
    },
  },
};

export const PrefixIconVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-[400px] p-6">
      <div>
        <h4 className="text-sm font-semibold mb-4 text-gray-700">
          Prefix Icon - Outside Border (prefixInside=false, 16px size)
        </h4>
        <div className="flex flex-col gap-4">
          <SelectField
            label="Default State"
            prefixIcon={
              <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" fill="#282C3B" />
              </svg>
            }
            prefixInside={false}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
            placeholder="Select option"
          />
          <SelectField
            label="With Value"
            prefixIcon={
              <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                <path
                  d="M8 2L10 6L14 6.5L11 9.5L12 14L8 11.5L4 14L5 9.5L2 6.5L6 6L8 2Z"
                  fill="#282C3B"
                />
              </svg>
            }
            prefixInside={false}
            value={1}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
          />
          <SelectField
            label="Disabled"
            prefixIcon={
              <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                <rect x="2" y="2" width="12" height="12" fill="#787E95" />
              </svg>
            }
            prefixInside={false}
            disabled
            value={1}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-4 text-gray-700">
          Prefix Icon - Inside Border (prefixInside=true, background #F1F3F8,
          16px size)
        </h4>
        <div className="flex flex-col gap-4">
          <SelectField
            label="Default State"
            prefixIcon={
              <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" fill="#282C3B" />
              </svg>
            }
            prefixInside={true}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
            placeholder="Select option"
          />
          <SelectField
            label="With Value"
            prefixIcon={
              <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                <path
                  d="M8 2L10 6L14 6.5L11 9.5L12 14L8 11.5L4 14L5 9.5L2 6.5L6 6L8 2Z"
                  fill="#282C3B"
                />
              </svg>
            }
            prefixInside={true}
            value={1}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
          />
          <SelectField
            label="Disabled"
            prefixIcon={
              <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                <rect x="2" y="2" width="12" height="12" fill="#787E95" />
              </svg>
            }
            prefixInside={true}
            disabled
            value={1}
            data={[
              { label: "Option 1", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Testing prefix icon variants with 16px size. Tests prefixInside=true and false, ensuring 10px gap between prefix and value. Requirements: 6.2, 6.5",
      },
    },
  },
};

export const PrefixGapVerification: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[400px] p-6">
      <div className="border-2 border-blue-300 p-4 rounded">
        <p className="text-xs text-blue-600 mb-4 font-semibold">
          Gap Verification: 10px between prefix and value
        </p>
        <div className="flex flex-col gap-4">
          <SelectField
            label="Prefix Text + Value"
            prefixText="Type"
            value={1}
            data={[
              { label: "Long Option Name Here", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
          />
          <SelectField
            label="Prefix Icon + Value"
            prefixIcon={
              <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="6" fill="#2196F3" />
              </svg>
            }
            value={1}
            data={[
              { label: "Long Option Name Here", value: 1 },
              { label: "Option 2", value: 2 },
            ]}
          />
          <SelectField
            label="Prefix Text Inside + Value"
            prefixText="USD"
            prefixInside={true}
            value={1}
            data={[
              { label: "1,000.00", value: 1 },
              { label: "2,000.00", value: 2 },
            ]}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Verification of 10px gap between prefix and input value. Requirement: 6.5",
      },
    },
  },
};

export const PrefixWithOtherFeatures: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-[400px] p-6">
      <SelectField
        label="Prefix + Badge"
        prefixText="Type"
        value={1}
        badge="NEW"
        data={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
        ]}
      />
      <SelectField
        label="Prefix + Error"
        prefixText="Category"
        error
        helpMessage="This field is required"
        data={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
        ]}
      />
      <SelectField
        label="Prefix Inside + Badge + Help"
        prefixText="USD"
        prefixInside={true}
        value={2}
        badge="PRO"
        helpMessage="Premium feature"
        data={[
          { label: "100.00", value: 1 },
          { label: "200.00", value: 2 },
        ]}
      />
      <SelectField
        label="Prefix Icon + Required + Error"
        required
        error
        prefixIcon={
          <svg className="block size-full" fill="none" viewBox="0 0 16 16">
            <path
              d="M8 2L10 6L14 6.5L11 9.5L12 14L8 11.5L4 14L5 9.5L2 6.5L6 6L8 2Z"
              fill="#D05C4E"
            />
          </svg>
        }
        helpMessage="Please select a rating"
        data={[
          { label: "1 Star", value: 1 },
          { label: "2 Stars", value: 2 },
          { label: "3 Stars", value: 3 },
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Testing prefix functionality combined with other features (badge, error, help message, required).",
      },
    },
  },
};

// Real-world Examples
export const FormExample: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[400px] p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">User Information</h3>
      <SelectField
        label="Country"
        required
        data={[
          { label: "Vietnam", value: "vn" },
          { label: "United States", value: "us" },
          { label: "Japan", value: "jp" },
          { label: "Korea", value: "kr" },
        ]}
        helpMessage="Select your country"
      />
      <SelectField
        label="Language"
        required
        prefixText="Lang"
        data={[
          { label: "Vietnamese", value: "vi" },
          { label: "English", value: "en" },
          { label: "Japanese", value: "ja" },
        ]}
      />
      <SelectField
        label="Subscription Plan"
        value="pro"
        badge="PRO"
        data={[
          { label: "Free", value: "free" },
          { label: "Pro", value: "pro" },
          { label: "Enterprise", value: "enterprise" },
        ]}
        helpMessage="Current plan: Pro"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Example of select fields used in a form.",
      },
    },
  },
};

export const ValidationExample: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[400px]">
      <SelectField
        label="Valid Field"
        value={1}
        helpMessage="This field is valid"
        data={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
        ]}
      />
      <SelectField
        label="Invalid Field"
        required
        error
        helpMessage="Please select an option"
        data={[
          { label: "Option 1", value: 1 },
          { label: "Option 2", value: 2 },
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Example showing validation states.",
      },
    },
  },
};
