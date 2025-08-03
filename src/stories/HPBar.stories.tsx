// components/HPBar.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HPBar from "./HPBar";

const meta: Meta<typeof HPBar> = {
    title: "Components/HPBar",
    component: HPBar,
    argTypes: {
        hp: {
            name: "HP hiện tại",
            control: { type: "number", min: 0, max: 1000 },
            defaultValue: 700,
        },
        maxHp: {
            name: "HP tối đa",
            control: { type: "number", min: 1, max: 1000 },
            defaultValue: 1000,
        },
        color: {
            name: "Màu thanh HP",
            control: "color",
            defaultValue: "#22d3ee",
        },
        className: {
            table: { disable: true },
        },
    },
};
export default meta;
type Story = StoryObj<typeof HPBar>;

export const Default: Story = {
    args: {
        hp: 700,
        maxHp: 1000,
        color: "#22d3ee",
    },
    name: "Thanh HP mặc định",
};

export const Danger: Story = {
    args: {
        hp: 200,
        maxHp: 1000,
        color: "#ef4444",
    },
    name: "HP thấp (đổi màu đỏ)",
};
