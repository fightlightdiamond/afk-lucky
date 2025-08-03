// components/Skill.tsx
import React from "react";
import {Card, CardContent} from "@/components/ui/card";

export interface SkillProps {
    name: string;
    img: string;
    desc: string;
}

export default function Skill({ name, img, desc }: SkillProps) {
    return (
        <Card className="w-36">
            <CardContent className="flex flex-col items-center p-4">
                <img
                    src={img}
                    alt={name}
                    className="w-16 h-16 rounded-xl mb-2 object-contain border shadow"
                />
                <div className="text-lg font-semibold">{name}</div>
                <div className="text-xs text-gray-500 text-center">{desc}</div>
            </CardContent>
        </Card>
    );
}
