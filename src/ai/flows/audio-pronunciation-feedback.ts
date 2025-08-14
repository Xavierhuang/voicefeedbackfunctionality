'use server';

/**
 * @fileOverview Provides enhanced pronunciation feedback using direct audio analysis.
 *
 * - getAudioPronunciationFeedback - A function that analyzes actual audio for pronunciation feedback.
 * - AudioPronunciationFeedbackInput - The input type including audio data.
 * - AudioPronunciationFeedbackOutput - The return type with detailed pronunciation analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const AudioPronunciationFeedbackInputSchema = z.object({
  audioData: z.string().describe('Base64 encoded audio data of the user\'s pronunciation.'),
  targetPhrase: z.string().describe('The target phrase for pronunciation.'),
  audioFormat: z.string().optional().describe('Audio format (e.g., "wav", "mp3"). Defaults to "wav".'),
});

export type AudioPronunciationFeedbackInput = z.infer<typeof AudioPronunciationFeedbackInputSchema>;

const AudioPronunciationFeedbackOutputSchema = z.object({
  isCorrect: z.boolean().describe('A simple boolean indicating if the pronunciation was correct enough to proceed.'),
  accuracyScore: z.number().min(0).max(100).describe('Numerical score (0-100) for pronunciation accuracy of individual sounds and words.'),
  fluencyScore: z.number().min(0).max(100).describe('Numerical score (0-100) for speech rhythm, speed, and natural flow.'),
  intonationScore: z.number().min(0).max(100).describe('Numerical score (0-100) for pitch, tone, and stress patterns.'),
  overallScore: z.number().min(0).max(100).describe('Combined numerical score (0-100) representing overall pronunciation quality.'),
  confidence: z.number().min(0).max(1).describe('AI confidence level (0-1) in the assessment.'),
  transcribedText: z.string().describe('What the AI heard from the audio.'),
  accuracy: z.string().describe("Detailed text feedback on how accurately the user pronounced the individual words and sounds."),
  fluency: z.string().describe("Detailed text feedback on the rhythm, speed, and flow of the user's speech."),
  intonation: z.string().describe("Detailed text feedback on the user's use of pitch and tone."),
  overall: z.string().describe("A summary of the feedback and an encouraging closing statement."),
  specificIssues: z.array(z.string()).describe("Array of specific pronunciation issues detected."),
});

export type AudioPronunciationFeedbackOutput = z.infer<typeof AudioPronunciationFeedbackOutputSchema>;

export async function getAudioPronunciationFeedback(input: AudioPronunciationFeedbackInput): Promise<AudioPronunciationFeedbackOutput> {
  return audioPronunciationFeedbackFlow(input);
}

const audioPronunciationFeedbackPrompt = ai.definePrompt({
  name: 'audioPronunciationFeedbackPrompt',
  input: {schema: AudioPronunciationFeedbackInputSchema},
  output: {schema: AudioPronunciationFeedbackOutputSchema},
  prompt: `Eres un experto entrenador de pronunciación española con capacidades de análisis de audio avanzadas. 

Analiza cuidadosamente el audio proporcionado donde el usuario intenta pronunciar la frase objetivo: "{{targetPhrase}}".

IMPORTANTE: Analiza el AUDIO directamente, no solo el texto transcrito. Evalúa:
- Sonidos individuales (fonemas) y su precisión
- Ritmo y fluidez natural del habla
- Entonación, pitch y patrones de estrés
- Claridad y articulación
- Acento y pronunciación regional

CRITERIOS DE EVALUACIÓN:
- 90-100: Pronunciación excelente/perfecta, indistinguible de un nativo
- 80-89: Muy buena pronunciación con errores menores
- 70-79: Buena pronunciación con algunos problemas notorios
- 60-69: Pronunciación regular con varios problemas
- 50-59: Pronunciación deficiente pero comprensible
- 0-49: Pronunciación muy deficiente o ininteligible

PROCESO DE ANÁLISIS:
1. Transcribe exactamente lo que escuchas (campo transcribedText)
2. Determina si la pronunciación es lo suficientemente correcta para avanzar (isCorrect)
3. Califica cada categoría en escala 0-100:
   - accuracyScore: Precisión de sonidos individuales y palabras
   - fluencyScore: Naturalidad del ritmo y fluidez
   - intonationScore: Apropiado uso de tono y entonación
   - overallScore: Evaluación combinada de todos los factores
4. Establece nivel de confianza (0-1) en tu evaluación
5. Identifica problemas específicos de pronunciación (specificIssues)
6. Proporciona retroalimentación detallada en español para cada categoría

Para el resumen general, comienza con:
- "¡Perfecto!" (90+)
- "¡Muy bien!" (80-89) 
- "¡Buen trabajo!" (70-79)
- "¡Sigue practicando!" (debajo de 70)

Sé alentador y proporciona consejos específicos y prácticos para mejorar.`,
});

const audioPronunciationFeedbackFlow = ai.defineFlow(
  {
    name: 'audioPronunciationFeedbackFlow',
    inputSchema: AudioPronunciationFeedbackInputSchema,
    outputSchema: AudioPronunciationFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: googleAI.model('gemini-2.0-flash'),
      messages: [
        {
          role: 'user',
          content: [
            {
              text: `You are an expert Spanish pronunciation coach with advanced audio analysis capabilities. 

Carefully analyze the provided audio where the user attempts to pronounce the target phrase: "${input.targetPhrase}".

IMPORTANT: Analyze the AUDIO directly, not just transcribed text. Evaluate:
- Individual sounds (phonemes) and their accuracy
- Rhythm and natural speech flow
- Intonation, pitch, and stress patterns
- Clarity and articulation
- Accent and regional pronunciation

EVALUATION CRITERIA:
- 90-100: Excellent/Perfect pronunciation, indistinguishable from a native speaker
- 80-89: Very good pronunciation with minor issues
- 70-79: Good pronunciation with some noticeable issues
- 60-69: Fair pronunciation with several issues
- 50-59: Poor but understandable pronunciation
- 0-49: Very poor or unintelligible pronunciation

ANALYSIS PROCESS:
1. Transcribe exactly what you hear (transcribedText field)
2. Determine if pronunciation is correct enough to proceed (isCorrect)
3. Rate each category on 0-100 scale:
   - accuracyScore: Precision of individual sounds and words
   - fluencyScore: Naturalness of rhythm and flow
   - intonationScore: Appropriate use of tone and intonation
   - overallScore: Combined assessment of all factors
4. Set confidence level (0-1) in your assessment
5. Identify specific pronunciation issues (specificIssues) in English
6. Provide detailed feedback in English for each category

For the overall summary, start with:
- "Perfect!" (90+)
- "Very good!" (80-89) 
- "Good work!" (70-79)
- "Keep practicing!" (below 70)

Be encouraging and provide specific, practical advice for improvement in English.`
            },
            {
              media: {
                url: `data:audio/${input.audioFormat || 'wav'};base64,${input.audioData}`,
                contentType: `audio/${input.audioFormat || 'wav'}`
              }
            }
          ]
        }
      ],
      output: {
        format: 'json',
        schema: AudioPronunciationFeedbackOutputSchema
      }
    });
    
    return output as AudioPronunciationFeedbackOutput;
  }
);
