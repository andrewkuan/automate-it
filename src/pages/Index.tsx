import { useState, useEffect } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import ResultCard from "@/components/ResultCard";
import EffortImpactMatrix from "@/components/EffortImpactMatrix";
import { supabase } from "@/integrations/supabase/client";

interface ResultData {
  automate_score: number;
  ai_needed_percent: number;
  why: string;
  biggest_bottleneck: string;
  suggested_approach: string;
  time_to_build_hours: number;
  tools_required?: (string | { name: string; purpose?: string })[];
  codewords_prompt?: string;
  recommended_tool?: string;
  recommendation_reason?: string;
  workflow_steps?: { node_name: string; node_type: "trigger" | "action" | "condition" | "ai"; tool: string; description: string }[];
  effort_score?: number;
  impact_score?: number;
}

interface TaskPoint {
  label: string;
  effort: number;
  impact: number;
}

const placeholderExamples = [
  "Every Monday I manually export a CSV from our CRM, clean the data in Excel, and upload it to Google Sheets for the sales team...",
  "I spend 30 minutes each day copying invoice data from emails into our accounting software...",
  "Each week I manually check 50+ websites for price changes and update a spreadsheet...",
  "I have a 30 minute call with each new client to understand their business before we start working together.",
  "Every morning I compile reports from three different tools and send a summary email to the team...",
];

const Index = () => {
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [taskPoints, setTaskPoints] = useState<TaskPoint[]>(() => {
    try {
      const stored = sessionStorage.getItem("effort-impact-tasks");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loadingText, setLoadingText] = useState("Analyzing...");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  useEffect(() => {
    if (task) return;
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
        setPlaceholderVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [task]);

  useEffect(() => {
    if (!loading) {
      setLoadingText("Analyzing...");
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
      i = (i + 1) % phrases.length;
      setLoadingText(phrases[i]);
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
      const { data, error } = await supabase.functions.invoke("analyze-task", {
        body: { task: description },
      });

      if (error) throw error;
      setResult(data);

      if (data.effort_score != null && data.impact_score != null) {
        const label = description.split(/\s+/).slice(0, 4).join(" ");
        setTaskPoints((prev) => {
          const updated = [...prev, { label, effort: data.effort_score, impact: data.impact_score }];
          sessionStorage.setItem("effort-impact-tasks", JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasResult = !!result;
  const isFullResult = hasResult && result.automate_score >= 50;

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 py-6 md:py-10">
      {/* Header — collapses when result exists */}
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

          {/* Full-size input */}
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
                  className="absolute top-0 left-0 px-4 py-3 text-muted-foreground pointer-events-none transition-opacity duration-400 ease-in-out"
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
                  <span key={loadingText} className="animate-fade-in">
                    {loadingText}
                  </span>
                </>
              ) : (
                "Analyze Task"
              )}
            </button>
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

            {/* Compact input */}
            <div className="flex-1 flex items-center gap-2 max-w-xl">
              <button
                onClick={() => handleSubmit()}
                disabled={loading || !task.trim()}
                className="shrink-0 flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground font-semibold py-2 px-4 text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {loading ? "..." : "Analyze"}
              </button>
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Describe a task..."
                className="flex-1 rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
              />
            </div>
          </div>

          {/* Results area */}
          <div className="w-full max-w-6xl mx-auto space-y-6">
            {isFullResult ? (
              <>
                {/* Two-column: left = verdict, right = matrix */}
                <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
                  {/* Left: core verdict sections */}
                  <ResultCard data={result} taskDescription={task} section="verdict" />

                  {/* Right: effort/impact matrix */}
                  {taskPoints.length >= 2 ? (
                    <div className="rounded-xl bg-card border border-border gradient-border p-6 space-y-4 animate-fade-up h-fit">
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">
                        Effort vs Impact Matrix
                      </h3>
                      <EffortImpactMatrix tasks={taskPoints} />
                    </div>
                  ) : (
                    <div className="rounded-xl bg-card border border-border gradient-border p-6 flex items-center justify-center text-muted-foreground text-sm animate-fade-up">
                      Analyze 2+ tasks to see the Effort vs Impact matrix
                    </div>
                  )}
                </div>

                {/* Below: remaining detail sections */}
                <ResultCard data={result} taskDescription={task} section="details" />
              </>
            ) : (
              /* Low-score: simple centered card */
              <div className="max-w-2xl mx-auto">
                <ResultCard data={result} taskDescription={task} section="all" />
                {taskPoints.length >= 2 && (
                  <div className="mt-6 rounded-xl bg-card border border-border gradient-border p-6 space-y-4 animate-fade-up">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">
                      Effort vs Impact Matrix
                    </h3>
                    <EffortImpactMatrix tasks={taskPoints} />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
