# Hướng dẫn viết Storybook cho Shadcn/UI

## Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt và cấu hình](#cài-đặt-và-cấu-hình)
3. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
4. [Cách sử dụng Shadcn/UI](#cách-sử-dụng-shadcnui)
5. [Viết Stories cho Components](#viết-stories-cho-components)
6. [Best Practices](#best-practices)
7. [Ví dụ thực tế](#ví-dụ-thực-tế)

## Giới thiệu

Shadcn/UI là một thư viện component UI được xây dựng trên Radix UI và Tailwind CSS. Storybook giúp chúng ta phát triển, test và document các component một cách độc lập.

## Cài đặt và cấu hình

### 1. Cài đặt Shadcn/UI

```bash
# Khởi tạo shadcn/ui
npx shadcn@latest init

# Thêm components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
# ... thêm các component khác
```

### 2. Cài đặt Storybook

```bash
# Khởi tạo Storybook
npx storybook@latest init

# Cài đặt addons cần thiết
npm install --save-dev @storybook/addon-a11y @storybook/addon-docs
```

### 3. Cấu hình Storybook

**`.storybook/main.ts`**
```typescript
import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {}
  },
  staticDirs: ["../public"]
};

export default config;
```

**`.storybook/preview.ts`**
```typescript
import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css"; // Import Tailwind CSS

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
```

## Cấu trúc thư mục

```
project/
├── src/
│   ├── components/
│   │   └── ui/           # Shadcn components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ...
│   ├── stories/          # Storybook stories
│   │   ├── Button.stories.ts
│   │   ├── Card.stories.ts
│   │   └── ...
│   └── lib/
│       └── utils.ts      # Utility functions
├── .storybook/
│   ├── main.ts
│   └── preview.ts
└── components.json       # Shadcn config
```

## Cách sử dụng Shadcn/UI

### 1. Cấu hình components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### 2. Import và sử dụng components

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Sử dụng trong component
<Button variant="default" size="lg">
  Click me
</Button>
```

## Viết Stories cho Components

### 1. Cấu trúc cơ bản của một Story

```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ComponentName } from '@/components/ui/component-name';

const meta: Meta<typeof ComponentName> = {
  title: 'Shadcn UI/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Định nghĩa controls
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Props mặc định
  },
};
```

### 2. Ví dụ Story cho Button

```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'Shadcn UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Kiểu hiển thị của button',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Kích thước của button',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Vô hiệu hóa button',
    },
  },
  args: { 
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </>
    ),
  },
};
```

### 3. Ví dụ Story cho Card (Composite Component)

```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof Card> = {
  title: 'Shadcn UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
    </Card>
  ),
};

export const ProductCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>iPhone 15 Pro</CardTitle>
        <CardDescription>Smartphone cao cấp</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-2xl font-bold">$999</p>
          <p className="text-sm text-muted-foreground">
            A17 Pro chip, 48MP camera
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  ),
};
```

## Best Practices

### 1. Tổ chức Stories

- **Nhóm theo component**: Mỗi component một file story
- **Đặt tên rõ ràng**: `ComponentName.stories.ts`
- **Sử dụng title hierarchy**: `'Shadcn UI/ComponentName'`

### 2. Viết Stories hiệu quả

```typescript
// ✅ Tốt: Sử dụng argTypes để tạo controls
argTypes: {
  variant: {
    control: { type: 'select' },
    options: ['default', 'destructive', 'outline'],
    description: 'Button variant',
  },
}

// ✅ Tốt: Sử dụng render function cho composite components
export const ComplexExample: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Dynamic Title</CardTitle>
      </CardHeader>
    </Card>
  ),
};

// ✅ Tốt: Thêm actions cho interactive elements
args: { 
  onClick: fn(),
  onSubmit: fn(),
}
```

### 3. Documentation

```typescript
// Thêm mô tả cho component
const meta: Meta<typeof Button> = {
  title: 'Shadcn UI/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Button component được xây dựng trên Radix UI với Tailwind CSS styling.',
      },
    },
  },
};

// Thêm mô tả cho từng story
export const Primary: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Button chính được sử dụng cho các action quan trọng.',
      },
    },
  },
};
```

## Ví dụ thực tế

### 1. Form Components Story

```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export const LoginForm: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Enter your password" />
      </div>
      <Button className="w-full">Sign In</Button>
    </div>
  ),
};
```

### 2. Theme Testing

```typescript
// Tạo decorator để test dark mode
export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="bg-background text-foreground p-4">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    children: 'Dark Mode Button',
  },
};
```

## Chạy Storybook

```bash
# Development
npm run storybook

# Build static
npm run build-storybook

# Test stories
npm run test-storybook
```

## Kết luận

Việc kết hợp Shadcn/UI với Storybook giúp:
- Phát triển component độc lập
- Test các trạng thái khác nhau
- Tạo documentation tự động
- Đảm bảo accessibility
- Chia sẻ design system với team

Hãy tuân thủ các best practices và tổ chức code một cách có hệ thống để tối ưu hóa workflow phát triển.