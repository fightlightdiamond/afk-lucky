import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { UserPagination } from "@/components/admin/UserPagination";
import { PaginationParams } from "@/types/user";

const meta: Meta<typeof UserPagination> = {
  title: "Admin/UserPagination",
  component: UserPagination,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The UserPagination component provides comprehensive pagination controls for the admin user management interface.

## Features
- **Page size selection**: Dropdown to change number of items per page
- **Navigation controls**: First, Previous, Next, Last buttons
- **Direct page navigation**: Input field to jump to specific page
- **Results display**: Shows current range and total count
- **Responsive design**: Adapts to different screen sizes
- **Loading states**: Disables controls during data loading

## Usage
This component is designed to work with the enhanced user management API and provides all necessary pagination functionality.
        `,
      },
    },
  },
  argTypes: {
    pagination: {
      description: "Pagination parameters including current page, total, etc.",
    },
    onPageChange: {
      description: "Callback when page is changed",
    },
    onPageSizeChange: {
      description: "Callback when page size is changed",
    },
    isLoading: {
      description: "Whether the component is in loading state",
      control: "boolean",
    },
  },
  args: {
    onPageChange: action("onPageChange"),
    onPageSizeChange: action("onPageSizeChange"),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const createPagination = (
  overrides: Partial<PaginationParams> = {}
): PaginationParams => ({
  page: 1,
  pageSize: 20,
  total: 100,
  totalPages: 5,
  hasNextPage: true,
  hasPreviousPage: false,
  startIndex: 1,
  endIndex: 20,
  offset: 0,
  limit: 20,
  isFirstPage: true,
  isLastPage: false,
  ...overrides,
});
// Default story - First page
export const Default: Story = {
  args: {
    pagination: createPagination(),
    isLoading: false,
  },
};

// Middle page
export const MiddlePage: Story = {
  args: {
    pagination: createPagination({
      page: 3,
      hasPreviousPage: true,
      hasNextPage: true,
      startIndex: 41,
      endIndex: 60,
      isFirstPage: false,
      isLastPage: false,
    }),
    isLoading: false,
  },
};

// Last page
export const LastPage: Story = {
  args: {
    pagination: createPagination({
      page: 5,
      hasPreviousPage: true,
      hasNextPage: false,
      startIndex: 81,
      endIndex: 100,
      isFirstPage: false,
      isLastPage: true,
    }),
    isLoading: false,
  },
};

// Large dataset with jump to page
export const LargeDataset: Story = {
  args: {
    pagination: createPagination({
      page: 25,
      total: 1000,
      totalPages: 50,
      hasPreviousPage: true,
      hasNextPage: true,
      startIndex: 481,
      endIndex: 500,
      isFirstPage: false,
      isLastPage: false,
    }),
    isLoading: false,
  },
};

// Loading state
export const Loading: Story = {
  args: {
    pagination: createPagination(),
    isLoading: true,
  },
};

// Small dataset (single page)
export const SinglePage: Story = {
  args: {
    pagination: createPagination({
      page: 1,
      total: 15,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      startIndex: 1,
      endIndex: 15,
      isFirstPage: true,
      isLastPage: true,
    }),
    isLoading: false,
  },
};

// Empty state (no results)
export const EmptyState: Story = {
  args: {
    pagination: createPagination({
      page: 1,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      startIndex: 0,
      endIndex: 0,
      isFirstPage: true,
      isLastPage: true,
    }),
    isLoading: false,
  },
};

// Different page sizes
export const LargePageSize: Story = {
  args: {
    pagination: createPagination({
      pageSize: 100,
      total: 500,
      totalPages: 5,
      endIndex: 100,
    }),
    isLoading: false,
  },
};

export const SmallPageSize: Story = {
  args: {
    pagination: createPagination({
      pageSize: 10,
      total: 100,
      totalPages: 10,
      endIndex: 10,
    }),
    isLoading: false,
  },
};
