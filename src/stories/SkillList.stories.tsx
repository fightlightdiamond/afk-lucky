import { heroSkills } from "@/data/skills"
import SkillList from "./SkillList"

export default {
    title: "Components/SkillList",
    component: SkillList,
    argTypes: {
        skills: {
            name: "Skills",
            description: "Danh sách các skill của hero",
            control: { type: "object" },
            table: {
                type: { summary: "HeroSkill[]" },
                defaultValue: { summary: "[]" },
            },
            defaultValue: heroSkills,
        },
    },
    parameters: {
        // Tích hợp dark mode nếu project có setup (ví dụ: darkMode: true)
    },
}

export const Default = () => <SkillList skills={heroSkills} />
