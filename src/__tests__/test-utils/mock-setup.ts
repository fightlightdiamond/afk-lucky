import { vi } from "vitest";

// Centralized mock setup utilities
export const setupMocks = () => {
  // Mock all external dependencies
  vi.mock("next-auth", () => import("../__mocks__/auth"));
  vi.mock("@/lib/prisma", () => import("../__mocks__/prisma"));
  vi.mock("@/lib/ability", () => import("../__mocks__/ability"));
  vi.mock("@/lib/auth", () => ({
    authOptions: {},
  }));
};

// Helper to import mocks after they've been set up
export const importMocks = async () => {
  const { mockPrisma, resetPrismaMocks, setupPrismaDefaults } = await import(
    "../__mocks__/prisma"
  );
  const { mockAbility, resetAbilityMocks, mockPermissions } = await import(
    "../__mocks__/ability"
  );
  const {
    getServerSession,
    mockAuthenticatedSession,
    mockUnauthenticatedSession,
    mockUserWithRole,
    resetAuthMocks,
  } = await import("../__mocks__/auth");

  return {
    mockPrisma,
    mockAbility,
    getServerSession,
    resetPrismaMocks,
    setupPrismaDefaults,
    resetAbilityMocks,
    mockPermissions,
    mockAuthenticatedSession,
    mockUnauthenticatedSession,
    mockUserWithRole,
    resetAuthMocks,
  };
};

// Helper to reset all mocks
export const resetAllMocks = async () => {
  vi.clearAllMocks();

  const mocks = await importMocks();
  mocks.resetPrismaMocks();
  mocks.resetAbilityMocks();
  mocks.resetAuthMocks();
  mocks.setupPrismaDefaults();
};

// Common test data
export const createMockUser = (overrides: any = {}) => ({
  id: "user-1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  isActive: true,
  role: {
    id: "role-1",
    name: "USER",
    permissions: ["read:profile"],
  },
  ...overrides,
});

export const createMockRole = (overrides: any = {}) => ({
  id: "role-1",
  name: "USER",
  permissions: ["read:profile"],
  description: "Regular user role",
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

export const createMockSession = (userOverrides: any = {}) => ({
  user: createMockUser(userOverrides),
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

// Helper to create mock requests
export const createMockRequest = (url: string, options: any = {}) => {
  const { method = "GET", body, headers = {} } = options;

  const request = {
    url,
    method,
    headers: new Headers(headers),
    json: vi.fn().mockResolvedValue(body),
    formData: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(JSON.stringify(body)),
  };

  return request as any;
};
