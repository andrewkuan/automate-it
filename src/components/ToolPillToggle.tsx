import { cn } from "@/lib/utils";

export type ToolSlug = "codewords" | "n8n" | "make" | "zapier";

interface Tool {
  slug: ToolSlug;
  label: string;
  color: string; // HSL values for the brand
  activeClass: string;
}

const TOOLS: Tool[] = [
  { slug: "codewords", label: "CodeWords", color: "262 83% 58%", activeClass: "bg-[hsl(262,83%,58%)] text-white border-[hsl(262,83%,58%)]" },
  { slug: "n8n", label: "n8n", color: "5 85% 55%", activeClass: "bg-[hsl(5,85%,55%)] text-white border-[hsl(5,85%,55%)]" },
  { slug: "make", label: "Make", color: "280 67% 50%", activeClass: "bg-[hsl(280,67%,50%)] text-white border-[hsl(280,67%,50%)]" },
  { slug: "zapier", label: "Zapier", color: "25 100% 50%", activeClass: "bg-[hsl(25,100%,50%)] text-white border-[hsl(25,100%,50%)]" },
];

interface ToolPillToggleProps {
  selected: ToolSlug[];
  onChange: (selected: ToolSlug[]) => void;
}

const ToolPillToggle = ({ selected, onChange }: ToolPillToggleProps) => {
  const toggle = (slug: ToolSlug) => {
    if (selected.includes(slug)) {
      // Don't allow deselecting the last one
      if (selected.length <= 1) return;
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-muted-foreground font-medium tracking-wide">
        Which tools do you use? <span className="text-muted-foreground/60">(select all that apply)</span>
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {TOOLS.map((tool) => {
          const isActive = selected.includes(tool.slug);
          return (
            <button
              key={tool.slug}
              type="button"
              onClick={() => toggle(tool.slug)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200",
                isActive
                  ? tool.activeClass
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              )}
            >
              {tool.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToolPillToggle;
