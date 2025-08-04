// components/CardStat.tsx
import React from "react";

export interface CardStatProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
}

export default function CardStat({
  label,
  value,
  icon,
  color = "text-gray-600",
}: CardStatProps) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className={color}>{icon}</span>}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`font-semibold ${color}`}>{value}</span>
      </div>
    </div>
  );
}
