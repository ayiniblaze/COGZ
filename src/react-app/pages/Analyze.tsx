import { useState } from "react";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { Textarea } from "@/react-app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";
import {
  Loader2,
  Lightbulb,
  Terminal,
  Sparkles,
  ThumbsUp,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Menu,
} from "lucide-react";
import { Badge } from "@/react-app/components/ui/badge";
import StarField from "@/react-app/components/StarField";
import Logo3D from "@/react-app/components/Logo3D";
import HistorySidebar from "@/react-app/components/HistorySidebar";
import ChatBox from "@/react-app/components/ChatBox";
import { getAuthToken } from "@/react-app/lib/auth";

type CodeError = {
  line?: number;
  column?: number;
  message: string;
  severity: "error" | "warning";
  hint?: string;
};

type AnalyzeApiResponse =
  | {
      ok: true;
      isCorrect: true;
      message: string;
    }
  | {
      ok: true;
      isCorrect: false;
      message: string;
      details: {
        language: string;
        errors: CodeError[];
        guidance: string[];
      };
    };

interface HistoryItem {
  id: string;
  language: string;
  snippet: string;
  timestamp: Date;
  saved: boolean;
  backendResult?: AnalyzeApiResponse;
}

const SAMPLE_LANGUAGES = [
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "java", name: "Java" },
  { id: "c", name: "C" },
];

const ENCOURAGEMENTS = [
  "You already caught the point! But there are some other changes to do.",
  "Nice! You're super close - just a few tweaks needed!",
  "Almost there! You've got the core idea down perfectly.",
  "Solid foundation! Just need to polish a couple details.",
  "Great thinking! You're on the right track, keep going!",
  "You're doing amazing! One more small adjustment and you'll nail it!",
  "Impressive work so far! You're really understanding this!",
  "So close! Your approach is spot-on, just missing one tiny piece.",
  "Love your problem-solving! Just a little more refinement needed.",
  "You're crushing it! Keep that momentum going!",
];

const GEN_Z_STORIES = [
  {
    title: "The Game Loop That Never Ends",
    story:
      "You know when you're playing a game and it freezes because it's stuck loading? That's your code rn. It's like trying to speedrun but you forgot to grab the key item, so you're just running in circles. Your loop needs a checkpoint to exit!",
    hints: [
      "What needs to happen to n after each multiplication?",
      "How can you make n smaller each time the loop runs?",
      "Try adding a line that changes n inside the loop",
    ],
  },
  {
    title: "The Group Chat That Won't Stop",
    story:
      "Imagine your group chat is blowing up with messages that never stop because everyone forgot to actually say goodbye. That's what your code is doing — it's stuck in an endless conversation with itself because nothing tells it when to stop!",
    hints: [
      "Your loop is like a conversation without an ending",
      "What variable controls when the loop should stop?",
      "Add a statement to decrease n each time through the loop",
    ],
  },
  {
    title: "The Song on Infinite Repeat",
    story:
      "It's like when your favorite song is stuck on repeat because you forgot to turn off loop. Your code is vibing to the same beat over and over without moving forward.",
    hints: [
      "The loop condition stays true forever — why?",
      "What needs to change inside the loop?",
      "Think about what makes n reach 0",
    ],
  },
  {
    title: "The Road Trip With No Destination",
    story:
      "Your code is like a road trip where you're driving in circles because nobody's checking the GPS. You keep going and going, but you never actually get anywhere because there's no exit ramp!",
    hints: [
      "Every journey needs an end point — what's yours?",
      "The counter variable needs to change to reach the exit",
      "Decrease n to eventually break the loop",
    ],
  },
  {
    title: "The Movie That Never Ends",
    story:
      "Imagine watching a movie that just loops the same scene forever because someone forgot to edit in the ending. That's your code — it's stuck on the same frame, playing over and over!",
    hints: [
      "What needs to happen for the movie to progress?",
      "Look at what stays constant in your loop",
      "Add a line to modify n each iteration",
    ],
  },
];

export default function AnalyzePage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [revealedHints, setRevealedHints] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setRevealedHints(0);

    const currentEncouragement = ENCOURAGEMENTS[storyIndex % ENCOURAGEMENTS.length];
    const currentStory = GEN_Z_STORIES[storyIndex % GEN_Z_STORIES.length];

    try {
      const token = getAuthToken();
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code, language }),
      });

      const data = (await res.json().catch(() => null)) as AnalyzeApiResponse | null;
      if (!res.ok || !data) {
        setAnalysis({
          isCorrect: false,
          errorMessage: "Analysis failed",
          errorHint: "Please try again.",
          encouragement: currentEncouragement,
          errorType: "backend-error",
          confidence: "high",
          story: currentStory,
          errors: [],
          guidance: [],
        });
        return;
      }

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        language,
        snippet: code,
        timestamp: new Date(),
        saved: false,
        backendResult: data,
      };
      setHistory((prev) => [newHistoryItem, ...prev]);

      if (data.isCorrect) {
        // IMPORTANT: when user debugged correctly, do not provide extra hints.
        setAnalysis({
          isCorrect: true,
          successMessage: data.message,
          guidance: [],
          encouragement: currentEncouragement,
        });
      } else {
        const firstError = data.details.errors[0];
        setAnalysis({
          isCorrect: false,
          errorMessage: firstError?.message || data.message,
          errorHint: firstError?.hint || "",
          encouragement: currentEncouragement,
          errorType: "syntax-error",
          confidence: "high",
          story: currentStory,
          errors: data.details.errors,
          guidance: data.details.guidance,
        });
      }
    } catch {
      setAnalysis({
        isCorrect: false,
        errorMessage: "Network error",
        errorHint: "Please check your connection and try again.",
        encouragement: currentEncouragement,
        errorType: "network-error",
        confidence: "high",
        story: currentStory,
        errors: [],
        guidance: [],
      });
    } finally {
      setStoryIndex((prev) => prev + 1);
      setIsAnalyzing(false);
    }
  };

  const handleRevealHint = () => {
    if (analysis?.story?.hints && revealedHints < analysis.story.hints.length) {
      setRevealedHints((prev) => prev + 1);
    }
  };

  const handleNewCode = () => {
    setCode("");
    setAnalysis(null);
    setRevealedHints(0);
  };

  const handleSelectHistory = (item: any) => {
    setCode(item.snippet);
    setLanguage(item.language.toLowerCase());
  };

  const handleNewChat = () => {
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex">
      <StarField />

      {!sidebarOpen && (
        <Button
          onClick={() => setSidebarOpen(true)}
          size="lg"
          className="fixed left-6 bottom-10 z-50 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl"
          title="Open history sidebar"
        >
          <Menu className="w-6 h-6" />
        </Button>
      )}

      <div className="relative z-10">
        <HistorySidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onSelectHistory={handleSelectHistory}
          history={history}
          setHistory={setHistory}
        />
      </div>

      <div className="flex-1 relative z-10 flex flex-col">
        <header className="border-b border-indigo-500/20 bg-slate-900/80 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo3D />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                    COGZ
                  </h1>
                  <p className="text-xs text-indigo-300">Your AI Code Mentor</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Language:</span>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-40 bg-slate-800/50 border-indigo-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-indigo-500/30">
                      {SAMPLE_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id} className="text-white">
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <Card className="p-6 shadow-2xl border-indigo-500/30 bg-gradient-to-br from-indigo-900/90 to-indigo-950/90 backdrop-blur-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                    Your Code
                  </h2>
                </div>

                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="font-mono text-sm min-h-[400px] resize-none bg-slate-900/50 border-indigo-500/30 text-white placeholder:text-slate-500"
                />

                <div className="flex gap-3">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !code.trim()}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/50"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze My Code
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleNewCode}
                    variant="outline"
                    className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/30 hover:text-indigo-200"
                    size="lg"
                    title="Clear code and start fresh"
                  >
                    New Code
                  </Button>
                </div>

                {isAnalyzing && (
                  <div className="pt-4 border-t border-indigo-500/20">
                    <div className="flex flex-col items-center gap-4 py-8">
                      <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                      <p className="text-sm text-slate-300">Analyzing your code...</p>
                    </div>
                  </div>
                )}

                {analysis && !isAnalyzing && (
                  <div className="pt-4 border-t border-indigo-500/20 space-y-4">
                    {analysis.isCorrect ? (
                      <>
                        <Card className="p-5 shadow-lg border-green-500/40 bg-gradient-to-br from-green-900/80 to-emerald-900/80 backdrop-blur-md">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-lg font-bold text-green-300">{analysis.successMessage}</p>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 shadow-lg border-blue-500/30 bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-md">
                          <div className="flex items-start gap-3">
                            <ThumbsUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-blue-100">{analysis.encouragement}</p>
                          </div>
                        </Card>
                      </>
                    ) : (
                      <>
                        <Card className="p-5 shadow-lg border-red-500/40 bg-gradient-to-br from-red-900/80 to-orange-900/80 backdrop-blur-md">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-bold text-red-300 flex items-center gap-2">
                                Issues Found:{" "}
                                <Badge className="bg-red-600 text-white">{analysis.errors?.length || 1}</Badge>
                              </p>

                              <div className="space-y-3 mt-4">
                                {analysis.errors && analysis.errors.length > 0 ? (
                                  analysis.errors.map((error: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="bg-red-900/30 p-3 rounded border border-red-500/30"
                                    >
                                      <p className="text-sm text-red-200 font-mono">
                                        {idx + 1}. {error.message}
                                        {error.line && (
                                          <span className="text-red-400/70"> (Line {error.line})</span>
                                        )}
                                      </p>
                                      {error.hint && (
                                        <p className="text-xs text-red-300/90 mt-2">💡 {error.hint}</p>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="bg-red-900/30 p-3 rounded border border-red-500/30">
                                    <p className="text-sm text-red-200 font-mono">{analysis.errorMessage}</p>
                                    {analysis.errorHint && (
                                      <p className="text-xs text-red-300/90 mt-2">💡 {analysis.errorHint}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 shadow-lg border-green-500/30 bg-gradient-to-br from-green-900/80 to-emerald-900/80 backdrop-blur-md">
                          <div className="flex items-start gap-3">
                            <ThumbsUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-green-100">{analysis.encouragement}</p>
                          </div>
                        </Card>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-indigo-900/50 text-indigo-300 border-indigo-500/50"
                          >
                            {String(analysis.errorType).replace("-", " ").toUpperCase()}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-violet-900/50 text-violet-300 border-violet-500/50"
                          >
                            {analysis.confidence} confidence
                          </Badge>
                        </div>

                        <Card className="p-5 shadow-lg border-amber-500/30 bg-gradient-to-br from-amber-900/80 to-orange-900/80 backdrop-blur-md">
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-100">
                            <Lightbulb className="w-5 h-5 text-amber-400" />
                            {analysis.story.title}
                          </h3>
                          <p className="text-sm text-amber-50 leading-relaxed">{analysis.story.story}</p>
                        </Card>

                        <Card className="p-5 shadow-lg border-violet-500/30 bg-gradient-to-br from-violet-900/80 to-purple-900/80 backdrop-blur-md">
                          <h3 className="font-semibold mb-3 text-violet-100">
                            💡 Hints ({revealedHints}/{analysis.story.hints.length})
                          </h3>

                          {revealedHints === 0 ? (
                            <p className="text-sm text-violet-200 mb-3">
                              Ready for some hints? Click below to reveal them one at a time!
                            </p>
                          ) : (
                            <div className="space-y-2 mb-3">
                              {analysis.story.hints
                                .slice(0, revealedHints)
                                .map((hint: string, index: number) => (
                                  <div
                                    key={index}
                                    className="text-sm text-violet-100 flex gap-2 p-2 bg-violet-950/30 rounded"
                                  >
                                    <span className="text-violet-400 font-semibold">{index + 1}.</span>
                                    <span>{hint}</span>
                                  </div>
                                ))}
                            </div>
                          )}

                          {revealedHints < analysis.story.hints.length && (
                            <Button
                              onClick={handleRevealHint}
                              variant="outline"
                              className="w-full border-violet-500/50 text-violet-300 hover:bg-violet-900/50"
                            >
                              <ChevronDown className="w-4 h-4 mr-2" />
                              {revealedHints === 0 ? "Show First Hint" : "Show Next Hint"}
                            </Button>
                          )}

                          {revealedHints === analysis.story.hints.length && (
                            <p className="text-sm text-violet-300 text-center py-2">
                              ✨ All hints revealed! You got this!
                            </p>
                          )}
                        </Card>

                        {analysis.guidance && analysis.guidance.length > 0 && (
                          <Card className="p-5 shadow-lg border-indigo-500/30 bg-gradient-to-br from-indigo-900/80 to-slate-900/80 backdrop-blur-md">
                            <h3 className="font-semibold mb-3 text-indigo-100">Backend Guidance</h3>
                            <div className="space-y-2">
                              {analysis.guidance.map((g: string, idx: number) => (
                                <p key={idx} className="text-sm text-indigo-200/90">
                                  {g}
                                </p>
                              ))}
                            </div>
                          </Card>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>

        <ChatBox
          isOpen={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
          onNewChat={handleNewChat}
        />
      </div>
    </div>
  );
}
