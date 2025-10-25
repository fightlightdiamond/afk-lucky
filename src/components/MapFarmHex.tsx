import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "./MapFarmHex.module.css";

export interface HexPosition {
  q: number; // column (0-6)
  r: number; // row (0-6)
}

export interface Hero {
  id: string;
  name: string;
  image?: string;
  level?: number;
  type?: "warrior" | "mage" | "archer" | "assassin";
}

export interface Monster {
  id: string;
  name: string;
  image?: string;
  level?: number;
  type?: "goblin" | "orc" | "dragon" | "skeleton";
}

export interface MapFarmHexProps {
  heroPositions?: Array<{ position: HexPosition; hero: Hero }>;
  monsterPositions?: Array<{ position: HexPosition; monster: Monster }>;
  highlightCells?: HexPosition[];
  selectedCell?: HexPosition;
  onCellClick?: (position: HexPosition) => void;
  animated?: boolean;
  className?: string;
}

type HeroType = NonNullable<Hero["type"]>;
type MonsterType = NonNullable<Monster["type"]>;

const HERO_TYPE_COLOR: Record<HeroType, string> = {
  warrior: "bg-red-500 text-white",
  mage: "bg-blue-500 text-white",
  archer: "bg-green-500 text-white",
  assassin: "bg-purple-500 text-white",
};

const HERO_TYPE_ICON: Record<HeroType, string> = {
  warrior: "⚔️",
  mage: "🔮",
  archer: "🏹",
  assassin: "🗡️",
};

const MONSTER_TYPE_COLOR: Record<MonsterType, string> = {
  goblin: "bg-green-600 text-white",
  orc: "bg-gray-600 text-white",
  dragon: "bg-red-600 text-white",
  skeleton: "bg-black text-white",
};

const MONSTER_TYPE_ICON: Record<MonsterType, string> = {
  goblin: "👹",
  orc: "👺",
  dragon: "🐉",
  skeleton: "💀",
};

const generateHexGrid = (): HexPosition[] => {
  const grid: HexPosition[] = [];
  for (let r = 0; r < 7; r++) {
    for (let q = 0; q < 7; q++) {
      grid.push({ q, r });
    }
  }
  return grid;
};

export default function MapFarmHex({
  heroPositions = [],
  monsterPositions = [],
  highlightCells = [],
  selectedCell,
  onCellClick,
  animated = true,
  className = "",
}: MapFarmHexProps) {
  const hexGrid = React.useMemo(generateHexGrid, []);

  // Helper functions
  const getHeroAtPosition = (pos: HexPosition) => {
    return heroPositions.find(
      (h) => h.position.q === pos.q && h.position.r === pos.r
    );
  };

  const getMonsterAtPosition = (pos: HexPosition) => {
    return monsterPositions.find(
      (m) => m.position.q === pos.q && m.position.r === pos.r
    );
  };

  const isHighlighted = (pos: HexPosition) => {
    return highlightCells.some((h) => h.q === pos.q && h.r === pos.r);
  };

  const isSelected = (pos: HexPosition) => {
    return selectedCell && selectedCell.q === pos.q && selectedCell.r === pos.r;
  };

  return (
    <div
      className={cn(
        "relative w-fit mx-auto p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow-lg",
        animated && styles.mapContainer,
        className
      )}
    >
      {/* 7x7 Hex Grid */}
      <div className={styles.hexGrid}>
        {hexGrid.map((pos, index) => {
          const heroData = getHeroAtPosition(pos);
          const monsterData = getMonsterAtPosition(pos);
          const isHighlightedCell = isHighlighted(pos);
          const isSelectedCell = isSelected(pos);
          const heroType = (heroData?.hero.type ?? "assassin") as HeroType;
          const monsterType = (monsterData?.monster.type ?? "skeleton") as MonsterType;
          const hexagonBg = heroData
            ? "bg-blue-200 border-blue-300"
            : monsterData
            ? "bg-red-200 border-red-300"
            : "bg-green-50 border-green-200";

          return (
            <div
              key={`hex-${pos.q}-${pos.r}`}
              className={cn(
                styles.hexCell,
                animated && styles.animated,
                heroData && styles.heroCell,
                monsterData && styles.monsterCell,
                isHighlightedCell && styles.highlightedCell,
                isSelectedCell && styles.selectedCell
              )}
              style={
                {
                  "--hex-q": pos.q,
                  "--hex-r": pos.r,
                  "--animation-delay": `${index * 0.02}s`,
                } as React.CSSProperties
              }
              onClick={() => onCellClick?.(pos)}
            >
              {/* Hexagon shape */}
              <div
                className={cn(
                  styles.hexagon,
                  hexagonBg,
                  "hover:bg-opacity-80 transition-all duration-200"
                )}
              >
                {/* Hero content */}
                {heroData && (
                  <div
                    className={cn(
                      styles.cellContent,
                      animated && styles.heroContent
                    )}
                  >
                    {heroData.hero.image ? (
                      <Image
                        src={heroData.hero.image}
                        alt={heroData.hero.name}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          HERO_TYPE_COLOR[heroType]
                        )}
                      >
                        {HERO_TYPE_ICON[heroType]}
                      </div>
                    )}
                    {heroData.hero.level && (
                      <div className="text-xs font-bold text-blue-700 mt-1">
                        {heroData.hero.level}
                      </div>
                    )}
                  </div>
                )}

                {/* Monster content */}
                {monsterData && (
                  <div
                    className={cn(
                      styles.cellContent,
                      animated && styles.monsterContent
                    )}
                  >
                    {monsterData.monster.image ? (
                      <Image
                        src={monsterData.monster.image}
                        alt={monsterData.monster.name}
                        width={24}
                        height={24}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          MONSTER_TYPE_COLOR[monsterType]
                        )}
                      >
                        {MONSTER_TYPE_ICON[monsterType]}
                      </div>
                    )}
                    {monsterData.monster.level && (
                      <div className="text-xs font-bold text-red-700 mt-1">
                        {monsterData.monster.level}
                      </div>
                    )}
                  </div>
                )}

                {/* Empty cell indicator */}
                {!heroData && !monsterData && (
                  <div className={styles.emptyCell}>
                    <div className="w-1 h-1 rounded-full bg-green-400 opacity-40" />
                  </div>
                )}
              </div>

              {/* Glow effects */}
              {isHighlightedCell && animated && (
                <div className={styles.highlightGlow} />
              )}
              {isSelectedCell && animated && (
                <div className={styles.selectionGlow} />
              )}
              {heroData && animated && <div className={styles.heroGlow} />}
              {monsterData && animated && (
                <div className={styles.monsterGlow} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
