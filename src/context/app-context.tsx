"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { spanishContent } from '@/lib/data';
import type { Lesson } from '@/lib/types';

interface AppContextType {
  currentLevel: string;
  currentLessonIndex: number;
  streak: number;
  flaggedLessons: string[];
  currentLesson: Lesson | null;
  totalLevels: Record<string, { name: string; lessons: Lesson[] }>;
  handleLessonComplete: () => void;
  toggleFlagged: (lessonId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentLevel, setCurrentLevel] = useState<string>('A0');
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [flaggedLessons, setFlaggedLessons] = useState<string[]>([]);

  const currentLesson = useMemo(() => {
    const levelData = spanishContent.levels[currentLevel];
    if (levelData && levelData.lessons.length > currentLessonIndex) {
      return levelData.lessons[currentLessonIndex];
    }
    return null;
  }, [currentLevel, currentLessonIndex]);

  const handleLessonComplete = () => {
    const nextLessonIndex = currentLessonIndex + 1;
    const currentLevelLessons = spanishContent.levels[currentLevel].lessons;

    setStreak(s => s + 1);

    if (nextLessonIndex < currentLevelLessons.length) {
      setCurrentLessonIndex(nextLessonIndex);
    } else {
      const levelKeys = Object.keys(spanishContent.levels);
      const currentLevelArrayIndex = levelKeys.indexOf(currentLevel);
      if (currentLevelArrayIndex < levelKeys.length - 1) {
        const nextLevelKey = levelKeys[currentLevelArrayIndex + 1];
        if (spanishContent.levels[nextLevelKey].lessons.length > 0) {
            setCurrentLevel(nextLevelKey);
            setCurrentLessonIndex(0);
        } else {
            // Reached end of available content
            setCurrentLessonIndex(nextLessonIndex);
        }
      } else {
        // Completed all levels
        setCurrentLessonIndex(nextLessonIndex);
      }
    }
  };
  
  const toggleFlagged = (lessonId: string) => {
    setFlaggedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const value = {
    currentLevel,
    currentLessonIndex,
    streak,
    flaggedLessons,
    currentLesson,
    totalLevels: spanishContent.levels,
    handleLessonComplete,
    toggleFlagged,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
