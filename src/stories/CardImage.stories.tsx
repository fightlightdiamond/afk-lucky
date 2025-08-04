import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardImage from "./CardImage";

const meta: Meta<typeof CardImage> = {
  title: "Card Components/CardImage",
  component: CardImage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    src: {
      control: "text",
      description: "Image URL",
    },
    alt: {
      control: "text",
      description: "Alt text for the image",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
    alt: "Fantasy warrior",
  },
};

export const Mage: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
    alt: "Fantasy mage",
  },
};

export const Dragon: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
    alt: "Dragon",
  },
};

export const MultipleImages: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-md">
      <CardImage
        src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop"
        alt="Warrior"
      />
      <CardImage
        src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop"
        alt="Mage"
      />
    </div>
  ),
};
