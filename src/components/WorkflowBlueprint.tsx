import { useState } from "react";
import { Zap, Play, GitBranch, Brain } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkflowStep {
  node_name: string;
  node_type: "trigger" | "action" | "condition" | "ai";
  tool: string;
  description: string;
}

interface WorkflowBlueprintProps {
  steps: WorkflowStep[];
}

const nodeConfig: Record<string, { color: string; bg: string; border: string; Icon: React.ComponentType<{ className?: string }> }> = {
  trigger: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", Icon: Play },
  action: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", Icon: Zap },
  condition: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", Icon: GitBranch },
  ai: { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", Icon: Brain },
};

const WorkflowBlueprint = ({ steps }: WorkflowBlueprintProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {steps.map((step, i) => {
          const config = nodeConfig[step.node_type] || nodeConfig.action;
          const { Icon } = config;

          return (
            <div key={i} className="flex items-center shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex flex-col items-center gap-2 rounded-xl border ${config.border} ${config.bg} px-3 py-2 md:px-4 md:py-3 min-w-[100px] md:min-w-[120px] max-w-[160px] cursor-default transition-colors hover:brightness-125`}
                  >
                    <Icon className={`w-5 h-5 ${config.color}`} />
                    <span className="text-xs font-semibold text-foreground text-center leading-tight">
                      {step.node_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {step.tool}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[220px]">
                  <p className="text-xs">{step.description}</p>
                </TooltipContent>
              </Tooltip>

              {i < steps.length - 1 && (
                <svg width="32" height="20" viewBox="0 0 32 20" className="shrink-0 mx-0.5">
                  <line x1="0" y1="10" x2="24" y2="10" stroke="hsl(var(--border))" strokeWidth="2" />
                  <polygon points="24,5 32,10 24,15" fill="hsl(var(--muted-foreground))" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default WorkflowBlueprint;
