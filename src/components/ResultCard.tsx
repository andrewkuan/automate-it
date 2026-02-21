import ScoreDial from "./ScoreDial";
import AIBar from "./AIBar";
import { Copy } from "lucide-react";
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
  const isLowScore = data.automate_score < 50;

  return (
    <div className="w-full animate-fade-up rounded-xl bg-card border border-border gradient-border p-6 md:p-8 space-y-8">
      <div className={isLowScore ? "flex justify-center" : "grid md:grid-cols-2 gap-8 items-center"}>
        <ScoreDial score={data.automate_score} />
        {!isLowScore && data.ai_needed_percent != null && (
          <div className="space-y-4">
            <AIBar percentage={data.ai_needed_percent} />
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Why
          </h3>
          <p className="text-secondary-foreground leading-relaxed">
            {data.why}
          </p>
        </div>
        {data.biggest_bottleneck && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Biggest Bottleneck
            </h3>
            <p className="text-secondary-foreground leading-relaxed">
              {data.biggest_bottleneck}
            </p>
          </div>
        )}
        {data.suggested_approach && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Suggested Approach
            </h3>
            <p className="text-secondary-foreground leading-relaxed">
              {data.suggested_approach}
            </p>
          </div>
        )}
        {data.time_to_build_hours != null && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Time to Build
            </h3>
            <p className="text-secondary-foreground leading-relaxed">
              {data.time_to_build_hours} hours
            </p>
          </div>
        )}
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
    </div>
  );
};

export default ResultCard;
