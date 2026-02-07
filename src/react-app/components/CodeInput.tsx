import { useState } from 'react';
import { Button } from '@/react-app/components/ui/button';
import { Textarea } from '@/react-app/components/ui/textarea';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { evaluateCode, type EvalResult } from '@/shared/codeEvaluator';

interface CodeInputProps {
  value: string;
  onChange: (code: string) => void;
  language: string;
}

export default function CodeInput({ value, onChange, language }: CodeInputProps) {
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);

  const handleEvaluate = () => {
    if (!value.trim()) {
      setEvalResult({
        isValid: false,
        language: 'other',
        errors: [{ message: 'Code cannot be empty', severity: 'error' }],
        warnings: [],
        guidance: ['Paste your code to get started!'],
      });
      return;
    }
    const result = evaluateCode(value, language);
    setEvalResult(result);
  };

  return (
    <div className="w-full space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-300">
          Your Code
        </label>
        <Textarea
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          placeholder="Paste your code here (JavaScript, Python, etc.)..."
          className="min-h-[200px] max-h-[300px] resize-none bg-slate-800/50 border-indigo-500/30 text-white placeholder:text-slate-500 font-mono text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleEvaluate}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
        >
          Check Code
        </Button>
        <Button
          onClick={() => setEvalResult(null)}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800/50"
        >
          Clear Feedback
        </Button>
      </div>

      {/* Evaluation Feedback */}
      {evalResult && (
        <div className="mt-4 space-y-3">
          {evalResult.isValid ? (
            <div className="bg-green-950/50 border border-green-500/40 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-bold text-green-300 text-lg">
                  ✅ Your code is correct!
                </span>
              </div>
              <div className="space-y-1 ml-7">
                {evalResult.guidance.map((guide, idx) => (
                  <p key={idx} className="text-sm text-green-200/80">
                    {guide}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-red-950/40 border border-red-500/40 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="font-bold text-red-300 text-lg">
                  Issues found:
                </span>
              </div>
              <div className="space-y-3 ml-7">
                {evalResult.errors.map((err, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-sm font-mono text-red-200">
                      {err.message}
                    </p>
                    {err.hint && (
                      <p className="text-xs text-red-300/80 bg-red-900/20 p-2 rounded">
                        💡 {err.hint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
