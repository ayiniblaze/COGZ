import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { Textarea } from "@/react-app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/react-app/components/ui/select";
import Logo3D from "@/react-app/components/Logo3D";
import { clearAuthToken, getAuthToken } from "@/react-app/lib/auth";

type CodeError = {
  line?: number;
  column?: number;
  message: string;
  severity: "error" | "warning";
  hint?: string;
};

type AnalyzeResponse =
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

const LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "c", name: "C" },
];

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSignedIn = useMemo(() => Boolean(getAuthToken()), []);

  const handleAnalyze = async () => {
    setError(null);
    setIsLoading(true);
    setResult(null);

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

      const data = (await res.json().catch(() => null)) as AnalyzeResponse | null;
      if (!res.ok) {
        setError((data as any)?.message || "Analysis failed");
        return;
      }
      if (!data) {
        setError("Analysis failed");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    clearAuthToken();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Logo3D />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">COGZ</h1>
              <p className="text-sm text-slate-600">Paste code and get an analysis from the backend</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
            {isSignedIn && (
              <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
            )}
          </div>
        </header>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="w-52">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading || !code.trim()}>
              {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>

          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="min-h-[260px] font-mono"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          {result && result.isCorrect && (
            <Card className="p-4 bg-slate-50">
              <p className="font-semibold text-slate-900">{result.message}</p>
            </Card>
          )}

          {result && !result.isCorrect && (
            <Card className="p-4 bg-slate-50 space-y-3">
              <p className="font-semibold text-slate-900">{result.message}</p>
              {result.details.errors.length > 0 && (
                <div className="space-y-2">
                  {result.details.errors.map((e, idx) => (
                    <div key={idx} className="text-sm text-slate-800">
                      <div>
                        {idx + 1}. {e.message}
                        {typeof e.line === "number" ? ` (Line ${e.line})` : ""}
                      </div>
                      {e.hint ? <div className="text-slate-600">Hint: {e.hint}</div> : null}
                    </div>
                  ))}
                </div>
              )}

              {result.details.guidance.length > 0 && (
                <ul className="text-sm text-slate-700 list-disc pl-5">
                  {result.details.guidance.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </Card>
      </div>
    </div>
  );
}
