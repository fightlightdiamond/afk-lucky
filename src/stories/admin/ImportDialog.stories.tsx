import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ImportDialog } from "@/components/admin/ImportDialog";
import { ImportOptions, ImportResponse } from "@/types/user";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

// Interactive wrapper for Storybook
const InteractiveImportDialog = (props: any) => {
  const [open, setOpen] = useState(props.open || false);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (file: File, options: ImportOptions) => {
    setIsImporting(true);
    // Simulate import process
    await new Promise((resolve) => setTimeout(resolve, 4000));
    setIsImporting(false);
    setOpen(false);
    props.onImport(file, options);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isImporting) {
      setOpen(newOpen);
      props.onOpenChange(newOpen);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Open Import Dialog
      </button>
      <ImportDialog
        {...props}
        open={open}
        onOpenChange={handleOpenChange}
        onImport={handleImport}
        isImporting={isImporting}
      />
    </div>
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
      description: "Whether the dialog is open",
      control: { type: "boolean" },
    },
    availableRoles: {
      description: "Available roles for default assignment",
      control: { type: "object" },
    },
    maxFileSize: {
      description: "Maximum file size in bytes",
      control: { type: "number" },
    },
    supportedFormats: {
      description: "Supported file formats",
      control: { type: "object" },
    },
    isImporting: {
      description: "Whether import is in progress",
      control: { type: "boolean" },
    },
    onOpenChange: {
      description: "Callback when dialog open state changes",
      action: "openChange",
    },
    onImport: {
      description: "Callback when import is initiated",
      action: "import",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ImportDialog>;

// Sample roles for import
const sampleRoles = [
  { id: "role-admin", name: "ADMIN", description: "System Administrator" },
  { id: "role-editor", name: "EDITOR", description: "Content Editor" },
  { id: "role-moderator", name: "MODERATOR", description: "Content Moderator" },
  { id: "role-user", name: "USER", description: "Regular User" },
];

export const Default: Story = {
  args: {
    open: false,
    availableRoles: sampleRoles,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: [".csv", ".xlsx", ".xls"],
    isImporting: false,
    onOpenChange: fn(),
    onImport: fn(),
  },
};

export const WithLimitedRoles: Story = {
  args: {
    open: false,
    availableRoles: sampleRoles.slice(2), // Only moderator and user
    maxFileSize: 10 * 1024 * 1024,
    supportedFormats: [".csv", ".xlsx", ".xls"],
    isImporting: false,
    onOpenChange: fn(),
    onImport: fn(),
  },
};

export const NoRoles: Story = {
  args: {
    open: false,
    availableRoles: [],
    maxFileSize: 10 * 1024 * 1024,
    supportedFormats: [".csv", ".xlsx", ".xls"],
    isImporting: false,
    onOpenChange: fn(),
    onImport: fn(),
  },
};

export const CSVOnly: Story = {
  args: {
    open: false,
    availableRoles: sampleRoles,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    supportedFormats: [".csv"],
    isImporting: false,
    onOpenChange: fn(),
    onImport: fn(),
  },
};

export const SmallFileLimit: Story = {
  args: {
    open: false,
    availableRoles: sampleRoles,
    maxFileSize: 1 * 1024 * 1024, // 1MB
    supportedFormats: [".csv", ".xlsx", ".xls"],
    isImporting: false,
    onOpenChange: fn(),
    onImport: fn(),
  },
};

export const LargeFileLimit: Story = {
  args: {
    open: false,
    availableRoles: sampleRoles,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    supportedFormats: [".csv", ".xlsx", ".xls"],
    isImporting: false,
    onOpenChange: fn(),
    onImport: fn(),
  },
};

export const ImportingState: Story = {
  args: {
    open: false,
    availableRoles: sampleRoles,
    maxFileSize: 10 * 1024 * 1024,
    supportedFormats: [".csv", ".xlsx", ".xls"],
    isImporting: true,
    onOpenChange: fn(),
    onImport: fn(),
  },
};

export const OpenByDefault: Story = {
  args: {
    open: true,
    availableRoles: sampleRoles,
    maxFileSize: 10 * 1024 * 1024,
    supportedFormats: [".csv", ".xlsx", ".xls"],
    isImporting: false,
    onOpenChange: fn(),
    onImport: fn(),
  },
};

export const ExtendedFormats: Story = {
  args: {
    open: false,
    availableRoles: sampleRoles,
    maxFileSize: 10 * 1024 * 1024,
    supportedFormats: [".csv", ".xlsx", ".xls", ".tsv", ".txt"],
    isImporting: false,
    onOpenChange: fn(),
    onImport: fn(),
  },
};

export const ImportingWithProgress: Story = {
  args: {
    open: true,
    availableRoles: sampleRoles,
    maxFileSize: 10 * 1024 * 1024,
    supportedFormats: [".csv", ".xlsx", ".xls"],
    isImporting: true,
    onOpenChange: fn(),
    onImport: fn(),
  },
};

// Story showing the complete import workflow
export const ImportWorkflow: Story = {
  render: () => {
    const [step, setStep] = useState(1);
    const [open, setOpen] = useState(false);

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
              onClick={() => setOpen(true)}
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
          open={open}
          onOpenChange={setOpen}
          availableRoles={sampleRoles}
          maxFileSize={10 * 1024 * 1024}
          supportedFormats={[".csv", ".xlsx", ".xls"]}
          isImporting={step === 4}
          onImport={fn()}
        />
      </div>
    );
  },
};
