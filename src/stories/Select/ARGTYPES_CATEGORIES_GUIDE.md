# ArgTypes Categories Guide

## Overview

Để sử dụng thuận tiện hơn trong Storybook, các argTypes đã được nhóm theo categories. Dưới đây là hướng dẫn cập nhật cho từng component.

## SelectField Categories

### 1. Basic

- `label` - Label text for the select field
- `placeholder` - Placeholder text
- `disabled` - Disables the select field

### 2. Label & Help

- `required` - Shows required indicator (\*)
- `helpMessage` - Help text displayed below the field
- `error` - Error state styling

### 3. Prefix

- `prefixText` - Text prefix for the input
- `prefixInside` - Places prefix inside the input border
- `prefixIcon` - Icon prefix for the input

### 4. Badge

- `badge` - Badge text shown when value is selected

### 5. Select Behavior

- `searchable` - Enable search functionality in dropdown
- `virtualized` - Use virtualized list for large datasets (500+ items)

### 6. Dropdown Menu

- `placement` - Dropdown menu placement (auto recommended)
- `menuMaxHeight` - Max height of dropdown menu (px)
- `menuClassName` - Custom className for dropdown menu
- `menuStyle` - Custom style for dropdown menu
- `preventOverflow` - Prevent dropdown from overflowing viewport

### 7. Advanced Rendering

- `renderMenu` - Custom render function for dropdown menu
- `renderMenuItem` - Custom render function for menu items
- `renderValue` - Custom render function for selected value

## MultiSelectField Categories

### 1. Basic

- `label` - Label text
- `placeholder` - Placeholder text
- `disabled` - Disables the field

### 2. Label & Help

- `required` - Shows required indicator
- `helpMessage` - Help text displayed below
- `error` - Error state

### 3. Select Behavior

- `searchable` - Enable search functionality
- `countable` - Show count of selected items
- `sticky` - Make selected items sticky at top

### 4. Dropdown Menu

- `placement` - Dropdown menu placement
- `menuMaxHeight` - Max height of dropdown menu
- `preventOverflow` - Prevent dropdown from overflowing viewport

## TreeSelectField Categories

### 1. Basic

- `label` - Label text
- `placeholder` - Placeholder text
- `disabled` - Disables the field

### 2. Label & Help

- `required` - Shows required indicator
- `helpMessage` - Help text displayed below
- `error` - Error state

### 3. Tree Behavior

- `cascade` - Enable cascade selection (parent-child relationship)
- `defaultExpandAll` - Expand all nodes by default
- `expandItemValues` - Array of values for expanded nodes

### 4. Select Behavior

- `searchable` - Enable search functionality
- `countable` - Show count of selected items

### 5. Dropdown Menu

- `placement` - Dropdown menu placement
- `menuMaxHeight` - Max height of dropdown menu
- `preventOverflow` - Prevent dropdown from overflowing viewport

## Implementation Example

```typescript
argTypes: {
  label: {
    control: { type: "text" },
    description: "Label text for the select field",
    table: {
      category: "Basic",  // ← Add this
    },
  },
  // ... other props
}
```

## Benefits

1. **Organized Controls Panel**: Props được nhóm theo chức năng
2. **Easy to Find**: Dễ tìm prop cần thiết
3. **Better UX**: User experience tốt hơn khi test trong Storybook
4. **Clear Structure**: Cấu trúc rõ ràng, dễ maintain

## Next Steps

Để áp dụng categories vào stories:

1. Mở file `SelectField.stories.tsx`
2. Thêm `table: { category: "Category Name" }` vào mỗi argType
3. Repeat cho `MultiSelectField.stories.tsx` và `TreeSelectField.stories.tsx`
4. Test trong Storybook để xem controls được nhóm đúng

## Storybook Display

Sau khi áp dụng, Controls panel sẽ hiển thị như sau:

```
▼ Basic
  - label
  - placeholder
  - disabled

▼ Label & Help
  - required
  - helpMessage
  - error

▼ Prefix
  - prefixText
  - prefixInside

... và tiếp tục
```

Điều này giúp user dễ dàng navigate và test các props theo nhóm chức năng.
