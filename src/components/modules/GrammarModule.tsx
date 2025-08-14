
"use client";

import { useState, useEffect, useCallback } from "react";
import type { GrammarLesson, QuestionFeedback } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateGrammarExercises } from "@/ai/flows/generate-grammar-exercises";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { Loader2, RefreshCw, Volume2, PlayCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface GrammarModuleProps {
  lesson: GrammarLesson;
  onComplete: () => void;
}

type Question = GrammarLesson['exercise']['questions'][0];

// A client-side markdown to HTML renderer
const MarkdownRenderer = ({ content }: { content: string }) => {
    const htmlContent = content
      // Handle images: ![alt](src)
      .replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
        let hint = '';
        const hintMatch = alt.match(/\{data-ai-hint="([^"]+)"\}/);
        if (hintMatch) {
            hint = `data-ai-hint="${hintMatch[1]}"`;
            alt = alt.replace(/\{data-ai-hint="[^"]+"\}/, '').trim();
        }
        return `<img src="${src}" alt="${alt}" ${hint} class="rounded-lg my-4" />`;
      })
      // Handle headings (e.g., #, ##)
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-3 font-headline">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-4 font-headline">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-6 font-headline">$1</h1>')
      // Handle bold text (e.g., **text** or __text__)
      .replace(/\*\*(.*?)\*\*|__(.*?)__/gim, '<strong>$1$2</strong>')
       // Handle italic text (e.g., *text* or _text_)
      .replace(/\*(.*?)\*|_(.*?)_/gim, '<em>$1$2</em>')
       // Handle unordered lists
      .replace(/^\s*[-*+] (.*)/gim, '<ul><li class="list-disc ml-6">$1</li></ul>')
      .replace(/<\/ul>\s*<ul>/gim, '') // Merge consecutive lists
      // Handle paragraphs - this is tricky without a full parser
      .split('\n').filter(p => p.trim()).map(p => p.trim()).filter(line => !line.startsWith('<ul><li>')).join('<br />')
      .replace(/(<br \/>){2,}/g, '<br /><br />')
      .replace(/<br \/>/g, '</p><p>');

    return <div className="prose prose-base dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: `<p>${htmlContent}</p>` }} />;
};


export default function GrammarModule({ lesson, onComplete }: GrammarModuleProps) {
  const [questions, setQuestions] = useState<Question[]>(lesson.exercise.questions);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [incorrectAnswers, setIncorrectAnswers] = useState<Record<number, boolean>>({});
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [playingSentence, setPlayingSentence] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [advancedMarkdownContent, setAdvancedMarkdownContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingContent(true);
    // In a real app, you would fetch the content of the markdown file.
    // For this example, we'll simulate a fetch for the specific file.
    if (lesson.content === 'ser-vs-estar.md') {
       const content = `# Ser vs. Estar: The Two "To Be"s
A common point of confusion for Spanish learners is when to use 'ser' and when to use 'estar'. Both mean 'to be', but they are not interchangeable. Mastering this distinction is critical because using the wrong verb can completely change the meaning of a sentence. For example, "La manzana **es** verde" (The apple **is** green) implies its permanent color, while "La manzana **está** verde" (The apple **is** green/unripe) implies a temporary state.

The key difference lies in **permanence vs. state**. 'Ser' describes inherent, permanent qualities, while 'Estar' describes temporary conditions, locations, and ongoing actions.

![A split brain representing the different uses of Ser and Estar {data-ai-hint="brain logic"}](https://placehold.co/600x300.png)

## When to use 'Ser'
Use 'Ser' for things that are part of a thing's identity or nature. Think of the acronym **D.O.C.T.O.R.**:
*   **D**escription: *Yo **soy** alto.* (I **am** tall.)
*   **O**ccupation: *Ella **es** profesora.* (She **is** a teacher.)
*   **C**haracteristic: *Ellos **son** amables.* (They **are** kind.)
*   **T**ime & Date: *Hoy **es** martes.* (Today **is** Tuesday.)
*   **O**rigin: *Tú **eres** de España.* (You **are** from Spain.)
*   **R**elationship: *Él **es** mi hermano.* (He **is** my brother.)

## When to use 'Estar'
Use 'Estar' for things that are not permanent. Think of the acronym **P.L.A.C.E.**:
*   **P**osition: *El gato **está** debajo de la mesa.* (The cat **is** under the table.)
*   **L**ocation: *Yo **estoy** en el mercado.* (I **am** at the market.)
*   **A**ction (Progressive Tenses): *Él **está** comiendo.* (He **is** eating.)
*   **C**ondition: *Nosotros **estamos** cansados.* (We **are** tired.)
*   **E**motion: *Tú **estás** feliz.* (You **are** happy.)`;
      setMarkdownContent(content);
      // For this example, if the lesson is ser-vs-estar, we load advanced content.
      const advancedContent = `### Common Mistakes & Tips
*   **"Boring" vs. "Bored"**: This is a classic example. *Juan **es** aburrido* means "Juan **is** a boring person" (a characteristic). *Juan **está** aburrido* means "Juan **is** bored right now" (a condition/emotion).
*   **Events**: Use **ser** for the location of an *event*. *La fiesta **es** en mi casa.* (The party **is** at my house). This can feel tricky because 'location' usually uses 'estar'. Think of it like this: the event *is taking place* at my house.
*   **Death**: Use **estar** for death. Although it feels permanent, it's considered a state. *El autor **está** muerto.* (The author **is** dead).
*   **Best way to avoid mistakes**: When you're unsure, ask yourself: "Am I describing a fundamental quality of this person/thing, or am I describing its current state or location?" If it's a quality, use **ser**. If it's a state or location, use **estar**. Practice makes perfect!`;
      setAdvancedMarkdownContent(advancedContent);
    } else if (lesson.content === 'gender-and-articles.md') {
        const content = `# Gender and Articles: The Building Blocks
In Spanish, every noun has a gender (masculine or feminine), and the articles (the words for 'the' and 'a'/'an') must match that gender. This is fundamental because it affects not just the article, but also adjectives, pronouns, and sentence structure. Getting it right is essential for sounding natural.
## Masculine Nouns & Articles
*   **Generally end in -o**: el libr**o** (the book), el chic**o** (the boy).
*   **Definite Article ('the')**: **el**. Use it for specific, known nouns. *¿Dónde está **el** coche?* (Where is **the** car?)
*   **Indefinite Article ('a'/'an')**: **un**. Use it for non-specific nouns. *Quiero **un** café.* (I want **a** coffee.)
## Feminine Nouns & Articles
*   **Generally end in -a**: la mes**a** (the table), la chic**a** (the girl).
*   **Definite Article ('the')**: **la**. *Me gusta **la** casa.* (I like **the** house.)
*   **Indefinite Article ('a'/'an')**: **una**. *Tengo **una** pregunta.* (I have **a** question.)
### Important Exceptions
Not all nouns follow the -o/-a rule. For example, *el día* (the day) is masculine, and *la mano* (the hand) is feminine. You will learn these with practice!`;
        setMarkdownContent(content);
        setAdvancedMarkdownContent('');
    } else if (lesson.content === 'present-tense-ar.md') {
        const content = `# Present Tense: -ar Verbs
The present tense is used to talk about habits, routines, and things happening now. Verbs ending in -ar are the most common verb group in Spanish, so mastering their conjugation is a huge step forward.
## Conjugation Pattern
To conjugate an -ar verb, remove the -ar ending and add one of the following endings based on the subject.
### Subject Pronouns & Endings
*   **Yo (I)**: + **o** -> *habl**o*** (I speak)
*   **Tú (You, informal)**: + **as** -> *habl**as*** (You speak)
*   **Él/Ella/Usted (He/She/You, formal)**: + **a** -> *habl**a*** (He/She/You speak)
*   **Nosotros/as (We)**: + **amos** -> *habl**amos*** (We speak)
*   **Vosotros/as (You all, informal - Spain)**: + **áis** -> *habl**áis*** (You all speak)
*   **Ellos/Ellas/Ustedes (They/You all)**: + **an** -> *habl**an*** (They/You all speak)
## Examples in Action
*   *Yo **canto** en la ducha.* (I sing in the shower.)
*   *Ellos **trabajan** en la misma oficina.* (They work in the same office.)
*   *¿Tú **estudias** español todos los días?* (Do you study Spanish every day?)`;
        setMarkdownContent(content);
        setAdvancedMarkdownContent('');
    } else {
        setMarkdownContent("## Content not found for this lesson.");
        setAdvancedMarkdownContent('');
    }

    setTimeout(() => setIsLoadingContent(false), 300);
  }, [lesson.content]);

  useEffect(() => {
    setQuestions(lesson.exercise.questions);
    setAnswers({});
    setIncorrectAnswers({});
  }, [lesson]);
  
  useEffect(() => {
    const player = new Audio();
    player.onended = () => setPlayingSentence(null);
    setAudioPlayer(player);

    return () => {
      player.pause();
      player.src = '';
    }
  }, []);

  const handleSelect = (questionIndex: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }));
    const isCorrect = questions[questionIndex].answer === option;
    if (!isCorrect) {
        setIncorrectAnswers((prev) => ({ ...prev, [questionIndex]: true }));
    } else {
        setIncorrectAnswers((prev) => ({ ...prev, [questionIndex]: false }));
    }
  };
  
  const handleGenerateNew = useCallback(async () => {
    setIsGenerating(true);
    try {
      const result = await generateGrammarExercises({
        topic: lesson.title,
        count: questions.length,
      });
      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions as Question[]);
        setAnswers({});
        setIncorrectAnswers({});
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not generate new questions. Please try again.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while generating new questions.",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [lesson.title, questions.length, toast]);

  const handlePlayAudio = async (sentence: string, answer: string) => {
    if (playingSentence === sentence) {
      audioPlayer?.pause();
      setPlayingSentence(null);
      return;
    }

    setPlayingSentence(sentence);
    try {
      const { audioDataUri } = await textToSpeech({ text: sentence.replace('___', answer) });
      if (audioPlayer) {
        audioPlayer.src = audioDataUri;
        audioPlayer.play();
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        variant: "destructive",
        title: "Audio Error",
        description: "Could not play the audio.",
      });
      setPlayingSentence(null);
    }
  };

  const isComplete = questions.every(
    (q, i) => answers[i] === q.answer
  );

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="font-headline">{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Explanation Section */}
           {isLoadingContent ? (
             <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-48 w-full" />
             </div>
           ) : (
             <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold font-headline hover:no-underline">Lesson Explanation</AccordionTrigger>
                    <AccordionContent>
                        <MarkdownRenderer content={markdownContent} />
                    </AccordionContent>
                </AccordionItem>
                {advancedMarkdownContent && (
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-semibold font-headline hover:no-underline">Advanced Learning</AccordionTrigger>
                    <AccordionContent>
                        <MarkdownRenderer content={advancedMarkdownContent} />
                    </AccordionContent>
                  </AccordionItem>
                )}
             </Accordion>
           )}

          {/* Exercise Section */}
          <div className="border-t pt-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold font-headline">Practice Time!</h3>
                <Button variant="outline" size="sm" onClick={handleGenerateNew} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                  <span className="ml-2 hidden sm:inline">New Exercises</span>
                </Button>
            </div>
            <div className="space-y-6">
              {questions.map((q, index) => {
                const answerForThisQuestion = answers[index];
                const isAnswered = answerForThisQuestion !== undefined;
                const isCorrect = isAnswered && answerForThisQuestion === q.answer;
                
                return(
                <div key={index} className="bg-secondary/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-semibold">{index + 1}. {q.sentence.replace('___', '______')}</p>
                     {isCorrect && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-primary"
                            onClick={() => handlePlayAudio(q.sentence, q.answer)}
                            disabled={playingSentence !== null && playingSentence !== q.sentence}
                        >
                            {playingSentence === q.sentence ? <Loader2 className="animate-spin" /> : <PlayCircle />}
                        </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {q.options.map(option => {
                      const isSelected = answerForThisQuestion === option;
                      const isLocked = answers[index] === q.answer;
                      
                      return (
                        <Button
                          key={option}
                          onClick={() => handleSelect(index, option)}
                          variant={isSelected ? (isCorrect ? "default" : "destructive") : "outline"}
                          className={`font-semibold transition-all ${isSelected ? '' : 'bg-card hover:bg-secondary'}`}
                          style={isSelected && isCorrect ? {backgroundColor: '#22c55e'} : {}}
                          disabled={isLocked}
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                  {incorrectAnswers[index] && !isCorrect && isAnswered && (
                     <div className="mt-3 p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5"/>
                        <div>
                             <p className="font-bold">Let's take a closer look!</p>
                             <p>{q.explanation}</p>
                             <p className="mt-2">The correct answer is: <strong className="font-semibold">{q.sentence.replace('___', ` ${q.answer} `)}</strong></p>
                        </div>
                     </div>
                  )}
                </div>
              )})}
            </div>
          </div>
        </CardContent>

        {isComplete && (
          <CardFooter className="flex-col gap-4 text-center py-6 bg-secondary/30">
            <p className="text-green-600 dark:text-green-400 font-bold text-xl">¡Excelente! Lesson complete.</p>
            <Button onClick={onComplete}>
              Next Lesson
            </Button>
          </CardFooter>
        )}
      </Card>
    </>
  );
}

    

    
