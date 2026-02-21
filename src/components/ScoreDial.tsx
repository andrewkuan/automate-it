interface ScoreDialProps {
  score: number;
}

const ScoreDialComponent = ({ score }: ScoreDialProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return "hsl(var(--primary))";
    if (s >= 40) return "hsl(45, 90%, 55%)";
    return "hsl(0, 70%, 55%)";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
        Automate Score
      </p>
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--dial-track))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className="animate-score-fill"
            style={{
              "--target-offset": `${offset}`,
            } as React.CSSProperties}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold font-mono"
            style={{ color: getColor(score) }}
          >
            {score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreDialComponent;
