export interface BaseLesson {
  id: string;
  title: string;
  flagged?: boolean;
}

export interface GrammarLesson extends BaseLesson {
  type: 'grammar';
  // The 'explanation' object is replaced with a simple 'content' string,
  // which will hold the markdown filename.
  content: string; 
  exercise: {
    type: 'fill-in-the-blank';
    questions: {
      sentence: string;
      options: string[];
      answer: string;
      explanation: string;
    }[];
  };
}

export interface ConversationLesson extends BaseLesson {
  type: 'conversation';
  dialogue: { speaker: string; line: string }[];
  pronunciationCheck: {
    phrase: string;
  }[];
}

export interface ArticleLesson extends BaseLesson {
    type: 'article';
    headline: string;
    content: { type: 'paragraph' | 'quote'; text: string }[];
    comprehension: {
        question: string;
        options: string[];
        answer: string;
    }[];
}


export type Lesson = GrammarLesson | ConversationLesson | ArticleLesson;

export interface Level {
  name: string;
  lessons: Lesson[];
}

export interface ContentData {
  levels: Record<string, Level>;
}

export type QuestionFeedback = {
    sentence: string;
    answer: string;
    explanation: string;
}
