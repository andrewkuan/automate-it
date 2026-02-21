import { useState, useEffect } from "react";
import { Loader2, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const loadingMessages = [
  "Waking up the robots...",
  "Teaching hamsters to code...",
  "Consulting the automation oracle...",
  "Bribing the API gods...",
  "Untangling spaghetti workflows...",
  "Asking ChatGPT to ask Gemini...",
  "Compiling hopes and dreams...",
  "Reticulating splines...",
  "Convincing nodes to cooperate...",
  "Negotiating with cloud servers...",
  "Warming up the flux capacitor...",
  "Downloading more RAM...",
  "Feeding the neural hamsters...",
  "Almost there... probably...",
  "Still faster than doing it manually!",
];

interface GenerateContentButtonProps {
  label: string;
  functionName: string;
  taskDescription: string;
  workflowSteps?: any[];
  responseKey: string;
  selectedTools?: string[];
}

const GenerateContentButton = ({
  label,
  functionName,
  taskDescription,
  workflowSteps,
  responseKey,
  selectedTools,
}: GenerateContentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % loadingMessages.length);
        setFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    setMsgIndex(Math.floor(Math.random() * loadingMessages.length));
    setFade(true);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { task: taskDescription, workflow_steps: workflowSteps, selected_tools: selectedTools },
      });
      if (error) throw error;
      const result = data?.[responseKey] 
        || Object.values(data || {}).find((v) => typeof v === "string") 
        || "No content generated.";
      setContent(result as string);
    } catch {
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (content) {
    return (
      <div className="relative rounded-lg bg-secondary/50 border border-border font-mono text-sm text-foreground leading-relaxed max-h-64 overflow-y-auto">
        <div className="sticky top-0 right-0 flex justify-end p-2 bg-gradient-to-b from-secondary/80 to-transparent z-10">
          <button
            onClick={() => {
              navigator.clipboard.writeText(content);
              toast.success("Copied to clipboard!");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </div>
        <div className="px-4 pb-4 whitespace-pre-wrap">{content}</div>
      </div>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-secondary/30 text-muted-foreground font-medium text-sm hover:text-foreground hover:bg-secondary/60 hover:border-muted-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[260px]"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {loading ? (
        <span
          className="transition-opacity duration-300 ease-in-out text-primary font-semibold"
          style={{ opacity: fade ? 1 : 0 }}
        >
          {loadingMessages[msgIndex]}
        </span>
      ) : (
        label
      )}
    </button>
  );
};

export default GenerateContentButton;
