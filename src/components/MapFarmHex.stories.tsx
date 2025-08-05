import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import MapFarmHex from "./MapFarmHex";

const sampleHero1 = {
  id: "1",
  name: "Fire Warrior",
  level: 25,
  type: "warrior" as const,
};

const sampleHero2 = {
  id: "2",
  name: "Ice Mage",
  level: 30,
  type: "mage" as const,
};

const sampleMonster1 = {
  id: "1",
  name: "Goblin Scout",
  level: 15,
  type: "goblin" as const,
};

const sampleMonster2 = {
  id: "2",
  name: "Orc Warrior",
  level: 20,
  type: "orc" as const,
};

const sampleMonster3 = {
  id: "3",
  name: "Ancient Dragon",
  level: 50,
  type: "dragon" as const,
};

const meta: Meta<typeof MapFarmHex> = {
  title: "Game Components/MapFarmHex",
  component: MapFarmHex,
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    docs: {
      description: {
        component:
          "Hexagonal farm map component tối ưu với Tailwind CSS + CSS Module. 7x7 hex grid với hero positioning, monster spawns, highlight effects, và selection system.",
      },
    },
  },
  argTypes: {
    heroPositions: {
      control: "object",
      description: "Array of hero positions with hero data",
    },
    monsterPositions: {
      control: "object",
      description: "Array of monster positions with monster data",
    },
    highlightCells: {
      control: "object",
      description: "Array of cells to highlight (skill range, etc)",
    },
    selectedCell: {
      control: "object",
      description: "Currently selected cell position",
    },
    animated: {
      control: "boolean",
      description: "Enable animations and effects",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyMap: Story = {
  args: {
    animated: true,
  },
};

export const SingleHero: Story = {
  args: {
    heroPositions: [{ position: { q: 3, r: 3 }, hero: sampleHero1 }],
    animated: true,
  },
};

export const TwoHeroes: Story = {
  args: {
    heroPositions: [
      { position: { q: 1, r: 1 }, hero: sampleHero1 },
      { position: { q: 5, r: 5 }, hero: sampleHero2 },
    ],
    animated: true,
  },
};

export const WithMonsters: Story = {
  args: {
    heroPositions: [{ position: { q: 1, r: 1 }, hero: sampleHero1 }],
    monsterPositions: [
      { position: { q: 3, r: 2 }, monster: sampleMonster1 },
      { position: { q: 5, r: 4 }, monster: sampleMonster2 },
      { position: { q: 2, r: 5 }, monster: sampleMonster1 },
    ],
    animated: true,
  },
};

export const WithHighlights: Story = {
  args: {
    heroPositions: [{ position: { q: 3, r: 3 }, hero: sampleHero1 }],
    highlightCells: [
      { q: 2, r: 2 },
      { q: 2, r: 3 },
      { q: 2, r: 4 },
      { q: 3, r: 2 },
      { q: 3, r: 4 },
      { q: 4, r: 2 },
      { q: 4, r: 3 },
      { q: 4, r: 4 },
    ],
    animated: true,
  },
};

export const WithSelection: Story = {
  args: {
    heroPositions: [{ position: { q: 1, r: 1 }, hero: sampleHero1 }],
    monsterPositions: [{ position: { q: 4, r: 3 }, monster: sampleMonster2 }],
    selectedCell: { q: 2, r: 2 },
    animated: true,
  },
};

export const BattleScene: Story = {
  args: {
    heroPositions: [
      { position: { q: 0, r: 3 }, hero: sampleHero1 },
      { position: { q: 1, r: 2 }, hero: sampleHero2 },
    ],
    monsterPositions: [
      { position: { q: 5, r: 3 }, monster: sampleMonster3 },
      { position: { q: 4, r: 2 }, monster: sampleMonster2 },
      { position: { q: 4, r: 4 }, monster: sampleMonster1 },
      { position: { q: 6, r: 2 }, monster: sampleMonster1 },
    ],
    highlightCells: [
      { q: 2, r: 2 },
      { q: 2, r: 3 },
      { q: 2, r: 4 },
      { q: 3, r: 2 },
      { q: 3, r: 3 },
      { q: 3, r: 4 },
    ],
    selectedCell: { q: 3, r: 3 },
    animated: true,
  },
};

export const AllHeroTypes: Story = {
  args: {
    heroPositions: [
      {
        position: { q: 1, r: 1 },
        hero: { id: "1", name: "Warrior", type: "warrior", level: 25 },
      },
      {
        position: { q: 3, r: 1 },
        hero: { id: "2", name: "Mage", type: "mage", level: 30 },
      },
      {
        position: { q: 5, r: 1 },
        hero: { id: "3", name: "Archer", type: "archer", level: 28 },
      },
    ],
    animated: true,
  },
};

export const AllMonsterTypes: Story = {
  args: {
    monsterPositions: [
      {
        position: { q: 1, r: 3 },
        monster: { id: "1", name: "Goblin", type: "goblin", level: 15 },
      },
      {
        position: { q: 2, r: 3 },
        monster: { id: "2", name: "Orc", type: "orc", level: 20 },
      },
      {
        position: { q: 3, r: 3 },
        monster: { id: "3", name: "Dragon", type: "dragon", level: 50 },
      },
      {
        position: { q: 4, r: 3 },
        monster: { id: "4", name: "Skeleton", type: "skeleton", level: 18 },
      },
    ],
    animated: true,
  },
};

export const Interactive: Story = {
  args: {
    heroPositions: [{ position: { q: 2, r: 2 }, hero: sampleHero1 }],
    monsterPositions: [{ position: { q: 4, r: 4 }, monster: sampleMonster2 }],
    animated: true,
    onCellClick: (position) => {
      alert(`Clicked cell at q:${position.q}, r:${position.r}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive hex map - click vào các ô để test click handler.",
      },
    },
  },
};

export const WithoutAnimation: Story = {
  args: {
    heroPositions: [{ position: { q: 2, r: 2 }, hero: sampleHero1 }],
    monsterPositions: [{ position: { q: 4, r: 4 }, monster: sampleMonster2 }],
    highlightCells: [
      { q: 1, r: 1 },
      { q: 1, r: 2 },
      { q: 2, r: 1 },
    ],
    selectedCell: { q: 3, r: 3 },
    animated: false,
  },
};

export const LargeScale: Story = {
  args: {
    heroPositions: [
      {
        position: { q: 0, r: 0 },
        hero: { id: "1", name: "Tank", type: "warrior", level: 40 },
      },
      {
        position: { q: 6, r: 6 },
        hero: { id: "2", name: "Healer", type: "mage", level: 35 },
      },
    ],
    monsterPositions: [
      {
        position: { q: 3, r: 1 },
        monster: { id: "1", name: "Boss Orc", type: "orc", level: 45 },
      },
      {
        position: { q: 2, r: 3 },
        monster: { id: "2", name: "Goblin", type: "goblin", level: 20 },
      },
      {
        position: { q: 4, r: 3 },
        monster: { id: "3", name: "Goblin", type: "goblin", level: 20 },
      },
      {
        position: { q: 1, r: 5 },
        monster: { id: "4", name: "Skeleton", type: "skeleton", level: 25 },
      },
      {
        position: { q: 5, r: 5 },
        monster: { id: "5", name: "Skeleton", type: "skeleton", level: 25 },
      },
      {
        position: { q: 3, r: 6 },
        monster: { id: "6", name: "Dragon", type: "dragon", level: 60 },
      },
    ],
    highlightCells: [
      { q: 2, r: 0 },
      { q: 3, r: 0 },
      { q: 4, r: 0 },
      { q: 1, r: 1 },
      { q: 2, r: 1 },
      { q: 4, r: 1 },
      { q: 5, r: 1 },
      { q: 1, r: 2 },
      { q: 2, r: 2 },
      { q: 3, r: 2 },
      { q: 4, r: 2 },
      { q: 5, r: 2 },
    ],
    selectedCell: { q: 3, r: 1 },
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Large scale battle với nhiều units, highlights và effects.",
      },
    },
  },
};

export const SkillRange: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Warrior Attack Range</h3>
        <MapFarmHex
          heroPositions={[
            {
              position: { q: 3, r: 3 },
              hero: { id: "1", name: "Warrior", type: "warrior", level: 25 },
            },
          ]}
          highlightCells={[
            { q: 2, r: 2 },
            { q: 2, r: 3 },
            { q: 2, r: 4 },
            { q: 3, r: 2 },
            { q: 3, r: 4 },
            { q: 4, r: 2 },
            { q: 4, r: 3 },
            { q: 4, r: 4 },
          ]}
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Mage Spell Range</h3>
        <MapFarmHex
          heroPositions={[
            {
              position: { q: 3, r: 3 },
              hero: { id: "2", name: "Mage", type: "mage", level: 30 },
            },
          ]}
          highlightCells={[
            { q: 1, r: 1 },
            { q: 1, r: 2 },
            { q: 1, r: 3 },
            { q: 1, r: 4 },
            { q: 1, r: 5 },
            { q: 2, r: 1 },
            { q: 2, r: 2 },
            { q: 2, r: 3 },
            { q: 2, r: 4 },
            { q: 2, r: 5 },
            { q: 3, r: 1 },
            { q: 3, r: 2 },
            { q: 3, r: 4 },
            { q: 3, r: 5 },
            { q: 4, r: 1 },
            { q: 4, r: 2 },
            { q: 4, r: 3 },
            { q: 4, r: 4 },
            { q: 4, r: 5 },
            { q: 5, r: 1 },
            { q: 5, r: 2 },
            { q: 5, r: 3 },
            { q: 5, r: 4 },
            { q: 5, r: 5 },
          ]}
          animated
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Showcase skill ranges khác nhau cho các loại hero.",
      },
    },
  },
};
