import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartyPopper, Bot } from "lucide-react";

export default function CourseComplete() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-6 p-10 text-center">
        <PartyPopper className="h-16 w-16 text-primary" />
        <div className="space-y-2">
            <h2 className="text-3xl font-bold font-headline">¡Felicidades!</h2>
            <p className="text-muted-foreground max-w-md">
              You've completed all available lessons. You can use the Review Bot to practice what you've learned or wait for more content to be added.
            </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/chat">
            <Bot className="mr-2" />
            Review with AI Bot
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
