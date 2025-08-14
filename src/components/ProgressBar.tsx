"use client";

import { useAppContext } from "@/context/app-context";
import { Progress } from "@/components/ui/progress";

export default function ProgressBar() {
  const { currentLevel, totalLevels } = useAppContext();

  const levelKeys = Object.keys(totalLevels);
  const levelIndex = levelKeys.indexOf(currentLevel);
  const progressPercentage =
    levelIndex >= 0
      ? ((levelIndex + 1) / levelKeys.length) * 100
      : 0;
  
  const currentLevelName = totalLevels[currentLevel]?.name || 'Select a Level';

  return (
    <div className="w-full">
      <div className="text-center text-sm font-medium text-muted-foreground mb-2">
        {currentLevelName}
      </div>
      <Progress value={progressPercentage} aria-label={`Progress: ${currentLevelName}`} />
    </div>
  );
};
