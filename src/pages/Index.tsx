import { useState, useEffect } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import ResultCard from "@/components/ResultCard";

interface ResultData {
  automate_score: number;
  ai_needed_percent: number;
  why: string;
  biggest_bottleneck: string;
  suggested_approach: string;
  time_to_build: string;
}

const API_URL = "https://runtime.codewords.ai/run/task_automation_analyzer_439ac03c";

const Index = () => {
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);

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
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: description }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      setResult(data);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-12 md:py-20">
      <div className="w-full max-w-2xl space-y-10">
        {/* Header */}
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

        {/* Input */}
        <div className="space-y-4">
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g. Every Monday I manually export a CSV from our CRM, clean the data in Excel, and upload it to Google Sheets for the sales team..."
            rows={5}
            className="w-full rounded-xl bg-card border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none transition-shadow gradient-border"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={loading || !task.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold py-3 px-6 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Task"
            )}
          </button>
        </div>

        {/* Result */}
        {result && <ResultCard data={result} taskDescription={task} />}
      </div>
    </div>
  );
};

export default Index;
