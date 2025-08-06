import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Separator } from '@/components/ui/separator';
import { createElement } from 'react';

const meta: Meta<typeof Separator> = {
  title: 'Shadcn UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Separator orientation',
    },
    decorative: {
      control: { type: 'boolean' },
      description: 'Whether the separator is decorative',
    },
    className: {
      control: { type: 'text' },
      description: 'CSS class names',
    },
    // Text customization controls
    title: {
      control: { type: 'text' },
      description: 'Main title text',
    },
    description: {
      control: { type: 'text' },
      description: 'Description text',
    },
    navItems: {
      control: { type: 'text' },
      description: 'Navigation items (comma separated)',
    },
    itemSeparator: {
      control: { type: 'text' },
      description: 'Separator for nav items',
    },
  },
  args: {
    orientation: 'horizontal',
    decorative: true,
    title: 'Radix Primitives',
    description: 'An open-source UI component library.',
    navItems: 'Blog,Docs,Source',
    itemSeparator: ',',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const navItemsList = args.navItems 
      ? args.navItems.split(args.itemSeparator).map(item => item.trim()).filter(item => item.length > 0)
      : [];

    return createElement('div', null,
      createElement('div', { className: 'space-y-1' },
        createElement('h4', { className: 'text-sm leading-none font-medium' }, args.title),
        createElement('p', { className: 'text-muted-foreground text-sm border-b !border-gray-200 pb-2' },
          args.description
        )
      ),
      createElement(Separator, { 
        className: 'my-4 pt-2',
        orientation: args.orientation,
        decorative: args.decorative
      }),
      createElement('div', { className: 'flex h-5 items-center space-x-4 text-sm' },
        ...navItemsList.map((item, index) => {
          const elements = [];
          
          if (index > 0) {
            elements.push(createElement(Separator, { 
              key: `sep-${index}`, 
              orientation: 'vertical' 
            }));
          }
          
          const className = item === 'Docs' || index === 1 
            ? 'border-l border-r !border-gray-200 px-4' 
            : '';
          
          elements.push(createElement('div', { 
            key: item, 
            className 
          }, item));
          
          return elements;
        }).flat()
      )
    );
  },
};





