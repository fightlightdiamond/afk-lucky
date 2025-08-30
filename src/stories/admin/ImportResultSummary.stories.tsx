import type { Meta, StoryObj } from "@storybook/react";
import { ImportResultSummary } from "@/components/admin/ImportResultSummary";
import { ImportResponse } from "@/types/user";

const meta: Meta<typeof ImportResultSummary> = {
  title: "Admin/ImportResultSummary",
  component: ImportResultSummary,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A comprehensive summary of import results showing success rates, detailed statistics, error reports, and warnings. Features progress visualization and actionable insights.",
      },
    },
  },
  argTypes: {
    result: {
      description: "Import result object with summary and detailed information",
      control: { type: "object" },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImportResultSummary>;

// Helper to create sample errors and warnings
const createSampleErrors = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    row: i + 2,
    field: i % 3 === 0 ? "email" : i % 3 === 1 ? "first_name" : "role",
    message:
      i % 3 === 0
        ? "Invalid email format"
        : i % 3 === 1
        ? "First name is required"
        : "Invalid role specified",
    value:
      i % 3 === 0
        ? `invalid-email-${i}`
        : i % 3 === 1
        ? ""
        : `INVALID_ROLE_${i}`,
  }));

const createSampleWarnings = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    row: i + 2,
    field: i % 2 === 0 ? "role" : "is_active",
    message:
      i % 2 === 0
        ? "Role will be converted to standard format"
        : "User will be created as inactive",
    value: i % 2 === 0 ? `Role_${i}` : "false",
  }));

export const PerfectSuccess: Story = {
  args: {
    result: {
      summary: {
        totalRows: 100,
        created: 100,
        updated: 0,
        skipped: 0,
        invalidRows: 0,
      },
      errors: [],
      warnings: [],
    },
  },
};

export const PartialSuccess: Story = {
  args: {
    result: {
      summary: {
        totalRows: 100,
        created: 75,
        updated: 15,
        skipped: 5,
        invalidRows: 5,
      },
      errors: createSampleErrors(5),
      warnings: createSampleWarnings(3),
    },
  },
};

export const MostlyFailed: Story = {
  args: {
    result: {
      summary: {
        totalRows: 100,
        created: 20,
        updated: 5,
        skipped: 10,
        invalidRows: 65,
      },
      errors: createSampleErrors(15),
      warnings: createSampleWarnings(8),
    },
  },
};

export const CompleteFailure: Story = {
  args: {
    result: {
      summary: {
        totalRows: 50,
        created: 0,
        updated: 0,
        skipped: 0,
        invalidRows: 50,
      },
      errors: [
        {
          row: 0,
          field: "system",
          message: "Database connection failed",
          value: "N/A",
        },
        {
          row: 0,
          field: "system",
          message: "Authentication service unavailable",
          value: "N/A",
        },
        ...createSampleErrors(10),
      ],
      warnings: [],
    },
  },
};

export const UpdatesOnly: Story = {
  args: {
    result: {
      summary: {
        totalRows: 50,
        created: 0,
        updated: 45,
        skipped: 3,
        invalidRows: 2,
      },
      errors: createSampleErrors(2),
      warnings: [
        {
          row: 5,
          field: "email",
          message: "Email already exists, user data updated",
          value: "existing@example.com",
        },
        {
          row: 10,
          field: "role",
          message: "Role changed from USER to ADMIN",
          value: "ADMIN",
        },
      ],
    },
  },
};

export const ManySkipped: Story = {
  args: {
    result: {
      summary: {
        totalRows: 100,
        created: 30,
        updated: 10,
        skipped: 55,
        invalidRows: 5,
      },
      errors: createSampleErrors(5),
      warnings: [
        {
          row: 3,
          field: "email",
          message: "Duplicate email found, skipping",
          value: "duplicate@example.com",
        },
        {
          row: 8,
          field: "email",
          message: "User already exists with same data",
          value: "existing@example.com",
        },
        ...createSampleWarnings(10),
      ],
    },
  },
};

export const SmallDataset: Story = {
  args: {
    result: {
      summary: {
        totalRows: 5,
        created: 4,
        updated: 0,
        skipped: 0,
        invalidRows: 1,
      },
      errors: [
        {
          row: 3,
          field: "email",
          message: "Invalid email format",
          value: "not-an-email",
        },
      ],
      warnings: [
        {
          row: 2,
          field: "role",
          message: "Default role assigned",
          value: "USER",
        },
      ],
    },
  },
};

export const LargeDataset: Story = {
  args: {
    result: {
      summary: {
        totalRows: 10000,
        created: 8500,
        updated: 1200,
        skipped: 200,
        invalidRows: 100,
      },
      errors: createSampleErrors(20),
      warnings: createSampleWarnings(15),
    },
  },
};

export const WarningsOnly: Story = {
  args: {
    result: {
      summary: {
        totalRows: 50,
        created: 45,
        updated: 5,
        skipped: 0,
        invalidRows: 0,
      },
      errors: [],
      warnings: [
        {
          row: 2,
          field: "password",
          message: "Weak password detected, consider requiring password reset",
          value: "123456",
        },
        {
          row: 5,
          field: "locale",
          message: "Locale 'en_US' normalized to 'en'",
          value: "en_US",
        },
        {
          row: 8,
          field: "birthday",
          message: "Date format converted from MM/DD/YYYY to YYYY-MM-DD",
          value: "01/15/1990",
        },
        ...createSampleWarnings(8),
      ],
    },
  },
};

export const ErrorsOnly: Story = {
  args: {
    result: {
      summary: {
        totalRows: 25,
        created: 15,
        updated: 0,
        skipped: 0,
        invalidRows: 10,
      },
      errors: [
        {
          row: 3,
          field: "email",
          message: "Email format is invalid",
          value: "invalid.email",
        },
        {
          row: 7,
          field: "first_name",
          message: "First name cannot be empty",
          value: "",
        },
        {
          row: 12,
          field: "role",
          message: "Role 'SUPER_ADMIN' does not exist",
          value: "SUPER_ADMIN",
        },
        {
          row: 18,
          field: "birthday",
          message: "Invalid date format",
          value: "32/13/1990",
        },
        {
          row: 22,
          field: "email",
          message: "Email domain is blacklisted",
          value: "user@spam.com",
        },
      ],
      warnings: [],
    },
  },
};

export const HighSuccessRate: Story = {
  args: {
    result: {
      summary: {
        totalRows: 1000,
        created: 950,
        updated: 40,
        skipped: 8,
        invalidRows: 2,
      },
      errors: createSampleErrors(2),
      warnings: createSampleWarnings(5),
    },
  },
};

export const LowSuccessRate: Story = {
  args: {
    result: {
      summary: {
        totalRows: 200,
        created: 50,
        updated: 20,
        skipped: 30,
        invalidRows: 100,
      },
      errors: createSampleErrors(25),
      warnings: createSampleWarnings(12),
    },
  },
};

export const NoData: Story = {
  args: {
    result: {
      summary: {
        totalRows: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        invalidRows: 0,
      },
      errors: [],
      warnings: [],
    },
  },
};

export const MixedResults: Story = {
  args: {
    result: {
      summary: {
        totalRows: 150,
        created: 60,
        updated: 30,
        skipped: 40,
        invalidRows: 20,
      },
      errors: [
        {
          row: 5,
          field: "email",
          message: "Email already exists in system",
          value: "duplicate@example.com",
        },
        {
          row: 12,
          field: "password",
          message: "Password does not meet security requirements",
          value: "weak",
        },
        {
          row: 25,
          field: "role",
          message: "Invalid role specified",
          value: "INVALID_ROLE",
        },
        {
          row: 45,
          field: "birthday",
          message: "Future date not allowed",
          value: "2030-01-01",
        },
        {
          row: 67,
          field: "address",
          message: "Address format is invalid",
          value: "Invalid Address Format",
        },
      ],
      warnings: [
        {
          row: 8,
          field: "locale",
          message: "Locale defaulted to 'en'",
          value: "",
        },
        {
          row: 15,
          field: "is_active",
          message: "User created as inactive due to missing verification",
          value: "false",
        },
        {
          row: 33,
          field: "role",
          message: "Role converted to lowercase",
          value: "USER",
        },
        {
          row: 78,
          field: "group_id",
          message: "Group ID defaulted to 1",
          value: "",
        },
      ],
    },
  },
};
