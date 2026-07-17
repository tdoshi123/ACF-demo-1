"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, CircleDollarSign } from "lucide-react";
import AppShell from "@/components/AppShell";
import SectionCard from "@/components/SectionCard";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { formatCurrency } from "@/lib/calculations";
import { getProgramById, type Program } from "@/lib/programs";
import { StorageKeys, readJSON, writeJSON } from "@/lib/storage";
import { splitIncome } from "@/lib/tracking";
import type { IncomeEvent, IncomeSplit } from "@/lib/types";

type SplitKey = keyof Omit<IncomeSplit, "retainedTotal">;

interface SplitRow {
  key: SplitKey;
  /** Matching decimal field on `Program`. */
  programKey: keyof Pick<
    Program,
    "taxes" | "lifestyleCap" | "emergency" | "investing" | "kids"
  >;
  label: string;
  hint: string;
  tone: "muted" | "ink" | "green" | "gold";
  hideIfZero?: boolean;
}

const SPLIT_ROWS: SplitRow[] = [
  { key: "taxes", programKey: "taxes", label: "Taxes", hint: "Set aside immediately", tone: "muted" },
  { key: "lifestyle", programKey: "lifestyleCap", label: "Lifestyle", hint: "Spendable cap", tone: "ink" },
  { key: "emergency", programKey: "emergency", label: "Emergency", hint: "Untouchable", tone: "green" },
  { key: "investing", programKey: "investing", label: "Investing", hint: "Compounding", tone: "green" },
  { key: "kids", programKey: "kids", label: "Kids", hint: "Generational lock", tone: "gold", hideIfZero: true },
];

const QUICK_AMOUNTS = [500, 1500, 5000, 12500];

function todayInputValue(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function makeEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ie_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function toneDotClass(tone: SplitRow["tone"]): string {
  switch (tone) {
    case "green":
      return "bg-success";
    case "gold":
      return "bg-gold";
    case "ink":
      return "bg-ink";
    default:
      return "bg-ink-muted";
  }
}

export default function EnterCheckPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [program, setProgram] = useState<Program | null>(null);
  const [amount, setAmount] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState({ amount: false, date: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const programId = readJSON<string>(StorageKeys.program, "");
    setProgram(programId ? getProgramById(programId) : null);
    setReceivedDate(todayInputValue());
    setMounted(true);
  }, []);

  const numericAmount = Number(amount);
  const amountValid = Number.isFinite(numericAmount) && numericAmount > 0;
  const dateValid = Boolean(receivedDate);
  const hasProgram = Boolean(program);
  const formValid = amountValid && dateValid && hasProgram;

  const split = useMemo<IncomeSplit>(
    () => splitIncome(amountValid ? numericAmount : 0, program),
    [amountValid, numericAmount, program],
  );

  const retentionPct = program ? Math.round(program.retentionTarget * 100) : 0;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ amount: true, date: true });
    if (!formValid || !program || submitting) return;
    setSubmitting(true);

    const finalSplit = splitIncome(numericAmount, program);
    const trimmedNote = note.trim();
    const event: IncomeEvent = {
      id: makeEventId(),
      amount: numericAmount,
      programId: program.id,
      receivedDate,
      split: finalSplit,
      createdAt: new Date().toISOString(),
      ...(trimmedNote ? { note: trimmedNote } : {}),
    };

    const existing = readJSON<IncomeEvent[]>(StorageKeys.incomeEvents, []);
    writeJSON(StorageKeys.incomeEvents, [event, ...existing]);
    router.push("/dashboard");
  }

  return (
    <AppShell
      title="Enter Check"
      subtitle="Log the play. The split locks the moment the check lands."
    >
      {/* Top-of-page back control — no scroll required */}
      <div className="mb-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-bg-card/60 px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-white/20 hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {mounted && !hasProgram ? (
        <SectionCard
          eyebrow="Program required"
          title="No program selected yet"
          subtitle="Choose your program in onboarding before logging a check — the split can't be calculated without it."
          elevated
        >
          <PrimaryButton href="/onboarding">Finish choosing your program</PrimaryButton>
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
          {/* Form */}
          <div className="lg:col-span-3">
            <SectionCard
              eyebrow={program ? `Program · ${program.name}` : "New check"}
              title="Lock the split"
              subtitle={
                program
                  ? `${retentionPct}% retention target`
                  : "Enter the check details below."
              }
              elevated
            >
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Big amount input */}
                <div>
                  <label
                    htmlFor="amount"
                    className="text-xs font-medium text-ink-secondary"
                  >
                    Income amount (USD)
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-bg-card/70 px-4 focus-within:border-gold/40">
                    <CircleDollarSign className="h-6 w-6 shrink-0 text-gold" />
                    <input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      autoFocus
                      placeholder="0"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                      }
                      onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
                      className="score-num w-full bg-transparent py-4 text-3xl font-semibold tabular-nums text-ink outline-none placeholder:text-ink-muted"
                    />
                  </div>
                  {touched.amount && !amountValid && (
                    <p className="mt-1.5 text-xs text-danger">
                      Enter an amount greater than 0.
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setAmount(String(preset));
                          setTouched((t) => ({ ...t, amount: true }));
                        }}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-ink-secondary transition-colors hover:border-gold/30 hover:text-gold"
                      >
                        +{formatCurrency(preset)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Received date */}
                <div>
                  <label
                    htmlFor="receivedDate"
                    className="text-xs font-medium text-ink-secondary"
                  >
                    Date received
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-bg-card/70 px-4 focus-within:border-gold/40">
                    <CalendarClock className="h-4 w-4 shrink-0 text-gold" />
                    <input
                      id="receivedDate"
                      type="date"
                      value={receivedDate}
                      max={todayInputValue()}
                      onChange={(e) => setReceivedDate(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, date: true }))}
                      className="w-full bg-transparent py-3 text-sm text-ink outline-none"
                    />
                  </div>
                  {touched.date && !dateValid && (
                    <p className="mt-1.5 text-xs text-danger">Pick a date.</p>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label
                    htmlFor="note"
                    className="text-xs font-medium text-ink-secondary"
                  >
                    Note <span className="text-ink-muted">(optional)</span>
                  </label>
                  <textarea
                    id="note"
                    rows={2}
                    placeholder="What was this check for?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-bg-card/70 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-gold/40"
                  />
                </div>

                <div className="h-px w-full bg-white/5" />

                <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <SecondaryButton href="/dashboard">Cancel</SecondaryButton>
                  <PrimaryButton
                    type="submit"
                    size="lg"
                    disabled={!formValid || submitting}
                  >
                    {submitting ? "Locking…" : "Log check & split"}
                  </PrimaryButton>
                </div>
              </form>
            </SectionCard>
          </div>

          {/* Live split preview */}
          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <SectionCard eyebrow="Auto split" title="Preview">
                <div>
                  <div className="text-eyebrow">Check amount</div>
                  <div
                    className={`score-num mt-1.5 text-4xl font-semibold tabular-nums ${
                      amountValid ? "text-ink" : "text-ink-muted"
                    }`}
                  >
                    {formatCurrency(amountValid ? numericAmount : 0)}
                  </div>
                  {program && (
                    <div className="mt-1.5 text-xs text-ink-secondary">
                      {program.name} · {retentionPct}% retention target
                    </div>
                  )}
                </div>

                <div className="my-5 h-px w-full bg-white/5" />

                <ul className="space-y-3">
                  {SPLIT_ROWS.map((row) => {
                    const value = split[row.key];
                    const programPct = program ? program[row.programKey] : 0;
                    if (row.hideIfZero && !(programPct > 0)) return null;
                    return (
                      <li
                        key={row.key}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              aria-hidden
                              className={`h-1.5 w-1.5 rounded-full ${toneDotClass(row.tone)}`}
                            />
                            <span className="text-sm font-medium text-ink">
                              {row.label}
                            </span>
                            <span className="score-num text-[10px] uppercase tracking-wider text-ink-muted">
                              {Math.round(programPct * 100)}%
                            </span>
                          </div>
                          <div className="ml-3.5 mt-0.5 text-[11px] text-ink-secondary">
                            {row.hint}
                          </div>
                        </div>
                        <div
                          className={`score-num text-right text-base font-semibold tabular-nums ${
                            amountValid ? "text-ink" : "text-ink-muted"
                          }`}
                        >
                          {formatCurrency(value)}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="my-5 h-px w-full bg-white/5" />

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-eyebrow text-success">Retained total</div>
                    <div className="mt-1 text-[11px] text-ink-secondary">
                      Emergency + Investing + Kids
                    </div>
                  </div>
                  <div
                    className={`score-num text-right text-2xl font-semibold tabular-nums ${
                      amountValid ? "text-success" : "text-ink-muted"
                    }`}
                  >
                    {formatCurrency(split.retainedTotal)}
                  </div>
                </div>

                {/* Allocation bar */}
                <div className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-bg-card ring-1 ring-inset ring-white/10">
                  {amountValid && (
                    <>
                      <SegBar value={split.taxes} total={numericAmount} className="bg-ink-muted" />
                      <SegBar value={split.lifestyle} total={numericAmount} className="bg-ink/70" />
                      <SegBar value={split.emergency} total={numericAmount} className="bg-success" />
                      <SegBar value={split.investing} total={numericAmount} className="bg-success/70" />
                      <SegBar value={split.kids} total={numericAmount} className="bg-gold/60" />
                    </>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-ink-muted">
                  <span>Tax · Lifestyle · Save · Invest</span>
                  <span>100%</span>
                </div>
              </SectionCard>
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  );
}

function SegBar({
  value,
  total,
  className = "",
}: {
  value: number;
  total: number;
  className?: string;
}) {
  if (!total || !value) return null;
  const pct = Math.max(0, Math.min(100, (value / total) * 100));
  return (
    <span
      className={`block h-full transition-[width] duration-500 ease-out ${className}`}
      style={{ width: `${pct}%` }}
    />
  );
}
