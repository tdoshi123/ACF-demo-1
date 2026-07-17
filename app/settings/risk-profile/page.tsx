"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import AppShell from "@/components/AppShell";
import BadgePill from "@/components/BadgePill";
import SecondaryButton from "@/components/SecondaryButton";
import SectionCard from "@/components/SectionCard";
import AllocationEditor from "@/components/AllocationEditor";
import { portfolioByRisk } from "@/lib/mockData";
import {
  resolveAllocation,
  riskProfileLabel,
  sumSlicePercents,
} from "@/lib/calculations";
import { StorageKeys, readJSON, writeJSON } from "@/lib/storage";
import type {
  CustomAllocation,
  PortfolioSlice,
  RiskProfile,
} from "@/lib/types";

const RISK_PROFILE_ORDER: RiskProfile[] = [
  "conservative",
  "moderately_conservative",
  "balanced",
  "growth",
  "aggressive_growth",
];

export default function RiskProfilePage() {
  const [risk, setRisk] = useState<RiskProfile>("balanced");
  const [customAlloc, setCustomAlloc] = useState<CustomAllocation | null>(
    null,
  );
  const [draftAllocation, setDraftAllocation] = useState<PortfolioSlice[]>(
    portfolioByRisk.balanced.allocation,
  );

  useEffect(() => {
    const loadedRisk = readJSON<RiskProfile>(StorageKeys.risk, "balanced");
    setRisk(loadedRisk);
    const loadedCustomAlloc = readJSON<CustomAllocation | null>(
      StorageKeys.riskAllocation,
      null,
    );
    setCustomAlloc(loadedCustomAlloc);
    setDraftAllocation(resolveAllocation(loadedRisk, loadedCustomAlloc));
  }, []);

  const portfolio = portfolioByRisk[risk];
  const allocation = resolveAllocation(risk, customAlloc);

  function selectRisk(r: RiskProfile) {
    setRisk(r);
    writeJSON(StorageKeys.risk, r);
    // Picking a fresh preset supersedes a previous fine-tune; the editor
    // starts fresh from that preset's default slices.
    writeJSON<CustomAllocation | null>(StorageKeys.riskAllocation, null);
    setCustomAlloc(null);
    setDraftAllocation(portfolioByRisk[r].allocation.map((s) => ({ ...s })));
  }

  function updateAllocation(slices: PortfolioSlice[]) {
    setDraftAllocation(slices);
    const preset = portfolioByRisk[risk].allocation;
    const edited =
      sumSlicePercents(slices) === 100 &&
      JSON.stringify(slices) !== JSON.stringify(preset);
    const next: CustomAllocation | null = edited
      ? { baseRisk: risk, allocation: slices }
      : null;
    writeJSON<CustomAllocation | null>(StorageKeys.riskAllocation, next);
    setCustomAlloc(next);
  }

  function resetAllocation() {
    writeJSON<CustomAllocation | null>(StorageKeys.riskAllocation, null);
    setCustomAlloc(null);
    setDraftAllocation(portfolioByRisk[risk].allocation.map((s) => ({ ...s })));
  }

  return (
    <AppShell title="Risk Profile" minimalMobileHeader>
      <div className="mb-5">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-bg-card/60 px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-white/20 hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to More
        </Link>
      </div>

      <div className="space-y-6">
        <SectionCard
          eyebrow="Risk profile"
          title={`${riskProfileLabel(risk)} · ${portfolio.name}`}
          subtitle={portfolio.description}
          right={
            <BadgePill tone="gold" icon={<Shield className="h-3 w-3" />}>
              {portfolio.volatility} volatility
            </BadgePill>
          }
        >
          <div className="divide-y divide-white/5 md:grid md:gap-3 md:grid-cols-3 md:divide-y-0">
            <Row label="Expected return" value={portfolio.expectedReturn} />
            <Row label="Volatility" value={portfolio.volatility} />
            <Row
              label="Allocation"
              value={allocation
                .map((s) => `${s.label.split(" ")[0]} ${s.percent}%`)
                .join(" · ")}
            />
          </div>

          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/5">
            {allocation.map((slice) => (
              <div
                key={slice.label}
                style={{
                  width: `${slice.percent}%`,
                  background: slice.color,
                }}
              />
            ))}
          </div>

          <div className="mt-5">
            <div className="text-xs font-medium text-ink-secondary">
              Set your risk profile
            </div>
            <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
              {RISK_PROFILE_ORDER.map((r) => {
                const p = portfolioByRisk[r];
                const active = risk === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => selectRisk(r)}
                    aria-pressed={active}
                    className={[
                      "w-full rounded-xl border p-3.5 text-left transition-all",
                      active
                        ? "border-gold/40 bg-gold/[0.07] shadow-gold"
                        : "border-white/10 bg-bg-card/70 hover:border-white/20",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-eyebrow">{riskProfileLabel(r)}</div>
                        <div className="mt-1 text-sm font-semibold text-ink">
                          {p.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-ink-secondary">
                          {p.expectedReturn} · {p.volatility}
                        </div>
                      </div>
                      {active && <BadgePill tone="gold">Selected</BadgePill>}
                    </div>
                    <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-white/5">
                      {p.allocation.map((slice) => (
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
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-bg-card/60 p-4">
            <AllocationEditor
              allocation={draftAllocation}
              onChange={updateAllocation}
              onReset={resetAllocation}
            />
          </div>

          <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end">
            <SecondaryButton href="/onboarding">Retake quiz</SecondaryButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}

/* ===== */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 py-2.5 md:rounded-xl md:border md:border-white/5 md:bg-bg-card/60 md:p-3">
      <div className="text-[11px] uppercase tracking-wide text-ink-muted">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-medium text-ink">
        {value}
      </div>
    </div>
  );
}
