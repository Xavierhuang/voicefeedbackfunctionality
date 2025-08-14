# Voice Feedback Functionality

A comprehensive Spanish language learning application with AI-powered voice feedback and pronunciation scoring. Built with Next.js, Google AI (Gemini), and modern web technologies.

## 🎯 Features

### 🎤 Voice Recognition & Feedback
- **Real-time Speech Recognition** using Web Speech API
- **AI-Powered Pronunciation Analysis** with Google Gemini 2.0 Flash
- **Numerical Scoring System** (0-100) for accuracy, fluency, intonation, and overall performance
- **Detailed Text Feedback** with specific improvement suggestions
- **Confidence Scoring** (0-1) for AI assessment reliability

### 📚 Learning Modules
- **Conversation Practice** with AI pronunciation feedback
- **Grammar Exercises** with interactive lessons
- **Reading Comprehension** with markdown content
- **Progress Tracking** with streak counting
- **Lesson Flagging** for difficult content review

### 🎨 Modern UI/UX
- **Responsive Design** for mobile and desktop
- **Accessible Interface** with keyboard navigation
- **Optimized Bundle Size** with only necessary UI components
- **Smooth Animations** and transitions
- **Toast Notifications** for user feedback

### ⚡ Performance & Optimization
- **Direct Audio Analysis** for accurate pronunciation assessment
- **Minimal Bundle Size** with unused components removed
- **5-second Recording Limit** for optimal user experience
- **Smart Fallback System** for browser compatibility
- **Real-time Visual Feedback** during recording

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Google AI API key ([Get one here](https://aistudio.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Xavierhuang/voicefeedbackfunctionality.git
   cd voicefeedbackfunctionality
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   echo "GOOGLE_API_KEY=your_google_ai_api_key_here" > .env.local
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

## 📁 Project Structure

```
src/
├── ai/                          # AI integration
│   ├── flows/                   # AI workflows
│   │   ├── audio-pronunciation-feedback.ts     # 🎯 Core audio analysis
│   │   ├── generate-grammar-exercises.ts
│   │   ├── review-chat.ts
│   │   └── text-to-speech.ts
│   ├── dev.ts                   # Development AI server
│   └── genkit.ts               # Google AI configuration
├── app/                        # Next.js app router
│   ├── chat/                   # AI chat interface
│   ├── learn/                  # Learning modules
│   │   ├── conversation/       # 🎤 Voice practice
│   │   ├── grammar/           # Grammar lessons
│   │   └── reading/           # Reading exercises
│   └── layout.tsx
├── components/                 # React components
│   ├── modules/               # Learning module components
│   │   ├── ConversationModule.tsx  # 🎯 Main voice interface
│   │   ├── GrammarModule.tsx
│   │   └── ArticleModule.tsx
│   └── ui/                    # Reusable UI components
├── content/                   # Markdown lesson content
├── context/                   # React context providers
├── hooks/                     # Custom React hooks
└── lib/                       # Utilities and types
```

## 🎤 Voice Feedback System

### How It Works

1. **Audio Recording**: Uses MediaRecorder API to capture high-quality audio
2. **Direct Audio Analysis**: Google Gemini 2.0 Flash analyzes raw audio data
3. **Speech Recognition Fallback**: Web Speech API as backup for unsupported browsers
4. **AI Scoring**: Provides numerical scores (0-100) for multiple categories
5. **Detailed Feedback**: Delivers specific pronunciation improvement suggestions in English

### Scoring Categories

| Category | Description | Score Range |
|----------|-------------|-------------|
| **Accuracy** | Individual sounds and word pronunciation | 0-100 |
| **Fluency** | Rhythm, speed, and natural flow | 0-100 |
| **Intonation** | Pitch, tone, and stress patterns | 0-100 |
| **Overall** | Combined assessment score | 0-100 |
| **Confidence** | AI assessment reliability | 0-1 |

### Score Guidelines

- **90-100**: Excellent/Perfect pronunciation
- **80-89**: Very good with minor issues
- **70-79**: Good with some noticeable issues
- **60-69**: Fair with several issues
- **50-59**: Poor but understandable
- **0-49**: Very poor or unintelligible

## 🔧 Configuration

### Environment Variables

```bash
# Required
GOOGLE_API_KEY=your_google_ai_api_key_here

# Optional (alternative)
GEMINI_API_KEY=your_gemini_api_key_here
```

### AI Model Configuration

The system uses Google Gemini 2.0 Flash for optimal performance:

```typescript
// src/ai/genkit.ts
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
```

## 📱 Usage Examples

### Audio-Based Voice Practice

```typescript
import { getAudioPronunciationFeedback } from '@/ai/flows/audio-pronunciation-feedback';

const feedback = await getAudioPronunciationFeedback({
  audioData: "base64_encoded_audio_data",
  audioFormat: "webm", 
  targetPhrase: "Hola"
});

console.log(feedback);
// Output:
// {
//   isCorrect: true,
//   accuracyScore: 85,
//   fluencyScore: 78,
//   intonationScore: 92,
//   overallScore: 85,
//   confidence: 0.9,
//   transcribedText: "Hola",
//   accuracy: "Your pronunciation of 'Hola' was quite accurate...",
//   fluency: "The fluency was natural...",
//   intonation: "Your intonation was appropriate...",
//   overall: "Very good! Your pronunciation was excellent...",
//   specificIssues: []
// }
```

### Integration in React Component

```tsx
import { ConversationModule } from '@/components/modules/ConversationModule';

function MyApp() {
  return (
    <ConversationModule 
      lesson={lessonData}
      onComplete={() => console.log('Lesson completed!')}
    />
  );
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server (port 9002)
npm run genkit:dev       # Start AI development server
npm run genkit:watch     # Watch mode for AI server

# Production
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run typecheck       # Run TypeScript checks
```

### Adding New Voice Feedback Features

1. **Extend the AI schema** in `src/ai/flows/enhanced-pronunciation-feedback.ts`
2. **Update the UI** in `src/components/modules/ConversationModule.tsx`
3. **Add new lesson content** in `src/content/` or `src/lib/data.ts`

## 🎨 Customization

### Styling

The app uses Tailwind CSS with a custom color scheme:

```css
/* Primary colors */
--primary: #30A2FF;      /* Deep sky blue */
--background: #F5F7FA;   /* Light gray */
--accent: #E91E63;       /* Vibrant magenta */
```

### Adding New Learning Modules

1. Create a new module component in `src/components/modules/`
2. Add the route in `src/app/learn/`
3. Update the lesson data in `src/lib/data.ts`

## 🔒 Security

- API keys are stored in `.env.local` (not committed to git)
- Web Speech API requires HTTPS in production
- Input validation on all AI prompts

## 🌐 Browser Support

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Limited Web Speech API support
- **Safari**: Limited Web Speech API support
- **Mobile**: iOS Safari has limited support

## 📊 Performance

- **AI Response Time**: ~2-3 seconds average
- **Speech Recognition**: Real-time processing
- **Bundle Size**: Optimized with Next.js and Turbopack
- **Caching**: Automatic AI response caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Xavierhuang/voicefeedbackfunctionality/issues)
- **Documentation**: [Genkit Docs](https://genkit.dev/docs/plugins/google-genai)
- **Google AI**: [AI Studio](https://aistudio.google.com/)

## 🙏 Acknowledgments

- [Google AI](https://ai.google/) for Gemini API
- [Genkit](https://genkit.dev/) for AI framework
- [Next.js](https://nextjs.org/) for React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible components

---

**Built with ❤️ for genuine language understanding**
