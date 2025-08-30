import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import {
  UserStatusBadge,
  getStatusPriority,
  getStatusColor,
  canUserLogin,
} from "@/components/admin/UserStatusBadge";
import { User, UserStatus } from "@/types/user";

// Mock the UI components
vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children, asChild }: any) =>
    asChild ? children : <div>{children}</div>,
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
}));

const createMockUser = (
  status: UserStatus,
  isActive: boolean = true
): User => ({
  id: "1",
  email: "test@example.com",
  first_name: "John",
  last_name: "Doe",
  full_name: "John Doe",
  display_name: "John Doe",
  is_active: isActive,
  status,
  activity_status: "online" as const,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  last_login: "2023-01-01T12:00:00Z",
});

describe("UserStatusBadge", () => {
  it("renders active status correctly", () => {
    const user = createMockUser(UserStatus.ACTIVE);
    render(<UserStatusBadge user={user} />);

    expect(screen.getAllByText("Active")).toHaveLength(2); // Badge and tooltip
  });

  it("renders inactive status correctly", () => {
    const user = createMockUser(UserStatus.INACTIVE, false);
    render(<UserStatusBadge user={user} />);

    expect(screen.getAllByText("Inactive")).toHaveLength(2); // Badge and tooltip
  });

  it("renders banned status correctly", () => {
    const user = createMockUser(UserStatus.BANNED, false);
    render(<UserStatusBadge user={user} />);

    expect(screen.getAllByText("Banned")).toHaveLength(2); // Badge and tooltip
  });

  it("renders suspended status correctly", () => {
    const user = createMockUser(UserStatus.SUSPENDED, false);
    render(<UserStatusBadge user={user} />);

    expect(screen.getAllByText("Suspended")).toHaveLength(2); // Badge and tooltip
  });

  it("renders pending status correctly", () => {
    const user = createMockUser(UserStatus.PENDING, false);
    render(<UserStatusBadge user={user} />);

    expect(screen.getAllByText("Pending")).toHaveLength(2); // Badge and tooltip
  });

  it("renders without tooltip when showTooltip is false", () => {
    const user = createMockUser(UserStatus.ACTIVE);
    render(<UserStatusBadge user={user} showTooltip={false} />);

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.queryByTestId("tooltip-content")).not.toBeInTheDocument();
  });

  it("renders without icon when showIcon is false", () => {
    const user = createMockUser(UserStatus.ACTIVE);
    render(<UserStatusBadge user={user} showIcon={false} />);

    expect(screen.getAllByText("Active")).toHaveLength(2); // Badge and tooltip
    // Icon should not be rendered
  });

  it("renders without label when showLabel is false", () => {
    const user = createMockUser(UserStatus.ACTIVE);
    render(<UserStatusBadge user={user} showLabel={false} />);

    // Should only have text in tooltip, not in badge
    expect(screen.getAllByText("Active")).toHaveLength(1); // Only tooltip
  });

  it("applies custom className", () => {
    const user = createMockUser(UserStatus.ACTIVE);
    const { container } = render(
      <UserStatusBadge user={user} className="custom-class" />
    );

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("renders different sizes correctly", () => {
    const user = createMockUser(UserStatus.ACTIVE);

    const { rerender } = render(<UserStatusBadge user={user} size="sm" />);
    expect(screen.getAllByText("Active")).toHaveLength(2); // Badge and tooltip

    rerender(<UserStatusBadge user={user} size="md" />);
    expect(screen.getAllByText("Active")).toHaveLength(2); // Badge and tooltip

    rerender(<UserStatusBadge user={user} size="lg" />);
    expect(screen.getAllByText("Active")).toHaveLength(2); // Badge and tooltip
  });
});

describe("UserStatusBadge utility functions", () => {
  describe("getStatusPriority", () => {
    it("returns correct priorities for different statuses", () => {
      expect(getStatusPriority(UserStatus.ACTIVE)).toBe(1);
      expect(getStatusPriority(UserStatus.INACTIVE)).toBe(2);
      expect(getStatusPriority(UserStatus.SUSPENDED)).toBe(3);
      expect(getStatusPriority(UserStatus.BANNED)).toBe(4);
      expect(getStatusPriority(UserStatus.PENDING)).toBe(2);
    });
  });

  describe("getStatusColor", () => {
    it("returns correct colors for different statuses", () => {
      expect(getStatusColor(UserStatus.ACTIVE)).toBe("#10b981");
      expect(getStatusColor(UserStatus.INACTIVE)).toBe("#6b7280");
      expect(getStatusColor(UserStatus.BANNED)).toBe("#ef4444");
      expect(getStatusColor(UserStatus.SUSPENDED)).toBe("#f59e0b");
      expect(getStatusColor(UserStatus.PENDING)).toBe("#eab308");
    });
  });

  describe("canUserLogin", () => {
    it("returns true only for active status", () => {
      expect(canUserLogin(UserStatus.ACTIVE)).toBe(true);
      expect(canUserLogin(UserStatus.INACTIVE)).toBe(false);
      expect(canUserLogin(UserStatus.BANNED)).toBe(false);
      expect(canUserLogin(UserStatus.SUSPENDED)).toBe(false);
      expect(canUserLogin(UserStatus.PENDING)).toBe(false);
    });
  });
});
