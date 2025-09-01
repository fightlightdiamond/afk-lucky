import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from "@storybook/test";
const fn = () => () => {};
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ImportDialog } from "@/components/admin/ImportDialog";
import { Role, UserRole } from "@/types/user";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

// Interactive wrapper for Storybook
const InteractiveImportDialog = (props: { open: boolean; onClose: () => void; roles: Role[] }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ImportDialog
        open={props.open}
        onClose={props.onClose}
        roles={props.roles}
      />
    </QueryClientProvider>
  );
};

const meta: Meta<typeof ImportDialog> = {
  title: "Admin/ImportDialog",
  component: InteractiveImportDialog,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-6 bg-background">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive dialog for importing user data from CSV or Excel files. Features file upload, field mapping, import options, validation, preview, and progress tracking.",
      },
    },
  },
  argTypes: {
    open: {
      control: { type: "boolean" },
      description: "Whether the dialog is open",
    },
    onClose: {
      action: "onClose",
      description: "Callback when dialog should close",
    },
    roles: {
      control: { type: "object" },
      description: "Available roles for import",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImportDialog>;

// Sample roles for import
const sampleRoles: Role[] = [
  {
    id: "role-admin",
    name: UserRole.ADMIN,
    description: "System Administrator",
    permissions: ["admin:read", "admin:write", "user:read", "user:write"],
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
    permissions: ["content:read", "content:moderate", "user:read"],
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

export const Default: Story = {
  args: {
    open: false,
    onClose: fn(),
    roles: sampleRoles,
  },
};

export const WithLimitedRoles: Story = {
  args: {
    open: false,
    onClose: fn(),
    roles: sampleRoles.slice(2), // Only moderator and user
  },
};

export const Open: Story = {
  args: {
    open: true,
    onClose: fn(),
    roles: sampleRoles,
  },
};

export const ExtendedFormats: Story = {
  args: {
    open: false,
    onClose: fn(),
    roles: sampleRoles,
  },
};

export const NoRoles: Story = {
  args: {
    open: false,
    onClose: fn(),
    roles: [],
  },
};

export const CSVOnly: Story = {
  args: {
    open: false,
    onClose: fn(),
    roles: sampleRoles,
  },
};

export const SmallFileLimit: Story = {
  args: {
    open: false,
    onClose: fn(),
    roles: sampleRoles,
  },
};

export const LargeFileLimit: Story = {
  args: {
    open: false,
    onClose: fn(),
    roles: sampleRoles,
  },
};

export const ImportingState: Story = {
  args: {
    open: false,
    onClose: fn(),
    roles: sampleRoles,
  },
};

export const OpenByDefault: Story = {
  args: {
    open: true,
    onClose: fn(),
    roles: sampleRoles,
  },
};

export const ImportingWithProgress: Story = {
  args: {
    open: true,
    onClose: fn(),
    roles: sampleRoles,
  },
};

// Story showing the complete import workflow
export const InteractiveDemo: Story = {
  render: function InteractiveDemoRender() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [step, setStep] = React.useState(1);

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Import Workflow Demo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Step {step} of 4:{" "}
            {step === 1
              ? "File Upload"
              : step === 2
              ? "Field Mapping"
              : step === 3
              ? "Import Options"
              : "Import Progress"}
          </p>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Open Import Dialog
            </button>
            <button
              onClick={() => setStep(Math.min(4, step + 1))}
              disabled={step === 4}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <ImportDialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          roles={sampleRoles}
        />
      </div>
    );
  },
};
