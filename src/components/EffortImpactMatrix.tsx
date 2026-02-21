import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
  ReferenceLine,
  Cell,
} from "recharts";

interface TaskPoint {
  label: string;
  effort: number;
  impact: number;
}

interface EffortImpactMatrixProps {
  tasks: TaskPoint[];
}

const QUADRANT_LABELS = [
  { x: 25, y: 85, text: "Quick Wins", color: "hsl(var(--primary))" },
  { x: 75, y: 85, text: "Big Projects", color: "hsl(45, 90%, 55%)" },
  { x: 25, y: 15, text: "Don't Bother", color: "hsl(var(--muted-foreground))" },
  { x: 75, y: 15, text: "Time Sinks", color: "hsl(0, 70%, 55%)" },
];

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="hsl(var(--primary))" opacity={0.85} />
      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        fontSize={10}
        fontWeight={600}
      >
        {payload.label}
      </text>
    </g>
  );
};

const EffortImpactMatrix = ({ tasks }: EffortImpactMatrixProps) => {
  return (
    <div className="w-full h-[320px] relative">
      {/* Quadrant labels */}
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis
            type="number"
            dataKey="effort"
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            stroke="hsl(var(--border))"
          >
            <Label
              value="Effort →"
              position="bottom"
              offset={10}
              style={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey="impact"
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            stroke="hsl(var(--border))"
          >
            <Label
              value="Impact →"
              angle={-90}
              position="insideLeft"
              offset={0}
              style={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
          </YAxis>
          <ReferenceLine x={50} stroke="hsl(var(--border))" strokeDasharray="4 4" />
          <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="4 4" />

          {/* Quadrant labels as reference dots with custom render */}
          {QUADRANT_LABELS.map((q) => (
            <ReferenceLine
              key={q.text}
              x={q.x}
              stroke="transparent"
              label={{
                value: q.text,
                position: q.y > 50 ? "top" : "bottom",
                fill: q.color,
                fontSize: 11,
                fontWeight: 600,
                opacity: 0.6,
              }}
              segment={[{ x: q.x, y: q.y }, { x: q.x, y: q.y }]}
            />
          ))}

          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
                  <p className="font-semibold text-foreground">{d.label}</p>
                  <p className="text-muted-foreground">
                    Effort: {d.effort} · Impact: {d.impact}
                  </p>
                </div>
              );
            }}
          />
          <Scatter data={tasks} shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EffortImpactMatrix;
