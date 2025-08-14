"use client";

import { useState } from 'react';
import type { ArticleLesson } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ArticleModuleProps {
  lesson: ArticleLesson;
  onComplete: () => void;
}

export default function ArticleModule({ lesson, onComplete }: ArticleModuleProps) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    const handleSelect = (questionIndex: number, option: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: option }));
    };

    const handleSubmit = () => {
        setShowResults(true);
    };

    const isComplete = lesson.comprehension.every((q, i) => answers[i] === q.answer);
    const allAnswered = Object.keys(answers).length === lesson.comprehension.length;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline">{lesson.title}</CardTitle>
        <p className="text-muted-foreground pt-1">{lesson.headline}</p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Article Content */}
        <article className="prose prose-base dark:prose-invert max-w-none space-y-4">
          {lesson.content.map((item, index) => {
            if (item.type === 'quote') {
              return <blockquote key={index} className="border-l-4 border-primary bg-secondary/30 p-4 rounded-r-lg italic">{item.text}</blockquote>;
            }
            return <p key={index} className="font-body leading-relaxed">{item.text}</p>;
          })}
        </article>

        {/* Comprehension Section */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 font-headline">Comprehension Check</h3>
          <div className="space-y-6">
            {lesson.comprehension.map((q, index) => {
                const isCorrect = answers[index] === q.answer;
                return (
                    <div key={index} className={`bg-secondary/50 p-4 rounded-lg ${showResults ? (isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-destructive') : ''}`}>
                        <p className="text-base mb-3 font-semibold">{index + 1}. {q.question}</p>
                        <RadioGroup onValueChange={(value) => handleSelect(index, value)} value={answers[index]} disabled={showResults}>
                            {q.options.map(option => (
                                <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`${index}-${option}`} />
                                    <Label htmlFor={`${index}-${option}`} className="font-normal">{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {showResults && !isCorrect && (
                            <p className='mt-2 text-sm text-destructive'>Correct answer: {q.answer}</p>
                        )}
                    </div>
                );
            })}
          </div>
        </div>
      </CardContent>

      {!showResults && (
        <CardFooter className="py-6 bg-secondary/30">
            <Button onClick={handleSubmit} disabled={!allAnswered}>Check Answers</Button>
        </CardFooter>
      )}

      {showResults && (
        <CardFooter className="flex-col gap-4 text-center py-6 bg-secondary/30">
            {isComplete ? (
                 <p className="text-green-600 dark:text-green-400 font-bold text-xl">¡Perfecto! All answers are correct.</p>
            ) : (
                <p className="text-yellow-600 dark:text-yellow-400 font-bold text-xl">Good effort! Review the correct answers.</p>
            )}
            <Button onClick={onComplete}>Next Lesson</Button>
        </CardFooter>
      )}
    </Card>
  );
}
