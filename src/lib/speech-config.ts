/**
 * Speech Recognition Configuration for Spanish Learning
 * 
 * This module provides enhanced speech recognition configuration
 * specifically optimized for Spanish language learning.
 */

export interface SpeechConfig {
  primaryLanguage: string;
  fallbackLanguages: string[];
  maxAlternatives: number;
  continuous: boolean;
  interimResults: boolean;
}

export const SPANISH_SPEECH_CONFIG: SpeechConfig = {
  primaryLanguage: 'es-ES', // Spain Spanish
  fallbackLanguages: [
    'es-MX', // Mexican Spanish
    'es-AR', // Argentinian Spanish  
    'es-CO', // Colombian Spanish
    'es-US', // US Spanish
  ],
  maxAlternatives: 3,
  continuous: false,
  interimResults: false,
};

/**
 * Creates an optimized SpeechRecognition instance for Spanish learning
 * @param config Optional custom speech configuration
 * @returns Configured SpeechRecognition instance or null if not supported
 */
export function createSpanishSpeechRecognition(config: Partial<SpeechConfig> = {}): SpeechRecognition | null {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('Speech Recognition not supported in this browser');
    return null;
  }

  const finalConfig = { ...SPANISH_SPEECH_CONFIG, ...config };
  const recognition = new SpeechRecognition();
  
  // Basic configuration
  recognition.continuous = finalConfig.continuous;
  recognition.lang = finalConfig.primaryLanguage;
  recognition.interimResults = finalConfig.interimResults;
  recognition.maxAlternatives = finalConfig.maxAlternatives;
  recognition.grammars = undefined; // Use default Spanish grammar

  // Chrome-specific optimizations
  if ('webkitSpeechRecognition' in window) {
    (recognition as any).continuous = finalConfig.continuous;
    (recognition as any).interim_results = finalConfig.interimResults;
    (recognition as any).max_alternatives = finalConfig.maxAlternatives;
  }

  return recognition;
}

/**
 * Processes speech recognition results to get the best transcript
 * @param event SpeechRecognitionEvent
 * @returns Object with best transcript and confidence score
 */
export function processSpeechResult(event: SpeechRecognitionEvent): {
  transcript: string;
  confidence: number;
  alternatives: Array<{ transcript: string; confidence: number }>;
} {
  const result = event.results[0];
  let bestTranscript = result[0].transcript;
  let bestConfidence = result[0].confidence || 0.5;
  
  const alternatives: Array<{ transcript: string; confidence: number }> = [];
  
  // Collect all alternatives and find the best one
  for (let i = 0; i < result.length; i++) {
    const alternative = {
      transcript: result[i].transcript,
      confidence: result[i].confidence || 0.5
    };
    alternatives.push(alternative);
    
    if (alternative.confidence > bestConfidence) {
      bestTranscript = alternative.transcript;
      bestConfidence = alternative.confidence;
    }
  }
  
  return {
    transcript: bestTranscript,
    confidence: bestConfidence,
    alternatives
  };
}

/**
 * Enhanced error handling for Spanish speech recognition
 * @param error SpeechRecognitionError
 * @returns User-friendly error message in Spanish
 */
export function handleSpeechError(error: SpeechRecognitionError): string {
  switch (error.error) {
    case 'no-speech':
      return 'No se detectó ningún sonido. Por favor, intenta hablar más fuerte.';
    case 'audio-capture':
      return 'No se pudo acceder al micrófono. Verifica los permisos.';
    case 'not-allowed':
      return 'Permiso de micrófono denegado. Habilita el micrófono para continuar.';
    case 'network':
      return 'Error de conexión. Verifica tu conexión a internet.';
    case 'language-not-supported':
      return 'El idioma español no está soportado en este navegador.';
    case 'service-not-allowed':
      return 'El servicio de reconocimiento de voz no está disponible.';
    default:
      return `Error de reconocimiento de voz: ${error.error}. Por favor, intenta de nuevo.`;
  }
}
