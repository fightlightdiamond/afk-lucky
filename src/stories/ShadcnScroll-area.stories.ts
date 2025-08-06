import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { createElement } from 'react';
import * as React from 'react';

const meta: Meta<typeof ScrollArea> = {
  title: 'Shadcn UI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const tags = Array.from({ length: 50 }).map(
      (_, i, a) => `v1.2.0-beta.${a.length - i}`
    );

    return createElement(ScrollArea, {
      className: 'h-72 w-48 rounded-md border'
    },
      createElement('div', { className: 'p-4' },
        createElement('h4', { className: 'mb-4 text-sm leading-none font-medium' }, 'Tags'),
        ...tags.map((tag) =>
          createElement(React.Fragment, { key: tag },
            createElement('div', { className: 'text-sm' }, tag),
            createElement(Separator, { className: 'my-2' })
          )
        )
      )
    );
  },
};

export const HorizontalScrolling: Story = {
  render: () => {
    const works = [
      {
        artist: "Ornella Binni",
        art: "https://images.unsplash.com/photo-1465869185982-5a1a7522cbcb?auto=format&fit=crop&w=300&q=80",
      },
      {
        artist: "Tom Byrom", 
        art: "https://images.unsplash.com/photo-1548516173-3cabfa4607e9?auto=format&fit=crop&w=300&q=80",
      },
      {
        artist: "Vladimir Malyavko",
        art: "https://images.unsplash.com/photo-1494337480532-3725c85fd2ab?auto=format&fit=crop&w=300&q=80",
      },
    ];

    return createElement(ScrollArea, {
      className: 'w-96 rounded-md border whitespace-nowrap'
    },
      createElement('div', { className: 'flex w-max space-x-4 p-4' },
        ...works.map((artwork) =>
          createElement('figure', { key: artwork.artist, className: 'shrink-0' },
            createElement('div', { className: 'overflow-hidden rounded-md' },
              createElement('img', {
                src: artwork.art,
                alt: `Photo by ${artwork.artist}`,
                className: 'aspect-[3/4] h-fit w-fit object-cover',
                width: 300,
                height: 400
              })
            ),
            createElement('figcaption', { className: 'text-muted-foreground pt-2 text-xs' },
              'Photo by ',
              createElement('span', { className: 'text-foreground font-semibold' }, artwork.artist)
            )
          )
        )
      ),
      createElement(ScrollBar, { orientation: 'horizontal' })
    );
  },
};








