import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

export interface DisclaimerBoxProps {
  title?: string;
  children: ReactNode;
  tone?: "info" | "warning";
  className?: string;
}

export function DisclaimerBox({
  title = "Educational, not financial advice",
  children,
  tone = "info",
  className = "",
}: DisclaimerBoxProps) {
  const palette =
    tone === "warning"
      ? "border-warning/25 bg-warning/[0.06] text-warning"
      : "border-white/10 bg-white/[0.03] text-ink-secondary";

  return (
    <aside
      className={`flex gap-3 rounded-2xl border p-4 text-sm ${palette} ${className}`}
    >
      <ShieldAlert
        className={`mt-0.5 h-4 w-4 shrink-0 ${tone === "warning" ? "text-warning" : "text-ink-secondary"}`}
      />
      <div className="min-w-0">
        <div className="font-medium text-ink">{title}</div>
        <div className="mt-1 text-ink-secondary">{children}</div>
      </div>
    </aside>
  );
}

export default DisclaimerBox;
