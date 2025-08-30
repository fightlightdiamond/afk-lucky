import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { UserPagination } from "@/components/admin/UserPagination";
import { PaginationParams } from "@/types/user";

const meta: Meta<typeof UserPagination> = {
  title: "Admin/UserPagination",
  component: UserPagination,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive pagination component for the user management table. Features page navigation, page size selection, quick jump functionality, and responsive design.",
      },
    },
  },
  argTypes: {
    pagination: {
      description: "Pagination state object with current page, total, etc.",
      control: { type: "object" },
    },
    onPageChange: {
      description: "Callback when page changes",
      action: "pageChange",
    },
    onPageSizeChange: {
      description: "Callback when page size changes",
      action: "pageSizeChange",
    },
    disabled: {
      description: "Whether pagination is disabled",
      control: { type: "boolean" },
    },
    showSizeChanger: {
      description: "Whether to show page size selector",
      control: { type: "boolean" },
    },
    showQuickJumper: {
      description: "Whether to show quick page jump input",
      control: { type: "boolean" },
    },
    showTotal: {
      description: "Whether to show total count information",
      control: { type: "boolean" },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserPagination>;

// Sample pagination data
const createPagination = (
  page: number,
  pageSize: number,
  total: number
): PaginationParams => ({
  page,
  pageSize,
  total,
  totalPages: Math.ceil(total / pageSize),
  hasNextPage: page < Math.ceil(total / pageSize),
  hasPreviousPage: page > 1,
  startIndex: (page - 1) * pageSize + 1,
  endIndex: Math.min(page * pageSize, total),
  offset: (page - 1) * pageSize,
  limit: pageSize,
  isFirstPage: page === 1,
  isLastPage: page === Math.ceil(total / pageSize),
});

export const Default: Story = {
  args: {
    pagination: createPagination(1, 20, 150),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },
};

export const MiddlePage: Story = {
  args: {
    pagination: createPagination(5, 20, 150),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },
};

export const LastPage: Story = {
  args: {
    pagination: createPagination(8, 20, 150),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },
};

export const SinglePage: Story = {
  args: {
    pagination: createPagination(1, 20, 15),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },
};

export const LargeDataset: Story = {
  args: {
    pagination: createPagination(25, 50, 5000),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },
};

export const SmallPageSize: Story = {
  args: {
    pagination: createPagination(3, 10, 150),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },
};

export const LargePageSize: Story = {
  args: {
    pagination: createPagination(2, 100, 150),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },
};

export const DisabledState: Story = {
  args: {
    pagination: createPagination(3, 20, 150),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: true,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },
};

export const MinimalView: Story = {
  args: {
    pagination: createPagination(3, 20, 150),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: false,
    showQuickJumper: false,
    showTotal: false,
  },
};

export const WithoutSizeChanger: Story = {
  args: {
    pagination: createPagination(3, 20, 150),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: false,
    showQuickJumper: true,
    showTotal: true,
  },
};

export const WithoutQuickJumper: Story = {
  args: {
    pagination: createPagination(3, 20, 150),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: true,
    showQuickJumper: false,
    showTotal: true,
  },
};

export const EmptyDataset: Story = {
  args: {
    pagination: createPagination(1, 20, 0),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },
};

export const ManyPages: Story = {
  args: {
    pagination: createPagination(150, 20, 10000),
    onPageChange: fn(),
    onPageSizeChange: fn(),
    disabled: false,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: true,
  },
};
