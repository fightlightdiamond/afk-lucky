// components/CardFrame.tsx
import React from "react";
import { Card } from "@/components/ui/card";

export interface CardFrameProps {
  children: React.ReactNode;
  rarity?: "common" | "rare" | "epic" | "legendary";
  className?: string;
}

export default function CardFrame({
  children,
  rarity = "common",
  className = "",
}: CardFrameProps) {
  const getRarityBorder = () => {
    switch (rarity) {
      case "common":
        return "border-gray-400";
      case "rare":
        return "border-blue-400";
      case "epic":
        return "border-purple-400";
      case "legendary":
        return "border-yellow-400";
      default:
        return "border-gray-400";
    }
  };

  return (
    <Card
      className={`
            ${getRarityBorder()} 
            border-2 
            bg-gradient-to-b from-gray-100 to-gray-200
            ${className}
        `}
    >
      {children}
    </Card>
  );
}
