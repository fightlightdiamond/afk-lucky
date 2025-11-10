# TreeSelectField Cascade Behavior Fix

## Vấn đề

TreeSelectField có vấn đề với hành vi parent-child checkbox:

- ❌ Khi check parent node → children nodes KHÔNG được tự động check
- ❌ Khi check hết children nodes → parent node KHÔNG được tự động check
- ❌ Khi check một số children → không có phản hồi trực quan

## Nguyên nhân

Component đang sử dụng `cascade={false}` trong CheckTreePicker, điều này tắt tính năng cascade tự động của rsuite.

## Giải pháp

### 1. Bật Cascade Mode (`TreeSelectField.tsx`)

Thay đổi từ:

```tsx
<CheckTreePicker
  cascade={false}
  ...
/>
```

Thành:

```tsx
<CheckTreePicker
  cascade={true}
  ...
/>
```

### 2. Cập nhật CSS cho Indeterminate State (`CustomInput.module.css`)

Thêm CSS để ẩn trạng thái indeterminate (dấu gạch ngang) khi một số children được check:

```css
/* Indeterminate state - show as unchecked (no dash) */
.customSelectWrapper
  :global(.rs-picker-menu .rs-checkbox-indeterminate .rs-checkbox-checker) {
  background-color: white;
  border: 2px solid #d1d5de;
}

/* Hide the dash/minus icon for indeterminate state */
.customSelectWrapper
  :global(
    .rs-picker-menu .rs-checkbox-indeterminate .rs-checkbox-inner:before
  ) {
  display: none !important;
}

.customSelectWrapper
  :global(.rs-picker-menu .rs-checkbox-indeterminate .rs-checkbox-inner:after) {
  display: none !important;
}
```

### 3. Thêm Test Story (`TreeSelectField.stories.tsx`)

Thêm story `CascadeBehavior` để test và demo hành vi cascade.

## Hành vi sau khi sửa

✅ **Check parent node** → Tất cả children nodes được tự động check
✅ **Uncheck parent node** → Tất cả children nodes được tự động uncheck
✅ **Check HẾT children nodes** → Parent node được tự động check
✅ **Check MỘT SỐ children nodes** → Parent node hiển thị như unchecked (không có dấu gạch ngang)

## Cách test

1. Mở Storybook: `npm run storybook`
2. Navigate to "Form Components/TreeSelectField"
3. Mở story "Cascade Behavior"
4. Test các trường hợp:
   - Click vào checkbox của parent node "Header"
   - Verify tất cả children (Item 1, 2, 3) được check
   - Uncheck parent
   - Verify tất cả children được uncheck
   - Check từng children một
   - Verify khi check hết children, parent tự động được check

## Files thay đổi

1. `src/stories/Select/TreeSelectField.tsx` - Thay đổi `cascade={false}` thành `cascade={true}`
2. `src/stories/Select/CustomInput.module.css` - Thêm CSS cho indeterminate state
3. `src/stories/Select/TreeSelectField.stories.tsx` - Thêm story test cascade behavior

## Lưu ý

- Hành vi cascade là mặc định của rsuite CheckTreePicker
- Trạng thái indeterminate được ẩn để đơn giản hóa UI (theo yêu cầu)
- Nếu cần hiển thị trạng thái indeterminate (dấu gạch ngang), có thể xóa CSS rules ẩn icon
