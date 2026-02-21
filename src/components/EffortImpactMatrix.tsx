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

const DOT_COLORS = [
  "hsl(200, 80%, 60%)",
  "hsl(150, 70%, 50%)",
  "hsl(280, 70%, 60%)",
  "hsl(30, 90%, 55%)",
  "hsl(340, 75%, 55%)",
  "hsl(60, 80%, 50%)",
  "hsl(180, 60%, 50%)",
  "hsl(220, 75%, 65%)",
];

const CustomDot = (props: any) => {
  const { cx, cy, fill } = props;
  return (
    <circle cx={cx} cy={cy} r={7} fill={fill} stroke="hsl(var(--background))" strokeWidth={2} opacity={0.9} />
  );
};

const EffortImpactMatrix = ({ tasks }: EffortImpactMatrixProps) => {
  return (
    <div className="w-full space-y-4">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              type="number"
              dataKey="effort"
              domain={[0, 100]}
              tick={false}
              axisLine={false}
              tickLine={false}
            >
              <Label
                value="Effort →"
                position="bottom"
                offset={0}
                style={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="impact"
              domain={[0, 100]}
              tick={false}
              axisLine={false}
              tickLine={false}
            >
              <Label
                value="Impact →"
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
            </YAxis>
            <ReferenceLine x={50} stroke="hsl(var(--border))" strokeDasharray="4 4" />
            <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="4 4" />

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
                const i = tasks.indexOf(d);
                const color = DOT_COLORS[i % DOT_COLORS.length];
                return (
                  <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
                    <p className="font-semibold text-foreground" style={{ color }}>{d.label}</p>
                    <p className="text-muted-foreground">
                      Effort: {d.effort} · Impact: {d.impact}
                    </p>
                  </div>
                );
              }}
            />
            <Scatter data={tasks} shape={<CustomDot />}>
              {tasks.map((_, i) => (
                <Cell key={i} fill={DOT_COLORS[i % DOT_COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: DOT_COLORS[i % DOT_COLORS.length] }}
            />
            <span className="text-xs text-muted-foreground">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EffortImpactMatrix;
