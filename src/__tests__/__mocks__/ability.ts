import { vi } from "vitest";

// Mock ability object with all necessary methods
export const mockAbility = {
  can: vi.fn(() => true),
  cannot: vi.fn(() => false),
  rules: [],
};

// Mock the main functions exported from @/lib/ability
export const createAbility = vi.fn(() => mockAbility);
export const defineAbilitiesFor = vi.fn(() => mockAbility);

// Export UserRole enum for tests that need it
export const UserRole = {
  ADMIN: "ADMIN",
  AUTHOR: "AUTHOR",
  EDITOR: "EDITOR",
  MODERATOR: "MODERATOR",
  USER: "USER",
} as const;

// Export AppAbility type mock
export const AppAbility = vi.fn();

// Helper function to reset all mocks
export const resetAbilityMocks = () => {
  vi.clearAllMocks();
  mockAbility.can.mockReturnValue(true);
  mockAbility.cannot.mockReturnValue(false);
};

// Helper function to mock specific permissions
export const mockPermissions = (permissions: Record<string, boolean>) => {
  mockAbility.can.mockImplementation((...args: unknown[]) => {
    if (args.length >= 2) {
      const [action, subject] = args;
      const key = `${action}:${subject}`;
      return permissions[key] ?? true;
    }
    return true;
  });
};
