interface AIBarProps {
  percentage: number;
}

const AIBarComponent = ({ percentage }: AIBarProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          AI Needed
        </p>
        <span className="text-sm font-mono font-semibold text-bar-fill">
          {percentage}%
        </span>
      </div>
      <div className="h-3 rounded-full bg-bar-track overflow-hidden">
        <div
          className="h-full rounded-full bg-bar-fill animate-bar-fill"
          style={{
            width: "0%",
            "--target-width": `${percentage}%`,
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
};

export default AIBarComponent;
