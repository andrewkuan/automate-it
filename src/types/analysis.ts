export interface ResultData {
  automate_score: number;
  ai_needed_percent: number;
  why: string;
  biggest_bottleneck: string;
  suggested_approach: string;
  time_to_build_hours: number;
  tools_required?: (string | { name: string; purpose?: string })[];
  codewords_prompt?: string;
  recommended_tool?: string;
  recommendation_reason?: string;
  workflow_steps?: {
    node_name: string;
    node_type: "trigger" | "action" | "condition" | "ai";
    tool: string;
    description: string;
  }[];
  effort_score?: number;
  impact_score?: number;
}

export interface HistoryEntry {
  id: string;
  task: string;
  label: string;
  result: ResultData;
  timestamp: number;
  generated_codewords?: string;
  generated_n8n?: string;
}

export interface TaskPoint {
  label: string;
  effort: number;
  impact: number;
}
