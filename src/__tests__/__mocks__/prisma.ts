import { vi } from "vitest";

// Type definitions for mock functions
export interface MockModel {
  findMany: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  createMany: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  updateMany: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  aggregate: ReturnType<typeof vi.fn>;
  groupBy: ReturnType<typeof vi.fn>;
}

export interface MockPrismaClient {
  user: MockModel;
  role: MockModel;
  contact: MockModel;
  story: MockModel;
  storyTemplate: MockModel;
  userPreferences: MockModel;
  storyUsageAnalytics: MockModel;
  storyVersion: MockModel;
  userSubscription: MockModel;
  wordType: MockModel;
  passwordReset: MockModel;
  subject: MockModel;
  userProfile: MockModel;
  question: MockModel;
  tag: MockModel;
  $transaction: ReturnType<typeof vi.fn>;
  $connect: ReturnType<typeof vi.fn>;
  $disconnect: ReturnType<typeof vi.fn>;
  $executeRaw: ReturnType<typeof vi.fn>;
  $queryRaw: ReturnType<typeof vi.fn>;
}

// Create mock functions for all Prisma operations
const createMockModel = (): MockModel => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  createMany: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn(),
  aggregate: vi.fn(),
  groupBy: vi.fn(),
});

// Mock Prisma client with all models
export const mockPrisma: MockPrismaClient = {
  // Core models
  user: createMockModel(),
  role: createMockModel(),
  contact: createMockModel(),

  // Story-related models
  story: createMockModel(),
  storyTemplate: createMockModel(),
  userPreferences: createMockModel(),
  storyUsageAnalytics: createMockModel(),
  storyVersion: createMockModel(),
  userSubscription: createMockModel(),

  // Other models
  wordType: createMockModel(),
  passwordReset: createMockModel(),
  subject: createMockModel(),
  userProfile: createMockModel(),
  question: createMockModel(),
  tag: createMockModel(),

  // Transaction support
  $transaction: vi.fn(),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $executeRaw: vi.fn(),
  $queryRaw: vi.fn(),
};

// Export as both named and default export to match different import patterns
export const prisma = mockPrisma;
export default mockPrisma;

// Helper function to reset all Prisma mocks
export const resetPrismaMocks = () => {
  Object.values(mockPrisma).forEach((model) => {
    if (typeof model === "object" && model !== null) {
      Object.values(model).forEach((method) => {
        if (vi.isMockFunction(method)) {
          method.mockReset();
        }
      });
    }
  });
};

// Helper function to setup common mock responses
export const setupPrismaDefaults = () => {
  // Default empty responses for core models
  mockPrisma.user.findMany.mockResolvedValue([]);
  mockPrisma.role.findMany.mockResolvedValue([]);
  mockPrisma.contact.findMany.mockResolvedValue([]);
  mockPrisma.story.findMany.mockResolvedValue([]);
  mockPrisma.storyTemplate.findMany.mockResolvedValue([]);

  // Default counts
  mockPrisma.user.count.mockResolvedValue(0);
  mockPrisma.role.count.mockResolvedValue(0);
  mockPrisma.contact.count.mockResolvedValue(0);
  mockPrisma.story.count.mockResolvedValue(0);

  // Default transaction behavior
  mockPrisma.$transaction.mockImplementation((callback) => {
    if (typeof callback === "function") {
      return callback(mockPrisma);
    }
    return Promise.resolve(callback);
  });
};
