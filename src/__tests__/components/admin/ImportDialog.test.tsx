import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ImportDialog } from "@/components/admin/ImportDialog";

// Mock the hooks
vi.mock("@/hooks/useImport", () => ({
  useImportPreview: vi.fn(() => ({
    mutate: vi.fn(),
    data: undefined,
    isLoading: false,
    error: null,
    reset: vi.fn(),
  })),
  useImportValidation: vi.fn(() => ({
    mutate: vi.fn(),
    data: undefined,
    isLoading: false,
    error: null,
    reset: vi.fn(),
  })),
  useImportUsers: vi.fn(() => ({
    mutate: vi.fn(),
    data: undefined,
    isLoading: false,
    error: null,
    reset: vi.fn(),
  })),
  validateImportFile: vi.fn(() => ({ valid: true })),
  downloadSampleCSV: vi.fn(),
  createDefaultImportOptions: vi.fn(() => ({
    skipDuplicates: false,
    updateExisting: false,
    sendWelcomeEmail: true,
    defaultRole: "USER",
  })),
}));

const mockRoles = [
  {
    id: "role-1",
    name: "USER",
    permissions: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "role-2",
    name: "ADMIN",
    permissions: [],
    created_at: "",
    updated_at: "",
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("ImportDialog", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders upload step initially", () => {
    render(
      <ImportDialog open={true} onClose={mockOnClose} roles={mockRoles} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Import Users")).toBeInTheDocument();
    expect(screen.getByText("Upload Import File")).toBeInTheDocument();
    expect(screen.getByText("Choose File")).toBeInTheDocument();
  });

  it("shows file requirements", () => {
    render(
      <ImportDialog open={true} onClose={mockOnClose} roles={mockRoles} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("File Requirements:")).toBeInTheDocument();
    expect(
      screen.getByText(/Supported formats: CSV, Excel/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Maximum file size: 10MB/)).toBeInTheDocument();
  });

  it("provides download template option", () => {
    render(
      <ImportDialog open={true} onClose={mockOnClose} roles={mockRoles} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Download Template")).toBeInTheDocument();
  });
});
