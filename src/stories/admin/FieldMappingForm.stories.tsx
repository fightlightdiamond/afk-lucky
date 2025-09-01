import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import React, { useState } from "react";
import { FieldMappingForm } from "@/components/admin/FieldMappingForm";

// Interactive wrapper for Storybook
const InteractiveFieldMappingForm = (props: {
  headers?: string[];
  mapping?: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
  suggestedMapping?: Record<string, string>;
}) => {
  const [mapping, setMapping] = useState<Record<string, string>>(
    props.mapping || {}
  );

  const handleMappingChange = (newMapping: Record<string, string>) => {
    setMapping(newMapping);
    props.onChange(newMapping);
  };

  return (
    <FieldMappingForm
      headers={props.headers || []}
      mapping={mapping}
      onChange={handleMappingChange}
      suggestedMapping={props.suggestedMapping || {}}
    />
  );
};

const meta: Meta<typeof FieldMappingForm> = {
  title: "Admin/FieldMappingForm",
  component: InteractiveFieldMappingForm,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A form for mapping CSV/Excel file headers to user database fields. Features automatic suggestions, required field validation, and clear mapping status indicators.",
      },
    },
  },
  argTypes: {
    headers: {
      description: "Array of column headers from the imported file",
      control: { type: "object" },
    },
    onChange: {
      description: "Callback when mapping changes",
      action: "mappingChanged",
    },
    suggestedMapping: {
      description: "AI-suggested field mapping",
      control: { type: "object" },
    },
  },
  args: {
    onChange: fn(),
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FieldMappingForm>;

// Sample CSV headers - typical user import scenarios
const standardHeaders = [
  "email",
  "first_name",
  "last_name",
  "password",
  "role",
  "active",
];
const messyHeaders = [
  "Email Address",
  "First Name",
  "Last Name",
  "User Role",
  "Status",
  "Date Created",
];
const minimalHeaders = ["email", "name"];
const comprehensiveHeaders = [
  "email",
  "first_name",
  "last_name",
  "password",
  "role",
  "is_active",
  "birthday",
  "address",
  "locale",
  "gender",
  "group_id",
  "slack_webhook",
];
const unconventionalHeaders = [
  "user_email",
  "fname",
  "lname",
  "user_type",
  "enabled",
  "birth_date",
];

export const StandardHeaders: Story = {
  args: {
    headers: standardHeaders,
    mapping: {},
    suggestedMapping: {
      email: "email",
      first_name: "first_name",
      last_name: "last_name",
      password: "password",
      role: "role",
      active: "is_active",
    },
  },
};

export const MessyHeaders: Story = {
  args: {
    headers: messyHeaders,
    mapping: {},
    suggestedMapping: {
      "Email Address": "email",
      "First Name": "first_name",
      "Last Name": "last_name",
      "User Role": "role",
      Status: "is_active",
    },
  },
};

export const MinimalHeaders: Story = {
  args: {
    headers: minimalHeaders,
    mapping: {},
    suggestedMapping: {
      email: "email",
      name: "first_name", // Assuming name maps to first_name
    },
  },
};

export const ComprehensiveHeaders: Story = {
  args: {
    headers: comprehensiveHeaders,
    mapping: {},
    suggestedMapping: {
      email: "email",
      first_name: "first_name",
      last_name: "last_name",
      password: "password",
      role: "role",
      is_active: "is_active",
      birthday: "birthday",
      address: "address",
      locale: "locale",
      gender: "sex",
      group_id: "group_id",
      slack_webhook: "slack_webhook_url",
    },
  },
};

export const UnconventionalHeaders: Story = {
  args: {
    headers: unconventionalHeaders,
    mapping: {},
    suggestedMapping: {
      user_email: "email",
      fname: "first_name",
      lname: "last_name",
      user_type: "role",
      enabled: "is_active",
      birth_date: "birthday",
    },
  },
};

export const PartiallyMapped: Story = {
  args: {
    headers: standardHeaders,
    mapping: {
      email: "email",
      first_name: "first_name",
      last_name: "last_name",
    },
    suggestedMapping: {
      email: "email",
      first_name: "first_name",
      last_name: "last_name",
      password: "password",
      role: "role",
      active: "is_active",
    },
  },
};

export const FullyMapped: Story = {
  args: {
    headers: standardHeaders,
    mapping: {
      email: "email",
      first_name: "first_name",
      last_name: "last_name",
      password: "password",
      role: "role",
      active: "is_active",
    },
    suggestedMapping: {
      email: "email",
      first_name: "first_name",
      last_name: "last_name",
      password: "password",
      role: "role",
      active: "is_active",
    },
  },
};

export const NoSuggestions: Story = {
  args: {
    headers: ["col1", "col2", "col3", "col4"],
    mapping: {},
    suggestedMapping: {},
  },
};

export const ConflictingHeaders: Story = {
  args: {
    headers: ["email1", "email2", "primary_email", "backup_email"],
    mapping: {},
    suggestedMapping: {
      primary_email: "email",
    },
  },
};

export const MissingRequiredFields: Story = {
  args: {
    headers: ["username", "password", "role", "status"],
    mapping: {},
    suggestedMapping: {
      role: "role",
      status: "is_active",
    },
  },
};

export const WithPreMappedFields: Story = {
  args: {
    headers: ["Email Address", "First Name", "Last Name", "User Role", "Status"],
    mapping: {
      "Email Address": "email",
      "First Name": "first_name",
      "Last Name": "last_name",
    },
    onChange: fn(),
    suggestedMapping: {},
  },
};

export const WithManyHeaders: Story = {
  args: {
    headers: [
      "user_email",
      "user_first_name",
      "user_last_name",
      "user_password",
      "user_role",
      "user_active",
      "user_birthday",
      "user_address",
      "user_locale",
      "user_sex",
      "user_group_id",
      "user_slack_webhook_url",
    ],
    mapping: {},
    suggestedMapping: {
      user_email: "email",
      user_first_name: "first_name",
      user_last_name: "last_name",
      user_password: "password",
      user_role: "role",
      user_active: "is_active",
      user_birthday: "birthday",
      user_address: "address",
      user_locale: "locale",
      user_sex: "sex",
      user_group_id: "group_id",
      user_slack_webhook_url: "slack_webhook_url",
    },
    onChange: fn(),
  },
};

export const Disabled: Story = {
  args: {
    headers: ["Email", "First Name", "Last Name", "Role", "Status"],
    mapping: {
      Email: "email",
      "First Name": "first_name",
      "Last Name": "last_name",
    },
    onChange: fn(),
    suggestedMapping: {},
  },
};

export const InteractiveDemo: Story = {
  render: function InteractiveDemoRender(args) {
    const [selectedScenario, setSelectedScenario] = useState("standard");

    const scenarios = {
      standard: {
        name: "Standard CSV",
        headers: standardHeaders,
        suggested: {
          email: "email",
          first_name: "first_name",
          last_name: "last_name",
          password: "password",
          role: "role",
          active: "is_active",
        },
      },
      messy: {
        name: "Messy Headers",
        headers: messyHeaders,
        suggested: {
          "Email Address": "email",
          "First Name": "first_name",
          "Last Name": "last_name",
          "User Role": "role",
          Status: "is_active",
        },
      },
      minimal: {
        name: "Minimal Data",
        headers: minimalHeaders,
        suggested: {
          email: "email",
          name: "first_name",
        },
      },
      comprehensive: {
        name: "All Fields",
        headers: comprehensiveHeaders,
        suggested: {
          email: "email",
          first_name: "first_name",
          last_name: "last_name",
          password: "password",
          role: "role",
          is_active: "is_active",
          birthday: "birthday",
          address: "address",
          locale: "locale",
          gender: "sex",
          group_id: "group_id",
          slack_webhook: "slack_webhook_url",
        },
      },
    };

    const currentScenario =
      scenarios[selectedScenario as keyof typeof scenarios];

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Field Mapping Demo</h3>
          <p className="text-muted-foreground mb-6">
            Try different CSV header scenarios to see how field mapping works
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <button
              key={key}
              onClick={() => setSelectedScenario(key)}
              className={`px-3 py-1 rounded text-sm ${
                selectedScenario === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {scenario.name}
            </button>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <strong>Headers:</strong> {currentScenario.headers.join(", ")}
        </div>

        <InteractiveFieldMappingForm
          {...args}
          headers={currentScenario.headers}
          mapping={{}}
          suggestedMapping={currentScenario.suggested}
        />
      </div>
    );
  },
};
