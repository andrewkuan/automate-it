import ScoreDial from "./ScoreDial";
import AIBar from "./AIBar";
import WorkflowBlueprint from "./WorkflowBlueprint";
import GenerateContentButton from "./GenerateContentButton";
import { toast } from "sonner";
import { ResultData } from "@/types/analysis";
import { ToolSlug } from "./ToolPillToggle";

interface ResultCardProps {
  data: ResultData;
  taskDescription: string;
  section: "verdict" | "details" | "all";
  selectedTools: ToolSlug[];
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
    {children}
  </h3>
);

const Divider = () => <div className="h-px bg-border" />;

const ResultCard = ({ data, taskDescription, section, selectedTools }: ResultCardProps) => {
  const isLowScore = data.automate_score < 50;
  const multipleToolsSelected = selectedTools.length > 1;
  const codewordsSelected = selectedTools.includes("codewords");
  const n8nSelected = selectedTools.includes("n8n");

  /* ── Verdict section: score, AI bar, why, bottleneck, approach ── */
  const renderVerdict = () => (
    <div className="space-y-6">
      <div className={isLowScore ? "flex justify-center" : "flex flex-col items-center gap-6"}>
        <ScoreDial score={data.automate_score} />
        {!isLowScore && data.ai_needed_percent != null && (
          <div className="space-y-4">
            <AIBar percentage={data.ai_needed_percent} />
          </div>
        )}
      </div>

      <Divider />

      <div className="space-y-6">
        <div>
          <SectionLabel>Why</SectionLabel>
          <p className="text-secondary-foreground leading-relaxed">{data.why}</p>
        </div>
        {data.biggest_bottleneck && (
          <div>
            <SectionLabel>Biggest Bottleneck</SectionLabel>
            <p className="text-secondary-foreground leading-relaxed">{data.biggest_bottleneck}</p>
          </div>
        )}
        {data.suggested_approach && (
          <div>
            <SectionLabel>Suggested Approach</SectionLabel>
            <p className="text-secondary-foreground leading-relaxed">{data.suggested_approach}</p>
          </div>
        )}
      </div>
    </div>
  );

  /* ── Details section ── */
  const renderDetails = () => {
    const sections: React.ReactNode[] = [];

    if (data.time_to_build_hours != null) {
      sections.push(
        <div key="time">
          <SectionLabel>Time to Build</SectionLabel>
          <p className="text-secondary-foreground leading-relaxed">{data.time_to_build_hours} hours</p>
        </div>
      );
    }

    // Only show recommended tool if multiple tools selected
    if (!isLowScore && data.recommended_tool && multipleToolsSelected) {
      sections.push(
        <div key="tool">
          <SectionLabel>Recommended Tool</SectionLabel>
          <span className="inline-flex items-center rounded-full bg-primary/15 text-primary px-3 py-1 text-sm font-semibold">
            {data.recommended_tool}
          </span>
          {data.recommendation_reason && (
            <p className="text-secondary-foreground leading-relaxed mt-2">{data.recommendation_reason}</p>
          )}
        </div>
      );
    }

    if (data.tools_required && data.tools_required.length > 0) {
      sections.push(
        <div key="tools">
          <SectionLabel>Tools You'll Need</SectionLabel>
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
      );
    }

    if (!isLowScore && data.workflow_steps && data.workflow_steps.length > 0) {
      sections.push(
        <div key="workflow">
          <SectionLabel>Workflow Blueprint</SectionLabel>
          <WorkflowBlueprint steps={data.workflow_steps} />
        </div>
      );
    }

    // CodeWords generate button (only if codewords selected)
    if (!isLowScore && codewordsSelected) {
      sections.push(
        <div key="codewords">
          <SectionLabel>Build This on CodeWords</SectionLabel>
          <GenerateContentButton
            label="Generate CodeWords Prompt"
            functionName="generate-codewords-prompt"
            taskDescription={taskDescription}
            workflowSteps={data.workflow_steps}
            responseKey="codewords_prompt"
            selectedTools={selectedTools}
          />
        </div>
      );
    }

    // n8n generate button (only if n8n selected)
    if (!isLowScore && n8nSelected) {
      sections.push(
        <div key="n8n">
          <SectionLabel>Build This in n8n</SectionLabel>
          <GenerateContentButton
            label="Generate n8n Workflow"
            functionName="generate-n8n-workflow"
            taskDescription={taskDescription}
            workflowSteps={data.workflow_steps}
            responseKey="workflow"
            selectedTools={selectedTools}
          />
        </div>
      );
    }

    if (sections.length === 0) return null;

    return (
      <div className="space-y-6">
        {sections.map((s, i) => (
          <div key={i}>
            {i > 0 && <Divider />}
            <div className={i > 0 ? "pt-6" : ""}>{s}</div>
          </div>
        ))}
      </div>
    );
  };

  /* ── Render based on section prop ── */
  if (section === "verdict") {
    return (
      <div className="w-full animate-fade-up rounded-xl bg-card border border-border gradient-border p-4 md:p-6 lg:p-8">
        {renderVerdict()}
      </div>
    );
  }

  if (section === "details") {
    const details = renderDetails();
    if (!details) return null;
    return (
      <div className="w-full animate-fade-up rounded-xl bg-card border border-border gradient-border p-4 md:p-6 lg:p-8">
        {details}
      </div>
    );
  }

  // section === "all" — low-score fallback
  return (
    <div className="w-full animate-fade-up rounded-xl bg-card border border-border gradient-border p-4 md:p-6 lg:p-8 space-y-8">
      {renderVerdict()}
      {renderDetails() && (
        <>
          <Divider />
          {renderDetails()}
        </>
      )}
    </div>
  );
};

export default ResultCard;
