"use client";

import Link from "next/link";
import { Flame, Home } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

export default function Header() {
  const { streak, flaggedLessons, totalLevels } = useAppContext();

  const getLessonTitle = (lessonId: string) => {
    for (const levelKey in totalLevels) {
      const lesson = totalLevels[levelKey].lessons.find(l => l.id === lessonId);
      if (lesson) return lesson.title;
    }
    return "Unknown Lesson";
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-headline text-2xl font-bold text-primary">
          YAP Mastery
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-semibold">{streak} Day Streak</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Progress</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                Streak: {streak} days
              </DropdownMenuItem>
              {flaggedLessons.length > 0 && (
                <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Flagged for Review</DropdownMenuLabel>
                {flaggedLessons.map(id => (
                    <DropdownMenuItem key={id}>{getLessonTitle(id)}</DropdownMenuItem>
                ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
