import { useState, useEffect } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import ResultCard from "@/components/ResultCard";
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
}

// API call proxied through edge function

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

        {/* Result */}
        {result && <ResultCard data={result} taskDescription={task} />}
      </div>
    </div>
  );
};

export default Index;
