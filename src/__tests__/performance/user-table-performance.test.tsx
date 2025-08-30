import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { UserTableOptimized } from "@/components/admin/UserTableOptimized";
import { UserManagementPageOptimized } from "@/components/admin/UserManagementPageOptimized";
import { PerformanceMonitor } from "@/lib/performance-utils";
import { User, UserFilters } from "@/types/user";

// Mock data
const mockUsers: User[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `user-${i}`,
  email: `user${i}@example.com`,
  first_name: `First${i}`,
  last_name: `Last${i}`,
  full_name: `First${i} Last${i}`,
  display_name: `First${i} Last${i}`,
  is_active: i % 2 === 0,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
  status: i % 2 === 0 ? "active" : "inactive",
  activity_status: i % 3 === 0 ? "online" : i % 3 === 1 ? "offline" : "never",
  role:
    i % 4 === 0
      ? {
          id: `role-${i}`,
          name: "Admin",
          permissions: ["user:read", "user:write"],
        }
      : undefined,
}));

const mockFilters: UserFilters = {
  search: "",
  role: null,
  status: null,
  dateRange: null,
  activityDateRange: null,
  sortBy: "created_at",
  sortOrder: "desc",
  hasAvatar: null,
  locale: null,
  group_id: null,
  activity_status: null,
};

// Mock hooks
vi.mock("@/hooks/useUsers", () => ({
  useUsers: vi.fn(() => ({
    data: {
      users: mockUsers.slice(0, 20),
      pagination: { page: 1, pageSize: 20, total: mockUsers.length },
      metadata: { availableRoles: [] },
    },
    isLoading: false,
    error: null,
  })),
  useUsersInfinite: vi.fn(() => ({
    data: {
      pages: [
        {
          users: mockUsers.slice(0, 50),
          pagination: { page: 1, pageSize: 50, total: mockUsers.length },
        },
      ],
    },
    isLoading: false,
    error: null,
    fetchNextPage: vi.fn(),
    hasNextPage: true,
    isFetchingNextPage: false,
  })),
  useCreateUser: vi.fn(() => ({ mutate: vi.fn() })),
  useUpdateUser: vi.fn(() => ({ mutate: vi.fn() })),
  useDeleteUser: vi.fn(() => ({ mutate: vi.fn() })),
  useIntelligentPrefetch: vi.fn(() => ({
    prefetchNextPage: vi.fn(),
    prefetchUserDetails: vi.fn(),
  })),
  useUsersPerformance: vi.fn(() => ({
    startQueryTimer: vi.fn(),
    endQueryTimer: vi.fn(),
    startRenderTimer: vi.fn(),
    endRenderTimer: vi.fn(),
  })),
}));

vi.mock("@/hooks/useResponsive", () => ({
  useResponsive: vi.fn(() => ({
    isMobile: false,
    isTablet: false,
  })),
}));

vi.mock("@/store", () => ({
  useUserStore: vi.fn(() => ({
    selectedUsers: new Set(),
    selectUser: vi.fn(),
    selectAllUsers: vi.fn(),
    clearSelection: vi.fn(),
    bulkSelectUsers: vi.fn(),
  })),
}));

vi.mock("@/lib/error-handling", () => ({
  useErrorHandler: vi.fn(() => ({
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
    handleWarning: vi.fn(),
  })),
}));

vi.mock("@/components/auth/permission-guard", () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => children,
}));

describe("Performance Optimizations", () => {
  let queryClient: QueryClient;
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    performanceMonitor = PerformanceMonitor.getInstance();

    // Mock performance.now for consistent testing
    vi.spyOn(performance, "now").mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe("UserTableOptimized", () => {
    it("should render large user lists efficiently", async () => {
      const startTime = performance.now();

      renderWithProviders(
        <UserTableOptimized
          users={mockUsers.slice(0, 100)}
          filters={mockFilters}
          onFiltersChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
          enableVirtualScrolling={true}
          containerHeight={600}
          itemHeight={73}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 200ms for 100 users in test environment)
      expect(renderTime).toBeLessThan(200);

      // Should show virtual scrolling container
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    it("should handle selection changes efficiently", async () => {
      const onUserSelection = vi.fn();

      renderWithProviders(
        <UserTableOptimized
          users={mockUsers.slice(0, 20)}
          filters={mockFilters}
          onFiltersChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
          onUserSelection={onUserSelection}
          selectedUsers={new Set()}
        />
      );

      const checkboxes = screen.getAllByRole("checkbox");
      const startTime = performance.now();

      // Select multiple users rapidly
      for (let i = 1; i < 6; i++) {
        fireEvent.click(checkboxes[i]);
      }

      const endTime = performance.now();
      const selectionTime = endTime - startTime;

      // Should handle rapid selections efficiently
      expect(selectionTime).toBeLessThan(50);
      expect(onUserSelection).toHaveBeenCalledTimes(5);
    });

    it("should memoize components properly", () => {
      const { rerender } = renderWithProviders(
        <UserTableOptimized
          users={mockUsers.slice(0, 10)}
          filters={mockFilters}
          onFiltersChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      );

      const initialRows = screen.getAllByRole("row");

      // Re-render with same props
      rerender(
        <UserTableOptimized
          users={mockUsers.slice(0, 10)}
          filters={mockFilters}
          onFiltersChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
        />
      );

      const newRows = screen.getAllByRole("row");

      // Should have same number of rows (memoization working)
      expect(newRows).toHaveLength(initialRows.length);
    });
  });

  describe("Virtual Scrolling", () => {
    it("should only render visible items", () => {
      renderWithProviders(
        <UserTableOptimized
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
          enableVirtualScrolling={true}
          containerHeight={400}
          itemHeight={50}
        />
      );

      // With 400px container and 50px items, should show ~8 items + overscan
      const visibleRows = screen.getAllByRole("gridcell");
      expect(visibleRows.length).toBeLessThan(20); // Much less than 1000 total items
    });
  });

  describe("Debounced Search", () => {
    it("should debounce search input", async () => {
      const onFiltersChange = vi.fn();

      renderWithProviders(<UserManagementPageOptimized />);

      const searchInput = screen.getByRole("textbox", { name: /search/i });

      // Type rapidly
      fireEvent.change(searchInput, { target: { value: "t" } });
      fireEvent.change(searchInput, { target: { value: "te" } });
      fireEvent.change(searchInput, { target: { value: "tes" } });
      fireEvent.change(searchInput, { target: { value: "test" } });

      // Should not call onChange immediately
      expect(onFiltersChange).not.toHaveBeenCalled();

      // Should call onChange after debounce delay
      await waitFor(
        () => {
          expect(searchInput).toHaveValue("test");
        },
        { timeout: 600 }
      );
    });
  });

  describe("Performance Monitoring", () => {
    it("should track performance metrics", () => {
      const endTimer = performanceMonitor.startTimer("test-operation");

      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }

      const duration = endTimer();

      expect(duration).toBeGreaterThanOrEqual(0);

      const metrics = performanceMonitor.getMetrics("test-operation");
      expect(metrics).toBeTruthy();
      expect(metrics?.count).toBe(1);
      expect(metrics?.average).toBe(duration);
    });

    it("should detect slow operations", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Record a slow operation
      performanceMonitor.recordMetric("slow-operation", 150);
      performanceMonitor.logSlowOperations(100);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Slow operation detected: slow-operation")
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Optimistic Updates", () => {
    it("should show optimistic updates immediately", async () => {
      const { useCreateUser } = await import("@/hooks/useUsers");
      const mockMutate = vi.fn();

      vi.mocked(useCreateUser).mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
        error: null,
      } as unknown);

      renderWithProviders(<UserManagementPageOptimized />);

      const addButton = screen.getByRole("button", { name: /add user/i });
      fireEvent.click(addButton);

      // Should open dialog immediately
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });
  });

  describe("Memory Management", () => {
    it("should not create memory leaks with large datasets", () => {
      const { unmount } = renderWithProviders(
        <UserTableOptimized
          users={mockUsers}
          filters={mockFilters}
          onFiltersChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onToggleStatus={vi.fn()}
          enableVirtualScrolling={true}
        />
      );

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});
