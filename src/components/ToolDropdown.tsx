import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolSlug } from "./ToolPillToggle";

interface Tool {
  slug: ToolSlug;
  label: string;
  activeClass: string;
  dotColor: string;
}

const TOOLS: Tool[] = [
  { slug: "codewords", label: "CodeWords", activeClass: "bg-[hsl(262,83%,58%)] text-white", dotColor: "bg-[hsl(262,83%,58%)]" },
  { slug: "n8n", label: "n8n", activeClass: "bg-[hsl(5,85%,55%)] text-white", dotColor: "bg-[hsl(5,85%,55%)]" },
  { slug: "make", label: "Make", activeClass: "bg-[hsl(280,67%,50%)] text-white", dotColor: "bg-[hsl(280,67%,50%)]" },
  { slug: "zapier", label: "Zapier", activeClass: "bg-[hsl(25,100%,50%)] text-white", dotColor: "bg-[hsl(25,100%,50%)]" },
];

interface ToolDropdownProps {
  selected: ToolSlug[];
  onChange: (selected: ToolSlug[]) => void;
}

const ToolDropdown = ({ selected, onChange }: ToolDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (slug: ToolSlug) => {
    if (selected.includes(slug)) {
      if (selected.length <= 1) return;
      onChange(selected.filter((s) => s !== slug));
    } else {
      onChange([...selected, slug]);
    }
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
      >
        <div className="flex -space-x-1">
          {selected.map((slug) => {
            const tool = TOOLS.find((t) => t.slug === slug);
            return tool ? <span key={slug} className={cn("w-2.5 h-2.5 rounded-full ring-1 ring-card", tool.dotColor)} /> : null;
          })}
        </div>
        <span className="hidden sm:inline">Tools</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 rounded-lg border border-border bg-card shadow-lg p-2 min-w-[180px] space-y-1 animate-fade-up">
          <p className="text-[10px] text-muted-foreground font-medium px-2 pb-1 uppercase tracking-wider">
            Select tools
          </p>
          {TOOLS.map((tool) => {
            const isActive = selected.includes(tool.slug);
            return (
              <button
                key={tool.slug}
                type="button"
                onClick={() => toggle(tool.slug)}
                className={cn(
                  "flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", isActive ? tool.dotColor : "bg-muted-foreground/30")} />
                {tool.label}
                {isActive && <span className="ml-auto text-xs text-primary">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ToolDropdown;
