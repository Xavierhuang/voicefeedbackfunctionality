"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, BookOpen, MessageCircle, Newspaper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function HomePage() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <h1 className="font-headline text-2xl font-bold text-primary">
            YAP Mastery
          </h1>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl py-12 px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline mb-4">Welcome to YAP Mastery</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Your personalized path to mastering Spanish. Choose a category to practice or chat with our AI tutor to review what you've learned.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Grammar Lessons */}
            <Card className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline">Grammar Lessons</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>Master the rules of Spanish with interactive fill-in-the-blank exercises.</CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href="/learn/grammar">View Lessons</Link>
                </Button>
              </div>
            </Card>

             {/* Conversation Practice */}
            <Card className="flex flex-col">
              <CardHeader>
                 <div className="flex items-center gap-4">
                    <div className="bg-accent/10 p-3 rounded-full">
                        <MessageCircle className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="font-headline">Conversation Practice</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>Practice your pronunciation and conversational skills with AI-powered feedback.</CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/learn/conversation">Start Speaking</Link>
                </Button>
              </div>
            </Card>

            {/* Reading Articles */}
            <Card className="flex flex-col">
              <CardHeader>
                 <div className="flex items-center gap-4">
                    <div className="bg-green-500/10 p-3 rounded-full">
                        <Newspaper className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="font-headline">Reading Articles</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>Improve your comprehension by reading articles and answering questions.</CardDescription>
              </CardContent>
              <div className="p-6 pt-0">
                <Button asChild className="w-full" style={{backgroundColor: '#22c55e', color: 'white'}}>
                  <Link href="/learn/reading">Read Articles</Link>
                </Button>
              </div>
            </Card>
          </div>
            
          <div className="mt-16 text-center">
             <h3 className="text-2xl font-bold font-headline mb-4">Need to review?</h3>
             <p className="text-muted-foreground mb-6">Chat with our AI tutor about any concepts you've struggled with.</p>
              <Button asChild size="lg" variant="outline">
                   <Link href="/chat">
                      <Bot className="mr-2" />
                      Chat with YAP
                  </Link>
              </Button>
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground md:px-6">
            <p>&copy; {year} YAP Language Learning. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}