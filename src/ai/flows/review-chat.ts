
'use server';

/**
 * @fileOverview A review chatbot to help users practice.
 *
 * - reviewChat - A function that handles the chatbot interaction.
 * - ReviewChatInput - The input type for the reviewChat function.
 * - ReviewChatOutput - The return type for the reviewChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { spanishContent } from '@/lib/data';
import type { Lesson } from '@/lib/types';


// Define a tool to get lesson details
const getLessonDetailsTool = ai.defineTool(
    {
        name: 'getLessonDetails',
        description: 'Retrieves the content of a specific lesson based on its ID.',
        inputSchema: z.object({ id: z.string() }),
        outputSchema: z.custom<Lesson>((val) => (val as Lesson)?.id !== undefined)
    },
    async ({ id }) => {
        for (const levelKey in spanishContent.levels) {
            const lesson = spanishContent.levels[levelKey].lessons.find(l => l.id === id);
            if (lesson) return lesson;
        }
        throw new Error('Lesson not found');
    }
);


const ReviewChatInputSchema = z.object({
  question: z.string().describe('The user\'s message to the chatbot.'),
  flaggedLessonIds: z.array(z.string()).describe('A list of IDs for lessons the user has flagged for review.'),
});
export type ReviewChatInput = z.infer<typeof ReviewChatInputSchema>;

const ReviewChatOutputSchema = z.object({
  answer: z.string().describe('The chatbot\'s response.'),
});
export type ReviewChatOutput = z.infer<typeof ReviewChatOutputSchema>;


export async function reviewChat(input: ReviewChatInput): Promise<ReviewChatOutput> {
  return reviewChatFlow(input);
}


const reviewChatPrompt = ai.definePrompt({
    name: 'reviewChatPrompt',
    input: { schema: ReviewChatInputSchema },
    output: { schema: ReviewChatOutputSchema },
    tools: [getLessonDetailsTool],
    prompt: `You are YAP, an AI Spanish language tutor. Your goal is to help users review concepts they have struggled with.

    The user has flagged the following lesson IDs for review: {{#each flaggedLessonIds}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}.
    You can use the 'getLessonDetails' tool to fetch the content of these lessons if the user asks about them specifically.
    
    Keep your responses concise, friendly, and encouraging. You can engage in conversation, answer questions about Spanish grammar or culture, or create mini-exercises based on the flagged lessons.
    
    User's message: "{{question}}"
    `,
});


const reviewChatFlow = ai.defineFlow(
  {
    name: 'reviewChatFlow',
    inputSchema: ReviewChatInputSchema,
    outputSchema: ReviewChatOutputSchema,
  },
  async (input) => {
    const { output } = await reviewChatPrompt(input);
    return output!;
  }
);
