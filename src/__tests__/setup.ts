import { expect, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
// Import shared mocks for better performance
import {
  getPrismaMock,
  getAuthMock,
  getRouterMock,
  testUtils,
} from "./test-utils/shared-mocks";

// Lazy load jest-dom matchers to reduce initial load time
let matchersLoaded = false;
const loadMatchers = async () => {
  if (!matchersLoaded) {
    const matchers = await import("@testing-library/jest-dom/matchers");
    expect.extend(matchers);
    matchersLoaded = true;
  }
};

// Load matchers on first test
beforeAll(async () => {
  await loadMatchers();
});

// Optimized global mocks - create once and reuse
const createObserverMock = () => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(createObserverMock);

// Mock ResizeObserver
global.ResizeObserver = vi.fn(createObserverMock);

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

// Optimized storage mocks - create once and reuse
const createStorageMock = () => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
});

// Mock localStorage and sessionStorage
Object.defineProperty(window, "localStorage", { value: createStorageMock() });
Object.defineProperty(window, "sessionStorage", { value: createStorageMock() });

// Import shared mocks for better performance
import {
  getPrismaMock,
  getAuthMock,
  getRouterMock,
  testUtils,
} from "./test-utils/shared-mocks";

// Mock next/navigation (lazy loaded)
vi.mock("next/navigation", () => getRouterMock());

// Mock next-auth (lazy loaded)
vi.mock("next-auth/react", () => getAuthMock());

// Mock Prisma (lazy loaded)
vi.mock("@/lib/prisma", () => ({
  default: getPrismaMock(),
}));

// Enhanced cleanup with performance optimizations
afterEach(() => {
  cleanup();
  testUtils.resetMocks();
});
