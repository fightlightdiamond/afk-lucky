"use client";

import { useTTSHybridMode } from "@/hooks/useTTS";
import { Info } from "lucide-react";

export function HybridTTSToggle() {
  const { hybridMode, enModelLoaded, toggleHybridMode, isToggling } =
    useTTSHybridMode();

  return (
    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={hybridMode}
          onChange={(e) => toggleHybridMode(e.target.checked)}
          disabled={!enModelLoaded || isToggling}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
        />
        <span className="text-sm font-medium">
          Hybrid TTS Mode
          {isToggling && " (updating...)"}
        </span>
      </label>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Info className="w-3 h-3" />
        <span>
          {enModelLoaded
            ? hybridMode
              ? "English words will be pronounced correctly"
              : "Vietnamese-only mode (faster)"
            : "English model not loaded"}
        </span>
      </div>

      {!enModelLoaded && (
        <span className="text-xs text-amber-600 dark:text-amber-400">
          ⚠️ English model unavailable
        </span>
      )}
    </div>
  );
}
