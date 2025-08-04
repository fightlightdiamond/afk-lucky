import React from "react";
import Skill from "./Skill";
import styles from "./SkillList.module.css";

interface HeroSkill {
  id: string;
  name: string;
  img: string;
  desc: string;
  level?: number;
  maxLevel?: number;
  rarity?: "common" | "rare" | "epic" | "legendary";
  unlocked?: boolean;
}

interface SkillListProps {
  skills: HeroSkill[];
  layout?: "grid" | "list" | "masonry";
  columns?: 2 | 3 | 4 | 5;
  animated?: boolean;
  sortBy?: "name" | "rarity" | "level";
  filterBy?: "all" | "unlocked" | "locked" | "maxLevel";
  onSkillClick?: (skill: HeroSkill) => void;
}

export default function SkillList({
  skills,
  layout = "grid",
  columns = 3,
  animated = false,
  sortBy = "name",
  filterBy = "all",
  onSkillClick,
}: SkillListProps) {
  // Filter skills
  const filteredSkills = React.useMemo(() => {
    let filtered = [...skills];

    switch (filterBy) {
      case "unlocked":
        filtered = filtered.filter((skill) => skill.unlocked !== false);
        break;
      case "locked":
        filtered = filtered.filter((skill) => skill.unlocked === false);
        break;
      case "maxLevel":
        filtered = filtered.filter(
          (skill) =>
            skill.level && skill.maxLevel && skill.level >= skill.maxLevel
        );
        break;
    }

    return filtered;
  }, [skills, filterBy]);

  // Sort skills
  const sortedSkills = React.useMemo(() => {
    const sorted = [...filteredSkills];

    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "rarity":
        const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
        return sorted.sort(
          (a, b) =>
            (rarityOrder[b.rarity || "common"] || 0) -
            (rarityOrder[a.rarity || "common"] || 0)
        );
      case "level":
        return sorted.sort((a, b) => (b.level || 0) - (a.level || 0));
      default:
        return sorted;
    }
  }, [filteredSkills, sortBy]);

  // Tailwind classes cho layout
  const layoutClasses = {
    grid: `grid gap-4 ${
      columns === 2
        ? "grid-cols-2"
        : columns === 3
        ? "grid-cols-2 md:grid-cols-3"
        : columns === 4
        ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    }`,
    list: "space-y-4",
    masonry: "columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4",
  };

  // CSS Module classes cho effects
  const effectClasses = [
    animated && styles.animatedList,
    styles[`layout-${layout}`],
  ]
    .filter(Boolean)
    .join(" ");

  if (sortedSkills.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          No skills found
        </h3>
        <p className="text-gray-500">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div
      className={`
      w-full
      ${layoutClasses[layout]}
      ${effectClasses}
    `}
    >
      {sortedSkills.map((skill, index) => (
        <div
          key={skill.id}
          className={`
            ${layout === "list" ? "w-full" : ""}
            ${animated ? styles.skillItem : ""}
          `}
          style={{
            animationDelay: animated ? `${index * 0.1}s` : undefined,
          }}
        >
          {layout === "list" ? (
            // List layout - horizontal card
            <div
              className={`
                flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-gray-200
                hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer
                ${skill.unlocked === false ? "opacity-60" : ""}
              `}
              onClick={() => onSkillClick?.(skill)}
            >
              <div className="flex-shrink-0">
                <img
                  src={skill.img}
                  alt={skill.name}
                  className={`
                    w-16 h-16 rounded-xl object-contain border shadow
                    ${skill.unlocked === false ? "grayscale opacity-50" : ""}
                  `}
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {skill.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{skill.desc}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span
                    className={`
                    font-medium
                    ${
                      skill.level &&
                      skill.maxLevel &&
                      skill.level >= skill.maxLevel
                        ? "text-yellow-600"
                        : "text-blue-600"
                    }
                  `}
                  >
                    {skill.unlocked === false
                      ? "Locked"
                      : `Level ${skill.level || 1}/${skill.maxLevel || 5}`}
                  </span>
                  {skill.rarity && (
                    <span
                      className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${
                        skill.rarity === "common"
                          ? "bg-gray-100 text-gray-700"
                          : skill.rarity === "rare"
                          ? "bg-blue-100 text-blue-700"
                          : skill.rarity === "epic"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-yellow-100 text-yellow-700"
                      }
                    `}
                    >
                      {skill.rarity.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Grid/Masonry layout - use Skill component
            <Skill
              name={skill.name}
              img={skill.img}
              desc={skill.desc}
              level={skill.level}
              maxLevel={skill.maxLevel}
              rarity={skill.rarity}
              unlocked={skill.unlocked}
              animated={animated}
              onClick={() => onSkillClick?.(skill)}
            />
          )}
        </div>
      ))}

      {/* Loading animation overlay - CSS Module */}
      {animated && <div className={styles.loadingOverlay} />}
    </div>
  );
}
