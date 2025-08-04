// components/CardName.tsx
import React from "react";

export interface CardNameProps {
  name: string;
  subtitle?: string;
  className?: string;
}

export default function CardName({
  name,
  subtitle,
  className = "",
}: CardNameProps) {
  return (
    <div className={`text-center ${className}`}>
      <h3 className="font-bold text-lg text-gray-800">{name}</h3>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
}
