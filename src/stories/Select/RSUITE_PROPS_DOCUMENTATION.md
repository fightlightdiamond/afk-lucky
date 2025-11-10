# RSuite Props Documentation for Select Components

## Overview

Tất cả các Select components (SelectField, MultiSelectField, TreeSelectField) đều hỗ trợ đầy đủ props của rsuite pickers. Các props này đã được thêm vào argTypes trong Storybook để dễ dàng test và document.

## Common Props (Tất cả components)

### Placement

- **Type**: `string`
- **Default**: `"bottomStart"`
- **Options**:
  - `bottomStart`, `bottomEnd` - Hiển thị phía dưới
  - `topStart`, `topEnd` - Hiển thị phía trên
  - `leftStart`, `leftEnd` - Hiển thị bên trái
  - `rightStart`, `rightEnd` - Hiển thị bên phải
  - `auto`, `autoVerticalStart`, `autoVerticalEnd` - Tự động chọn vị trí tốt nhất
- **Description**: Vị trí hiển thị dropdown menu. Rsuite sẽ tự động điều chỉnh nếu không đủ không gian.
- **Recommendation**: Để mặc định `auto` hoặc không set để rsuite tự động xử lý

### Searchable

- **Type**: `boolean`
- **Default**: `false` (SelectField), `true` (MultiSelectField, TreeSelectField)
- **Description**: Bật/tắt chức năng search trong dropdown

### MenuMaxHeight

- **Type**: `number`
- **Default**: `320`
- **Description**: Chiều cao tối đa của dropdown menu (px)

### PreventOverflow

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Ngăn dropdown tràn ra ngoài viewport. Rsuite sẽ tự động điều chỉnh vị trí.

### MenuClassName

- **Type**: `string`
- **Description**: Custom className cho dropdown menu

### MenuStyle

- **Type**: `object`
- **Description**: Custom inline style cho dropdown menu

## SelectField Specific Props

### Virtualized

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Sử dụng virtualized list cho datasets lớn (1000+ items)
- **Recommendation**: Bật khi có > 500 items để tăng performance

### RenderMenu

- **Type**: `(menu: ReactNode) => ReactNode`
- **Description**: Custom render function cho toàn bộ dropdown menu

### RenderMenuItem

- **Type**: `(label: ReactNode, item: ItemDataType) => ReactNode`
- **Description**: Custom render function cho từng menu item

### RenderValue

- **Type**: `(value: any, item: ItemDataType) => ReactNode`
- **Description**: Custom render function cho giá trị đã chọn

## MultiSelectField Specific Props

### Countable

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Hiển thị số lượng items đã chọn
- **Note**: Component đã set `countable={false}` để match design

### Sticky

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Giữ các items đã chọn ở đầu danh sách

## TreeSelectField Specific Props

### Cascade

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Bật/tắt cascade selection (parent-child relationship)
- **Behavior**:
  - `true`: Check parent → check all children, check all children → check parent
  - `false`: Parent và children độc lập

### ExpandItemValues

- **Type**: `array`
- **Description**: Mảng các values của nodes được expand

### DefaultExpandAll

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Expand tất cả nodes khi mở dropdown

## Best Practices

### 1. Placement

```tsx
// ❌ Không nên hardcode placement
<SelectField placement="bottomStart" ... />

// ✅ Nên để rsuite tự động xử lý
<SelectField ... />

// ✅ Hoặc cho phép user control qua props
<SelectField placement={userPreferredPlacement} ... />
```

### 2. Large Datasets

```tsx
// ✅ Sử dụng virtualized cho datasets lớn
<SelectField
  data={largeData} // 1000+ items
  virtualized
  menuMaxHeight={400}
/>
```

### 3. Prevent Overflow

```tsx
// ✅ Mặc định đã bật, không cần set
<SelectField ... />

// ❌ Chỉ tắt khi có lý do cụ thể
<SelectField preventOverflow={false} ... />
```

### 4. Tree Cascade

```tsx
// ✅ Bật cascade cho UX tốt hơn
<TreeSelectField cascade={true} ... />

// ⚠️ Chỉ tắt khi cần selection độc lập
<TreeSelectField cascade={false} ... />
```

## Storybook Controls

Tất cả props trên đã được thêm vào Storybook argTypes. Bạn có thể:

1. Mở Storybook
2. Navigate đến component story
3. Sử dụng Controls panel để test các props
4. Xem documentation trong Docs tab

## Troubleshooting

### Dropdown hiển thị sai vị trí

- **Nguyên nhân**: Container không đủ không gian
- **Giải pháp**: Để rsuite tự động xử lý với `placement="auto"` hoặc không set

### Dropdown bị cắt/overflow

- **Nguyên nhân**: `preventOverflow={false}` hoặc container có `overflow: hidden`
- **Giải pháp**: Đảm bảo `preventOverflow={true}` (default) và container không có `overflow: hidden`

### Performance issues với large datasets

- **Nguyên nhân**: Render quá nhiều DOM nodes
- **Giải pháp**: Bật `virtualized={true}` cho SelectField hoặc giảm `menuMaxHeight`

## References

- [RSuite SelectPicker Docs](https://rsuitejs.com/components/select-picker/)
- [RSuite CheckPicker Docs](https://rsuitejs.com/components/check-picker/)
- [RSuite CheckTreePicker Docs](https://rsuitejs.com/components/check-tree-picker/)
