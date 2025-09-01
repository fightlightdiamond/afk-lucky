import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { DateRangeFilter } from "@/components/admin/filters/DateRangeFilter";

// Interactive wrapper for Storybook
const InteractiveDateRangeFilter = (props: {
  value?: { from: Date | null; to: Date | null } | null;
  onChange: (range: { from: Date | null; to: Date | null } | null) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  presets?: Array<{ label: string; value: { from: Date | null; to: Date | null } }>;
}) => {
  const [value, setValue] = useState<{ from: Date | null; to: Date | null } | null>(
    props.value || null
  );

  const handleChange = (range: { from: Date | null; to: Date | null } | null) => {
    setValue(range);
    props.onChange(range);
  };

  return (
    <DateRangeFilter
      value={value}
      onChange={handleChange}
      disabled={props.disabled}
      label={props.label}
      placeholder={props.placeholder}
      presets={props.presets}
    />
  );
};

const meta: Meta<typeof InteractiveDateRangeFilter> = {
  title: "Admin/Filters/DateRangeFilter",
  component: InteractiveDateRangeFilter,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A date range filter component for filtering users by creation date, last login, or other date fields. Features calendar picker, preset ranges, and accessibility support.",
      },
    },
  },
  argTypes: {
    value: {
      description: "Current date range selection",
      control: { type: "object" },
    },
    label: {
      description: "Label for the date range filter",
      control: { type: "text" },
    },
    placeholder: {
      description: "Placeholder text for the date range input",
      control: { type: "text" },
    },
    disabled: {
      description: "Whether the filter is disabled",
      control: { type: "boolean" },
    },
    presets: {
      description: "Preset date ranges to show",
      control: { type: "object" },
    },
    onChange: {
      description: "Callback when date range changes",
      action: "dateRangeChanged",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InteractiveDateRangeFilter>;

const today = new Date();
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
const lastYear = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

export const Default: Story = {
  args: {
    value: null,
    onChange: fn(),
    disabled: false,
    label: "Date Range",
  },
};

export const WithSelectedRange: Story = {
  args: {
    value: {
      from: new Date(2024, 0, 1),
      to: new Date(2024, 0, 31),
    },
    onChange: fn(),
    disabled: false,
    label: "Date Range",
  },
};

export const LastLoginFilter: Story = {
  args: {
    value: null,
    onChange: fn(),
    disabled: false,
    label: "Last Login",
  },
};

export const WithCustomLabel: Story = {
  args: {
    value: null,
    onChange: fn(),
    disabled: false,
    label: "Custom Date Range Label",
  },
};

export const WithoutPresets: Story = {
  args: {
    value: null,
    onChange: fn(),
    disabled: false,
    label: "Custom Date Range",
    presets: undefined,
  },
};

export const Disabled: Story = {
  args: {
    value: {
      from: new Date(2024, 0, 1),
      to: new Date(2024, 0, 31),
    },
    onChange: fn(),
    disabled: true,
    label: "Date Range (Disabled)",
  },
};

export const WithDateLimits: Story = {
  args: {
    value: null,
    onChange: fn(),
    disabled: false,
    label: "Registration Date",
  },
};

export const InteractiveDemo: Story = {
  render: function InteractiveDemoRender(args) {
    const [value, setValue] = useState<{ from: Date | null; to: Date | null } | null>(
      args.value || null
    );

    const getDaysDifference = () => {
      if (!value?.from || !value?.to) return 0;
      const diffTime = Math.abs(value.to.getTime() - value.from.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
      <div className="p-4 space-y-4">
        <div className="text-sm text-muted-foreground">
          This story demonstrates the DateRangeFilter component with interactive
          state management.
        </div>
        <DateRangeFilter
          value={value}
          onChange={setValue}
          {...args}
        />
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-2">Current Selection:</div>
          <pre className="text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
          {value?.from && value?.to && (
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Duration:</strong> {getDaysDifference()} days
            </p>
          )}
          {!value && (
            <p className="text-sm text-muted-foreground">
              No date range selected
            </p>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Tip:</strong> Try the preset buttons for quick date range
            selection!
          </p>
        </div>
      </div>
    );
  },
};
