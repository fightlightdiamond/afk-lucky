import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import React, { useState } from "react";
import { ImportOptionsForm } from "@/components/admin/ImportOptionsForm";
import { ImportOptions, Role, UserRole } from "@/types/user";

// Interactive wrapper for Storybook
const ImportOptionsFormWrapper = (args: React.ComponentProps<typeof ImportOptionsForm>) => {
  const [options, setOptions] = useState<ImportOptions>(args.options);

  const handleOptionsChange = (newOptions: ImportOptions) => {
    setOptions(newOptions);
    args.onChange?.(newOptions);
  };

  return (
    <ImportOptionsForm
      {...args}
      options={options}
      onChange={handleOptionsChange}
    />
  );
};

const meta: Meta<typeof ImportOptionsFormWrapper> = {
  title: "Admin/ImportOptionsForm",
  component: ImportOptionsFormWrapper,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Configuration form for import options including duplicate handling, validation settings, default values, and user notifications. Provides comprehensive control over the import process.",
      },
    },
  },
  argTypes: {
    options: {
      description: "Current import options configuration",
      control: { type: "object" },
    },
    roles: {
      description: "Available roles for default assignment",
      control: { type: "object" },
    },
  },
  args: {
    onChange: fn(),
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImportOptionsForm>;

// Sample roles for testing
const sampleRoles: Role[] = [
  {
    id: "role-admin",
    name: UserRole.ADMIN,
    description: "System Administrator",
    permissions: ["user:read", "user:write", "user:delete", "system:admin"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-editor",
    name: UserRole.EDITOR,
    description: "Content Editor",
    permissions: ["content:read", "content:write", "user:read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-moderator",
    name: UserRole.MODERATOR,
    description: "Content Moderator",
    permissions: ["content:moderate", "user:moderate", "user:read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-user",
    name: UserRole.USER,
    description: "Regular User",
    permissions: ["user:read"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Default import options
const defaultOptions: ImportOptions = {
  skipDuplicates: false,
  updateExisting: true,
  skipInvalidRows: true,
  defaultRole: undefined,
  defaultStatus: true,
  sendWelcomeEmail: false,
  requirePasswordReset: true,
};

export const Default: Story = {
  args: {
    options: defaultOptions,
    roles: sampleRoles,
  },
};

export const SkipDuplicates: Story = {
  args: {
    options: {
      ...defaultOptions,
      skipDuplicates: true,
      updateExisting: false, // Disabled when skip duplicates is on
    },
    roles: sampleRoles,
  },
};

export const UpdateExisting: Story = {
  args: {
    options: {
      ...defaultOptions,
      skipDuplicates: false,
      updateExisting: true,
    },
    roles: sampleRoles,
  },
};

export const StrictValidation: Story = {
  args: {
    options: {
      ...defaultOptions,
      skipInvalidRows: false, // Don't skip invalid rows
    },
    roles: sampleRoles,
  },
};

export const WithDefaultRole: Story = {
  args: {
    options: {
      ...defaultOptions,
      defaultRole: "role-user",
    },
    roles: sampleRoles,
  },
};

export const InactiveByDefault: Story = {
  args: {
    options: {
      ...defaultOptions,
      defaultStatus: false, // Users inactive by default
    },
    roles: sampleRoles,
  },
};

export const WithNotifications: Story = {
  args: {
    options: {
      ...defaultOptions,
      sendWelcomeEmail: true,
      requirePasswordReset: true,
    },
    roles: sampleRoles,
  },
};

export const NoNotifications: Story = {
  args: {
    options: {
      ...defaultOptions,
      sendWelcomeEmail: false,
      requirePasswordReset: false,
    },
    roles: sampleRoles,
  },
};

export const NoRoles: Story = {
  args: {
    options: defaultOptions,
    roles: [],
  },
};

export const LimitedRoles: Story = {
  args: {
    options: {
      ...defaultOptions,
      defaultRole: "role-user",
    },
    roles: sampleRoles.slice(2), // Only moderator and user roles
  },
};

export const ConservativeSettings: Story = {
  args: {
    options: {
      skipDuplicates: false,
      updateExisting: true,
      skipInvalidRows: true,
      defaultRole: undefined,
      defaultStatus: true,
      sendWelcomeEmail: false,
      requirePasswordReset: true,
      validateOnly: false,
    },
    roles: sampleRoles,
  },
};

export const AggressiveSettings: Story = {
  args: {
    options: {
      skipDuplicates: false,
      updateExisting: true,
      skipInvalidRows: true,
      defaultRole: "USER",
      defaultStatus: true,
      sendWelcomeEmail: true,
      requirePasswordReset: false,
      validateOnly: false,
    },
    roles: sampleRoles,
  },
};

export const InteractiveDemo: Story = {
  render: function InteractiveDemoRender(args) {
    const [preset, setPreset] = useState("default");

    const presets = {
      default: {
        name: "Default",
        options: defaultOptions,
      },
      conservative: {
        name: "Conservative",
        options: {
          skipDuplicates: true,
          updateExisting: false,
          skipInvalidRows: false,
          defaultRole: undefined,
          defaultStatus: false,
          sendWelcomeEmail: false,
          requirePasswordReset: true,
        },
      },
      aggressive: {
        name: "Aggressive",
        options: {
          skipDuplicates: false,
          updateExisting: true,
          skipInvalidRows: true,
          defaultRole: "role-user",
          defaultStatus: true,
          sendWelcomeEmail: true,
          requirePasswordReset: false,
        },
      },
      safe: {
        name: "Safe Mode",
        options: {
          skipDuplicates: true,
          updateExisting: false,
          skipInvalidRows: false,
          defaultRole: "role-user",
          defaultStatus: false,
          sendWelcomeEmail: false,
          requirePasswordReset: true,
        },
      },
    };

    const currentPreset = presets[preset as keyof typeof presets];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Import Options Demo</h3>
          <p className="text-muted-foreground mb-6">
            Try different preset configurations to see how import options work
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(presets).map(([key, presetData]) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`px-3 py-1 rounded text-sm ${
                preset === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {presetData.name}
            </button>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <strong>Current Preset:</strong> {currentPreset.name}
        </div>

        <ImportOptionsFormWrapper
          {...args}
          options={currentPreset.options}
          roles={sampleRoles}
        />

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Preset Descriptions:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <strong>Default:</strong> Balanced settings for most use cases
            </li>
            <li>
              <strong>Conservative:</strong> Skip duplicates, strict validation,
              inactive by default
            </li>
            <li>
              <strong>Aggressive:</strong> Update everything, skip invalid rows,
              active by default
            </li>
            <li>
              <strong>Safe Mode:</strong> Maximum safety with manual review
              required
            </li>
          </ul>
        </div>
      </div>
    );
  },
};
