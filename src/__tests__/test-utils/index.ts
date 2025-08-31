// Re-export all test utilities for easy importing
export * from "./auth-helpers";

// Common test setup utilities
export {
  setupPrismaDefaults,
  resetPrismaMocks,
  mockPrisma,
} from "../__mocks__/prisma";
export {
  resetAbilityMocks,
  mockPermissions,
  mockAbility,
} from "../__mocks__/ability";
export { resetAuthMocks } from "../__mocks__/auth";

// Utility function to reset all mocks at once
export const resetAllMocks = () => {
  resetPrismaMocks();
  resetAbilityMocks();
  resetAuthMocks();
};

// Common test data
export const testData = {
  validEmail: "test@example.com",
  invalidEmail: "invalid-email",
  validPassword: "Password123!",
  weakPassword: "123",
  testId: "test-id-123",
  testUuid: "550e8400-e29b-41d4-a716-446655440000",
};

// Common test assertions
export const expectSuccessResponse = (response: any, expectedData?: any) => {
  expect(response.status).toBe(200);
  if (expectedData) {
    expect(response.json).toHaveBeenCalledWith(expectedData);
  }
};

export const expectErrorResponse = (
  response: any,
  expectedStatus: number,
  expectedMessage?: string
) => {
  expect(response.status).toBe(expectedStatus);
  if (expectedMessage) {
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expectedMessage })
    );
  }
};

export const expectUnauthorizedResponse = (response: any) => {
  expectErrorResponse(response, 401, "Unauthorized");
};

export const expectForbiddenResponse = (response: any) => {
  expectErrorResponse(response, 403, "Forbidden");
};
