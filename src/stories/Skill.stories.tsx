// components/Skill.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Skill from "./Skill";

const meta: Meta<typeof Skill> = {
    title: "Components/Skill",
    component: Skill,
    argTypes: {
        name: {
            name: "Tên kỹ năng",
            control: "text",
            defaultValue: "Thunder Arrow",
        },
        img: {
            name: "Ảnh kỹ năng (URL)",
            control: "text",
            defaultValue:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvk4cx32JH5u6O-icQUN3FK_9yzdQDkJ_2JA&s",
        },
        desc: {
            name: "Mô tả",
            control: "text",
            defaultValue: "Bắn tên sét giật cực mạnh vào kẻ địch, gây sát thương lớn.",
        },
    },
};

export default meta;
type Story = StoryObj<typeof Skill>;

export const Default: Story = {
    args: {
        name: "Thunder Arrow",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvk4cx32JH5u6O-icQUN3FK_9yzdQDkJ_2JA&s",
        desc: "Bắn tên sét giật cực mạnh vào kẻ địch, gây sát thương lớn.",
    },
    name: "Kỹ năng mặc định",
};

export const CustomSkill: Story = {
    args: {
        name: "Retreat Leap",
        img: "https://cdn-icons-png.flaticon.com/512/616/616494.png",
        desc: "Bật nhảy lùi về phía sau, né tránh đòn đánh.",
    },
    name: "Kỹ năng khác",
};
