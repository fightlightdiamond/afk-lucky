# Test Quick Reference Guide

## Common Test Patterns - Quick Reference

### Component Testing

```typescript
// Basic component test
import { render, screen } from "@testing-library/react";

it("renders component", () => {
  render(<Component />);
  expect(screen.getByText("Hello")).toBeInTheDocument();
});

// User interaction
import { fireEvent } from "@testing-library/react";

it("handles click", () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick} />);
  fireEvent.click(screen.getByRole("button"));
  expect(onClick).toHaveBeenCalled();
});

// Form testing
it("submits form", async () => {
  render(<Form onSubmit={onSubmit} />);
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "John" },
  });
  fireEvent.click(screen.getByRole("button", { name: /submit/i }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
});
```

### API Testing

```typescript
// GET endpoint
it("returns data", async () => {
  mockPrisma.user.findMany.mockResolvedValue(mockUsers);
  const request = new NextRequest("http://localhost/api/users");
  const response = await GET(request);
  expect(response.status).toBe(200);
});

// POST endpoint
it("creates resource", async () => {
  const data = { name: "John" };
  const request = new NextRequest("http://localhost/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
  const response = await POST(request);
  expect(response.status).toBe(201);
});

// Error handling
it("handles errors", async () => {
  mockPrisma.user.findMany.mockRejectedValue(new Error("DB Error"));
  const response = await GET(request);
  expect(response.status).toBe(500);
});
```

### Hook Testing

```typescript
import { renderHook, act } from "@testing-library/react";

// Basic hook
it("returns initial state", () => {
  const { result } = renderHook(() => useCounter());
  expect(result.current.count).toBe(0);
});

// Hook with actions
it("increments count", () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(1);
});

// Async hook
it("fetches data", async () => {
  const { result } = renderHook(() => useUsers());
  await waitFor(() => {
    expect(result.current.users).toHaveLength(2);
  });
});
```

### Mock Patterns

```typescript
// Mock module
vi.mock("@/lib/api", () => ({
  fetchUsers: vi.fn().mockResolvedValue(mockUsers),
}));

// Mock component
vi.mock("@/components/Complex", () => ({
  default: ({ children }) => <div data-testid="complex">{children}</div>,
}));

// Mock hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser, isAuthenticated: true }),
}));

// Partial mock
vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual("@/lib/utils");
  return {
    ...actual,
    formatDate: vi.fn().mockReturnValue("2023-01-01"),
  };
});
```

### Accessibility Testing

```typescript
// ARIA labels
expect(screen.getByRole("button")).toHaveAccessibleName("Save user");

// Keyboard navigation
fireEvent.keyDown(element, { key: "Enter" });
fireEvent.keyDown(element, { key: "ArrowDown" });

// Focus management
expect(document.activeElement).toBe(screen.getByRole("button"));
```

### Async Testing

```typescript
// Wait for element
await waitFor(() => {
  expect(screen.getByText("Loaded")).toBeInTheDocument();
});

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByText("Loading")).not.toBeInTheDocument();
});

// Custom timeout
await waitFor(
  () => {
    expect(element).toBeInTheDocument();
  },
  { timeout: 5000 }
);
```

### Error Testing

```typescript
// Component errors
const ThrowError = () => {
  throw new Error("Test error");
};
render(
  <ErrorBoundary>
    <ThrowError />
  </ErrorBoundary>
);
expect(screen.getByText(/error/i)).toBeInTheDocument();

// API errors
global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
const { result } = renderHook(() => useApi());
await waitFor(() => expect(result.current.error).toBeTruthy());
```

### Performance Testing

```typescript
// Render time
const start = performance.now();
render(<LargeComponent data={largeDataset} />);
const renderTime = performance.now() - start;
expect(renderTime).toBeLessThan(100); // ms
```

### Common Selectors

```typescript
// By role
screen.getByRole("button", { name: /save/i });
screen.getByRole("textbox", { name: /email/i });
screen.getByRole("table");

// By label
screen.getByLabelText(/first name/i);

// By text
screen.getByText("Hello World");
screen.getByText(/hello/i); // regex

// By test id
screen.getByTestId("user-card");

// Query variants (returns null if not found)
screen.queryByText("Not Found"); // null
screen.findByText("Async Text"); // Promise
```

### Setup and Cleanup

```typescript
describe("Component", () => {
  beforeEach(() => {
    // Setup before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    cleanup();
  });

  beforeAll(() => {
    // Setup once before all tests
  });

  afterAll(() => {
    // Cleanup once after all tests
  });
});
```

### Test Data Factories

```typescript
const createUser = (overrides = {}) => ({
  id: "user-1",
  name: "John Doe",
  email: "john@test.com",
  ...overrides,
});

const createUsers = (count = 3) =>
  Array.from({ length: count }, (_, i) => createUser({ id: `user-${i + 1}` }));
```

### Debugging

```typescript
// Debug DOM
screen.debug();
screen.debug(screen.getByRole("button"));

// Log queries
screen.logTestingPlaygroundURL();

// Pretty print
console.log(prettyDOM(container));
```

### Common Assertions

```typescript
// Existence
expect(element).toBeInTheDocument();
expect(element).not.toBeInTheDocument();

// Visibility
expect(element).toBeVisible();
expect(element).not.toBeVisible();

// Text content
expect(element).toHaveTextContent("Hello");
expect(element).toHaveTextContent(/hello/i);

// Attributes
expect(element).toHaveAttribute("disabled");
expect(element).toHaveClass("active");

// Form elements
expect(input).toHaveValue("test");
expect(checkbox).toBeChecked();

// Function calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith("arg");
expect(mockFn).toHaveBeenCalledTimes(2);
```
