# Testing Documentation

This directory contains comprehensive tests for the admin user management system.

## Test Structure

```
src/__tests__/
├── setup.ts                    # Test setup and global mocks
├── api/
│   └── admin/
│       └── users.test.ts       # API endpoint tests
├── components/
│   └── admin/
│       └── UserTable.test.tsx  # Component tests
└── hooks/
    └── useUsers.test.ts        # React Query hooks tests
```

## Test Types

### 1. API Tests (`api/admin/users.test.ts`)

Tests for all API endpoints including:

- GET /api/admin/users with filtering and pagination
- POST /api/admin/users with validation
- POST /api/admin/users/bulk for bulk operations
- Error handling and edge cases
- Permission checks

### 2. Component Tests (`components/admin/UserTable.test.tsx`)

Tests for React components including:

- Rendering with different data states
- User interactions (clicks, form submissions)
- Props handling and callbacks
- Loading and error states

### 3. Hook Tests (`hooks/useUsers.test.ts`)

Tests for React Query hooks including:

- Data fetching and caching
- Mutations and optimistic updates
- Error handling and retry logic
- State management integration

## Running Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run Storybook tests
npm run test:storybook

# Run all tests (unit + storybook)
npm run test:all
```

## Coverage Requirements

The test suite maintains minimum coverage thresholds:

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Test Utilities

### Setup (`setup.ts`)

- Configures testing environment
- Provides global mocks for browser APIs
- Sets up React Testing Library
- Mocks Next.js and authentication

### Mocking Strategy

- API calls are mocked using Vitest mocks
- Database operations use Prisma mocks
- Authentication is mocked with test user data
- Browser APIs are mocked for consistent testing

## Writing New Tests

### API Tests

```typescript
describe("API endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup mocks
  });

  it("should handle success case", async () => {
    // Arrange
    // Act
    // Assert
  });

  it("should handle error case", async () => {
    // Test error scenarios
  });
});
```

### Component Tests

```typescript
describe("Component", () => {
  const defaultProps = {
    // Define default props
  };

  it("should render correctly", () => {
    render(<Component {...defaultProps} />);
    expect(screen.getByRole("...")).toBeInTheDocument();
  });

  it("should handle user interactions", async () => {
    const user = userEvent.setup();
    const mockCallback = vi.fn();

    render(<Component {...defaultProps} onAction={mockCallback} />);

    await user.click(screen.getByRole("button"));
    expect(mockCallback).toHaveBeenCalled();
  });
});
```

### Hook Tests

```typescript
describe("useCustomHook", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should return expected data", async () => {
    const { result } = renderHook(() => useCustomHook(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Descriptive Test Names**: Test names should clearly describe the scenario
3. **Arrange-Act-Assert Pattern**: Structure tests with clear setup, action, and verification
4. **Mock External Dependencies**: Mock API calls, database operations, and third-party libraries
5. **Test Edge Cases**: Include tests for error states, empty data, and boundary conditions
6. **Keep Tests Independent**: Each test should be able to run in isolation
7. **Use Realistic Test Data**: Test data should resemble real application data

## Debugging Tests

### Common Issues

- **Mock not working**: Check if the mock is properly configured in setup.ts
- **Async operations**: Use `waitFor` for async operations
- **Component not rendering**: Check if all required props are provided
- **API tests failing**: Verify mock responses match expected format

### Debug Commands

```bash
# Run specific test file
npm run test -- users.test.ts

# Run tests with verbose output
npm run test -- --reporter=verbose

# Run tests in debug mode
npm run test -- --inspect-brk
```

## Integration with CI/CD

Tests are configured to run in CI/CD pipelines with:

- Coverage reporting
- Test result artifacts
- Failure notifications
- Performance monitoring

The test suite ensures code quality and prevents regressions in the user management system.
