import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from '@storybook/test';
import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

const data: Payment[] = [
  {
    id: "m5gr84i9",
    amount: 316,
    status: "success",
    email: "ken99@example.com",
  },
  {
    id: "3u1reuv4",
    amount: 242,
    status: "success",
    email: "Abe45@example.com",
  },
  {
    id: "derv1ws0",
    amount: 837,
    status: "processing",
    email: "Monserrat44@example.com",
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "success",
    email: "Silas22@example.com",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
  },
];

const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      React.createElement(Checkbox, {
        checked: table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate"),
        onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
        'aria-label': "Select all"
      })
    ),
    cell: ({ row }) => (
      React.createElement(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value) => row.toggleSelected(!!value),
        'aria-label': "Select row"
      })
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      React.createElement('div', { className: "capitalize" }, row.getValue("status"))
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        React.createElement(Button, {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc")
        },
          "Email",
          React.createElement(ArrowUpDown, { className: "ml-2 h-4 w-4" })
        )
      );
    },
    cell: ({ row }) => React.createElement('div', { className: "lowercase" }, row.getValue("email")),
  },
  {
    accessorKey: "amount",
    header: () => React.createElement('div', { className: "text-right" }, "Amount"),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return React.createElement('div', { className: "text-right font-medium" }, formatted);
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        React.createElement(DropdownMenu, null,
          React.createElement(DropdownMenuTrigger, { asChild: true },
            React.createElement(Button, { variant: "ghost", className: "h-8 w-8 p-0" },
              React.createElement('span', { className: "sr-only" }, "Open menu"),
              React.createElement(MoreHorizontal, { className: "h-4 w-4" })
            )
          ),
          React.createElement(DropdownMenuContent, { align: "end" },
            React.createElement(DropdownMenuLabel, null, "Actions"),
            React.createElement(DropdownMenuItem, {
              onClick: () => navigator.clipboard.writeText(payment.id)
            }, "Copy payment ID"),
            React.createElement(DropdownMenuSeparator),
            React.createElement(DropdownMenuItem, null, "View customer"),
            React.createElement(DropdownMenuItem, null, "View payment details")
          )
        )
      );
    },
  },
];

type TableStoryArgs = {
  filterPlaceholder: string;
  showColumnToggle: boolean;
  showPagination: boolean;
  showRowSelection: boolean;
  pageSize: number;
};

const meta: Meta<TableStoryArgs> = {
  title: 'Shadcn UI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    filterPlaceholder: {
      control: { type: 'text' },
      description: 'Placeholder text for filter input',
    },
    showColumnToggle: {
      control: { type: 'boolean' },
      description: 'Show column visibility toggle',
    },
    showPagination: {
      control: { type: 'boolean' },
      description: 'Show pagination controls',
    },
    showRowSelection: {
      control: { type: 'boolean' },
      description: 'Enable row selection',
    },
    pageSize: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Number of rows per page',
    },
  },
  args: {
    filterPlaceholder: 'Filter emails...',
    showColumnToggle: true,
    showPagination: true,
    showRowSelection: true,
    pageSize: 10,
  },
};

export default meta;
type Story = StoryObj<TableStoryArgs>;

const DataTableComponent = (args: TableStoryArgs) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: args.pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const filterInput = React.createElement(Input, {
    placeholder: args.filterPlaceholder,
    value: (table.getColumn("email")?.getFilterValue() as string) ?? "",
    onChange: (event) =>
      table.getColumn("email")?.setFilterValue(event.target.value),
    className: "max-w-sm"
  });

  const columnToggle = args.showColumnToggle ? React.createElement(DropdownMenu, null,
    React.createElement(DropdownMenuTrigger, { asChild: true },
      React.createElement(Button, { variant: "outline", className: "ml-auto" },
        "Columns ",
        React.createElement(ChevronDown, { className: "ml-2 h-4 w-4" })
      )
    ),
    React.createElement(DropdownMenuContent, { align: "end" },
      table
        .getAllColumns()
        .filter((column) => column.getCanHide())
        .map((column) =>
          React.createElement(DropdownMenuCheckboxItem, {
            key: column.id,
            className: "capitalize",
            checked: column.getIsVisible(),
            onCheckedChange: (value) => column.toggleVisibility(!!value)
          }, column.id)
        )
    )
  ) : null;

  const tableHeaders = table.getHeaderGroups().map((headerGroup) =>
    React.createElement(TableRow, { key: headerGroup.id },
      headerGroup.headers.map((header) =>
        React.createElement(TableHead, { key: header.id },
          header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())
        )
      )
    )
  );

  const tableRows = table.getRowModel().rows?.length ? (
    table.getRowModel().rows.map((row) =>
      React.createElement(TableRow, {
        key: row.id,
        'data-state': row.getIsSelected() && "selected"
      },
        row.getVisibleCells().map((cell) =>
          React.createElement(TableCell, { key: cell.id },
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )
        )
      )
    )
  ) : (
    [React.createElement(TableRow, { key: 'empty' },
      React.createElement(TableCell, {
        colSpan: columns.length,
        className: "h-24 text-center"
      }, "No results.")
    )]
  );

  const pagination = args.showPagination ? React.createElement('div', { className: 'flex items-center justify-end space-x-2 py-4' },
    args.showRowSelection ? React.createElement('div', { className: 'text-muted-foreground flex-1 text-sm' },
      `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
    ) : null,
    React.createElement('div', { className: 'space-x-2' },
      React.createElement(Button, {
        variant: "outline",
        size: "sm",
        onClick: () => table.previousPage(),
        disabled: !table.getCanPreviousPage()
      }, "Previous"),
      React.createElement(Button, {
        variant: "outline",
        size: "sm",
        onClick: () => table.nextPage(),
        disabled: !table.getCanNextPage()
      }, "Next")
    )
  ) : null;

  return React.createElement('div', { className: 'w-full' },
    React.createElement('div', { className: 'flex items-center py-4' },
      filterInput,
      columnToggle
    ),
    React.createElement('div', { className: 'overflow-hidden rounded-md border' },
      React.createElement(Table, null,
        React.createElement(TableHeader, null, ...tableHeaders),
        React.createElement(TableBody, null, ...tableRows)
      )
    ),
    pagination
  );
};

export const Default: Story = {
  render: (args) => React.createElement(DataTableComponent, args),
  args: {
    filterPlaceholder: 'Filter emails...',
    showColumnToggle: true,
    showPagination: true,
    showRowSelection: true,
    pageSize: 10,
  },
};

export const WithoutColumnToggle: Story = {
  render: (args) => React.createElement(DataTableComponent, args),
  args: {
    filterPlaceholder: 'Search payments...',
    showColumnToggle: false,
    showPagination: true,
    showRowSelection: true,
    pageSize: 5,
  },
};

export const WithoutPagination: Story = {
  render: (args) => React.createElement(DataTableComponent, args),
  args: {
    filterPlaceholder: 'Filter emails...',
    showColumnToggle: true,
    showPagination: false,
    showRowSelection: true,
    pageSize: 20,
  },
};

export const WithoutRowSelection: Story = {
  render: (args) => React.createElement(DataTableComponent, args),
  args: {
    filterPlaceholder: 'Filter emails...',
    showColumnToggle: true,
    showPagination: true,
    showRowSelection: false,
    pageSize: 10,
  },
};

export const Minimal: Story = {
  render: (args) => React.createElement(DataTableComponent, args),
  args: {
    filterPlaceholder: 'Search...',
    showColumnToggle: false,
    showPagination: false,
    showRowSelection: false,
    pageSize: 20,
  },
};

export const SmallPageSize: Story = {
  render: (args) => React.createElement(DataTableComponent, args),
  args: {
    filterPlaceholder: 'Filter emails...',
    showColumnToggle: true,
    showPagination: true,
    showRowSelection: true,
    pageSize: 3,
  },
};
