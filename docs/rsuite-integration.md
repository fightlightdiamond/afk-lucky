# Tích hợp RSuite vào Next.js

## Cài đặt

RSuite đã được cài đặt và cấu hình trong dự án này:

```bash
npm install rsuite @rsuite/icons
```

## Cấu hình

### 1. Import CSS trong Layout

File `src/app/layout.tsx` đã được cập nhật để import CSS của RSuite:

```tsx
import "rsuite/dist/rsuite.min.css";
```

### 2. Sử dụng Components

RSuite components cần được sử dụng trong Client Components (với `'use client'` directive):

```tsx
"use client";

import { Button, Panel } from "rsuite";

export default function MyComponent() {
  return (
    <Panel header="Tiêu đề" bordered>
      <Button appearance="primary">Click me</Button>
    </Panel>
  );
}
```

## Components phổ biến

### Buttons

```tsx
import { Button, ButtonToolbar } from "rsuite";

<ButtonToolbar>
  <Button appearance="primary">Primary</Button>
  <Button appearance="default">Default</Button>
  <Button appearance="subtle">Subtle</Button>
  <Button appearance="ghost">Ghost</Button>
  <Button appearance="link">Link</Button>
</ButtonToolbar>;
```

### Input với Icons

```tsx
import { Input, InputGroup } from "rsuite";
import SearchIcon from "@rsuite/icons/Search";

<InputGroup inside>
  <Input placeholder="Tìm kiếm..." />
  <InputGroup.Addon>
    <SearchIcon />
  </InputGroup.Addon>
</InputGroup>;
```

### Panel

```tsx
import { Panel } from "rsuite";

<Panel header="Tiêu đề" bordered shaded>
  Nội dung panel
</Panel>;
```

### Message

```tsx
import { Message } from 'rsuite';

<Message type="info" showIcon>
  Thông báo thông tin
</Message>

<Message type="success" showIcon>
  Thành công!
</Message>

<Message type="warning" showIcon>
  Cảnh báo
</Message>

<Message type="error" showIcon>
  Lỗi
</Message>
```

## Demo Component

Xem component demo tại `src/components/RSuiteDemo.tsx` và story tại Storybook.

## Tài liệu chính thức

- [RSuite Documentation](https://rsuitejs.com/)
- [RSuite Components](https://rsuitejs.com/components/overview/)
- [RSuite Icons](https://rsuitejs.com/resources/icons/)

## Lưu ý

- Tất cả RSuite components đều cần `'use client'` directive vì chúng sử dụng React hooks
- RSuite CSS đã được import globally trong layout
- Có thể tùy chỉnh theme của RSuite thông qua CSS variables
