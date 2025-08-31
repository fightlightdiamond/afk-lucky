# Test Patterns and Best Practices

## Overview

This document outlines the standardized test patterns, best practices, and guidelines for writing maintainable and efficient tests in the admin user management system.

## Table of Contents

1. [Test Structure and Organization](#test-structure-and-organization)
2. [Mock Patterns](#mock-patterns)
3. [Component Testing Patterns](#component-testing-patterns)
4. [API Testing Patterns](#api-testing-patterns)
5. [Hook Testing Patterns](#hook-testing-patterns)
6. [Performance Best Practices](#performance-best-practices)
7. [Accessibility Testing](#accessibility-testing)
8. [Error Handling Testing](#error-handling-testing)
9. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)

## Test Structure and Organization

### File Naming Convention

```
src/__tests__/
├── api/
│   └── admin/
│       ├── users.test.ts
│       ├── users-[id].test.ts
│       └── roles.test.ts
├── components/
│   └── admin/
│       ├── UserTable.test.tsx
│       └── UserDialog.test.tsx
├── hooks/
│   ├── useUsers.test.ts
│   └── useExport.test.ts
├── integration/
│   └── user-management-workflows.test.tsx
├── accessibility/
│   └── admin-accessibility.test.tsx
└── performance/
    └── user-table-performance.test.tsx
```

### Test File Structure

```typescript
// Standard test file structure
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ComponentUnderTest } from "@/components/ComponentUnderTest";

// Test data and mocks
const mockData = {
  // Test data here
};

// Mock setup
vi.mock("@/lib/dependency", () => ({
  // Mock implementation
}));

describe("ComponentUnderTest", () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe("Feature Group", () => {
    it("should behave correctly when condition is met", async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Mock Patterns

### 1. Shared Mock Pattern

Use shared mocks for better performance and consistency:

```typescript
// src/__tests__/test-utils/shared-mocks.ts
import { vi } from "vitest";

export const getPrismaMock = () => {
  if (!sharedMocks.prisma) {
    sharedMocks.prisma = {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
  }
  return sharedMocks.prisma;
};
```

### 2. API Mock Pattern

```typescript
// Mock API responses consistently
const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
});

global.fetch = vi.fn().mockResolvedValue(mockApiResponse(mockData));
```

### 3. Component Mock Pattern

```typescript
// Mock complex components
vi.mock("@/components/ComplexComponent", () => ({
  default: vi.fn(({ children, ...props }) => (
    <div data-testid="complex-component" {...props}>
      {children}
    </div>
  )),
}));
```

## Component Testing Patterns

### 1. Basic Component Rendering

```typescript
describe("UserTable Component", () => {
  const defaultProps = {
    users: mockUsers,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("renders user table with correct data", () => {
    render(<UserTable {...defaultProps} />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
```

### 2. User Interaction Testing

```typescript
it("calls onEdit when edit button is clicked", async () => {
  const onEdit = vi.fn();
  render(<UserTable {...defaultProps} onEdit={onEdit} />);

  const editButton = screen.getByRole("button", { name: /edit/i });
  fireEvent.click(editButton);

  expect(onEdit).toHaveBeenCalledWith(mockUsers[0]);
});
```

### 3. Form Testing Pattern

```typescript
it("submits form with correct data", async () => {
  const onSubmit = vi.fn();
  render(<UserForm onSubmit={onSubmit} />);

  // Fill form fields
  fireEvent.change(screen.getByLabelText(/first name/i), {
    target: { value: "John" },
  });

  // Submit form
  fireEvent.click(screen.getByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      firstName: "John",
    });
  });
});
```

## API Testing Patterns

### 1. GET Endpoint Testing

```typescript
describe("/api/admin/users", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it("should return users successfully", async () => {
    // Mock Prisma response
    mockPrisma.user.findMany.mockResolvedValue(mockUsers);

    const request = new NextRequest("http://localhost:3000/api/admin/users");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toHaveLength(2);
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
      include: { role: true },
      orderBy: { created_at: "desc" },
    });
  });
});
```

### 2. POST Endpoint Testing

```typescript
it("should create user successfully", async () => {
  const newUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john@test.com",
  };
  mockPrisma.user.create.mockResolvedValue({ id: "new-id", ...newUser });

  const request = new NextRequest("http://localhost:3000/api/admin/users", {
    method: "POST",
    body: JSON.stringify(newUser),
  });

  const response = await POST(request);
  const data = await response.json();

  expect(response.status).toBe(201);
  expect(data.firstName).toBe("John");
  expect(mockPrisma.user.create).toHaveBeenCalledWith({
    data: expect.objectContaining(newUser),
  });
});
```

### 3. Error Handling Testing

```typescript
it("should handle database errors", async () => {
  mockPrisma.user.findMany.mockRejectedValue(new Error("Database error"));

  const request = new NextRequest("http://localhost:3000/api/admin/users");
  const response = await GET(request);

  expect(response.status).toBe(500);
  const data = await response.json();
  expect(data.error).toBe("Internal server error");
});
```

## Hook Testing Patterns

### 1. Basic Hook Testing

```typescript
import { renderHook, act } from "@testing-library/react";
import { useUsers } from "@/hooks/useUsers";

describe("useUsers", () => {
  it("should fetch users successfully", async () => {
    global.fetch = vi.fn().mockResolvedValue(mockApiResponse(mockUsers));

    const { result } = renderHook(() => useUsers());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
  });
});
```

### 2. Hook with Provider Testing

```typescript
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const { result } = renderHook(() => useUsers(), { wrapper });
```

## Performance Best Practices

### 1. Lazy Loading Mocks

```typescript
// Lazy load heavy dependencies
const loadHeavyMock = async () => {
  const { heavyFunction } = await import("@/lib/heavy-dependency");
  return vi.mocked(heavyFunction);
};
```

### 2. Shared Test Data

```typescript
// Create shared test data to reduce memory usage
const createMockUser = (overrides = {}) => ({
  id: "user-1",
  firstName: "John",
  lastName: "Doe",
  email: "john@test.com",
  ...overrides,
});
```

### 3. Optimized Cleanup

```typescript
afterEach(() => {
  // Fast cleanup
  cleanup();
  vi.clearAllMocks();
  // Reset shared mocks
  resetSharedMocks();
});
```

## Accessibility Testing

### 1. Basic Accessibility Tests

```typescript
it("has proper ARIA labels", () => {
  render(<UserTable {...defaultProps} />);

  expect(screen.getByRole("table")).toHaveAccessibleName("Users table");
  expect(
    screen.getByRole("button", { name: /edit user/i })
  ).toBeInTheDocument();
});
```

### 2. Keyboard Navigation Testing

```typescript
it("supports keyboard navigation", () => {
  render(<UserTable {...defaultProps} />);

  const table = screen.getByRole("table");
  fireEvent.keyDown(table, { key: "ArrowDown" });

  expect(document.activeElement).toHaveAttribute("data-row", "0");
});
```

## Error Handling Testing

### 1. Component Error Boundaries

```typescript
it("handles errors gracefully", () => {
  const ThrowError = () => {
    throw new Error("Test error");
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

### 2. API Error Testing

```typescript
it("handles API errors", async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

  const { result } = renderHook(() => useUsers());

  await waitFor(() => {
    expect(result.current.error).toBeTruthy();
  });
});
```

## Common Pitfalls and Solutions

### 1. Async Testing Issues

**Problem**: Tests failing due to async operations not completing

**Solution**: Use `waitFor` and proper async/await patterns

```typescript
// ❌ Wrong
it("should update state", () => {
  fireEvent.click(button);
  expect(screen.getByText("Updated")).toBeInTheDocument(); // May fail
});

// ✅ Correct
it("should update state", async () => {
  fireEvent.click(button);
  await waitFor(() => {
    expect(screen.getByText("Updated")).toBeInTheDocument();
  });
});
```

### 2. Mock Leakage

**Problem**: Mocks affecting other tests

**Solution**: Proper cleanup and mock isolation

```typescript
// ❌ Wrong - global mock without cleanup
vi.mock("@/lib/api");

// ✅ Correct - scoped mock with cleanup
describe("Component", () => {
  beforeEach(() => {
    vi.mock("@/lib/api");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
```

### 3. Over-mocking

**Problem**: Mocking too much, losing test value

**Solution**: Mock only external dependencies

```typescript
// ❌ Wrong - mocking internal logic
vi.mock("@/components/UserCard");

// ✅ Correct - mocking external API
vi.mock("@/lib/api");
```

### 4. Flaky Tests

**Problem**: Tests that sometimes pass, sometimes fail

**Solution**: Proper waiting and deterministic test data

```typescript
// ❌ Wrong - timing dependent
setTimeout(() => {
  expect(element).toBeInTheDocument();
}, 100);

// ✅ Correct - event driven
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

## Test Data Management

### 1. Factory Pattern

```typescript
// src/__tests__/test-utils/factories.ts
export const userFactory = (overrides = {}) => ({
  id: faker.string.uuid(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
});
```

### 2. Fixture Files

```typescript
// src/__tests__/fixtures/users.json
[
  {
    id: "user-1",
    firstName: "John",
    lastName: "Doe",
    email: "john@test.com",
  },
];
```

## Continuous Integration Considerations

### 1. Test Parallelization

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: "threads",
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 2,
      },
    },
  },
});
```

### 2. Test Timeouts

```typescript
// Set appropriate timeouts for CI
export default defineConfig({
  test: {
    testTimeout: 10000, // 10 seconds
    hookTimeout: 10000,
  },
});
```

## Debugging Test Issues

### 1. Debug Utilities

```typescript
// Add debug helpers
import { screen } from "@testing-library/react";

// Debug DOM state
screen.debug();

// Debug specific element
screen.debug(screen.getByRole("button"));
```

### 2. Test Isolation

```typescript
// Run single test for debugging
it.only("should debug this test", () => {
  // Test code
});
```

## Conclusion

Following these patterns and best practices will help maintain a robust, efficient, and maintainable test suite. Remember to:

1. Keep tests simple and focused
2. Use consistent patterns across the codebase
3. Mock external dependencies, not internal logic
4. Write tests that are easy to understand and maintain
5. Optimize for performance without sacrificing reliability
6. Ensure accessibility compliance through testing
7. Handle errors gracefully in tests
8. Use proper async patterns for reliable tests

For questions or suggestions about these patterns, please refer to the team's testing guidelines or reach out to the development team.
