import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import styles from "./Skill.module.css";

export interface SkillProps {
  name: string;
  img: string;
  desc: string;
  level?: number;
  maxLevel?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
  unlocked?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

export default function Skill({
  name,
  img,
  desc,
  level = 1,
  maxLevel = 5,
  rarity = "common",
  unlocked = true,
  animated = false,
  onClick,
}: SkillProps) {
  const isMaxLevel = level >= maxLevel;

  // Tailwind classes cho rarity colors
  const rarityClasses = {
    common: "border-gray-300 bg-gray-50",
    rare: "border-blue-400 bg-blue-50",
    epic: "border-purple-400 bg-purple-50",
    legendary: "border-yellow-400 bg-yellow-50",
  };

  // CSS Module classes cho effects
  const effectClasses = [
    animated && styles.animatedSkill,
    !unlocked && styles.lockedSkill,
    isMaxLevel && styles.maxLevelSkill,
    styles[`rarity-${rarity}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card
      className={`
        w-36 cursor-pointer transition-all duration-300 border-2
        ${rarityClasses[rarity]}
        ${effectClasses}
        ${unlocked ? "hover:shadow-lg hover:-translate-y-1" : "opacity-60"}
      `}
      onClick={unlocked ? onClick : undefined}
    >
      <CardContent className="flex flex-col items-center p-4 relative">
        {/* Skill Icon Container */}
        <div
          className={`
          relative w-16 h-16 rounded-xl mb-2 overflow-hidden
          ${unlocked ? "border shadow" : "border-dashed border-gray-300"}
          ${animated ? styles.iconContainer : ""}
        `}
        >
          <img
            src={img}
            alt={name}
            className={`
              w-full h-full object-contain transition-all duration-300
              ${unlocked ? "" : "grayscale opacity-50"}
              ${animated ? styles.skillIcon : ""}
            `}
          />

          {/* Lock overlay - CSS Module */}
          {!unlocked && (
            <div className={styles.lockOverlay}>
              <span className="text-gray-400 text-xl">🔒</span>
            </div>
          )}

          {/* Max level crown - CSS Module */}
          {isMaxLevel && unlocked && (
            <div className={styles.maxLevelCrown}>
              <span className="text-yellow-500 text-sm">👑</span>
            </div>
          )}
        </div>

        {/* Skill Name */}
        <div
          className={`
          text-lg font-semibold text-center mb-1
          ${unlocked ? "text-gray-800" : "text-gray-400"}
          ${animated ? styles.skillName : ""}
        `}
        >
          {name}
        </div>

        {/* Skill Level */}
        <div
          className={`
          text-xs font-medium mb-2
          ${isMaxLevel ? "text-yellow-600" : "text-blue-600"}
        `}
        >
          {unlocked ? `Level ${level}/${maxLevel}` : "Locked"}
        </div>

        {/* Skill Description */}
        <div
          className={`
          text-xs text-center leading-relaxed
          ${unlocked ? "text-gray-500" : "text-gray-400"}
        `}
        >
          {desc}
        </div>

        {/* Level Progress Bar - CSS Module */}
        {unlocked && !isMaxLevel && (
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${(level / maxLevel) * 100}%` }}
            />
          </div>
        )}

        {/* Rarity glow effect - CSS Module */}
        {unlocked && animated && rarity !== "common" && (
          <div className={`${styles.rarityGlow} ${styles[`glow-${rarity}`]}`} />
        )}

        {/* Unlock animation - CSS Module */}
        {unlocked && animated && <div className={styles.unlockEffect} />}
      </CardContent>
    </Card>
  );
}
