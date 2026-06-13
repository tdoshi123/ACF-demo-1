import type { ReactNode } from "react";

export type BadgeTone =
  | "gold"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

export interface BadgePillProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
}

const toneMap: Record<BadgeTone, string> = {
  gold: "bg-gold/15 text-gold border-gold/30",
  neutral: "bg-white/5 text-ink border-white/10",
  success: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/10 text-warning border-warning/25",
  danger: "bg-danger/10 text-danger border-danger/25",
  info: "bg-needs/10 text-needs border-needs/25",
  muted: "bg-white/[0.03] text-ink-muted border-white/5",
};

export function BadgePill({
  children,
  tone = "neutral",
  icon,
  className = "",
}: BadgePillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${toneMap[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

export default BadgePill;
