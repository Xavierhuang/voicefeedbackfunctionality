
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Bot, User, Send, Mic, Loader2, Volume2, StopCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { reviewChat, ReviewChatInput } from '@/ai/flows/review-chat';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { createSpanishSpeechRecognition, processSpeechResult, handleSpeechError } from '@/lib/speech-config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Message = {
  role: 'user' | 'bot';
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [playingMessage, setPlayingMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { flaggedLessons } = useAppContext();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const recognition = createSpanishSpeechRecognition();
    if (recognition) {
      recognition.onresult = (event) => {
        const result = processSpeechResult(event);
        
        console.log('Chat speech recognition result:', {
          transcript: result.transcript,
          confidence: result.confidence,
          alternatives: result.alternatives
        });
        
        setInput(result.transcript);
        handleSubmit(result.transcript);
      };
      
      recognition.onend = () => setIsListening(false);
      
      recognition.onerror = (event) => {
        const errorMessage = handleSpeechError(event);
        toast({ 
          variant: 'destructive', 
          title: 'Error de Voz', 
          description: errorMessage 
        });
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, [toast]);
  
  useEffect(() => {
    const player = new Audio();
    player.onended = () => setPlayingMessage(null);
    setAudioPlayer(player);
    return () => { player.pause(); player.src = ''; };
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);


  const handleSubmit = async (value: string) => {
    const userInput = value.trim();
    if (!userInput) return;

    setInput('');
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: userInput }]);

    try {
      const chatInput: ReviewChatInput = {
        question: userInput,
        flaggedLessonIds: flaggedLessons,
      };
      const response = await reviewChat(chatInput);
      setMessages((prev) => [...prev, { role: 'bot', content: response.answer }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      toast({
        variant: 'destructive',
        title: 'Chatbot Error',
        description: 'Sorry, the chatbot is not available right now.',
      });
       setMessages((prev) => [...prev, { role: 'bot', content: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
        toast({variant: 'destructive', title: 'Unsupported', description: 'Voice recognition is not supported in your browser.'});
        return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };
  
  const playAudio = async (text: string) => {
    if (playingMessage === text) {
      audioPlayer?.pause();
      setPlayingMessage(null);
      return;
    }
    setPlayingMessage(text);
    try {
      const { audioDataUri } = await textToSpeech({ text });
      if (audioPlayer) {
          audioPlayer.src = audioDataUri;
          audioPlayer.play();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Audio Error", description: "Could not play the audio." });
      setPlayingMessage(null);
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-3xl">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot /> Review Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="space-y-6 pr-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'bot' && <Bot className="h-6 w-6 text-primary shrink-0" />}
                        <div className={`p-3 rounded-lg max-w-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                           <p>{msg.content}</p>
                           {msg.role === 'bot' && (
                                <Button size="icon" variant="ghost" className="h-7 w-7 mt-1" onClick={() => playAudio(msg.content)} disabled={playingMessage !== null && playingMessage !== msg.content}>
                                     {playingMessage === msg.content ? <Loader2 className="animate-spin" /> : <Volume2 />}
                                </Button>
                           )}
                        </div>
                        {msg.role === 'user' && <User className="h-6 w-6 shrink-0" />}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <Bot className="h-6 w-6 text-primary shrink-0" />
                            <div className="p-3 rounded-lg bg-secondary">
                                <Loader2 className="animate-spin" />
                            </div>
                        </div>
                    )}
                     </div>
                </ScrollArea>
            </CardContent>
            <CardFooter>
              <form
                className="flex w-full items-center space-x-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(input);
                }}
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about a lesson or practice your Spanish..."
                  disabled={isLoading}
                />
                <Button type="button" size="icon" onClick={handleVoiceInput} disabled={isLoading || !recognitionRef.current}>
                  {isListening ? <StopCircle /> : <Mic />}
                </Button>
                <Button type="submit" size="icon" disabled={isLoading || !input}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
