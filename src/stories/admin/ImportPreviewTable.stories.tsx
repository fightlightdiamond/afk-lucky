import type { Meta, StoryObj } from "@storybook/react";
import { ImportPreviewTable } from "@/components/admin/ImportPreviewTable";
import { ImportError, ImportWarning } from "@/types/user";

const meta: Meta<typeof ImportPreviewTable> = {
  title: "Admin/ImportPreviewTable",
  component: ImportPreviewTable,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A preview table for import data showing parsed rows with validation errors and warnings. Features tabbed interface for data preview, errors, and warnings with detailed error reporting.",
      },
    },
  },
  argTypes: {
    headers: {
      description: "Array of column headers from the imported file",
      control: { type: "object" },
    },
    rows: {
      description: "Array of parsed data rows",
      control: { type: "object" },
    },
    errors: {
      description: "Array of validation errors",
      control: { type: "object" },
    },
    warnings: {
      description: "Array of validation warnings",
      control: { type: "object" },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImportPreviewTable>;

// Sample headers and data
const standardHeaders = [
  "email",
  "first_name",
  "last_name",
  "role",
  "is_active",
];

const validRows = [
  {
    _rowNumber: 2,
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    role: "USER",
    is_active: "true",
  },
  {
    _rowNumber: 3,
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    role: "EDITOR",
    is_active: "true",
  },
  {
    _rowNumber: 4,
    email: "bob.wilson@example.com",
    first_name: "Bob",
    last_name: "Wilson",
    role: "USER",
    is_active: "false",
  },
];

const mixedRows = [
  {
    _rowNumber: 2,
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    role: "USER",
    is_active: "true",
  },
  {
    _rowNumber: 3,
    email: "invalid-email",
    first_name: "Jane",
    last_name: "Smith",
    role: "INVALID_ROLE",
    is_active: "true",
  },
  {
    _rowNumber: 4,
    email: "bob.wilson@example.com",
    first_name: "",
    last_name: "Wilson",
    role: "USER",
    is_active: "maybe",
  },
  {
    _rowNumber: 5,
    email: "alice.johnson@example.com",
    first_name: "Alice",
    last_name: "Johnson",
    role: "ADMIN",
    is_active: "true",
  },
];

const sampleErrors: ImportError[] = [
  {
    row: 3,
    field: "email",
    message: "Invalid email format",
    value: "invalid-email",
  },
  {
    row: 3,
    field: "role",
    message: "Role 'INVALID_ROLE' does not exist",
    value: "INVALID_ROLE",
  },
  {
    row: 4,
    field: "first_name",
    message: "First name is required",
    value: "",
  },
  {
    row: 4,
    field: "is_active",
    message: "Invalid boolean value. Expected 'true' or 'false'",
    value: "maybe",
  },
];

const sampleWarnings: ImportWarning[] = [
  {
    row: 2,
    field: "role",
    message: "Role 'USER' will be converted to lowercase",
    value: "USER",
  },
  {
    row: 4,
    field: "is_active",
    message: "User will be created as inactive",
    value: "false",
  },
  {
    row: 5,
    field: "role",
    message: "Admin role assignment requires additional permissions",
    value: "ADMIN",
  },
];

const manyErrors: ImportError[] = [
  ...Array.from({ length: 15 }, (_, i) => ({
    row: i + 2,
    field: i % 2 === 0 ? "email" : "first_name",
    message:
      i % 2 === 0 ? "Invalid email format" : "Name contains invalid characters",
    value: i % 2 === 0 ? `invalid-email-${i}` : `Name${i}!@#`,
  })),
];

const manyWarnings: ImportWarning[] = [
  ...Array.from({ length: 12 }, (_, i) => ({
    row: i + 2,
    field: "role",
    message: "Role will be converted to standard format",
    value: `Role_${i}`,
  })),
];

export const ValidData: Story = {
  args: {
    headers: standardHeaders,
    rows: validRows,
    errors: [],
    warnings: [],
  },
};

export const WithErrors: Story = {
  args: {
    headers: standardHeaders,
    rows: mixedRows,
    errors: sampleErrors,
    warnings: [],
  },
};

export const WithWarnings: Story = {
  args: {
    headers: standardHeaders,
    rows: validRows,
    errors: [],
    warnings: sampleWarnings,
  },
};

export const ErrorsAndWarnings: Story = {
  args: {
    headers: standardHeaders,
    rows: mixedRows,
    errors: sampleErrors,
    warnings: sampleWarnings,
  },
};

export const ManyErrors: Story = {
  args: {
    headers: standardHeaders,
    rows: Array.from({ length: 15 }, (_, i) => ({
      _rowNumber: i + 2,
      email: `invalid-email-${i}`,
      first_name: `Name${i}!@#`,
      last_name: `Last${i}`,
      role: "USER",
      is_active: "true",
    })),
    errors: manyErrors,
    warnings: [],
  },
};

export const ManyWarnings: Story = {
  args: {
    headers: standardHeaders,
    rows: Array.from({ length: 12 }, (_, i) => ({
      _rowNumber: i + 2,
      email: `user${i}@example.com`,
      first_name: `User${i}`,
      last_name: `Last${i}`,
      role: `Role_${i}`,
      is_active: "true",
    })),
    errors: [],
    warnings: manyWarnings,
  },
};

export const LargeDataset: Story = {
  args: {
    headers: standardHeaders,
    rows: Array.from({ length: 50 }, (_, i) => ({
      _rowNumber: i + 2,
      email: `user${i}@example.com`,
      first_name: `User${i}`,
      last_name: `Last${i}`,
      role: i % 3 === 0 ? "ADMIN" : i % 3 === 1 ? "EDITOR" : "USER",
      is_active: i % 4 === 0 ? "false" : "true",
    })),
    errors: [
      {
        row: 5,
        field: "email",
        message: "Email already exists in database",
        value: "user3@example.com",
      },
      {
        row: 15,
        field: "role",
        message: "Invalid role specified",
        value: "SUPER_ADMIN",
      },
    ],
    warnings: [
      {
        row: 10,
        field: "is_active",
        message: "User will be created as inactive",
        value: "false",
      },
    ],
  },
};

export const EmptyData: Story = {
  args: {
    headers: standardHeaders,
    rows: [],
    errors: [],
    warnings: [],
  },
};

export const SingleRow: Story = {
  args: {
    headers: standardHeaders,
    rows: [validRows[0]],
    errors: [],
    warnings: [
      {
        row: 2,
        field: "role",
        message: "Default role will be assigned",
        value: "USER",
      },
    ],
  },
};

export const ComplexHeaders: Story = {
  args: {
    headers: [
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
    ],
    rows: [
      {
        _rowNumber: 2,
        email: "john.doe@example.com",
        first_name: "John",
        last_name: "Doe",
        password: "********",
        role: "USER",
        is_active: "true",
        birthday: "1990-01-15",
        address: "123 Main St, New York, NY",
        locale: "en",
        gender: "male",
        group_id: "5",
        slack_webhook: "https://hooks.slack.com/services/...",
      },
      {
        _rowNumber: 3,
        email: "jane.smith@example.com",
        first_name: "Jane",
        last_name: "Smith",
        password: "********",
        role: "EDITOR",
        is_active: "true",
        birthday: "1985-06-22",
        address: "456 Oak Ave, Los Angeles, CA",
        locale: "en",
        gender: "female",
        group_id: "3",
        slack_webhook: "",
      },
    ],
    errors: [
      {
        row: 3,
        field: "slack_webhook",
        message: "Invalid webhook URL format",
        value: "invalid-url",
      },
    ],
    warnings: [
      {
        row: 2,
        field: "password",
        message: "Password will be hashed before storage",
        value: "********",
      },
    ],
  },
};

export const ErrorsOnly: Story = {
  args: {
    headers: standardHeaders,
    rows: [
      {
        _rowNumber: 2,
        email: "invalid-email",
        first_name: "",
        last_name: "Doe",
        role: "INVALID",
        is_active: "maybe",
      },
    ],
    errors: [
      {
        row: 2,
        field: "email",
        message: "Invalid email format",
        value: "invalid-email",
      },
      {
        row: 2,
        field: "first_name",
        message: "First name is required",
        value: "",
      },
      {
        row: 2,
        field: "role",
        message: "Role 'INVALID' does not exist",
        value: "INVALID",
      },
      {
        row: 2,
        field: "is_active",
        message: "Invalid boolean value",
        value: "maybe",
      },
    ],
    warnings: [],
  },
};

export const WarningsOnly: Story = {
  args: {
    headers: standardHeaders,
    rows: validRows,
    errors: [],
    warnings: [
      {
        row: 2,
        field: "role",
        message: "Role will be converted to lowercase",
        value: "USER",
      },
      {
        row: 3,
        field: "email",
        message: "Email domain not in whitelist",
        value: "jane.smith@example.com",
      },
      {
        row: 4,
        field: "is_active",
        message: "Inactive users require manual activation",
        value: "false",
      },
    ],
  },
};
