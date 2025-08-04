import React from "react";
import { Progress } from "@/components/ui/progress";
import styles from "./HPBar.module.css";

interface HPBarProps {
  hp: number;
  maxHp: number;
  animated?: boolean;
  showNumbers?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact" | "detailed";
  critical?: boolean;
  className?: string;
}

export default function HPBar({
  hp,
  maxHp,
  animated = true,
  showNumbers = true,
  size = "md",
  variant = "default",
  critical = false,
  className,
}: HPBarProps) {
  const percent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const isLowHP = percent <= 25;
  const isCriticalHP = percent <= 10;

  // Tailwind classes cho size
  const sizeClasses = {
    sm: "h-2 text-xs",
    md: "h-3 text-sm",
    lg: "h-4 text-base",
  };

  // Tailwind classes cho layout variants
  const variantClasses = {
    default: "flex items-center gap-2",
    compact: "flex items-center gap-1",
    detailed: "space-y-1",
  };

  // CSS Module classes cho effects
  const effectClasses = [
    animated && styles.animatedBar,
    isLowHP && styles.lowHP,
    isCriticalHP && styles.criticalHP,
    critical && styles.forceCritical,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`w-full ${variantClasses[variant]} ${effectClasses} ${
        className || ""
      }`}
    >
      {/* HP Numbers - Left side */}
      {showNumbers && variant !== "compact" && (
        <div
          className={`
          ${sizeClasses[size].split(" ")[1]} font-bold w-8 text-right
          ${isLowHP ? "text-red-600" : "text-gray-700"}
          ${animated ? styles.animatedNumber : ""}
        `}
        >
          {hp}
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        className={`
        relative flex-1 
        ${variant === "detailed" ? "space-y-1" : ""}
      `}
      >
        {/* Label for detailed variant */}
        {variant === "detailed" && (
          <div className="flex justify-between items-center">
            <span
              className={`${
                sizeClasses[size].split(" ")[1]
              } font-medium text-gray-600`}
            >
              Health
            </span>
            {showNumbers && (
              <span
                className={`${sizeClasses[size].split(" ")[1]} text-gray-500`}
              >
                {hp} / {maxHp}
              </span>
            )}
          </div>
        )}

        {/* Main Progress Bar */}
        <Progress
          value={percent}
          className={`
            ${sizeClasses[size].split(" ")[0]} rounded-full
            bg-gray-200 dark:bg-gray-700 overflow-hidden
            ${styles.hpProgress}
          `}
        />

        {/* HP Bar Fill Overlay - CSS Module */}
        <div
          className={`
            absolute top-0 left-0 ${
              sizeClasses[size].split(" ")[0]
            } rounded-full
            transition-all duration-500 ease-out
            ${
              isLowHP
                ? "bg-red-500"
                : isCriticalHP
                ? "bg-red-600"
                : "bg-green-500"
            }
            ${animated ? styles.hpFill : ""}
          `}
          style={{ width: `${percent}%` }}
        />

        {/* Critical warning overlay - CSS Module */}
        {(isCriticalHP || critical) && animated && (
          <div className={`absolute inset-0 ${styles.criticalOverlay}`} />
        )}

        {/* Damage/Heal animation overlay - CSS Module */}
        {animated && <div className={styles.changeIndicator} />}
      </div>

      {/* HP Numbers - Right side */}
      {showNumbers && variant === "default" && (
        <div
          className={`${
            sizeClasses[size].split(" ")[1]
          } text-gray-500 w-12 text-left`}
        >
          / {maxHp}
        </div>
      )}

      {/* Compact numbers */}
      {showNumbers && variant === "compact" && (
        <div
          className={`${
            sizeClasses[size].split(" ")[1]
          } text-gray-600 font-medium`}
        >
          {hp}/{maxHp}
        </div>
      )}

      {/* HP percentage for detailed variant */}
      {variant === "detailed" && (
        <div className="text-center">
          <span
            className={`
            ${sizeClasses[size].split(" ")[1]} font-bold
            ${isLowHP ? "text-red-600" : "text-gray-700"}
          `}
          >
            {Math.round(percent)}%
          </span>
        </div>
      )}
    </div>
  );
}
