import { useState, useEffect } from 'react';
import { Card } from '@/react-app/components/ui/card';
import { Button } from '@/react-app/components/ui/button';
import { ScrollArea } from '@/react-app/components/ui/scroll-area';
import { Clock, Bookmark, User, LogIn, Trash2, Menu, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Separator } from '@/react-app/components/ui/separator';
import { Badge } from '@/react-app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/react-app/components/ui/dialog';
import { Input } from '@/react-app/components/ui/input';
import { Label } from '@/react-app/components/ui/label';
import { evaluateCode, type EvalResult } from '@/shared/codeEvaluator';

interface HistoryItem {
  id: string;
  language: string;
  snippet: string;
  timestamp: Date;
  saved: boolean;
  evalResult?: EvalResult;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectHistory?: (item: HistoryItem) => void;
  history?: HistoryItem[];
  setHistory?: (items: HistoryItem[]) => void;
}

export default function HistorySidebar({ isOpen, onToggle, onSelectHistory, history: externalHistory, setHistory: setExternalHistory }: HistorySidebarProps) {
  const [history, setHistory] = useState<HistoryItem[]>(externalHistory || []);

  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [selectedEvalResult, setSelectedEvalResult] = useState<EvalResult | null>(null);
  const [showEvalDialog, setShowEvalDialog] = useState(false);

  // Sync with external history
  useEffect(() => {
    if (externalHistory) {
      setHistory(externalHistory);
    }
  }, [externalHistory]);

  // Update parent when history changes
  const updateHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    if (setExternalHistory) {
      setExternalHistory(newHistory);
    }
  };

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.map(item =>
      item.id === id ? { ...item, saved: !item.saved } : item
    );
    updateHistory(newHistory);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item.id !== id);
    updateHistory(newHistory);
  };

  const handleSelectItem = (item: HistoryItem) => {
    if (onSelectHistory) {
      onSelectHistory(item);
    }
    // Evaluate the code automatically
    const evalResult = evaluateCode(item.snippet, item.language);
    setSelectedEvalResult(evalResult);
    setShowEvalDialog(true);
  };

  const handleLogin = () => {
    if (loginForm.email && loginForm.password) {
      setIsLoggedIn(true);
      setUsername(loginForm.email.split('@')[0]);
      setShowLoginDialog(false);
      setLoginForm({ email: '', password: '' });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="w-80 h-screen bg-slate-900/95 backdrop-blur-sm border-r border-indigo-500/20 flex flex-col">
        {/* History Section */}
        <div className="flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-white">History</h2>
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle();
              }}
              size="icon"
              variant="ghost"
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 h-8 w-8"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-2 pb-4">
              {history.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className="p-3 bg-slate-800/50 border-indigo-500/20 hover:bg-slate-800/70 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-indigo-900/50 text-indigo-300 border-indigo-500/30">
                      {item.language}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleToggleSave(item.id, e)}
                        className="h-6 w-6 hover:bg-slate-700/50"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            item.saved
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-400'
                          }`}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="h-6 w-6 text-red-400/70 hover:bg-red-900/30 hover:text-red-400 transition-all"
                        title="Delete this entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-slate-300 truncate">
                    {item.snippet}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.timestamp.toLocaleTimeString()}
                  </p>
                </Card>
              ))}
              {history.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">
                  No history yet
                </p>
              )}
            </div>
          </ScrollArea>

          {/* Clear All History Button */}
          {history.length > 0 && (
            <Button
              onClick={() => {
                if (confirm('Are you sure you want to delete all history? This cannot be undone.')) {
                  setHistory([]);
                }
              }}
              variant="ghost"
              size="sm"
              className="w-full mt-4 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Clear All History
            </Button>
          )}
        </div>

        <Separator className="bg-indigo-500/20 flex-shrink-0" />

        {/* User Section */}
        <div className="p-4 bg-slate-900/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {isLoggedIn ? username : 'Guest User'}
              </p>
              <p className="text-xs text-slate-400">
                {isLoggedIn ? 'Premium Mode' : 'Learning Mode'}
              </p>
            </div>
            <Button
              onClick={isLoggedIn ? handleLogout : () => setShowLoginDialog(true)}
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
              title={isLoggedIn ? 'Logout' : 'Login'}
            >
              <LogIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-slate-900 border-indigo-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Sign In to COGZ</DialogTitle>
            <DialogDescription className="text-slate-400">
              Enter your credentials to access premium features
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="bg-slate-800/50 border-indigo-500/30 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
                className="bg-slate-800/50 border-indigo-500/30 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowLoginDialog(false)}
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogin}
              disabled={!loginForm.email || !loginForm.password}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
            >
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Code Evaluation Dialog */}
      <Dialog open={showEvalDialog} onOpenChange={setShowEvalDialog}>
        <DialogContent className="bg-slate-900 border-indigo-500/30 text-white max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedEvalResult?.isValid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Code Analysis: Valid
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Code Analysis: Issues Found
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Language: {selectedEvalResult?.language}
            </DialogDescription>
          </DialogHeader>

          {selectedEvalResult && (
            <div className="space-y-4">
              {/* Success Message */}
              {selectedEvalResult.isValid && selectedEvalResult.successMessage && (
                <div className="bg-green-950/50 border-2 border-green-500/50 rounded p-4 text-center">
                  <p className="text-lg font-bold text-green-300">
                    {selectedEvalResult.successMessage}
                  </p>
                  <p className="text-sm text-green-200/70 mt-2">
                    Great job! Your code has no syntax errors.
                  </p>
                </div>
              )}

              {/* Errors */}
              {selectedEvalResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Errors ({selectedEvalResult.errors.length})
                  </h4>
                  <div className="bg-red-950/30 border border-red-500/30 rounded p-3 space-y-2">
                    {selectedEvalResult.errors.map((err, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="text-red-300 font-mono">{err.message}</p>
                        {err.hint && (
                          <p className="text-red-200/70 text-xs mt-1">💡 {err.hint}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {selectedEvalResult.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-yellow-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Warnings ({selectedEvalResult.warnings.length})
                  </h4>
                  <div className="bg-yellow-950/30 border border-yellow-500/30 rounded p-3 space-y-1">
                    {selectedEvalResult.warnings.map((warn, idx) => (
                      <p key={idx} className="text-sm text-yellow-300">{warn}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Guidance */}
              {selectedEvalResult.guidance.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-indigo-400">Guidance</h4>
                  <div className="bg-indigo-950/30 border border-indigo-500/30 rounded p-3 space-y-1">
                    {selectedEvalResult.guidance.map((guide, idx) => (
                      <p key={idx} className="text-sm text-indigo-200">{guide}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowEvalDialog(false)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
