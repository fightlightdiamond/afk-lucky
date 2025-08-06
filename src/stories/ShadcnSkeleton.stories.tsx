import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Skeleton } from '@/components/ui/skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Shadcn UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'CSS class names for styling',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-4 p-4">
      <Skeleton className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px] bg-gray-300 dark:bg-gray-700" />
        <Skeleton className="h-4 w-[200px] bg-gray-300 dark:bg-gray-700" />
      </div>
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-10 w-[250px] rounded-xl bg-gray-300 dark:bg-gray-700" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px] bg-gray-300 dark:bg-gray-700" />
        <Skeleton className="h-4 w-[200px] bg-gray-300 dark:bg-gray-700" />
      </div>
    </div>
  ),
};




