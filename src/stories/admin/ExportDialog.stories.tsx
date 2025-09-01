import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { ExportDialog } from "@/components/admin/ExportDialog";
import { ExportFormat } from "@/types/user";

// Interactive wrapper for Storybook
const InteractiveExportDialog = (props: React.ComponentProps<typeof ExportDialog>) => {
  const [open, setOpen] = useState(props.open || false);

  const handleExport = async (format: ExportFormat, fields?: string[]) => {
    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setOpen(false);
    props.onExport(format, fields);
  };

  const handleClose = () => {
    setOpen(false);
    props.onClose();
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Open Export Dialog
      </button>
      <ExportDialog
        {...props}
        open={open}
        onClose={handleClose}
        onExport={handleExport}
      />
    </div>
  );
};

const meta: Meta<typeof ExportDialog> = {
  title: "Admin/ExportDialog",
  component: InteractiveExportDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive dialog for exporting user data. Features format selection (CSV, Excel, JSON), field selection, filtering options, and progress tracking.",
      },
    },
  },
  argTypes: {
    open: {
      description: "Whether the dialog is open",
      control: { type: "boolean" },
    },
    totalRecords: {
      description: "Total number of records available for export",
      control: { type: "number", min: 0 },
    },
    filteredRecords: {
      description: "Number of records after applying filters",
      control: { type: "number", min: 0 },
    },
    availableFields: {
      description: "Available fields for export selection",
      control: { type: "object" },
    },
    isExporting: {
      description: "Whether export is in progress",
      control: { type: "boolean" },
    },
    onOpenChange: {
      description: "Callback when dialog open state changes",
      action: "openChange",
    },
    onExport: {
      description: "Callback when export is initiated",
      action: "export",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ExportDialog>;

// Available fields for export
const defaultAvailableFields = [
  { key: "id", label: "User ID", description: "Unique identifier" },
  { key: "email", label: "Email Address", description: "User's email address" },
  { key: "first_name", label: "First Name", description: "User's first name" },
  { key: "last_name", label: "Last Name", description: "User's last name" },
  {
    key: "full_name",
    label: "Full Name",
    description: "Combined first and last name",
  },
  {
    key: "is_active",
    label: "Active Status",
    description: "Whether user is active",
  },
  { key: "role", label: "Role", description: "User's assigned role" },
  {
    key: "created_at",
    label: "Created Date",
    description: "Account creation date",
  },
  { key: "updated_at", label: "Updated Date", description: "Last update date" },
  {
    key: "last_login",
    label: "Last Login",
    description: "Last login timestamp",
  },
  {
    key: "activity_status",
    label: "Activity Status",
    description: "Online/offline status",
  },
  {
    key: "locale",
    label: "Language",
    description: "User's preferred language",
  },
  { key: "age", label: "Age", description: "User's age" },
  { key: "address", label: "Address", description: "User's address" },
];

export const Default: Story = {
  args: {
    open: false,
    totalRecords: 1250,
    onExport: fn(),
  },
};

export const WithFilters: Story = {
  args: {
    open: false,
    totalRecords: 1250,
    filteredRecords: 89,
    onExport: fn(),
  },
};

export const SmallDataset: Story = {
  args: {
    open: false,
    totalRecords: 25,
    onExport: fn(),
  },
};

export const LargeDataset: Story = {
  args: {
    open: false,
    totalRecords: 50000,
    filteredRecords: 50000,
    onExport: fn(),
  },
};

export const HeavilyFiltered: Story = {
  args: {
    open: false,
    totalRecords: 10000,
    filteredRecords: 3,
    onExport: fn(),
  },
};

export const MinimalFields: Story = {
  args: {
    open: false,
    totalRecords: 1250,
    availableFields: [
      { key: "id", label: "User ID", description: "Unique identifier" },
      {
        key: "email",
        label: "Email Address",
        description: "User's email address",
      },
      {
        key: "full_name",
        label: "Full Name",
        description: "Combined first and last name",
      },
      {
        key: "is_active",
        label: "Active Status",
        description: "Whether user is active",
      },
    ],
    onExport: fn(),
  },
};

export const ExtensiveFields: Story = {
  args: {
    open: false,
    totalRecords: 1250,
    availableFields: [
      ...defaultAvailableFields,
      {
        key: "birthday",
        label: "Birthday",
        description: "User's date of birth",
      },
      { key: "sex", label: "Gender", description: "User's gender" },
      { key: "coin", label: "Coins", description: "User's coin balance" },
      {
        key: "group_id",
        label: "Group ID",
        description: "User's group identifier",
      },
      {
        key: "slack_webhook_url",
        label: "Slack Webhook",
        description: "Slack integration URL",
      },
      {
        key: "remember_token",
        label: "Remember Token",
        description: "Authentication token",
      },
      {
        key: "deleted_at",
        label: "Deleted Date",
        description: "Soft deletion timestamp",
      },
    ],
    onExport: fn(),
  },
};

export const ExportingState: Story = {
  args: {
    open: false,
    totalRecords: 1250,
    onExport: fn(),
  },
};

export const OpenByDefault: Story = {
  args: {
    open: true,
    totalRecords: 1250,
    onExport: fn(),
  },
};

export const NoRecords: Story = {
  args: {
    open: false,
    totalRecords: 0,
    onExport: fn(),
  },
};

export const ExportingLargeDataset: Story = {
  args: {
    open: true,
    totalRecords: 100000,
    onExport: fn(),
  },
};

export const CustomFieldLabels: Story = {
  args: {
    open: false,
    totalRecords: 1250,
    availableFields: [
      { key: "id", label: "🆔 User ID", description: "Unique user identifier" },
      { key: "email", label: "📧 Email", description: "Primary email address" },
      {
        key: "full_name",
        label: "👤 Full Name",
        description: "Complete user name",
      },
      {
        key: "is_active",
        label: "✅ Status",
        description: "Account active status",
      },
      { key: "role", label: "🛡️ Role", description: "User permission role" },
      {
        key: "created_at",
        label: "📅 Created",
        description: "Account creation date",
      },
      {
        key: "last_login",
        label: "🕐 Last Login",
        description: "Most recent login",
      },
    ],
    onExport: fn(),
  },
};
