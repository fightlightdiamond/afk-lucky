import { vi } from "vitest";
import { Session } from "next-auth";

// Mock session data
export const mockUser = {
  id: "1",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  role: {
    id: "1",
    name: "ADMIN",
    permissions: ["user:read", "user:create", "user:update", "user:delete"],
  },
  isActive: true,
};

export const mockSession: Session = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock next-auth functions
export const getServerSession = vi.fn();

// Helper functions for setting up auth mocks
export const mockAuthenticatedSession = (
  customUser?: Partial<typeof mockUser>
) => {
  const user = { ...mockUser, ...customUser };
  const session = { ...mockSession, user };
  getServerSession.mockResolvedValue(session);
  return session;
};

export const mockUnauthenticatedSession = () => {
  getServerSession.mockResolvedValue(null);
  return null;
};

export const mockUserWithRole = (
  roleName: string,
  permissions: string[] = []
) => {
  return mockAuthenticatedSession({
    role: {
      id: "1",
      name: roleName,
      permissions,
    },
  });
};

// Reset auth mocks
export const resetAuthMocks = () => {
  getServerSession.mockReset();
};
