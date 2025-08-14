"use client";

import React from "react";
import { Flag } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useAppContext } from "@/context/app-context";
import { Lesson } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LessonWrapperProps {
  children: React.ReactNode;
  lesson: Lesson;
}

export default function LessonWrapper({ children, lesson }: LessonWrapperProps) {
  const { flaggedLessons, toggleFlagged } = useAppContext();
  const isFlagged = flaggedLessons.includes(lesson.id);

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 h-8 w-8"
              onClick={() => toggleFlagged(lesson.id)}
            >
              <Flag className={cn("h-5 w-5 text-muted-foreground", isFlagged && "fill-accent text-accent")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFlagged ? "Unflag for review" : "Flag for review"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {children}
    </div>
  );
}
