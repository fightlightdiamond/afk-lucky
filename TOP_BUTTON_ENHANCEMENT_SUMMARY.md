# TopButton Component Enhancement Summary

## Những gì đã được nâng cấp

### 1. Hệ thống Threshold nâng cao

Đã bổ sung các loại threshold mới:

#### Threshold Types hiện có:

- **ThresholdScalar**: `number | PxString | VhString | PercentString`
  - Ví dụ: `300`, `"200px"`, `"50vh"`, `"25%"`
- **ThresholdFromEdge**: Tính từ top hoặc bottom

  ```typescript
  {
    from?: "top" | "bottom";
    px?: number;
    vh?: number;
    percent?: number;
  }
  ```

- **ThresholdElement**: Dựa trên element DOM
  ```typescript
  {
    element: Element | string | (() => Element | null);
    when?: "enter" | "leave" | "center" | "visible" | "hidden";
    offset?: ThresholdScalar;
  }
  ```

#### Threshold Types mới:

- **ThresholdMultiple**: Kết hợp nhiều điều kiện

  ```typescript
  {
    conditions: Threshold[];
    operator?: "and" | "or";
  }
  ```

- **ThresholdTime**: Thêm điều kiện thời gian

  ```typescript
  {
    after?: number; // milliseconds
    before?: number; // milliseconds
    condition?: Threshold;
  }
  ```

- **Function**: Custom logic
  ```typescript
  (ctx: VisibilityContext) => boolean;
  ```

### 2. Cải thiện VisibilityContext

```typescript
type VisibilityContext = {
  container: Element | Window;
  scrollTop: number;
  lastScrollTop: number;
  direction: "up" | "down" | "none";
  scrollHeight: number; // total content height
  clientHeight: number; // viewport height
  scrollRange: number; // scrollHeight - clientHeight
};
```

### 3. Sửa lỗi và cải thiện

- Sửa lỗi TypeScript với `useRef` initialization
- Thay thế `window.pageYOffset` (deprecated) bằng `window.scrollY`
- Cải thiện hàm `evaluateThreshold` để hỗ trợ các threshold mới
- Thêm hỗ trợ thời gian cho threshold evaluation

### 4. Storybook Stories được cập nhật

- Sửa lỗi positioning trong Storybook bằng cách override CSS classes
- Tách React Hooks ra khỏi render functions để tránh lỗi ESLint
- Thêm stories mới để demo các threshold types:
  - `ThresholdElementBased`
  - `ThresholdMultipleConditions`
  - `ThresholdWithDelay`
  - `ThresholdFunction`
  - `AllPositions`
  - `CustomOffsets`
  - `ScrollContainerExample`
  - `DebounceComparison`
  - `ComprehensiveExample`

### 5. CSS Fixes cho Storybook

Thêm classes để override fixed positioning trong Storybook:

```css
className="relative !bottom-auto !right-auto !top-auto !left-auto !fixed-none !static"
className="!absolute" // cho container examples
```

## Cách sử dụng các tính năng mới

### Multiple Conditions

```typescript
<TopButton
  auto
  threshold={{
    conditions: [
      300, // Scroll 300px
      { from: "bottom", px: 500 }, // Not within 500px of bottom
    ],
    operator: "and",
  }}
/>
```

### Time-based Threshold

```typescript
<TopButton
  auto
  threshold={{
    after: 2000, // Wait 2 seconds
    condition: 200, // Then check scroll position
  }}
/>
```

### Element-based with new states

```typescript
<TopButton
  auto
  threshold={{
    element: "#footer",
    when: "visible", // New: visible/hidden states
    offset: "10px",
  }}
/>
```

### Custom Function

```typescript
<TopButton
  auto
  threshold={(ctx) => {
    // Show when scrolled more than 50% of content
    return ctx.scrollTop > ctx.scrollRange * 0.5;
  }}
/>
```

## Exported Types

```typescript
export type {
  Threshold,
  ThresholdScalar,
  ThresholdFromEdge,
  ThresholdElement,
  ThresholdMultiple, // New
  ThresholdTime, // New
  VisibilityContext,
  Anchor,
  Size,
  Tone,
};
```

## Tương thích ngược

Tất cả API cũ vẫn hoạt động bình thường. Các tính năng mới là optional và không ảnh hưởng đến code hiện tại.
