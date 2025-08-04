import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SkillList from "./SkillList";

const sampleSkills = [
  {
    id: "1",
    name: "Fire Bolt",
    img: "https://via.placeholder.com/64x64/ef4444/ffffff?text=🔥",
    desc: "A basic fire spell that deals moderate damage",
    level: 3,
    maxLevel: 5,
    rarity: "common" as const,
    unlocked: true,
  },
  {
    id: "2",
    name: "Ice Storm",
    img: "https://via.placeholder.com/64x64/3b82f6/ffffff?text=❄️",
    desc: "Summons a powerful ice storm that freezes enemies",
    level: 2,
    maxLevel: 5,
    rarity: "rare" as const,
    unlocked: true,
  },
  {
    id: "3",
    name: "Lightning Strike",
    img: "https://via.placeholder.com/64x64/8b5cf6/ffffff?text=⚡",
    desc: "Calls down lightning to devastate foes",
    level: 4,
    maxLevel: 5,
    rarity: "epic" as const,
    unlocked: true,
  },
  {
    id: "4",
    name: "Dragon Breath",
    img: "https://via.placeholder.com/64x64/f59e0b/ffffff?text=🐉",
    desc: "Ultimate dragon magic that burns everything",
    level: 5,
    maxLevel: 5,
    rarity: "legendary" as const,
    unlocked: true,
  },
  {
    id: "5",
    name: "Meteor",
    img: "https://via.placeholder.com/64x64/6b7280/ffffff?text=☄️",
    desc: "Requires level 50 to unlock this devastating spell",
    level: 1,
    maxLevel: 5,
    rarity: "legendary" as const,
    unlocked: false,
  },
  {
    id: "6",
    name: "Heal",
    img: "https://via.placeholder.com/64x64/22c55e/ffffff?text=💚",
    desc: "Restores health to allies",
    level: 5,
    maxLevel: 5,
    rarity: "common" as const,
    unlocked: true,
  },
];

const meta: Meta<typeof SkillList> = {
  title: "Game Components/SkillList",
  component: SkillList,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Skill list component tối ưu với Tailwind CSS + CSS Module. Tailwind cho layout, grid, responsive cơ bản. CSS Module cho staggered animations, loading effects phức tạp.",
      },
    },
  },
  argTypes: {
    layout: {
      control: "select",
      options: ["grid", "list", "masonry"],
      description: "Layout style for skills",
    },
    columns: {
      control: "select",
      options: [2, 3, 4, 5],
      description: "Number of columns for grid layout",
    },
    animated: {
      control: "boolean",
      description: "Enable staggered animations",
    },
    sortBy: {
      control: "select",
      options: ["name", "rarity", "level"],
      description: "Sort skills by",
    },
    filterBy: {
      control: "select",
      options: ["all", "unlocked", "locked", "maxLevel"],
      description: "Filter skills by",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const GridLayout: Story = {
  args: {
    skills: sampleSkills,
    layout: "grid",
    columns: 3,
    animated: true,
  },
};

export const ListLayout: Story = {
  args: {
    skills: sampleSkills,
    layout: "list",
    animated: true,
  },
};

export const MasonryLayout: Story = {
  args: {
    skills: sampleSkills,
    layout: "masonry",
    animated: true,
  },
};

export const FourColumns: Story = {
  args: {
    skills: sampleSkills,
    layout: "grid",
    columns: 4,
    animated: true,
  },
};

export const SortedByRarity: Story = {
  args: {
    skills: sampleSkills,
    layout: "grid",
    columns: 3,
    sortBy: "rarity",
    animated: true,
  },
};

export const UnlockedOnly: Story = {
  args: {
    skills: sampleSkills,
    layout: "grid",
    columns: 3,
    filterBy: "unlocked",
    animated: true,
  },
};

export const LockedOnly: Story = {
  args: {
    skills: sampleSkills,
    layout: "grid",
    columns: 3,
    filterBy: "locked",
    animated: true,
  },
};

export const MaxLevelOnly: Story = {
  args: {
    skills: sampleSkills,
    layout: "grid",
    columns: 3,
    filterBy: "maxLevel",
    animated: true,
  },
};

export const EmptyState: Story = {
  args: {
    skills: [],
    layout: "grid",
    columns: 3,
    animated: true,
  },
};

export const Interactive: Story = {
  args: {
    skills: sampleSkills,
    layout: "grid",
    columns: 3,
    animated: true,
    onSkillClick: (skill) => alert(`Clicked on ${skill.name}!`),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive skill list với click handlers. Click vào skill để test.",
      },
    },
  },
};
