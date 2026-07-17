"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CircleDollarSign,
  Pause,
  Play,
  Wallet,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import PrimaryButton from "@/components/PrimaryButton";
import ProgressBar from "@/components/ProgressBar";
import SecondaryButton from "@/components/SecondaryButton";
import SectionCard from "@/components/SectionCard";
import { mockDeposit, mockMonthlyIncome } from "@/lib/mockData";
import {
  buildPlan,
  determineDepositWarning,
  formatCurrency,
  monthlyDepositEquivalent,
} from "@/lib/calculations";
import { StorageKeys, readJSON, writeJSON } from "@/lib/storage";
import type { DepositFrequency } from "@/lib/types";

export default function RecurringDepositPage() {
  const [income, setIncome] = useState(mockMonthlyIncome.amount);
  const [depositAmount, setDepositAmount] = useState(mockDeposit.amount);
  const [frequency, setFrequency] = useState<DepositFrequency>(
    mockDeposit.frequency,
  );
  const [paused, setPaused] = useState<boolean>(!mockDeposit.active);
  const [savedToast, setSavedToast] = useState(false);
  const [pauseArmed, setPauseArmed] = useState(false);

  useEffect(() => {
    setIncome(readJSON<number>(StorageKeys.income, mockMonthlyIncome.amount));
    const savedDeposit = readJSON<{
      amount: number;
      frequency: DepositFrequency;
    } | null>(StorageKeys.deposit, null);
    if (savedDeposit) {
      setDepositAmount(savedDeposit.amount);
      setFrequency(savedDeposit.frequency);
    }
    setPaused(readJSON<boolean>(StorageKeys.depositPaused, !mockDeposit.active));
  }, []);

  const plan = useMemo(() => buildPlan(income), [income]);
  const monthlyEquivalent = useMemo(
    () => monthlyDepositEquivalent(depositAmount, frequency),
    [depositAmount, frequency],
  );
  const warning = determineDepositWarning(
    monthlyEquivalent,
    plan.savingsInvesting,
  );

  function save() {
    writeJSON(StorageKeys.income, income);
    writeJSON(StorageKeys.deposit, { amount: depositAmount, frequency });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  }

  function togglePause() {
    setPaused((p) => {
      const next = !p;
      writeJSON(StorageKeys.depositPaused, next);
      return next;
    });
    setPauseArmed(false);
  }

  return (
    <AppShell title="Recurring Deposit" minimalMobileHeader>
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
          eyebrow="Recurring deposit"
          title={`${formatCurrency(depositAmount)} / ${frequency}`}
          subtitle={`Monthly equivalent: ${formatCurrency(monthlyEquivalent)} · ${paused ? "Paused" : "Active"}`}
          right={
            pauseArmed ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPauseArmed(false)}
                  className="rounded-full border border-white/10 bg-bg-card/60 px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-white/20 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={togglePause}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    paused
                      ? "border-success/40 bg-success/15 text-success hover:bg-success/25"
                      : "border-warning/40 bg-warning/15 text-warning hover:bg-warning/25",
                  ].join(" ")}
                >
                  {paused ? "Confirm resume" : "Confirm pause"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPauseArmed(true)}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  paused
                    ? "border-success/30 bg-success/10 text-success hover:bg-success/15"
                    : "border-warning/30 bg-warning/10 text-warning hover:bg-warning/15",
                ].join(" ")}
              >
                {paused ? (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    Pause
                  </>
                )}
              </button>
            )
          }
        >
          <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
            <Field label="Monthly NIL income">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-bg-card/70 px-4">
                <CircleDollarSign className="h-5 w-5 text-gold" />
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value) || 0)}
                  className="w-full bg-transparent py-3 text-base font-semibold text-ink outline-none"
                />
                <span className="text-xs text-ink-muted">/ mo</span>
              </div>
            </Field>

            <Field label="Recurring deposit amount">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-bg-card/70 px-4">
                <Wallet className="h-5 w-5 text-gold" />
                <input
                  type="number"
                  min={0}
                  step={25}
                  value={depositAmount}
                  onChange={(e) =>
                    setDepositAmount(Number(e.target.value) || 0)
                  }
                  className="w-full bg-transparent py-3 text-base font-semibold text-ink outline-none"
                />
                <span className="text-xs text-ink-muted">/ {frequency}</span>
              </div>
            </Field>

            <Field label="Frequency">
              <div className="grid grid-cols-3 gap-2">
                {(["weekly", "biweekly", "monthly"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={[
                      "rounded-xl border px-3 py-2 text-sm capitalize transition-colors",
                      frequency === f
                        ? "border-gold/50 bg-gold/[0.08] text-ink"
                        : "border-white/10 bg-bg-card/60 text-ink-secondary hover:border-white/20 hover:text-ink",
                    ].join(" ")}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="20% ceiling vs monthly deposit">
              <div className="rounded-2xl border border-white/5 bg-bg-card/60 p-3 md:p-4">
                <div className="flex items-center justify-between text-xs text-ink-secondary">
                  <span>Monthly equivalent</span>
                  <span className="text-ink">
                    {formatCurrency(monthlyEquivalent)} /{" "}
                    {formatCurrency(plan.savingsInvesting)}
                  </span>
                </div>
                <ProgressBar
                  className="mt-2"
                  value={
                    plan.savingsInvesting > 0
                      ? (monthlyEquivalent / plan.savingsInvesting) * 100
                      : 0
                  }
                  color={warning.level === "over" ? "#EF4444" : "#D4AF37"}
                  height={8}
                />
                <div
                  className={[
                    "mt-3 rounded-xl border p-2.5 text-xs",
                    warning.level === "ok"
                      ? "border-success/25 bg-success/[0.07] text-success"
                      : warning.level === "over"
                        ? "border-danger/25 bg-danger/[0.07] text-danger"
                        : "border-warning/25 bg-warning/[0.07] text-warning",
                  ].join(" ")}
                >
                  <div className="font-semibold">{warning.title}</div>
                  <div className="text-ink-secondary">{warning.message}</div>
                </div>
              </div>
            </Field>
          </div>

          <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
            {savedToast && (
              <span className="self-center text-xs text-success">
                Saved locally
              </span>
            )}
            <SecondaryButton href="/settings">Cancel</SecondaryButton>
            <PrimaryButton onClick={save}>Save changes</PrimaryButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}

/* ===== */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-ink-secondary">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
