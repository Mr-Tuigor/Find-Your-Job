"use client";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

export function ScoreRing({
  score,
  size = 48,
  strokeWidth = 4,
  className = "",
  showLabel = true,
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "hsl(var(--score-green))";
    if (s >= 60) return "hsl(var(--score-yellow))";
    return "hsl(var(--score-red))";
  };

  const getTextColor = (s: number) => {
    if (s >= 80) return "text-emerald-400";
    if (s >= 60) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring-animated"
          style={{
            transition: "stroke-dashoffset 1.2s ease-out",
          }}
        />
      </svg>
      {showLabel && (
        <span
          className={`absolute text-xs font-bold ${getTextColor(score)}`}
          style={{ fontSize: size < 40 ? "0.6rem" : "0.75rem" }}
        >
          {score}%
        </span>
      )}
    </div>
  );
}
