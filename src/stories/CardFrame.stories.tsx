import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardFrame from "./CardFrame";

const meta: Meta<typeof CardFrame> = {
  title: "Card Components/CardFrame",
  component: CardFrame,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    rarity: {
      control: "select",
      options: ["common", "rare", "epic", "legendary"],
      description: "Rarity of the card",
    },
    children: {
      control: "text",
      description: "Content inside the card frame",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Common: Story = {
  args: {
    rarity: "common",
    children: <div className="p-4">Common Card Content</div>,
  },
};

export const Rare: Story = {
  args: {
    rarity: "rare",
    children: <div className="p-4">Rare Card Content</div>,
  },
};

export const Epic: Story = {
  args: {
    rarity: "epic",
    children: <div className="p-4">Epic Card Content</div>,
  },
};

export const Legendary: Story = {
  args: {
    rarity: "legendary",
    children: <div className="p-4">Legendary Card Content</div>,
  },
};

export const AllRarities: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <CardFrame rarity="common">
        <div className="p-4 text-center">
          <h3 className="font-bold">Common</h3>
          <p className="text-sm">Basic card</p>
        </div>
      </CardFrame>
      <CardFrame rarity="rare">
        <div className="p-4 text-center">
          <h3 className="font-bold">Rare</h3>
          <p className="text-sm">Uncommon card</p>
        </div>
      </CardFrame>
      <CardFrame rarity="epic">
        <div className="p-4 text-center">
          <h3 className="font-bold">Epic</h3>
          <p className="text-sm">Powerful card</p>
        </div>
      </CardFrame>
      <CardFrame rarity="legendary">
        <div className="p-4 text-center">
          <h3 className="font-bold">Legendary</h3>
          <p className="text-sm">Ultimate card</p>
        </div>
      </CardFrame>
    </div>
  ),
};
