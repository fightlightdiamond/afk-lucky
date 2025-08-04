import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import DamageNumber from "./DamageNumber";

const meta: Meta<typeof DamageNumber> = {
  title: "Card Components/DamageNumber",
  component: DamageNumber,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#1a1a1a" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    damage: {
      control: { type: "number", min: 1, max: 9999 },
      description: "Damage amount",
    },
    type: {
      control: "select",
      options: ["physical", "magical", "true"],
      description: "Type of damage",
    },
    critical: {
      control: "boolean",
      description: "Whether this is a critical hit",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Physical: Story = {
  args: {
    damage: 150,
    type: "physical",
  },
};

export const Magical: Story = {
  args: {
    damage: 200,
    type: "magical",
  },
};

export const TrueDamage: Story = {
  args: {
    damage: 100,
    type: "true",
  },
};

export const Critical: Story = {
  args: {
    damage: 350,
    type: "physical",
    critical: true,
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex gap-4">
      <DamageNumber damage={150} type="physical" />
      <DamageNumber damage={200} type="magical" />
      <DamageNumber damage={100} type="true" />
      <DamageNumber damage={350} type="physical" critical />
    </div>
  ),
};
