import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { DateRangeFilter } from "@/components/admin/filters/DateRangeFilter";

// Interactive wrapper for Storybook
const InteractiveDateRangeFilter = (props: any) => {
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  } | null>(props.dateRange || null);

  const handleDateRangeChange = (
    range: { from: Date | null; to: Date | null } | null
  ) => {
    setDateRange(range);
    props.onDateRangeChange(range);
  };

  return (
    <DateRangeFilter
      {...props}
      dateRange={dateRange}
      onDateRangeChange={handleDateRangeChange}
    />
  );
};

const meta: Meta<typeof DateRangeFilter> = {
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
    dateRange: {
      description: "Currently selected date range",
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
    showPresets: {
      description: "Whether to show preset date ranges",
      control: { type: "boolean" },
    },
    maxDate: {
      description: "Maximum selectable date",
      control: { type: "date" },
    },
    minDate: {
      description: "Minimum selectable date",
      control: { type: "date" },
    },
    onDateRangeChange: {
      description: "Callback when date range changes",
      action: "dateRangeChange",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DateRangeFilter>;

const today = new Date();
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
const lastYear = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

export const Default: Story = {
  args: {
    dateRange: null,
    label: "Created Date",
    placeholder: "Select date range...",
    disabled: false,
    showPresets: true,
    onDateRangeChange: fn(),
  },
};

export const WithRange: Story = {
  args: {
    dateRange: {
      from: lastWeek,
      to: today,
    },
    label: "Created Date",
    placeholder: "Select date range...",
    disabled: false,
    showPresets: true,
    onDateRangeChange: fn(),
  },
};

export const LastLoginFilter: Story = {
  args: {
    dateRange: null,
    label: "Last Login",
    placeholder: "Filter by last login date...",
    disabled: false,
    showPresets: true,
    onDateRangeChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Date range filter configured for filtering by last login date.",
      },
    },
  },
};

export const ActivityFilter: Story = {
  args: {
    dateRange: {
      from: lastMonth,
      to: today,
    },
    label: "Activity Period",
    placeholder: "Select activity period...",
    disabled: false,
    showPresets: true,
    onDateRangeChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Date range filter for filtering by user activity period.",
      },
    },
  },
};

export const WithoutPresets: Story = {
  args: {
    dateRange: null,
    label: "Custom Date Range",
    placeholder: "Select custom date range...",
    disabled: false,
    showPresets: false,
    onDateRangeChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Date range filter without preset options.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    dateRange: {
      from: lastWeek,
      to: today,
    },
    label: "Created Date",
    placeholder: "Select date range...",
    disabled: true,
    showPresets: true,
    onDateRangeChange: fn(),
  },
};

export const WithDateLimits: Story = {
  args: {
    dateRange: null,
    label: "Registration Date",
    placeholder: "Select registration period...",
    disabled: false,
    showPresets: true,
    minDate: lastYear,
    maxDate: today,
    onDateRangeChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Date range filter with minimum and maximum date limits.",
      },
    },
  },
};

export const SingleDateSelected: Story = {
  args: {
    dateRange: {
      from: today,
      to: null,
    },
    label: "Start Date",
    placeholder: "Select start date...",
    disabled: false,
    showPresets: true,
    onDateRangeChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Date range filter with only start date selected.",
      },
    },
  },
};

export const LongLabel: Story = {
  args: {
    dateRange: null,
    label: "User Account Creation and Registration Date Range",
    placeholder:
      "Select the date range for when user accounts were created and registered in the system...",
    disabled: false,
    showPresets: true,
    onDateRangeChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: "Date range filter with long label and placeholder text.",
      },
    },
  },
};

export const InteractiveDemo: Story = {
  render: (args) => {
    const [dateRange, setDateRange] = useState<{
      from: Date | null;
      to: Date | null;
    } | null>(null);
    const [showPresets, setShowPresets] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [label, setLabel] = useState("Created Date");

    const handleDateRangeChange = (
      range: { from: Date | null; to: Date | null } | null
    ) => {
      setDateRange(range);
      args.onDateRangeChange?.(range);
    };

    const formatDate = (date: Date | null) => {
      return date ? date.toLocaleDateString() : "Not set";
    };

    const getDaysDifference = () => {
      if (!dateRange?.from || !dateRange?.to) return null;
      const diffTime = Math.abs(
        dateRange.to.getTime() - dateRange.from.getTime()
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Filter Label:</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter filter label..."
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showPresets}
                onChange={(e) => setShowPresets(e.target.checked)}
              />
              Show Presets
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />
              Disabled
            </label>
          </div>

          <DateRangeFilter
            dateRange={dateRange}
            label={label}
            placeholder="Select date range..."
            disabled={disabled}
            showPresets={showPresets}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-medium">Selected Range:</h4>
          <div className="text-sm space-y-1">
            <p>
              <strong>From:</strong> {formatDate(dateRange?.from || null)}
            </p>
            <p>
              <strong>To:</strong> {formatDate(dateRange?.to || null)}
            </p>
            {getDaysDifference() && (
              <p>
                <strong>Duration:</strong> {getDaysDifference()} days
              </p>
            )}
          </div>
          {!dateRange && (
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
