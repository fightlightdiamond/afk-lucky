# Code Templates

This directory contains standardized templates for creating consistent code across the project. These templates follow the established code structure standards and naming conventions.

## Available Templates

### 1. Component Template (`Component.template.tsx`)

Use this template when creating new React components.

**Usage:**

1. Copy the template file
2. Rename to your component name (PascalCase)
3. Replace `ComponentName` with your actual component name
4. Update the props interface and implementation

**Example:**

```bash
cp docs/templates/Component.template.tsx src/components/admin/NewComponent.tsx
```

### 2. Hook Template (`Hook.template.ts`)

Use this template when creating custom React hooks.

**Usage:**

1. Copy the template file
2. Rename to your hook name (camelCase starting with 'use')
3. Replace `useHookName` with your actual hook name
4. Update the options and return types

**Example:**

```bash
cp docs/templates/Hook.template.ts src/hooks/useNewHook.ts
```

### 3. Test Template (`Test.template.test.tsx`)

Use this template when creating component tests.

**Usage:**

1. Copy the template file
2. Rename to match your component test file
3. Replace `ComponentName` with your actual component name
4. Update the test cases and assertions

**Example:**

```bash
cp docs/templates/Test.template.test.tsx src/__tests__/components/admin/NewComponent.test.tsx
```

### 4. Story Template (`Story.template.stories.tsx`)

Use this template when creating Storybook stories.

**Usage:**

1. Copy the template file
2. Rename to match your component story file
3. Replace `ComponentName` with your actual component name
4. Update the stories and controls

**Example:**

```bash
cp docs/templates/Story.template.stories.tsx src/stories/admin/NewComponent.stories.tsx
```

### 5. Types Template (`Types.template.ts`)

Use this template when creating TypeScript type definitions.

**Usage:**

1. Copy the template file
2. Rename to your types file
3. Update the interfaces and types
4. Follow the naming conventions

**Example:**

```bash
cp docs/templates/Types.template.ts src/types/newFeature.ts
```

## Template Guidelines

### Naming Conventions

- **Components**: PascalCase (e.g., `UserDialog.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useUsers.ts`)
- **Tests**: Same as component + `.test` (e.g., `UserDialog.test.tsx`)
- **Stories**: Same as component + `.stories` (e.g., `UserDialog.stories.tsx`)
- **Types**: camelCase (e.g., `user.ts`)

### File Organization

Follow the established folder structure:

```
src/
├── components/
│   ├── admin/
│   │   ├── ComponentName.tsx
│   │   └── index.ts (barrel export)
│   └── ui/
├── hooks/
│   └── useHookName.ts
├── types/
│   └── typeName.ts
├── __tests__/
│   ├── components/
│   │   └── admin/
│   │       └── ComponentName.test.tsx
│   └── hooks/
│       └── useHookName.test.ts
└── stories/
    └── admin/
        └── ComponentName.stories.tsx
```

### Import/Export Patterns

Follow the established import order and patterns:

1. React and core libraries
2. Third-party libraries
3. Internal UI components
4. Internal components and utilities
5. Types (using `import type`)

### Best Practices

1. **Consistency**: Always use the templates as starting points
2. **Documentation**: Include JSDoc comments for public APIs
3. **Types**: Use TypeScript for all code with proper typing
4. **Testing**: Write comprehensive tests for all components and hooks
5. **Accessibility**: Include proper ARIA labels and semantic HTML
6. **Error Handling**: Implement proper error boundaries and handling

## Quick Start Commands

### Create a new admin component:

```bash
# Create component
cp docs/templates/Component.template.tsx src/components/admin/MyComponent.tsx

# Create test
cp docs/templates/Test.template.test.tsx src/__tests__/components/admin/MyComponent.test.tsx

# Create story
cp docs/templates/Story.template.stories.tsx src/stories/admin/MyComponent.stories.tsx

# Create types (if needed)
cp docs/templates/Types.template.ts src/components/admin/types.ts
```

### Create a new hook:

```bash
# Create hook
cp docs/templates/Hook.template.ts src/hooks/useMyHook.ts

# Create test
cp docs/templates/Test.template.test.tsx src/__tests__/hooks/useMyHook.test.ts
```

## Validation

After creating new files, run the structure validation:

```bash
npm run validate:structure
```

This will check that your new files follow the established conventions and patterns.

## Contributing

When updating templates:

1. Ensure they follow the latest code standards
2. Update this README if adding new templates
3. Test templates with real implementations
4. Update validation scripts if needed

For questions about templates or code structure, refer to:

- [Code Structure Standards](../CODE_STRUCTURE_STANDARDS.md)
- [Import/Export Guidelines](../IMPORT_EXPORT_GUIDELINES.md)
