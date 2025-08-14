
'use client';

import { useState } from 'react';
import { spanishContent } from '@/lib/data';
import type { ArticleLesson } from '@/lib/types';
import ArticleModule from '@/components/modules/ArticleModule';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, ArrowLeft } from 'lucide-react';

export default function ReadingListPage() {
    const [selectedLesson, setSelectedLesson] = useState<ArticleLesson | null>(null);

    const articleLessons = Object.values(spanishContent.levels).flatMap(level => 
        level.lessons.filter(lesson => lesson.type === 'article')
    ) as ArticleLesson[];
    
    const handleLessonClick = (lesson: ArticleLesson) => {
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
                    Back to Articles
                </Button>
                <ArticleModule lesson={selectedLesson} onComplete={handleBackToList} />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline">
                    <Newspaper className="h-7 w-7 text-green-600" />
                    Reading Articles
                </CardTitle>
                <CardDescription>Choose an article to read and test your comprehension.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articleLessons.map(lesson => (
                        <Button
                            key={lesson.id}
                            variant="outline"
                            className="h-auto justify-start p-4 text-left"
                            onClick={() => handleLessonClick(lesson)}
                        >
                           <div>
                                <p className="font-semibold">{lesson.title}</p>
                                <p className="text-sm text-muted-foreground font-normal">{lesson.headline}</p>
                            </div>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
