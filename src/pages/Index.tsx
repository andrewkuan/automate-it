import { useState, useEffect } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import ResultCard from "@/components/ResultCard";
import EffortImpactMatrix from "@/components/EffortImpactMatrix";
import SearchHistory from "@/components/SearchHistory";
import { supabase } from "@/integrations/supabase/client";
import { ResultData, TaskPoint, HistoryEntry } from "@/types/analysis";
import { getHistory, addToHistory } from "@/lib/history";

const placeholderExamples = [
  "Every Monday I manually export a CSV from our CRM, clean the data in Excel, and upload it to Google Sheets for the sales team...",
  "I spend 30 minutes each day copying invoice data from emails into our accounting software...",
  "Each week I manually check 50+ websites for price changes and update a spreadsheet...",
  "I have a 30 minute call with each new client to understand their business before we start working together.",
  "Every morning I compile reports from three different tools and send a summary email to the team...",
];

/** Condense a task description into a short 2-3 word label */
const summarizeTask = (text: string): string => {
  const cleaned = text
    .replace(/^(every\s+(morning|day|week|monday|evening)\s+i\s+)/i, "")
    .replace(/^(i\s+(spend|manually|have to|need to)\s+)/i, "")
    .replace(/^(each\s+\w+\s+i\s+)/i, "")
    .trim();
  const words = cleaned.split(/\s+/).filter((w) => w.length > 1).slice(0, 3);
  const label = words.join(" ");
  return label.length > 24 ? label.slice(0, 22) + "…" : label;
};

const Index = () => {
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [currentLabel, setCurrentLabel] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() => getHistory());

  // Derive matrix points from history so deletes stay in sync
  const taskPoints: TaskPoint[] = history
    .filter((e) => e.result.effort_score != null && e.result.impact_score != null)
    .map((e) => ({ label: e.label, effort: e.result.effort_score!, impact: e.result.impact_score! }));
  const [loadingText, setLoadingText] = useState("Analyzing...");
  const [loadingTextVisible, setLoadingTextVisible] = useState(true);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  useEffect(() => {
    if (task) return;
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
        setPlaceholderVisible(true);
      }, 800);
    }, 5000);
    return () => clearInterval(interval);
  }, [task]);

  useEffect(() => {
    if (!loading) {
      setLoadingText("Analyzing...");
      setLoadingTextVisible(true);
      return;
    }
    const phrases = [
      "Analyzing...",
      "Evaluating complexity...",
      "Checking automation potential...",
      "Crunching the numbers...",
      "Almost there...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingTextVisible(false);
      setTimeout(() => {
        i = (i + 1) % phrases.length;
        setLoadingText(phrases[i]);
        setLoadingTextVisible(true);
      }, 400);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedTask = params.get("task");
    if (sharedTask) {
      setTask(sharedTask);
      handleSubmit(sharedTask);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (taskText?: string) => {
    const description = taskText || task;
    if (!description.trim()) {
      toast.error("Please describe a task first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const [analyzeResult, summarizeResult] = await Promise.all([
        supabase.functions.invoke("analyze-task", { body: { task: description } }),
        supabase.functions.invoke("summarize-task", { body: { task: description } }),
      ]);

      if (analyzeResult.error) throw analyzeResult.error;
      const data = analyzeResult.data as ResultData;
      const label = summarizeResult.data?.label || summarizeTask(description);

      setResult(data);
      setCurrentLabel(label);

      // Save to history
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        task: description,
        label,
        result: data,
        timestamp: Date.now(),
      };
      const updatedHistory = addToHistory(entry);
      setHistory(updatedHistory);

      // Matrix points are now derived from history, no separate storage needed
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (entry: HistoryEntry) => {
    setTask(entry.task);
    setResult(entry.result);
    setCurrentLabel(entry.label);
  };

  const hasResult = !!result;
  const isFullResult = hasResult && result.automate_score >= 50;

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 py-6 md:py-10">
      {!hasResult ? (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-10 pt-8 md:pt-14">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-primary text-xs font-mono font-semibold uppercase tracking-widest">
              <Zap className="w-3 h-3" />
              Automation Analyzer
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Is This Worth{" "}
              <span className="text-primary glow-text">Automating</span>?
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Describe your manual task and get an instant analysis on whether it's worth automating.
            </p>
          </div>

          <div className="w-full space-y-4">
            <div className="relative">
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                rows={5}
                className="w-full rounded-xl bg-card border border-border px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none transition-shadow gradient-border"
              />
              {!task && (
                <div
                  className="absolute top-0 left-0 px-4 py-3 text-muted-foreground pointer-events-none transition-opacity duration-700 ease-in-out"
                  style={{ opacity: placeholderVisible ? 1 : 0 }}
                >
                  e.g. {placeholderExamples[placeholderIndex]}
                </div>
              )}
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={loading || !task.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold py-3 px-6 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="transition-opacity duration-400 ease-in-out" style={{ opacity: loadingTextVisible ? 1 : 0 }}>
                    {loadingText}
                  </span>
                </>
              ) : (
                "Analyze Task"
              )}
            </button>
          </div>

          {/* History on landing page */}
          <div className="w-full">
            <SearchHistory
              history={history}
              onHistoryChange={setHistory}
              onReview={handleReview}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Compact header bar */}
          <div className="flex items-center gap-4 w-full max-w-6xl mx-auto mb-6">
            <div className="flex items-center gap-2 shrink-0">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground tracking-tight">
                Automation Analyzer
              </span>
            </div>

            <div className="flex-1 flex items-center gap-2 max-w-xl">
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Describe a task..."
                className="flex-1 rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
              />
              <button
                onClick={() => handleSubmit()}
                disabled={loading || !task.trim()}
                className="shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground font-semibold py-2 px-4 text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {loading ? "..." : "Analyze"}
              </button>
            </div>
          </div>
          {/* Task summary title */}
          {currentLabel && (
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-foreground tracking-tight">{currentLabel}</h2>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Current task</span>
            </div>
          )}

          {/* Results area */}
          <div className="w-full max-w-6xl mx-auto space-y-6">
            {isFullResult ? (
              <div className="grid lg:grid-cols-[380px_1fr] gap-6">
                <ResultCard data={result} taskDescription={task} section="verdict" />
                <div className="space-y-6">
                  {taskPoints.length >= 2 ? (
                    <div className="rounded-xl bg-card border border-border gradient-border p-6 space-y-4 animate-fade-up">
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">
                        Effort vs Impact Matrix
                      </h3>
                      <EffortImpactMatrix tasks={taskPoints} activeLabel={currentLabel} />
                    </div>
                  ) : (
                    <div className="rounded-xl bg-card border border-border gradient-border p-6 flex items-center justify-center text-muted-foreground text-sm animate-fade-up">
                      Analyze 2+ tasks to see the Effort vs Impact matrix
                    </div>
                  )}
                  <ResultCard data={result} taskDescription={task} section="details" />
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <ResultCard data={result} taskDescription={task} section="all" />
                {taskPoints.length >= 2 && (
                  <div className="mt-6 rounded-xl bg-card border border-border gradient-border p-6 space-y-4 animate-fade-up">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">
                      Effort vs Impact Matrix
                    </h3>
                      <EffortImpactMatrix tasks={taskPoints} activeLabel={currentLabel} />
                  </div>
                )}
              </div>
            )}

            {/* History below results */}
            <SearchHistory
              history={history}
              onHistoryChange={setHistory}
              onReview={handleReview}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
