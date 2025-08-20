"use client";

import { Heart, Star } from "lucide-react";
import { StoryTemplate } from "@/types/story";

interface TemplateCardProps {
  template: StoryTemplate;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (template: StoryTemplate) => void;
  onToggleFavorite: (templateId: string) => void;
  isToggling?: boolean;
  size?: "small" | "large";
}

export default function TemplateCard({
  template,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
  isToggling = false,
  size = "large",
}: TemplateCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent template selection
    onToggleFavorite(template.id);
  };

  if (size === "small") {
    return (
      <div
        onClick={() => onSelect(template)}
        className={`p-3 border rounded-lg cursor-pointer transition-all relative ${
          isSelected
            ? "border-purple-500 bg-purple-50"
            : "border-gray-200 hover:border-purple-300"
        }`}
      >
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isToggling}
          className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
            isFavorite
              ? "text-red-500 hover:text-red-600"
              : "text-gray-400 hover:text-red-500"
          } ${isToggling ? "opacity-50" : ""}`}
        >
          <Heart className={`w-3 h-3 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        <div className="flex items-center space-x-2 pr-6">
          <span className="text-lg">{template.icon}</span>
          <div>
            <h5 className="font-medium text-gray-800 text-sm">
              {template.name}
            </h5>
            <p className="text-xs text-gray-600">{template.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(template)}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md relative ${
        isSelected
          ? "border-purple-500 bg-purple-50"
          : "border-gray-200 hover:border-purple-300"
      }`}
    >
      {/* Favorite button */}
      <button
        onClick={handleFavoriteClick}
        disabled={isToggling}
        className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${
          isFavorite
            ? "text-red-500 hover:text-red-600"
            : "text-gray-400 hover:text-red-500"
        } ${isToggling ? "opacity-50" : ""}`}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>

      <div className="flex items-start space-x-3 pr-8">
        <span className="text-2xl">{template.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-800">{template.name}</h4>
            {template.popular && (
              <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded flex items-center">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{template.description}</p>

          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {template.category}
            </span>
            {isFavorite && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded flex items-center">
                <Heart className="w-3 h-3 mr-1 fill-current" />
                Favorite
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
