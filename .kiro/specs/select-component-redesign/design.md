# Design Document

## Overview

This design document outlines the technical approach for updating the Select component family to match the new design system specifications. The update focuses on refining visual styling, improving state management, fixing TypeScript issues, and ensuring consistent behavior across SelectField, MultiSelectField, and TreeSelectField components.

The components are built on top of RSuite's picker components (SelectPicker, CheckPicker, CheckTreePicker) with custom styling applied through CSS modules and Tailwind classes.

## Architecture

### Component Hierarchy

```
SelectField (Single Selection)
├── CustomInput (Base component with custom UI)
│   ├── Prefix Area (optional)
│   ├── Value/Placeholder Display
│   ├── Badge (optional)
│   └── Chevron Icon
└── RSuite SelectPicker (hidden, provides functionality)

MultiSelectField (Multiple Selection)
├── Label + Required Indicator
├── RSuite CheckPicker (styled)
└── Help Message

TreeSelectField (Hierarchical Selection)
├── Label + Required Indicator
├── RSuite CheckTreePicker (styled)
└── Help Message
```

### Design Principles

1. **Separation of Concerns**: Custom UI layer separate from functional picker layer
2. **Consistent Styling**: Shared CSS module for common styles across all select types
3. **Type Safety**: Proper TypeScript types with no 'any' usage
4. **Accessibility**: Keyboard navigation and ARIA support maintained
5. **Performance**: Memoization and ref forwarding for optimal rendering

## Components and Interfaces

### 1. CustomInput Component

**Purpose**: Provides the custom-styled UI for SelectField while RSuite SelectPicker handles functionality

**Key Changes**:

- Fix TypeScript errors (remove 'any', add null checks)
- Improve ref handling
- Ensure badge only shows when value is selected
- Maintain exact Figma design specifications

**Interface Updates**:

```typescript
export type CustomInputProps = React.HTMLAttributes<HTMLDivElement> &
  Omit<RSelectProps, "onChange"> & {
    prefixText?: string;
    prefixIcon?: React.ReactNode;
    prefixInside?: boolean;
    onChange?: (value: string | number | null) => void;
    error?: boolean;
    badge?: string;
    disabled?: boolean;
  };
```

**Implementation Details**:

1. **Ref Handling**:

   - Use both forwarded ref and internal pickerRef
   - Add null check before calling pickerRef.current.open()
   - Properly type refs with PickerHandle

2. **Data Type Safety**:

   - Replace `any` with proper type: `Array<{ label: string; value: string | number }>`
   - Use type guards for selectedItem lookup

3. **Badge Logic**:

   - Only render badge when both `badge` prop exists AND `value` is truthy
   - Maintain exact styling from Figma

4. **State Management**:
   - Track isOpen state for focus ring styling
   - Handle open/close callbacks properly
   - Sync custom UI with hidden picker state

### 2. SelectField Component

**Purpose**: Wrapper component that adds label, help message, and error handling to CustomInput

**Key Changes**:

- Ensure proper ref forwarding
- Maintain consistent spacing (4px gaps)
- Icon rendering for help messages (info vs alert)

**No major structural changes needed** - component already follows design system well

### 3. MultiSelectField Component

**Purpose**: Multi-selection dropdown using RSuite CheckPicker

**Key Changes**:

- Refine checkbox styling in CSS module
- Ensure proper error state styling
- Update help message to match SelectField pattern

**Checkbox Styling Requirements**:

- Unchecked: White background, #D1D5DE border, 2px width
- Checked: #2196F3 background, white checkmark
- Size: 20px × 20px
- Border radius: 4px
- Smooth transitions: 0.2s ease

### 4. TreeSelectField Component

**Purpose**: Hierarchical multi-selection using RSuite CheckTreePicker

**Key Changes**:

- Fix help message icon rendering (currently broken)
- Ensure header node styling (#E3F2FD background when expanded)
- Maintain proper indentation for child nodes

**Tree Node Styling Requirements**:

- Header (expanded): #E3F2FD background
- Header (collapsed): White background
- Child items: White background, proper indentation
- Hover: #F5F6F8 background (except expanded headers)

## Data Models

### Select Option Data Structure

```typescript
interface SelectOption {
  label: string;
  value: string | number;
}

interface TreeSelectOption extends SelectOption {
  children?: TreeSelectOption[];
}
```

### Component Props

```typescript
// SelectField
interface SelectFieldProps extends CustomInputProps {
  label?: string;
  required?: boolean;
  helpMessage?: string;
}

// MultiSelectField
interface MultiSelectFieldProps extends CheckPickerProps {
  label?: string;
  required?: boolean;
  helpMessage?: string;
  error?: boolean;
}

// TreeSelectField
interface TreeSelectFieldProps extends CheckTreePickerProps {
  label?: string;
  required?: boolean;
  helpMessage?: string;
  error?: boolean;
}
```

## Error Handling

### TypeScript Errors to Fix

1. **CustomInput.tsx**:

   - Line: `data?.find((item: any) => ...)` → Use proper type
   - Line: `if (pickerRef.current)` → Add null check before calling methods
   - Line: `ref` parameter → Either use it or remove the warning

2. **General**:
   - Ensure all refs are properly typed with `PickerHandle`
   - Remove unused variables
   - Add proper null/undefined checks

### Runtime Error Handling

1. **Invalid Data**:

   - Handle empty data arrays gracefully
   - Validate value exists in data before displaying

2. **Ref Errors**:

   - Always check ref.current before calling methods
   - Provide fallback behavior if ref is null

3. **State Synchronization**:
   - Ensure custom UI stays in sync with hidden picker
   - Handle edge cases (rapid open/close, disabled state changes)

## Testing Strategy

### Visual Testing (Storybook)

1. **State Coverage**:

   - Default (empty)
   - With value selected
   - Hover state
   - Focus state
   - Error state
   - Disabled state

2. **Variant Coverage**:

   - With/without label
   - With/without help message
   - With/without prefix (text and icon)
   - With/without badge
   - Prefix inside vs outside

3. **Component Type Coverage**:
   - SelectField (single select)
   - MultiSelectField (multi select)
   - TreeSelectField (tree select)

### Interaction Testing

1. **Keyboard Navigation**:

   - Tab to focus
   - Enter/Space to open
   - Arrow keys to navigate
   - Enter to select
   - Escape to close

2. **Mouse Interaction**:

   - Click to open
   - Click item to select
   - Click outside to close
   - Hover states

3. **Edge Cases**:
   - Rapid clicking
   - Disabled state interactions
   - Empty data arrays
   - Very long option labels

### Type Safety Testing

1. **Compilation**:

   - No TypeScript errors
   - Proper type inference
   - Correct prop types

2. **Runtime**:
   - No console warnings
   - Proper ref handling
   - No undefined errors

## CSS Module Structure

### CustomInput.module.css Organization

```css
/* 1. Wrapper and Base Styles */
.customSelectWrapper {
}

/* 2. Custom Toggle UI (SelectField only) */
.customToggle {
}
.customToggleInner {
}
.customToggleContent {
}
.customToggleBorder {
}

/* 3. State Modifiers */
.customToggleOpen {
}
.customToggleDisabled {
}
.customToggleError {
}

/* 4. RSuite Picker Overrides */
/* 4.1 SelectPicker (hidden) */
:global(.rs-picker-select.rs-picker-toggle) {
}

/* 4.2 CheckPicker & CheckTreePicker */
:global(.rs-picker-check.rs-picker-toggle) {
}
:global(.rs-picker-check-tree.rs-picker-toggle) {
}

/* 5. Dropdown Menu Styles */
:global(.rs-picker-menu) {
}
:global(.rs-picker-select-menu-items) {
}
:global(.rs-picker-select-menu-item) {
}

/* 6. Checkbox Styles (Multi/Tree Select) */
:global(.rs-checkbox-checker) {
}
:global(.rs-checkbox-checked .rs-checkbox-checker) {
}

/* 7. Tree Node Styles */
:global(.rs-check-tree-node-label) {
}
:global(.rs-check-tree-node-expanded > .rs-check-tree-node-label) {
}
```

### Color Palette

```css
/* Borders */
--border-default: #d1d5de;
--border-hover: #b3b8c5;
--border-error: #d05c4e;

/* Backgrounds */
--bg-white: #ffffff;
--bg-disabled: #f1f3f8;
--bg-hover: #f5f6f8;
--bg-active: #4a5568;
--bg-tree-header: #e3f2fd;
--bg-prefix-inside: #f1f3f8;
--bg-badge: #131313;

/* Text */
--text-primary: #282c3b;
--text-secondary: #787e95;
--text-error: #d05c4e;
--text-white: #ffffff;

/* Checkbox */
--checkbox-checked: #2196f3;

/* Focus Ring */
--focus-ring: #f1f3f8;
```

### Spacing System

```css
/* Gaps */
--gap-xs: 2px;
--gap-sm: 4px;
--gap-md: 8px;
--gap-lg: 10px;
--gap-xl: 12px;

/* Padding */
--padding-input: 10px;
--padding-prefix: 12px;
--padding-menu-item: 8px 12px;
--padding-badge: 5px 6px;

/* Sizes */
--height-input: 32px;
--size-icon: 16px;
--size-checkbox: 20px;
--size-help-icon: 12px;
```

## Implementation Approach

### Phase 1: Fix TypeScript Issues

1. Update CustomInput to remove 'any' types
2. Add proper null checks for refs
3. Fix unused variable warnings
4. Ensure all components compile without errors

### Phase 2: Refine Visual Styling

1. Verify all colors match design system
2. Update checkbox styling for multi-select
3. Fix tree node header backgrounds
4. Ensure consistent spacing throughout

### Phase 3: Fix Component Bugs

1. Fix TreeSelectField help message icon rendering
2. Ensure badge only shows when value exists
3. Verify all state transitions work correctly
4. Test disabled state behavior

### Phase 4: Update Stories

1. Ensure all stories reflect current design
2. Add missing state examples
3. Update documentation
4. Verify visual regression

## Accessibility Considerations

1. **Keyboard Navigation**:

   - All interactive elements keyboard accessible
   - Proper focus management
   - Escape key closes dropdown

2. **Screen Readers**:

   - Proper ARIA labels maintained by RSuite
   - Error messages announced
   - Selected values announced

3. **Visual Indicators**:

   - Focus ring meets WCAG contrast requirements (2px #F1F3F8)
   - Error state clearly visible (#D05C4E)
   - Disabled state obvious (gray background, disabled cursor)

4. **Color Contrast**:
   - Text on white: #282C3B (passes WCAG AA)
   - Active item: white on #4A5568 (passes WCAG AA)
   - Error text: #D05C4E (passes WCAG AA for large text)

## Performance Considerations

1. **Memoization**:

   - CustomInput wrapped in React.memo
   - Callbacks wrapped in useCallback
   - Prevent unnecessary re-renders

2. **CSS Optimization**:

   - Use CSS modules for scoped styles
   - Leverage CSS transitions over JS animations
   - Minimize style recalculations

3. **Large Data Sets**:
   - RSuite handles virtualization internally
   - No additional optimization needed for now
   - Monitor performance with 1000+ items

## Migration Notes

### Breaking Changes

None - this is a refinement update, not a breaking change

### Deprecations

None

### New Features

None - maintaining existing API surface

### Bug Fixes

1. TypeScript errors in CustomInput
2. TreeSelectField help message icon
3. Badge showing without value
4. Ref handling improvements
