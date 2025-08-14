'use server';

/**
 * @fileOverview Provides enhanced pronunciation feedback using AI with numerical scoring.
 *
 * - getPronunciationFeedback - A function that enhances the pronunciation feedback process.
 * - PronunciationFeedbackInput - The input type for the getPronunciationFeedback function.
 * - PronunciationFeedbackOutput - The return type for the getPronunciationFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PronunciationFeedbackInputSchema = z.object({spokenText: z.string().describe('The text spoken by the user.'), targetPhrase: z.string().describe('The target phrase for pronunciation.'),});

export type PronunciationFeedbackInput = z.infer<typeof PronunciationFeedbackInputSchema>;

const PronunciationFeedbackOutputSchema = z.object({
  isCorrect: z.boolean().describe('A simple boolean indicating if the pronunciation was correct enough to proceed.'),
  accuracyScore: z.number().min(0).max(100).describe('Numerical score (0-100) for pronunciation accuracy of individual sounds and words.'),
  fluencyScore: z.number().min(0).max(100).describe('Numerical score (0-100) for speech rhythm, speed, and natural flow.'),
  intonationScore: z.number().min(0).max(100).describe('Numerical score (0-100) for pitch, tone, and stress patterns.'),
  overallScore: z.number().min(0).max(100).describe('Combined numerical score (0-100) representing overall pronunciation quality.'),
  confidence: z.number().min(0).max(1).describe('AI confidence level (0-1) in the assessment.'),
  accuracy: z.string().describe("Detailed text feedback on how accurately the user pronounced the individual words and sounds."),
  fluency: z.string().describe("Detailed text feedback on the rhythm, speed, and flow of the user's speech."),
  intonation: z.string().describe("Detailed text feedback on the user's use of pitch and tone. For example, if it should sound like a question."),
  overall: z.string().describe("A summary of the feedback and an encouraging closing statement."),
});

export type PronunciationFeedbackOutput = z.infer<typeof PronunciationFeedbackOutputSchema>;

export async function getPronunciationFeedback(input: PronunciationFeedbackInput): Promise<PronunciationFeedbackOutput> {
  return pronunciationFeedbackFlow(input);
}

const pronunciationFeedbackPrompt = ai.definePrompt({
  name: 'pronunciationFeedbackPrompt',
  input: {schema: PronunciationFeedbackInputSchema},
  output: {schema: PronunciationFeedbackOutputSchema},
  prompt: `You are an expert Spanish pronunciation coach. A user is trying to pronounce the phrase "{{targetPhrase}}" and they said "{{spokenText}}".

Provide comprehensive feedback including numerical scores (0-100) and detailed text analysis. Be encouraging and constructive.

SCORING GUIDELINES:
- 90-100: Excellent/Perfect pronunciation
- 80-89: Very good with minor issues
- 70-79: Good with some noticeable issues
- 60-69: Fair with several issues
- 50-59: Poor but understandable
- 0-49: Very poor or unintelligible

ASSESSMENT STEPS:
1. First, decide if the pronunciation was good enough to be considered 'correct' (set isCorrect boolean). A perfect match isn't necessary, but it should be clearly understandable.

2. Rate each category on a 0-100 scale:
   - accuracyScore: How well individual sounds and words were pronounced
   - fluencyScore: How natural the rhythm and flow was
   - intonationScore: How appropriate the pitch and tone were
   - overallScore: Combined assessment of all factors

3. Set confidence level (0-1) based on how certain you are of the assessment.

4. Provide detailed text feedback for each category (accuracy, fluency, intonation, overall).

5. For the overall summary, start with "¡Perfecto!" (90+), "¡Muy bien!" (80-89), "¡Buen trabajo!" (70-79), or "¡Sigue practicando!" (below 70).

Be encouraging and provide specific, actionable feedback for improvement.`,
});

const pronunciationFeedbackFlow = ai.defineFlow(
  {
    name: 'pronunciationFeedbackFlow',
    inputSchema: PronunciationFeedbackInputSchema,
    outputSchema: PronunciationFeedbackOutputSchema,
  },
  async input => {
    const {output} = await pronunciationFeedbackPrompt(input);
    return output!;
  }
);
