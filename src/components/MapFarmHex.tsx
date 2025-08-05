import React from "react";
import Image from "next/image";
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

export default function MapFarmHex({
  heroPositions = [],
  monsterPositions = [],
  highlightCells = [],
  selectedCell,
  onCellClick,
  animated = true,
  className = "",
}: MapFarmHexProps) {
  // Generate 7x7 hex grid (49 cells total)
  const generateHexGrid = () => {
    const grid: HexPosition[] = [];
    for (let r = 0; r < 7; r++) {
      for (let q = 0; q < 7; q++) {
        grid.push({ q, r });
      }
    }
    return grid;
  };

  const hexGrid = generateHexGrid();

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
      className={`
        relative w-fit mx-auto p-6 bg-gradient-to-br from-green-50 to-emerald-100 
        rounded-2xl shadow-lg
        ${animated ? styles.mapContainer : ""}
        ${className}
      `}
    >
      {/* 7x7 Hex Grid */}
      <div className={styles.hexGrid}>
        {hexGrid.map((pos, index) => {
          const heroData = getHeroAtPosition(pos);
          const monsterData = getMonsterAtPosition(pos);
          const isHighlightedCell = isHighlighted(pos);
          const isSelectedCell = isSelected(pos);

          return (
            <div
              key={`hex-${pos.q}-${pos.r}`}
              className={`
                ${styles.hexCell}
                ${animated ? styles.animated : ""}
                ${heroData ? styles.heroCell : ""}
                ${monsterData ? styles.monsterCell : ""}
                ${isHighlightedCell ? styles.highlightedCell : ""}
                ${isSelectedCell ? styles.selectedCell : ""}
              `}
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
                className={`
                  ${styles.hexagon}
                  ${
                    heroData
                      ? "bg-blue-200 border-blue-300"
                      : monsterData
                      ? "bg-red-200 border-red-300"
                      : "bg-green-50 border-green-200"
                  }
                  hover:bg-opacity-80 transition-all duration-200
                `}
              >
                {/* Hero content */}
                {heroData && (
                  <div
                    className={`${styles.cellContent} ${
                      animated ? styles.heroContent : ""
                    }`}
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
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${
                            heroData.hero.type === "warrior"
                              ? "bg-red-500 text-white"
                              : heroData.hero.type === "mage"
                              ? "bg-blue-500 text-white"
                              : heroData.hero.type === "archer"
                              ? "bg-green-500 text-white"
                              : "bg-purple-500 text-white"
                          }
                        `}
                      >
                        {heroData.hero.type === "warrior"
                          ? "⚔️"
                          : heroData.hero.type === "mage"
                          ? "🔮"
                          : heroData.hero.type === "archer"
                          ? "🏹"
                          : "🗡️"}
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
                    className={`${styles.cellContent} ${
                      animated ? styles.monsterContent : ""
                    }`}
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
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${
                            monsterData.monster.type === "goblin"
                              ? "bg-green-600 text-white"
                              : monsterData.monster.type === "orc"
                              ? "bg-gray-600 text-white"
                              : monsterData.monster.type === "dragon"
                              ? "bg-red-600 text-white"
                              : "bg-black text-white"
                          }
                        `}
                      >
                        {monsterData.monster.type === "goblin"
                          ? "👹"
                          : monsterData.monster.type === "orc"
                          ? "👺"
                          : monsterData.monster.type === "dragon"
                          ? "🐉"
                          : "💀"}
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
