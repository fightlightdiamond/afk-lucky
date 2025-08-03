// components/SkillList.tsx

import {HeroSkill} from "@/types/skill";

interface SkillListProps {
    skills: HeroSkill[]
}

export default function SkillList({ skills }: SkillListProps) {
    return (
        <div className="grid grid-cols-3 gap-4">
            {skills.map(skill => (
                <div key={skill.id} className="hover:shadow-2xl transition">
                    <div className="flex flex-col items-center p-4">
                        <img src={skill.img} alt={skill.name}
                             className="w-16 h-16 rounded-xl mb-2 object-contain border shadow" />
                        <div className="text-lg font-semibold">{skill.name}</div>
                        <div className="text-xs text-gray-500 text-center">{skill.desc}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}
