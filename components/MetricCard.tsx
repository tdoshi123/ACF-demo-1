import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface MetricCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  accent?: "gold" | "blue" | "purple" | "green" | "neutral";
  trend?: {
    direction: "up" | "down" | "flat";
    label: string;
  };
  className?: string;
}

const accentMap: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  gold: "text-gold",
  blue: "text-needs",
  purple: "text-wants",
  green: "text-savings",
  neutral: "text-ink-secondary",
};

const accentBgMap: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  gold: "bg-gold/10",
  blue: "bg-needs/10",
  purple: "bg-wants/10",
  green: "bg-savings/10",
  neutral: "bg-white/5",
};

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "neutral",
  trend,
  className = "",
}: MetricCardProps) {
  return (
    <div
      className={`surface-card relative overflow-hidden p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-eyebrow">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            {value}
          </div>
        </div>
        {Icon && (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentBgMap[accent]}`}
          >
            <Icon className={`h-5 w-5 ${accentMap[accent]}`} />
          </div>
        )}
      </div>

      {(hint || trend) && (
        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-ink-secondary">
          {hint && <span>{hint}</span>}
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                trend.direction === "up"
                  ? "bg-success/10 text-success"
                  : trend.direction === "down"
                    ? "bg-danger/10 text-danger"
                    : "bg-white/5 text-ink-secondary"
              }`}
            >
              {trend.direction === "up" ? "▲" : trend.direction === "down" ? "▼" : "—"}
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default MetricCard;
