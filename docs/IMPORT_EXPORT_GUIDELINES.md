# Import/Export Guidelines

This document provides detailed guidelines for import and export patterns in the project to ensure consistency and maintainability.

## Table of Contents

1. [Import Order and Grouping](#import-order-and-grouping)
2. [Path Aliases Usage](#path-aliases-usage)
3. [Export Patterns](#export-patterns)
4. [Barrel Exports](#barrel-exports)
5. [Type Imports](#type-imports)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

## Import Order and Grouping

Always organize imports in the following order with blank lines between groups:

```typescript
// 1. React and core libraries
import React, { useState, useEffect } from "react";
import { NextRequest, NextResponse } from "next/server";

// 2. Third-party libraries (alphabetical)
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

// 5. Types (alphabetical, using 'import type')
import type { User, Role } from "@/types/user";
import type { ApiResponse } from "@/types/api";
```

## Path Aliases Usage

### Configured Aliases

The project uses the following path aliases:

- `@/*` - Maps to `./src/*`

### Usage Rules

```typescript
// ✅ Good - Use path aliases for internal imports
import { UserDialog } from "@/components/admin/UserDialog";
import { useUsers } from "@/hooks/useUsers";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types/user";

// ❌ Bad - Relative imports for internal modules
import { UserDialog } from "../../components/admin/UserDialog";
import { useUsers } from "../hooks/useUsers";

// ✅ Acceptable - Relative imports for same directory
import { UserDialogProps } from "./types";
import { validateUser } from "./utils";
```

### When to Use Relative vs Absolute Imports

- **Use absolute imports (`@/`)** for:

  - Cross-domain imports (components, hooks, utils, types)
  - Any import that goes up more than one directory level
  - Imports from `src/` subdirectories

- **Use relative imports** for:
  - Files in the same directory
  - Closely related files (component and its types file)

## Export Patterns

### Named Exports (Preferred)

```typescript
// ✅ Preferred - Named exports for better tree-shaking
export const UserDialog = () => { ... };
export const UserTable = () => { ... };
export const formatDate = (date: Date) => { ... };

// Usage
import { UserDialog, UserTable } from "@/components/admin";
```

### Default Exports (Limited Use)

```typescript
// ✅ Acceptable - Default export for single main component/page
const UserManagementPage = () => { ... };
export default UserManagementPage;

// ✅ Acceptable - Default export for configuration objects
const config = { ... };
export default config;

// Usage
import UserManagementPage from "@/pages/admin/users";
import config from "@/config/database";
```

### Mixed Exports

```typescript
// ✅ Good - Named exports with default
export const UserDialog = () => { ... };
export const UserTable = () => { ... };

const UserManagement = () => { ... };
export default UserManagement;

// Usage
import UserManagement, { UserDialog, UserTable } from "@/components/admin/UserManagement";
```

## Barrel Exports

### Purpose

Barrel exports (index.ts files) provide clean import paths and better organization.

### Structure

```typescript
// src/components/admin/index.ts
export { UserDialog } from "./UserDialog";
export { UserTable } from "./UserTable";
export { BulkOperations } from "./BulkOperations";

// Re-export sub-modules
export * from "./filters";

// Type exports
export type { UserDialogProps } from "./UserDialog";
export type { UserTableProps } from "./UserTable";
```

### Usage Guidelines

```typescript
// ✅ Good - Use barrel exports for clean imports
import { UserDialog, UserTable } from "@/components/admin";

// ✅ Also good - Direct imports for specific components
import { UserDialog } from "@/components/admin/UserDialog";

// ❌ Avoid - Importing everything from barrel
import * as AdminComponents from "@/components/admin";
```

### When to Create Barrel Exports

- **Always create** for domain folders (admin, auth, etc.)
- **Consider creating** for folders with 3+ related files
- **Don't create** for single-file folders
- **Don't create** if it causes circular dependencies

## Type Imports

### Use `import type` for Type-Only Imports

```typescript
// ✅ Good - Use 'import type' for types
import type { User, Role } from "@/types/user";
import type { ComponentProps } from "react";

// ✅ Good - Mixed imports
import { useState } from "react";
import type { FC } from "react";

// ❌ Bad - Regular import for types
import { User, Role } from "@/types/user";
```

### Type Re-exports

```typescript
// types/index.ts
export type { User, Role } from "./user";
export type { ApiResponse, ApiError } from "./api";
export type { ComponentProps } from "./components";

// Usage
import type { User, ApiResponse } from "@/types";
```

## Best Practices

### 1. Consistency

- Always follow the same import order
- Use the same alias patterns throughout the project
- Maintain consistent export patterns within domains

### 2. Performance

- Use named exports for better tree-shaking
- Avoid importing entire libraries when only specific functions are needed
- Use `import type` to avoid runtime imports for types

### 3. Maintainability

- Group related imports together
- Use descriptive import names
- Avoid deep import paths when barrel exports are available

### 4. Readability

- Keep import statements alphabetical within groups
- Use consistent spacing and formatting
- Add comments for complex import scenarios

## Examples

### Component File Example

```typescript
// src/components/admin/UserDialog.tsx
"use client";

// React and core libraries
import React, { useState, useEffect } from "react";

// Third-party libraries
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Internal UI components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Internal utilities and hooks
import { useUsers } from "@/hooks/useUsers";
import { formatDate } from "@/lib/utils";

// Types
import type { User } from "@/types/user";
import type { UserDialogProps } from "./types";

export const UserDialog: React.FC<UserDialogProps> = ({ ... }) => {
  // Component implementation
};
```

### Hook File Example

```typescript
// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Internal utilities
import { api } from "@/lib/api";
import { handleApiError } from "@/lib/error-handling";

// Types
import type { User, CreateUserData, UpdateUserData } from "@/types/user";
import type { ApiResponse } from "@/types/api";

export const useUsers = () => {
  // Hook implementation
};
```

### API Route Example

```typescript
// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";

// Third-party libraries
import { z } from "zod";

// Internal utilities
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAbility } from "@/lib/ability";

// Types
import type { User } from "@/types/user";

export async function GET(request: NextRequest) {
  // API implementation
}
```

### Test File Example

```typescript
// src/__tests__/components/admin/UserDialog.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

// Component under test
import { UserDialog } from "@/components/admin/UserDialog";

// Test utilities
import { createMockUser } from "@/__tests__/__mocks__/user-data";
import { renderWithProviders } from "@/__tests__/test-utils";

// Types
import type { UserDialogProps } from "@/components/admin/types";

describe("UserDialog", () => {
  // Test implementation
});
```

## Common Mistakes to Avoid

### 1. Circular Dependencies

```typescript
// ❌ Bad - Can cause circular dependencies
// components/A.tsx
import { B } from "./B";

// components/B.tsx
import { A } from "./A";
```

### 2. Deep Imports

```typescript
// ❌ Bad - Deep import paths
import { UserDialog } from "@/components/admin/dialogs/user/UserDialog";

// ✅ Good - Use barrel exports
import { UserDialog } from "@/components/admin";
```

### 3. Mixing Import Styles

```typescript
// ❌ Bad - Inconsistent import styles
import UserDialog from "@/components/admin/UserDialog";
import { UserTable } from "@/components/admin/UserTable";

// ✅ Good - Consistent named exports
import { UserDialog, UserTable } from "@/components/admin";
```

### 4. Unnecessary Type Imports

```typescript
// ❌ Bad - Runtime import for types
import { User } from "@/types/user";
const user: User = { ... };

// ✅ Good - Type-only import
import type { User } from "@/types/user";
const user: User = { ... };
```

Following these guidelines ensures consistent, maintainable, and performant import/export patterns throughout the project.
