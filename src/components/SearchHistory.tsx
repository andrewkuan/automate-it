import { useState } from "react";
import { History, Trash2, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { HistoryEntry } from "@/types/analysis";
import { deleteFromHistory, clearHistory } from "@/lib/history";

interface SearchHistoryProps {
  history: HistoryEntry[];
  onHistoryChange: (history: HistoryEntry[]) => void;
  onReview: (entry: HistoryEntry) => void;
}

const SearchHistory = ({ history, onHistoryChange, onReview }: SearchHistoryProps) => {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteFromHistory(id);
    onHistoryChange(updated);
  };

  const handleClear = () => {
    clearHistory();
    onHistoryChange([]);
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const visible = expanded ? history : history.slice(0, 3);

  return (
    <div className="rounded-xl bg-card border border-border p-4 space-y-3 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">
            Search History
          </h3>
          <span className="text-xs text-muted-foreground">({history.length})</span>
        </div>
        <button
          onClick={handleClear}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-1.5">
        {visible.map((entry) => (
          <div
            key={entry.id}
            onClick={() => onReview(entry)}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-secondary/50 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className={`text-sm font-bold tabular-nums ${scoreColor(entry.result.automate_score)}`}>
                {entry.result.automate_score}
              </span>
              <span className="text-sm text-foreground truncate">{entry.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-muted-foreground">
                {new Date(entry.timestamp).toLocaleDateString()}
              </span>
              <button
                onClick={(e) => handleDelete(entry.id, e)}
                className="md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {history.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Show less" : `Show ${history.length - 3} more`}
        </button>
      )}
    </div>
  );
};

export default SearchHistory;
