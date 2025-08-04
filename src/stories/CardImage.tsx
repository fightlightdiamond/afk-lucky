// components/CardImage.tsx
import React from "react";

export interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function CardImage({
  src,
  alt,
  className = "",
}: CardImageProps) {
  return (
    <div className={`relative overflow-hidden rounded-t-lg ${className}`}>
      <img src={src} alt={alt} className="w-full h-32 object-cover" />
    </div>
  );
}
