// components/DamageNumber.tsx
import React from "react";

export interface DamageNumberProps {
  damage: number;
  type?: "physical" | "magical" | "true";
  critical?: boolean;
}

export default function DamageNumber({
  damage,
  type = "physical",
  critical = false,
}: DamageNumberProps) {
  const getColorClass = () => {
    switch (type) {
      case "physical":
        return "text-red-500";
      case "magical":
        return "text-blue-500";
      case "true":
        return "text-white";
      default:
        return "text-red-500";
    }
  };

  return (
    <div
      className={`
            font-bold text-lg
            ${getColorClass()}
            ${critical ? "text-yellow-400 animate-pulse" : ""}
            drop-shadow-lg
        `}
    >
      {critical && "CRIT! "}
      {damage}
    </div>
  );
}
