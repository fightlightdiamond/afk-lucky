import { vi } from "vitest";
import { Session } from "next-auth";

// Import UserRole enum directly to avoid circular dependencies
export enum UserRole {
  ADMIN = "ADMIN",
  AUTHOR = "AUTHOR",
  EDITOR = "EDITOR",
  MODERATOR = "MODERATOR",
  USER = "USER",
}

// Type definitions for test users and sessions
export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  isActive: boolean;
}

export interface TestSession extends Session {
  user: TestUser;
}

// Helper function to create test users
const createTestUser = (
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  roleName: UserRole,
  roleId: string,
  permissions: string[],
  isActive: boolean = true
): TestUser => ({
  id,
  email,
  firstName,
  lastName,
  role: {
    id: roleId,
    name: roleName,
    permissions: [...permissions], // Create mutable array
  },
  isActive,
});

// Default test users for different roles
export const testUsers = {
  admin: createTestUser(
    "admin-1",
    "admin@example.com",
    "Admin",
    "User",
    UserRole.ADMIN,
    "role-admin",
    [
      "user:read",
      "user:create",
      "user:update",
      "user:delete",
      "role:read",
      "role:create",
      "role:update",
      "role:delete",
      "story:read",
      "story:create",
      "story:update",
      "story:delete",
      "contact:read",
      "contact:create",
      "contact:update",
      "contact:delete",
    ]
  ),
  author: createTestUser(
    "author-1",
    "author@example.com",
    "Author",
    "User",
    UserRole.AUTHOR,
    "role-author",
    [
      "story:read",
      "story:create",
      "story:update",
      "content:read",
      "content:create",
      "content:update",
    ]
  ),
  editor: createTestUser(
    "editor-1",
    "editor@example.com",
    "Editor",
    "User",
    UserRole.EDITOR,
    "role-editor",
    [
      "story:read",
      "story:update",
      "content:read",
      "content:update",
      "content:publish",
    ]
  ),
  moderator: createTestUser(
    "moderator-1",
    "moderator@example.com",
    "Moderator",
    "User",
    UserRole.MODERATOR,
    "role-moderator",
    [
      "user:read",
      "user:update",
      "story:read",
      "story:update",
      "contact:read",
      "contact:update",
    ]
  ),
  user: createTestUser(
    "user-1",
    "user@example.com",
    "Regular",
    "User",
    UserRole.USER,
    "role-user",
    ["story:read"]
  ),
  inactive: createTestUser(
    "inactive-1",
    "inactive@example.com",
    "Inactive",
    "User",
    UserRole.USER,
    "role-user",
    ["story:read"],
    false
  ),
};

// Session creation utilities
export const createTestSession = (user: TestUser): TestSession => ({
  user,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

export const createSessionForRole = (
  role: keyof typeof testUsers
): TestSession => {
  return createTestSession(testUsers[role]);
};

// Mock setup utilities
export const mockAuthenticatedUser = (user: TestUser = testUsers.admin) => {
  const session = createTestSession(user);
  const getServerSession = vi.fn().mockResolvedValue(session);
  return { session, getServerSession };
};

export const mockUnauthenticatedUser = () => {
  const getServerSession = vi.fn().mockResolvedValue(null);
  return { session: null, getServerSession };
};

export const mockUserWithPermissions = (
  permissions: string[],
  role: string = UserRole.USER
) => {
  const customUser: TestUser = {
    ...testUsers.user,
    role: {
      ...testUsers.user.role,
      name: role,
      permissions: [...permissions],
    },
  };
  return mockAuthenticatedUser(customUser);
};

// Custom user creation utility
export const createCustomUser = (overrides: Partial<TestUser>): TestUser => {
  const baseUser = testUsers.user;
  return {
    ...baseUser,
    ...overrides,
    role: {
      ...baseUser.role,
      ...overrides.role,
    },
  };
};

// Batch user creation for testing lists
export const createTestUsers = (
  count: number,
  roleType: keyof typeof testUsers = "user"
): TestUser[] => {
  const baseUser = testUsers[roleType];
  return Array.from({ length: count }, (_, index) => ({
    ...baseUser,
    id: `${roleType}-${index + 1}`,
    email: `${roleType}${index + 1}@example.com`,
    firstName: `${baseUser.firstName}${index + 1}`,
    role: {
      ...baseUser.role,
      permissions: [...baseUser.role.permissions], // Create mutable copy
    },
  }));
};

// Permission checking utilities
export const hasPermission = (user: TestUser, permission: string): boolean => {
  return (
    user.role.permissions.includes(permission) ||
    user.role.name === UserRole.ADMIN
  );
};

export const canManageUsers = (user: TestUser): boolean => {
  return hasPermission(user, "user:read") && hasPermission(user, "user:update");
};

export const canCreateUsers = (user: TestUser): boolean => {
  return hasPermission(user, "user:create");
};

export const canDeleteUsers = (user: TestUser): boolean => {
  return hasPermission(user, "user:delete");
};

// Mock reset utility
export const resetAuthMocks = () => {
  vi.clearAllMocks();
};

// Request mocking utilities for API tests
export const createMockRequest = (
  method: string = "GET",
  body?: any,
  headers?: Record<string, string>
) => {
  const request = {
    method,
    headers: new Headers(headers),
    json: vi.fn().mockResolvedValue(body),
    formData: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
    url: "http://localhost:3000/api/test",
  };

  return request as any; // Mock Request object
};

export const createMockResponse = (status: number = 200, data?: any) => {
  return {
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
    ok: status >= 200 && status < 300,
  } as any; // Mock Response object
};

// Integration test helpers
export const setupAuthenticatedTest = (
  role: keyof typeof testUsers = "admin"
) => {
  const user = testUsers[role];
  const session = createTestSession(user);
  const mockGetServerSession = vi.fn().mockResolvedValue(session);

  return {
    user,
    session,
    mockGetServerSession,
    cleanup: () => {
      mockGetServerSession.mockReset();
    },
  };
};

export const setupUnauthenticatedTest = () => {
  const mockGetServerSession = vi.fn().mockResolvedValue(null);

  return {
    user: null,
    session: null,
    mockGetServerSession,
    cleanup: () => {
      mockGetServerSession.mockReset();
    },
  };
};
