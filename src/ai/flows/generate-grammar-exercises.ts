'use server';

/**
 * @fileOverview Generates new grammar exercises using AI.
 *
 * - generateGrammarExercises - A function that creates new fill-in-the-blank questions.
 * - GenerateGrammarExercisesInput - The input type for the generateGrammarExercises function.
 * - GenerateGrammarExercisesOutput - The return type for the generateGrammarExercises function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
  sentence: z.string().describe("A sentence with a blank '___' for the user to fill in."),
  options: z.array(z.string()).describe("A list of two options for the user to choose from."),
  answer: z.string().describe("The correct option."),
  explanation: z.string().describe("A brief explanation of why the answer is correct."),
});

const GenerateGrammarExercisesInputSchema = z.object({
    topic: z.string().describe('The grammar topic for the exercises, e.g., "Ser vs. Estar".'),
    count: z.number().int().positive().describe('The number of questions to generate.'),
});

export type GenerateGrammarExercisesInput = z.infer<typeof GenerateGrammarExercisesInputSchema>;

const GenerateGrammarExercisesOutputSchema = z.object({
  questions: z.array(QuestionSchema),
});

export type GenerateGrammarExercisesOutput = z.infer<typeof GenerateGrammarExercisesOutputSchema>;

export async function generateGrammarExercises(input: GenerateGrammarExercisesInput): Promise<GenerateGrammarExercisesOutput> {
  return generateGrammarExercisesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGrammarExercisesPrompt',
  input: {schema: GenerateGrammarExercisesInputSchema},
  output: {schema: GenerateGrammarExercisesOutputSchema},
  prompt: `You are a Spanish language teacher. Generate {{count}} new fill-in-the-blank questions for a grammar exercise on the topic of "{{topic}}".

For each question, provide:
1.  A 'sentence' with a blank '___' where the word should go.
2.  An array of two 'options' for the user to choose from.
3.  The correct 'answer'.
4.  A short 'explanation' for why the answer is correct.

Return the result in the 'questions' field.`,
});

const generateGrammarExercisesFlow = ai.defineFlow(
  {
    name: 'generateGrammarExercisesFlow',
    inputSchema: GenerateGrammarExercisesInputSchema,
    outputSchema: GenerateGrammarExercisesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
