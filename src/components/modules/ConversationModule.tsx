"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { ConversationLesson } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Volume2, Mic, Loader2, StopCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getPronunciationFeedback, PronunciationFeedbackOutput } from '@/ai/flows/enhanced-pronunciation-feedback';
import { getAudioPronunciationFeedback, AudioPronunciationFeedbackOutput } from '@/ai/flows/audio-pronunciation-feedback';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder } from '@/lib/audio-recorder';
import { createSpanishSpeechRecognition, processSpeechResult, handleSpeechError } from '@/lib/speech-config';

interface ConversationModuleProps {
  lesson: ConversationLesson;
  onComplete: () => void;
}

export default function ConversationModule({ lesson, onComplete }: ConversationModuleProps) {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [aiFeedback, setAiFeedback] = useState<AudioPronunciationFeedbackOutput | null>(null);
  const [isCheckingPronunciation, setIsCheckingPronunciation] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isApiSupported, setIsApiSupported] = useState<boolean | undefined>(undefined);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [playingLine, setPlayingLine] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const targetPhrase = lesson.pronunciationCheck[currentPhraseIndex].phrase;
  const isCorrect = aiFeedback?.isCorrect || false;

  // Audio Recording Methods
  const handleAudioRecord = async () => {
    if (!audioRecorderRef.current) {
      try {
        audioRecorderRef.current = new AudioRecorder({ maxDuration: 5 });
        await audioRecorderRef.current.initialize();
        setIsApiSupported(true);
      } catch (error) {
        console.error('Error initializing audio recorder:', error);
        toast({
          variant: 'destructive',
          title: 'Microphone Error',
          description: 'Could not access microphone. Please check permissions.'
        });
        return;
      }
    }

    if (isRecording) {
      // Stop recording
      await stopRecording();
    } else {
      // Start recording
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      setSpokenText('');
      setAiFeedback(null);
      setIsRecording(true);
      setRecordingDuration(0);
      
      await audioRecorderRef.current!.startRecording();
      
      // Clear any existing interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      
      // Update duration display
      durationIntervalRef.current = setInterval(() => {
        if (audioRecorderRef.current?.isRecording()) {
          const duration = audioRecorderRef.current.getCurrentDuration();
          setRecordingDuration(duration);
          
          // Auto-stop at 5 seconds (as a safety measure)
          if (duration >= 5) {
            stopRecording();
          }
        } else {
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: 'destructive',
        title: 'Recording Error',
        description: 'Failed to start audio recording.'
      });
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const stopRecording = async () => {
    try {
      // Clear the duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      if (audioRecorderRef.current?.isRecording()) {
        audioRecorderRef.current.stopRecording();
        const recordedAudio = await audioRecorderRef.current.getRecordedAudio();
        
        setIsRecording(false);
        setRecordingDuration(0);
        
        // Process the audio with AI
        await checkAudioPronunciation(recordedAudio.audioData, recordedAudio.format, targetPhrase);
      } else {
        setIsRecording(false);
        setRecordingDuration(0);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        variant: 'destructive',
        title: 'Recording Error',
        description: 'Failed to process audio recording.'
      });
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const handleListen = () => {
    if (!isApiSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      return;
    }
    setSpokenText('');
    setAiFeedback(null);
    setIsListening(true);
    recognitionRef.current.start();
  };

  const checkAudioPronunciation = async (audioData: string, audioFormat: string, currentTargetPhrase: string) => {
    setIsCheckingPronunciation(true);
    try {
      const result = await getAudioPronunciationFeedback({
        audioData,
        audioFormat,
        targetPhrase: currentTargetPhrase,
      });
      setAiFeedback(result);
      setSpokenText(result.transcribedText); // Show what the AI heard
    } catch (error) {
      console.error("Error getting AI audio feedback:", error);
      toast({
          variant: "destructive",
          title: "AI Feedback Error",
          description: "Sorry, the AI feedback is not available right now.",
      });
    } finally {
      setIsCheckingPronunciation(false);
    }
  };

  const checkPronunciation = async (transcript: string, currentTargetPhrase: string) => {
    setIsCheckingPronunciation(true);
    try {
      const result = await getPronunciationFeedback({
        spokenText: transcript,
        targetPhrase: currentTargetPhrase,
      });
      // Convert to match new interface
      const audioResult: AudioPronunciationFeedbackOutput = {
        ...result,
        transcribedText: transcript,
        specificIssues: [],
      };
      setAiFeedback(audioResult);
    } catch (error) {
      console.error("Error getting AI feedback:", error);
      toast({
          variant: "destructive",
          title: "AI Feedback Error",
          description: "There was an error getting feedback. Please try again.",
      });
    } finally {
      setIsCheckingPronunciation(false);
    }
  };

  useEffect(() => {
    // Initialize audio recording capability
    const initializeAudio = async () => {
      if (AudioRecorder.isSupported()) {
        setIsApiSupported(true);
      } else {
        // Fallback to speech recognition
        const recognition = createSpanishSpeechRecognition();
        if (recognition) {
          setIsApiSupported(true);

          recognition.onresult = (event) => {
            const result = processSpeechResult(event);
            
            console.log('Speech recognition result:', {
              transcript: result.transcript,
              confidence: result.confidence,
              alternatives: result.alternatives
            });
            
            setSpokenText(result.transcript);
            checkPronunciation(result.transcript, lesson.pronunciationCheck[currentPhraseIndex].phrase);
          };

          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            const errorMessage = handleSpeechError(event);
            toast({
              variant: 'destructive',
              title: 'Error de Reconocimiento',
              description: errorMessage
            });
            setIsListening(false);
            setIsCheckingPronunciation(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = recognition;
        } else {
          setIsApiSupported(false);
        }
      }
    };

    initializeAudio();

    // Cleanup function
    return () => {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.cleanup();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- This is the fix. Run only once on mount.

  useEffect(() => {
    const player = new Audio();
    player.onended = () => setPlayingLine(null);
    setAudioPlayer(player);

    return () => {
      player.pause();
      player.src = '';
    }
  }, []);
  
  // This effect ensures the checkPronunciation function has the correct targetPhrase
  // when it's called from the speech recognition callback.
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event) => {
        const result = processSpeechResult(event);
        
        console.log('Speech recognition result (updated):', {
          transcript: result.transcript,
          confidence: result.confidence,
          targetPhrase: targetPhrase,
          alternatives: result.alternatives
        });
        
        setSpokenText(result.transcript);
        // Directly use the targetPhrase from state here.
        checkPronunciation(result.transcript, targetPhrase);
      };
    }
  }, [targetPhrase, checkPronunciation]);


  const speakLine = async (text: string) => {
    if (playingLine === text) {
        audioPlayer?.pause();
        setPlayingLine(null);
        return;
    }

    setPlayingLine(text);
    try {
        const { audioDataUri } = await textToSpeech({ text });
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
        setPlayingLine(null);
    }
  };

  const nextPhrase = () => {
    if (currentPhraseIndex < lesson.pronunciationCheck.length - 1) {
      setCurrentPhraseIndex((prev) => prev + 1);
      setSpokenText('');
      setAiFeedback(null);
    }
  };

  const isComplete = currentPhraseIndex >= lesson.pronunciationCheck.length - 1 && isCorrect;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline">{lesson.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Dialogue Section */}
        <div>
          <h3 className="text-xl font-semibold mb-3 font-headline">Dialogue</h3>
          <div className="space-y-4 bg-secondary/50 p-4 rounded-lg">
            {lesson.dialogue.map((line, index) => (
              <div key={index} className="flex items-start gap-3">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 shrink-0" 
                    onClick={() => speakLine(line.line)}
                    disabled={playingLine !== null && playingLine !== line.line}
                >
                  {playingLine === line.line ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5 text-primary" />}
                </Button>
                <p className="pt-0.5">
                  <span className="font-bold text-primary">{line.speaker}:</span>
                  <span className="ml-2">{line.line}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pronunciation Check Section */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-3 font-headline">Pronunciation Practice</h3>
          {isApiSupported === false ? (
            <Alert variant="destructive">
              <AlertTitle>Unsupported Browser</AlertTitle>
              <AlertDescription>
                The Web Speech API is not supported by your browser. Please try a modern version of Chrome or Edge.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="bg-secondary/50 p-6 rounded-lg text-center">
              <p className="mb-2 text-muted-foreground">Try saying this phrase:</p>
              <p className="text-2xl font-bold font-headline mb-6">"{targetPhrase}"</p>
              <div className="flex flex-col items-center space-y-2">
                <Button
                  onClick={AudioRecorder.isSupported() ? handleAudioRecord : handleListen}
                  disabled={isCheckingPronunciation || isListening || isRecording}
                  className={`rounded-full h-16 w-16 p-4 shadow-lg transition-all ${
                    isRecording 
                      ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                      : 'bg-accent text-accent-foreground hover:bg-accent/90'
                  } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                  aria-label={
                    isRecording ? "Stop recording" : 
                    isListening ? "Stop listening" : 
                    AudioRecorder.isSupported() ? "Start audio recording" : "Start voice recognition"
                  }
                >
                  {isCheckingPronunciation ? (
                    <Loader2 className="h-7 w-7 animate-spin" />
                  ) : (isListening || isRecording) ? (
                    <StopCircle className="h-7 w-7" />
                  ) : (
                    <Mic className="h-7 w-7" />
                  )}
                </Button>
                
                {/* Recording duration display */}
                {isRecording && (
                  <div className="text-sm text-red-600 font-mono">
                    {recordingDuration.toFixed(1)}s
                  </div>
                )}
                
                {/* Audio mode indicator */}
                <div className="text-xs text-muted-foreground text-center">
                  {AudioRecorder.isSupported() ? (
                    <span className="text-green-600">🎤 Audio Analysis</span>
                  ) : (
                    <span className="text-blue-600">🗣️ Speech Recognition</span>
                  )}
                </div>
              </div>
              
              {spokenText && (
                 <p className="mt-4 text-sm text-muted-foreground italic">You said: "{spokenText}"</p>
              )}

              {aiFeedback && (
                <div className={`mt-6 p-4 text-left rounded-lg text-sm ${isCorrect ? 'bg-green-600/10 text-green-800 dark:text-green-300' : 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-300'}`}>
                   <div className="flex items-center font-bold mb-3 text-base">
                     {isCorrect ? <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" /> : <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />}
                     Feedback
                   </div>
                   
                   {/* Numerical Scores */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-background/50 rounded-lg">
                     <div className="text-center">
                       <div className="text-2xl font-bold text-primary">{aiFeedback.accuracyScore}</div>
                       <div className="text-xs text-muted-foreground">Accuracy</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-primary">{aiFeedback.fluencyScore}</div>
                       <div className="text-xs text-muted-foreground">Fluency</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-primary">{aiFeedback.intonationScore}</div>
                       <div className="text-xs text-muted-foreground">Intonation</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-primary">{aiFeedback.overallScore}</div>
                       <div className="text-xs text-muted-foreground">Overall</div>
                     </div>
                   </div>
                   
                   {/* Detailed Text Feedback */}
                   <div className="space-y-3">
                      <div><strong className="font-semibold text-primary/80">Accuracy:</strong> {aiFeedback.accuracy}</div>
                      <div><strong className="font-semibold text-primary/80">Fluency:</strong> {aiFeedback.fluency}</div>
                      <div><strong className="font-semibold text-primary/80">Intonation:</strong> {aiFeedback.intonation}</div>
                      <div className="font-medium pt-2 border-t border-current/20">{aiFeedback.overall}</div>
                      
                      {/* Show specific issues if available */}
                      {aiFeedback.specificIssues && aiFeedback.specificIssues.length > 0 && (
                        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                            Specific Areas to Improve:
                          </h4>
                          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                            {aiFeedback.specificIssues.map((issue, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Show transcribed text for audio feedback */}
                      {aiFeedback.transcribedText && aiFeedback.transcribedText !== spokenText && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                          <span className="font-medium text-blue-800 dark:text-blue-200">AI heard: </span>
                          <span className="text-blue-700 dark:text-blue-300">"{aiFeedback.transcribedText}"</span>
                        </div>
                      )}
                   </div>
                </div>
              )}
              {currentPhraseIndex < lesson.pronunciationCheck.length - 1 && isCorrect && (
                <Button onClick={nextPhrase} className="mt-4">
                  Next Phrase
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {isComplete && (
        <CardFooter className="flex-col gap-4 text-center py-6 bg-secondary/30">
          <p className="text-green-600 dark:text-green-400 font-bold text-xl">¡Buen trabajo! Conversation practice complete.</p>
          <Button onClick={onComplete}>
            Next Lesson
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
