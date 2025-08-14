
'use client';

import { useState } from 'react';
import { spanishContent } from '@/lib/data';
import type { ConversationLesson } from '@/lib/types';
import ConversationModule from '@/components/modules/ConversationModule';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowLeft } from 'lucide-react';

export default function ConversationListPage() {
    const [selectedLesson, setSelectedLesson] = useState<ConversationLesson | null>(null);

    const conversationLessons = Object.values(spanishContent.levels).flatMap(level => 
        level.lessons.filter(lesson => lesson.type === 'conversation')
    ) as ConversationLesson[];

    const handleLessonClick = (lesson: ConversationLesson) => {
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
                    Back to Conversation Lessons
                </Button>
                <ConversationModule lesson={selectedLesson} onComplete={handleBackToList} />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-3 font-headline">
                    <MessageCircle className="h-7 w-7 text-accent" />
                    Conversation Practice
                </CardTitle>
                <CardDescription>Choose a scenario to practice your speaking skills.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conversationLessons.map(lesson => (
                        <Button
                            key={lesson.id}
                            variant="outline"
                            className="h-auto justify-start p-4 text-left"
                            onClick={() => handleLessonClick(lesson)}
                        >
                            <div>
                                <p className="font-semibold">{lesson.title}</p>
                                <p className="text-sm text-muted-foreground font-normal">
                                    Practice a dialogue between {[...new Set(lesson.dialogue.map(d => d.speaker))].join(' and ')}.
                                </p>
                            </div>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
