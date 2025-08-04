// components/CardLevel.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";

export interface CardLevelProps {
  level: number;
  maxLevel?: number;
}

export default function CardLevel({ level, maxLevel = 100 }: CardLevelProps) {
  return (
    <Badge variant="default" className="absolute top-2 left-2">
      Lv. {level}
      {maxLevel && level >= maxLevel && " MAX"}
    </Badge>
  );
}
