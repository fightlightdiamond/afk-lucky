# Code Structure Standards and Organization

## Overview

This document establishes standardized folder structure, naming conventions, import/export patterns, and code organization guidelines for the admin user management system. These standards ensure consistency, maintainability, and scalability across the codebase.

## Table of Contents

1. [Folder Structure Standards](#folder-structure-standards)
2. [Naming Conventions](#naming-conventions)
3. [Import/Export Patterns](#importexport-patterns)
4. [Path Aliases](#path-aliases)
5. [Component Organization](#component-organization)
6. [Test Organization](#test-organization)
7. [Story Organization](#story-organization)
8. [Code Templates](#code-templates)
9. [Best Practices](#best-practices)

## Folder Structure Standards

### Root Level Structure

```
project-root/
├── .kiro/                    # Kiro configuration and specs
├── docs/                     # Documentation files
├── public/                   # Static assets
├── prisma/                   # Database schema and migrations
├── src/                      # Source code
├── storybook-static/         # Built Storybook files
├── .storybook/              # Storybook configuration
└── [config files]           # Various configuration files
```

### Source Code Structure (`src/`)

```
src/
├── __tests__/               # Test files and utilities
│   ├── __mocks__/          # Global mocks
│   ├── accessibility/      # Accessibility tests
│   ├── api/               # API endpoint tests
│   ├── components/        # Component tests
│   ├── e2e/              # End-to-end tests
│   ├── hooks/            # Hook tests
│   ├── integration/      # Integration tests
│   ├── pages/            # Page tests
│   ├── performance/      # Performance tests
│   └── test-utils/       # Test utilities and helpers
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin pages
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   └── [feature]/        # Feature-specific pages
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── navigation/       # Navigation components
│   ├── providers/        # Context providers
│   ├── story/            # Story-related components
│   └── ui/               # Reusable UI components
├── context/              # React contexts
├── data/                 # Static data and constants
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries and configurations
├── providers/            # Global providers
├── services/             # Business logic services
├── store/                # State management
├── stories/              # Storybook stories
│   ├── admin/            # Admin component stories
│   ├── assets/           # Story assets
│   └── [domain]/         # Domain-specific stories
└── types/                # TypeScript type definitions
```

### Domain-Based Organization

Components are organized by domain/feature:

```
src/components/
├── admin/                 # User management, roles, permissions
│   ├── filters/          # Filter components
│   ├── UserDialog.tsx    # User creation/editing
│   ├── UserTable.tsx     # User listing
│   └── ...
├── auth/                 # Authentication components
├── navigation/           # Navigation and layout
├── story/               # Story/content management
└── ui/                  # Generic UI components
```

## Naming Conventions

### Files and Directories

| Type        | Convention                    | Example                     |
| ----------- | ----------------------------- | --------------------------- |
| Components  | PascalCase                    | `UserDialog.tsx`            |
| Pages       | kebab-case                    | `user-management/`          |
| Hooks       | camelCase starting with 'use' | `useUsers.ts`               |
| Utilities   | camelCase                     | `formatDate.ts`             |
| Types       | camelCase                     | `user.ts`                   |
| Constants   | SCREAMING_SNAKE_CASE          | `API_ENDPOINTS.ts`          |
| Test files  | Same as source + `.test`      | `UserDialog.test.tsx`       |
| Story files | Same as source + `.stories`   | `UserDialog.stories.tsx`    |
| Mock files  | Same as source                | `ability.ts` (in **mocks**) |

### Component Naming

```typescript
// ✅ Good - PascalCase for components
export const UserDialog = () => { ... }
export const BulkActionBar = () => { ... }
export const SearchInput = () => { ... }

// ❌ Bad
export const userDialog = () => { ... }
export const bulk_action_bar = () => { ... }
```

### Hook Naming

```typescript
// ✅ Good - camelCase starting with 'use'
export const useUsers = () => { ... }
export const useBulkOperations = () => { ... }
export const useDebounce = () => { ... }

// ❌ Bad
export const Users = () => { ... }
export const getBulkOperations = () => { ... }
```

### File Organization Patterns

```
ComponentName/
├── ComponentName.tsx         # Main component
├── ComponentName.test.tsx    # Component tests
├── ComponentName.stories.tsx # Storybook stories
├── ComponentName.module.css  # Component styles (if needed)
├── index.ts                  # Barrel export
└── types.ts                  # Component-specific types
```

## Import/Export Patterns

### Import Order and Grouping

```typescript
// 1. React and core libraries
import React, { useState, useEffect } from "react";
import { NextRequest, NextResponse } from "next/server";

// 2. Third-party libraries
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

// 3. Internal UI components (alphabetical)
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// 4. Internal components and utilities (alphabetical)
import { UserTable } from "@/components/admin/UserTable";
import { useUsers } from "@/hooks/useUsers";
import { formatDate } from "@/lib/utils";

// 5. Types (alphabetical)
import type { User, Role } from "@/types/user";
import type { ApiResponse } from "@/types/api";
```

### Export Patterns

```typescript
// ✅ Preferred - Named exports
export const UserDialog = () => { ... }
export const UserTable = () => { ... }

// ✅ Acceptable - Default export for single main component
const UserManagementPage = () => { ... }
export default UserManagementPage;

// ✅ Barrel exports in index.ts
export { UserDialog } from "./UserDialog";
export { UserTable } from "./UserTable";
export type { UserDialogProps } from "./UserDialog";
```

### Re-export Patterns

```typescript
// src/components/admin/index.ts
export { UserDialog } from "./UserDialog";
export { UserTable } from "./UserTable";
export { BulkOperations } from "./BulkOperations";

// Usage
import { UserDialog, UserTable } from "@/components/admin";
```

## Path Aliases

### Configured Aliases

```typescript
// tsconfig.json paths configuration
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

### Usage Patterns

```typescript
// ✅ Good - Use path aliases for internal imports
import { UserDialog } from "@/components/admin/UserDialog";
import { useUsers } from "@/hooks/useUsers";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types/user";

// ❌ Bad - Relative imports for internal modules
import { UserDialog } from "../../components/admin/UserDialog";
import { useUsers } from "../hooks/useUsers";
```

### Alias Guidelines

- Always use `@/` for internal imports
- Use relative imports only for files in the same directory
- Prefer specific imports over barrel imports for better tree-shaking

## Component Organization

### Component Structure

```typescript
// UserDialog.tsx
"use client"; // If client component

// Imports (following import order)
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

// Types and interfaces
interface UserDialogProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

// Component implementation
export const UserDialog: React.FC<UserDialogProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  // Component logic
  return (
    // JSX
  );
};

// Default props (if needed)
UserDialog.defaultProps = {
  user: undefined,
};
```

### Component Categories

1. **UI Components** (`src/components/ui/`)

   - Generic, reusable components
   - No business logic
   - Highly configurable

2. **Feature Components** (`src/components/[domain]/`)

   - Domain-specific components
   - Contains business logic
   - Uses UI components

3. **Layout Components** (`src/components/navigation/`)

   - Page layouts and navigation
   - Structural components

4. **Provider Components** (`src/components/providers/`)
   - Context providers
   - State management wrappers

## Test Organization

### Test File Structure

```
src/__tests__/
├── __mocks__/              # Global mocks
│   ├── ability.ts         # Ability system mocks
│   ├── prisma.ts          # Database mocks
│   └── auth.ts            # Authentication mocks
├── test-utils/            # Test utilities
│   ├── component-helpers.ts
│   ├── api-helpers.ts
│   └── accessibility-helpers.ts
├── components/            # Component tests (mirrors src/components)
│   └── admin/
│       ├── UserDialog.test.tsx
│       └── filters/
│           └── SearchInput.test.tsx
├── api/                   # API tests (mirrors src/app/api)
├── hooks/                 # Hook tests (mirrors src/hooks)
└── integration/           # Integration tests
```

### Test Naming

```typescript
// Test file: UserDialog.test.tsx
describe("UserDialog", () => {
  describe("rendering", () => {
    it("should render create dialog when no user provided", () => {});
    it("should render edit dialog when user provided", () => {});
  });

  describe("form validation", () => {
    it("should show validation errors for invalid email", () => {});
    it("should validate required fields", () => {});
  });

  describe("user interactions", () => {
    it("should call onSave when form is submitted", () => {});
    it("should call onClose when cancel button is clicked", () => {});
  });
});
```

## Story Organization

### Story File Structure

```
src/stories/
├── admin/                 # Admin component stories
│   ├── UserDialog.stories.tsx
│   ├── UserTable.stories.tsx
│   └── filters/
│       └── SearchInput.stories.tsx
├── auth/                  # Auth component stories
└── ui/                    # UI component stories
```

### Story Naming and Structure

```typescript
// UserDialog.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { UserDialog } from "@/components/admin/UserDialog";

const meta: Meta<typeof UserDialog> = {
  title: "Admin/UserDialog",
  component: UserDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    // Arg type definitions
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateUser: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onSave: () => {},
  },
};

export const EditUser: Story = {
  args: {
    user: {
      // Mock user data
    },
    isOpen: true,
    onClose: () => {},
    onSave: () => {},
  },
};
```

## Code Templates

### Component Template

```typescript
// Template: ComponentName.tsx
"use client";

import React from "react";
import type { ComponentNameProps } from "./types";

export const ComponentName: React.FC<ComponentNameProps> = (
  {
    // Props destructuring
  }
) => {
  // Component logic

  return <div>{/* Component JSX */}</div>;
};
```

### Hook Template

```typescript
// Template: useHookName.ts
import { useState, useEffect } from "react";
import type { HookReturnType, HookOptions } from "./types";

export const useHookName = (options: HookOptions): HookReturnType => {
  // Hook logic

  return {
    // Return values
  };
};
```

### Test Template

```typescript
// Template: ComponentName.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  const defaultProps = {
    // Default props
  };

  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly", () => {
    render(<ComponentName {...defaultProps} />);
    // Assertions
  });
});
```

## Best Practices

### General Guidelines

1. **Consistency**: Follow established patterns throughout the codebase
2. **Clarity**: Use descriptive names that clearly indicate purpose
3. **Modularity**: Keep components focused and single-purpose
4. **Reusability**: Design components to be reusable across contexts
5. **Type Safety**: Use TypeScript for all code with proper typing

### Component Guidelines

1. **Single Responsibility**: Each component should have one clear purpose
2. **Props Interface**: Always define props interfaces
3. **Default Props**: Use default props when appropriate
4. **Error Boundaries**: Implement error handling for complex components
5. **Accessibility**: Include proper ARIA labels and semantic HTML

### Import Guidelines

1. **Absolute Imports**: Use path aliases for internal imports
2. **Import Order**: Follow the established import order
3. **Specific Imports**: Import only what you need
4. **Type Imports**: Use `import type` for type-only imports

### File Organization Guidelines

1. **Co-location**: Keep related files together
2. **Barrel Exports**: Use index.ts files for clean imports
3. **Separation of Concerns**: Separate logic, types, and tests
4. **Consistent Naming**: Follow naming conventions consistently

This document serves as the foundation for maintaining code quality and consistency across the project. All team members should follow these standards when creating new code or refactoring existing code.
