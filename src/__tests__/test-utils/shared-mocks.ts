import { vi } from "vitest";

// Shared mock instances to reduce memory usage and improve performance
export const sharedMocks = {
  // Prisma mock instance
  prisma: null as any,

  // Auth mock instance
  auth: null as any,

  // Router mock instance
  router: null as any,
};

// Initialize Prisma mock (lazy loaded)
export const getPrismaMock = () => {
  if (!sharedMocks.prisma) {
    sharedMocks.prisma = {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
        count: vi.fn(),
        groupBy: vi.fn(),
      },
      role: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(),
      $connect: vi.fn(),
      $disconnect: vi.fn(),
    };
  }
  return sharedMocks.prisma;
};

// Initialize Auth mock (lazy loaded)
export const getAuthMock = () => {
  if (!sharedMocks.auth) {
    sharedMocks.auth = {
      useSession: () => ({
        data: {
          user: {
            id: "test-user-id",
            email: "test@example.com",
            role: "ADMIN",
          },
        },
        status: "authenticated",
      }),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    };
  }
  return sharedMocks.auth;
};

// Initialize Router mock (lazy loaded)
export const getRouterMock = () => {
  if (!sharedMocks.router) {
    sharedMocks.router = {
      useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
      }),
      useSearchParams: () => ({
        get: vi.fn(),
        getAll: vi.fn(),
        has: vi.fn(),
        keys: vi.fn(),
        values: vi.fn(),
        entries: vi.fn(),
        forEach: vi.fn(),
        toString: vi.fn(),
      }),
      usePathname: () => "/admin/users",
    };
  }
  return sharedMocks.router;
};

// Reset all shared mocks (call this in test cleanup)
export const resetSharedMocks = () => {
  if (sharedMocks.prisma) {
    Object.values(sharedMocks.prisma.user).forEach((fn: any) => {
      if (typeof fn === "function" && fn.mockReset) {
        fn.mockReset();
      }
    });
    Object.values(sharedMocks.prisma.role).forEach((fn: any) => {
      if (typeof fn === "function" && fn.mockReset) {
        fn.mockReset();
      }
    });
  }

  if (sharedMocks.auth) {
    Object.values(sharedMocks.auth).forEach((fn: any) => {
      if (typeof fn === "function" && fn.mockReset) {
        fn.mockReset();
      }
    });
  }

  if (sharedMocks.router) {
    Object.values(sharedMocks.router).forEach((fn: any) => {
      if (typeof fn === "function" && fn.mockReset) {
        fn.mockReset();
      }
    });
  }
};

// Performance-optimized test utilities
export const testUtils = {
  // Fast DOM cleanup
  fastCleanup: () => {
    document.body.innerHTML = "";
  },

  // Optimized wait utility
  fastWait: (ms: number = 0) =>
    new Promise((resolve) => setTimeout(resolve, ms)),

  // Memory-efficient mock reset
  resetMocks: () => {
    vi.clearAllMocks();
    resetSharedMocks();
  },
};
