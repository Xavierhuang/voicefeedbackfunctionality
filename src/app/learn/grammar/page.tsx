
'use client';

import { useState } from 'react';
import { spanishContent } from '@/lib/data';
import type { GrammarLesson } from '@/lib/types';
import GrammarModule from '@/components/modules/GrammarModule';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function GrammarListPage() {
    const [selectedLesson, setSelectedLesson] = useState<GrammarLesson | null>(null);

    const grammarLessons = Object.values(spanishContent.levels).flatMap(level => 
        level.lessons.filter(lesson => lesson.type === 'grammar')
    ) as GrammarLesson[];

    const handleLessonClick = (lesson: GrammarLesson) => {
        setSelectedLesson(lesson);
    };

    const handleBackToList = () => {
        setSelectedLesson(null);
    }

    if (selectedLesson) {
        return (
            <div>
                <Button variant="ghost" onClick={handleBackToList} className="mb-4">
                    <ArrowLeft className="mr-2" />
                    Back to Grammar Lessons
                </Button>
                <GrammarModule lesson={selectedLesson} onComplete={handleBackToList} />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline">
                    <BookOpen className="h-7 w-7 text-primary" />
                    Grammar Lessons
                </CardTitle>
                <CardDescription>Choose a grammar topic to practice.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grammarLessons.map(lesson => (
                        <Button
                            key={lesson.id}
                            variant="outline"
                            className="h-auto justify-start p-4 text-left"
                            onClick={() => handleLessonClick(lesson)}
                        >
                            <div>
                                <p className="font-semibold">{lesson.title}</p>
                                <p className="text-sm text-muted-foreground font-normal">Interactive grammar exercises.</p>
                            </div>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
