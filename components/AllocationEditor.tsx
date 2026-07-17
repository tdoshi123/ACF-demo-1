"use client";

import SecondaryButton from "@/components/SecondaryButton";
import { sumSlicePercents, summarizeAssetClasses } from "@/lib/calculations";
import type { PortfolioSlice } from "@/lib/types";

/**
 * Shared fine-tune editor for a preset's asset-class percentages. Used by
 * onboarding, Settings, and Portfolio — purely controlled by props, no
 * knowledge of `RiskProfile` or storage. Callers own state/persistence and
 * pass in their own draft allocation.
 *
 * Slices keep the exact labels + colors of the base preset; only percents
 * are editable here (no adding/removing/renaming asset classes).
 */
export interface AllocationEditorProps {
  allocation: PortfolioSlice[];
  onChange: (slices: PortfolioSlice[]) => void;
  onReset: () => void;
  showReset?: boolean;
}

export default function AllocationEditor({
  allocation,
  onChange,
  onReset,
  showReset = true,
}: AllocationEditorProps) {
  const total = sumSlicePercents(allocation);
  const valid = total === 100;
  const summary = summarizeAssetClasses(allocation);

  function updateSlice(index: number, percent: number) {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    const next = allocation.map((slice, i) =>
      i === index ? { ...slice, percent: clamped } : slice,
    );
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-medium text-ink-secondary">
          Fine-tune your allocation
        </div>
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
            valid
              ? "border-success/25 bg-success/[0.07] text-success"
              : "border-danger/25 bg-danger/[0.07] text-danger",
          ].join(" ")}
        >
          Total {total}%
        </span>
      </div>

      <div className="space-y-3">
        {allocation.map((slice, index) => (
          <div
            key={slice.label}
            className="rounded-xl border border-white/10 bg-bg-card/60 p-3.5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: slice.color }}
                />
                <span className="truncate text-sm font-medium text-ink">
                  {slice.label}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={slice.percent}
                  onChange={(e) =>
                    updateSlice(index, Number(e.target.value) || 0)
                  }
                  className="w-16 rounded-lg border border-white/10 bg-bg-card/80 px-2 py-1 text-right text-sm font-semibold text-ink outline-none focus:border-gold/40"
                />
                <span className="text-xs text-ink-muted">%</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={slice.percent}
              onChange={(e) => updateSlice(index, Number(e.target.value))}
              className="mt-3 w-full accent-gold"
            />
          </div>
        ))}
      </div>

      <div className="flex h-1.5 overflow-hidden rounded-full bg-white/5">
        {allocation.map((slice) => (
          <div
            key={slice.label}
            title={`${slice.label} ${slice.percent}%`}
            style={{
              width: `${slice.percent}%`,
              background: slice.color,
            }}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-ink-secondary">
          Stocks {summary.stocks}% · Bonds {summary.bonds}% · Cash{" "}
          {summary.cash}%
        </div>
        {showReset && (
          <SecondaryButton onClick={onReset} size="md">
            Reset to preset
          </SecondaryButton>
        )}
      </div>
    </div>
  );
}
