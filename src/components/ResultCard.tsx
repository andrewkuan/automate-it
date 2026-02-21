import ScoreDial from "./ScoreDial";
import AIBar from "./AIBar";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

interface ResultCardProps {
  data: ResultData;
  taskDescription: string;
}

const ResultCard = ({ data, taskDescription }: ResultCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const params = new URLSearchParams({ task: taskDescription });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { label: "Why", content: data.why },
    { label: "Biggest Bottleneck", content: data.biggest_bottleneck },
    { label: "Suggested Approach", content: data.suggested_approach },
    { label: "Time to Build", content: `${data.time_to_build_hours} hours` },
  ];

  return (
    <div className="w-full animate-fade-up rounded-xl bg-card border border-border gradient-border p-6 md:p-8 space-y-8">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <ScoreDial score={data.automate_score} />
        <div className="space-y-4">
          <AIBar percentage={data.ai_needed_percent} />
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.label}>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              {section.label}
            </h3>
            <p className="text-secondary-foreground leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      {data.tools_required && data.tools_required.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Tools You'll Need
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.tools_required.map((tool) => {
                const name = typeof tool === "string" ? tool : tool.name;
                return (
                  <span
                    key={name}
                    className="inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-sm font-medium"
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}

      {data.codewords_prompt && (
        <>
          <div className="h-px bg-border" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
              Build This on CodeWords
            </h3>
            <div className="relative rounded-lg bg-secondary/50 border border-border p-4 font-mono text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {data.codewords_prompt}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(data.codewords_prompt!);
                  toast.success("Prompt copied to clipboard!");
                }}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Copy className="w-3 h-3" />
                Copy Prompt
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-surface-hover transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Share Result"}
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
