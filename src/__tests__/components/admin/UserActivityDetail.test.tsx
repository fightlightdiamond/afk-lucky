import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserActivityDetail } from "@/components/admin/UserActivityDetail";
import { User, UserRole, UserStatus, ActivityStatus } from "@/types/user";

// Mock the date-fns functions
vi.mock("date-fns", () => ({
  formatDistanceToNow: vi.fn(() => "2 hours"),
  format: vi.fn(() => "Dec 15, 2023 at 14:30"),
}));

const mockUser: User = {
  id: "1",
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  full_name: "John Doe",
  display_name: "John Doe",
  is_active: true,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-12-15T14:30:00Z",
  last_login: "2023-12-15T14:30:00Z",
  last_logout: "2023-12-15T16:30:00Z",
  status: UserStatus.ACTIVE,
  activity_status: ActivityStatus.OFFLINE,
  role: {
    id: "role-1",
    name: UserRole.USER,
    permissions: ["read"],
    description: "Regular user",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
};

const mockUserNeverLoggedIn: User = {
  ...mockUser,
  id: "2",
  last_login: undefined,
  last_logout: undefined,
  activity_status: ActivityStatus.NEVER,
};

const mockUserOnline: User = {
  ...mockUser,
  id: "3",
  activity_status: ActivityStatus.ONLINE,
  last_logout: undefined,
};

describe("UserActivityDetail", () => {
  it("renders trigger button correctly", () => {
    render(<UserActivityDetail user={mockUser} />);

    expect(
      screen.getByRole("button", { name: /view activity/i })
    ).toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    render(<UserActivityDetail user={mockUser} />);

    const trigger = screen.getByRole("button", { name: /view activity/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(
        screen.getByText("Activity Details - John Doe")
      ).toBeInTheDocument();
    });
  });

  it("displays current status for offline user", async () => {
    render(<UserActivityDetail user={mockUser} />);

    const trigger = screen.getByRole("button", { name: /view activity/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Current Status")).toBeInTheDocument();
      expect(screen.getByText("Offline")).toBeInTheDocument();
    });
  });

  it("displays current status for online user", async () => {
    render(<UserActivityDetail user={mockUserOnline} />);

    const trigger = screen.getByRole("button", { name: /view activity/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Online")).toBeInTheDocument();
    });
  });

  it("displays never logged in status", async () => {
    render(<UserActivityDetail user={mockUserNeverLoggedIn} />);

    const trigger = screen.getByRole("button", { name: /view activity/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Never logged in")).toBeInTheDocument();
      expect(
        screen.getByText("This user has never logged into the system.")
      ).toBeInTheDocument();
    });
  });

  it("displays login statistics", async () => {
    render(<UserActivityDetail user={mockUser} />);

    const trigger = screen.getByRole("button", { name: /view activity/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Login Statistics")).toBeInTheDocument();
      expect(screen.getByText("Total Sessions")).toBeInTheDocument();
      expect(screen.getByText("Active Sessions")).toBeInTheDocument();
      expect(screen.getByText("Last Login")).toBeInTheDocument();
    });
  });

  it("shows active sessions for online user", async () => {
    render(<UserActivityDetail user={mockUserOnline} />);

    const trigger = screen.getByRole("button", { name: /view activity/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getAllByText(/Active Sessions/).length).toBeGreaterThan(0);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  it("shows recent sessions for user with login history", async () => {
    render(<UserActivityDetail user={mockUser} />);

    const trigger = screen.getByRole("button", { name: /view activity/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Recent Sessions")).toBeInTheDocument();
    });
  });

  it("displays member since date", async () => {
    render(<UserActivityDetail user={mockUser} />);

    const trigger = screen.getByRole("button", { name: /view activity/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText(/Member since/)).toBeInTheDocument();
    });
  });

  it("renders with custom trigger", () => {
    const customTrigger = <button>Custom Trigger</button>;
    render(<UserActivityDetail user={mockUser} trigger={customTrigger} />);

    expect(screen.getByText("Custom Trigger")).toBeInTheDocument();
  });

  it("displays session details with location and device info", async () => {
    render(<UserActivityDetail user={mockUser} />);

    const trigger = screen.getByRole("button", { name: /view activity/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      // Check for location information
      expect(
        screen.getAllByText(/Ho Chi Minh City, Vietnam/).length
      ).toBeGreaterThan(0);
      // Check for IP address
      expect(screen.getAllByText(/192\.168\.1\./).length).toBeGreaterThan(0);
    });
  });

  it("handles user with no activity gracefully", async () => {
    const userWithNoActivity = {
      ...mockUserNeverLoggedIn,
      created_at: "2023-01-01T00:00:00Z",
    };

    render(<UserActivityDetail user={userWithNoActivity} />);

    const trigger = screen.getByRole("button", { name: /view activity/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("No Activity Found")).toBeInTheDocument();
    });
  });
});
