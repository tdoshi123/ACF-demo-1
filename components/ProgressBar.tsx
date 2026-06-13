import type { CSSProperties } from "react";

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  trackClassName?: string;
  className?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  rightLabel?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = "#D4AF37",
  trackClassName = "bg-white/5",
  className = "",
  height = 8,
  showLabel = false,
  label,
  rightLabel,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const trackStyle: CSSProperties = { height };
  const fillStyle: CSSProperties = {
    width: `${pct}%`,
    background: `linear-gradient(90deg, ${color}, ${color}CC)`,
    boxShadow: `0 0 18px -4px ${color}AA`,
  };

  return (
    <div className={className}>
      {(showLabel || label || rightLabel) && (
        <div className="mb-2 flex items-center justify-between text-xs text-ink-secondary">
          <span>{label}</span>
          <span className="font-medium text-ink">
            {rightLabel ?? `${Math.round(pct)}%`}
          </span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full ${trackClassName}`}
        style={trackStyle}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={fillStyle}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
