import { useState, useRef, useEffect } from 'react';
import { Card } from '@/react-app/components/ui/card';
import { Button } from '@/react-app/components/ui/button';
import { Textarea } from '@/react-app/components/ui/textarea';
import { Send, Bot, User, MessageSquare, X, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { evaluateCode, type EvalResult } from '@/shared/codeEvaluator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeEval?: EvalResult;
}

interface ChatBoxProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat?: () => void;
}

// Fun stories for debugging guidance
const DEBUG_STORIES = {
  loop: [
    "🎮 Bro, your loop is like a gamer stuck in an infinite level! No checkpoints, no progress. The game just keeps looping forever because there's no exit. You need to add something that eventually makes your loop condition FALSE. Think: what changes each time through the loop?",
    "📱 Yo, your loop is like a group chat that never stops! Everyone's texting but nobody's saying goodbye. Your code is stuck texting to itself forever cause nothing tells it when to STOP. What needs to change to eventually break outta this conversation?",
    "🎵 Bro, your song is on INFINITE repeat! 🎶 The loop's gonna vibe forever unless you hit that SKIP button. What variable needs to CHANGE to eventually skip past the loop?",
    "🚗 Road trip vibes but you're going in circles fam! No GPS, no destination. You're driving forever cause the exit ramp never comes. What needs to decrease to eventually reach your EXIT?",
  ],
  variable: [
    "Think about it like this: You start at point A and need to reach point B. What do you need to do at EVERY step?",
    "Imagine climbing stairs - you go UP one step at a time. Your code needs to do something similar each time. What's changing?",
    "Picture a countdown before launch 🚀 - 5, 4, 3, 2, 1 BLAST OFF. What's counting DOWN in your code?",
  ],
  syntax: [
    "Yo, there's a grammar error in your code fam! 🤔 It's like saying 'I going to store' instead of 'I'm going to store'. The computer gets confused!",
    "Your code's got a typo vibe right now. Like when you forget punctuation - the sentence doesn't make sense. Let me help you fix it!",
  ]
};

export default function ChatBox({ isOpen, onToggle }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Yo bro! 🤙 I'm your debugging homie. Drop your code here, ask me for hints, or just chat about what's buggin' you. I gotchu fam! I won't give you the answer but I'll guide you to figure it out. That's how you actually learn! 💪",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeCode = (message: string): { response: string; codeEval?: EvalResult } => {
    const lower = message.toLowerCase();
    
    // Check if message contains code snippet
    const codeBlockMatch = message.match(/```(\w+)?\n([\s\S]*?)\n```/) || message.match(/```([\s\S]*?)```/);
    if (codeBlockMatch) {
      const code = codeBlockMatch[codeBlockMatch.length - 1].trim();
      const language = codeBlockMatch[1] || 'javascript';
      const evalResult = evaluateCode(code, language);
      
      let response = '';
      if (evalResult.isValid) {
        const wins = [
          "YO BRO! 🔥 That's straight up correct! You're crushing it! No errors, just vibes. That's the energy we need!",
          "YESSSIR! ✅ Your code is CLEAN fam! No syntax errors, no bugs - just pure quality. This is how a pro does it!",
          "BRO! 🚀 That's it! That's EXACTLY right! Zero errors, perfect execution. You should be proud of yourself!",
          "AYEEE! 💪 Nailed it bro! Your code is solid, no issues at all. You're writing like a real programmer now!",
        ];
        response = wins[Math.floor(Math.random() * wins.length)];
      } else {
        const errorMsg = evalResult.errors[0]?.message || 'There are some issues';
        const hint = evalResult.errors[0]?.hint || 'Review the code carefully';
        response = `Yo bro, there's something off here. 🤔\n\n**Problem:** ${errorMsg}\n\n**What to think about:** ${hint}\n\nDon't worry fam, this is where the learning happens! Take another shot at it! 💪`;
      }
      return { response, codeEval: evalResult };
    }
    
    // Ask for hint - tell fun stories
    if (lower.includes('hint') || lower.includes('stuck') || lower.includes('help me') || lower.includes('i don\'t know')) {
      const storyIndex = Math.floor(Math.random() * DEBUG_STORIES.loop.length);
      const story = DEBUG_STORIES.loop[storyIndex];
      return { response: story };
    }
    
    // Ask about loops
    if (lower.includes('loop') || lower.includes('while') || lower.includes('for ')) {
      const loopHelp = [
        "Ok bro, here's the thing with loops. 🔄 They keep going and going UNTIL something tells them to STOP. Right now, what's telling YOUR loop to stop? Is anything changing that would eventually make the condition FALSE?",
        "Think of a loop like repeating a TikTok dance 💃 You keep doing it... and doing it... and doing it... until the music STOPS. Your code needs something to make that music stop!",
      ];
      return { response: loopHelp[Math.floor(Math.random() * loopHelp.length)] };
    }
    
    // Ask about variables
    if (lower.includes('variable') || lower.includes('counter') || lower.includes('increment')) {
      const varHelp = [
        "Variables are like counters bro! 🎯 Think of it like leveling up in a game - you start at level 1, then 2, then 3, etc. What's YOUR variable at right now? What should it be AFTER each loop?",
        "Imagine you're saving money fam 💰 Every paycheck, you add to your bank account. Same deal with variables - they gotta CHANGE as the loop runs!",
      ];
      return { response: varHelp[Math.floor(Math.random() * varHelp.length)] };
    }
    
    // Encouragement vibes
    if (lower.includes('hard') || lower.includes('confusing') || lower.includes('don\'t get') || lower.includes('frustrated')) {
      const encourage = [
        "Yo yo yo, I feel you bro! 💯 Debugging is like solving a puzzle - it's SUPPOSED to be challenging. But that's exactly how you get better. You're literally training your brain right now. This is a W! 🏆",
        "Bro, if this was easy, everyone would be a programmer! The fact that you're HERE, trying, asking questions - that's already a big W. Keep going homie! 🚀",
        "Listen fam, every single great programmer has been where you are right now - confused, frustrated, ready to flip the table. But they PUSHED THROUGH. You got this! 💪",
        "Real talk bro - this feeling means you're LEARNING. Your brain is literally building new pathways right now. Embrace the struggle! You're about to level up! 📈",
      ];
      return { response: encourage[Math.floor(Math.random() * encourage.length)] };
    }
    
    // Asking how something works
    if (lower.includes('how') || lower.includes('why') || lower.includes('what') || lower.includes('explain')) {
      const explain = [
        "Broooo, I LOVE the curiosity! That's the mindset of a real programmer right there! 🧠 Tell me specifically what part is confusing and I'll break it down for you!",
        "Yo, asking 'why' shows you actually wanna UNDERSTAND the code, not just copy-paste. That's real programmer energy! 🔥 What exactly you wanna know about?",
        "That's the spirit fam! Good developers are always asking 'how does this work?' What's the specific part you wanna dive deeper into?",
      ];
      return { response: explain[Math.floor(Math.random() * explain.length)] };
    }
    
    // General casual responses
    const responses = [
      "Bet bro! 🤝 Drop your code, ask for a hint, or just tell me what's going on!",
      "Word! I'm here for it! What's the vibe? Code check or just chatting?",
      "Yo, I see you trying! Need help with code, or just wanna talk through it?",
      "Respect! What can I help you with today homie? 💪",
      "For sure! Tell me what's up and we'll figure it out together!",
    ];
    return { response: responses[Math.floor(Math.random() * responses.length)] };
  };

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsProcessing(true);

    // Simulate AI response with context awareness
    setTimeout(() => {
      const { response, codeEval } = analyzeCode(currentInput);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        codeEval,
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Fresh start fam! 🆕 Let's get it! Drop your code or ask me anything. We got this! 💪",
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        size="icon"
        className="fixed right-6 bottom-6 z-20 h-14 w-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-2xl shadow-indigo-500/50"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed right-6 bottom-6 z-20 w-96 h-[600px] flex flex-col shadow-2xl border-indigo-500/30 bg-slate-900/95 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-indigo-500/20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Your Debugging Homie 🤙</h3>
            <p className="text-xs text-slate-400">I got your back bro!</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={handleNewConversation}
            size="icon"
            variant="ghost"
            className="text-slate-400 hover:text-white hover:bg-slate-800/50 h-8 w-8"
            title="New conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={onToggle}
            size="icon"
            variant="ghost"
            className="text-slate-400 hover:text-white hover:bg-slate-800/50 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages - Fixed scrolling */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-violet-600 to-purple-600'
                      : 'bg-gradient-to-br from-indigo-600 to-violet-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-violet-900/50 text-violet-50'
                      : 'bg-slate-800/50 text-slate-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              {/* Code Evaluation Feedback */}
              {message.codeEval && (
                <div className="flex gap-3 mt-2 ml-11">
                  <div className="flex-1">
                    {message.codeEval.isValid ? (
                      <div className="bg-green-950/50 border border-green-500/30 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="font-semibold text-green-300 text-xs">Code Status: Valid</span>
                        </div>
                        <p className="text-xs text-green-200/70">{message.codeEval.guidance[0] || "No syntax errors!"}</p>
                      </div>
                    ) : (
                      <div className="bg-red-950/30 border border-red-500/30 rounded p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3 h-3 text-red-400" />
                          <span className="font-semibold text-red-300 text-xs">Issues Found:</span>
                        </div>
                        {message.codeEval.errors.slice(0, 2).map((err, idx) => (
                          <div key={idx}>
                            <p className="text-xs text-red-200">{err.message}</p>
                            {err.hint && (
                              <p className="text-xs text-red-300/70 mt-1">💡 {err.hint}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 rounded-lg p-3 bg-slate-800/50">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-indigo-500/20 flex-shrink-0">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Paste your code or ask a question..."
            className="min-h-[60px] max-h-[120px] resize-none bg-slate-800/50 border-indigo-500/30 text-white placeholder:text-slate-500 text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            size="icon"
            className="bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 h-[60px] w-[60px] flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
