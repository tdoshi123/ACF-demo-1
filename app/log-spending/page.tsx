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
import { SPEND_CATEGORIES, getCategoryById } from "@/lib/categories";
import { StorageKeys, readJSON, writeJSON } from "@/lib/storage";
import {
  calculateTotals,
  calculateLifestyleUsage,
  isLifestyleCapExceeded,
} from "@/lib/tracking";
import type { IncomeEvent, SpendingLog } from "@/lib/types";

const QUICK_AMOUNTS = [25, 60, 150, 400];

type SpendStatus = "safe" | "warn" | "danger" | "neutral";

function todayInputValue(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function makeLogId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function LogSpendingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<IncomeEvent[]>([]);
  const [logs, setLogs] = useState<SpendingLog[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(SPEND_CATEGORIES[0].id);
  const [spendDate, setSpendDate] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState({ amount: false, date: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setEvents(readJSON<IncomeEvent[]>(StorageKeys.incomeEvents, []));
    setLogs(readJSON<SpendingLog[]>(StorageKeys.spendingLogs, []));
    setSpendDate(todayInputValue());
    setMounted(true);
  }, []);

  const numericAmount = Number(amount);
  const amountValid = Number.isFinite(numericAmount) && numericAmount > 0;
  const dateValid = Boolean(spendDate);
  const formValid = amountValid && dateValid;

  const totals = useMemo(
    () => calculateTotals(events, logs),
    [events, logs],
  );
  const allocated = totals.totalLifestyleAllocated;
  const spent = totals.totalLifestyleSpent;

  const entryAmount = amountValid ? numericAmount : 0;
  const projectedSpent = spent + entryAmount;
  const currentUsagePct = calculateLifestyleUsage(spent, allocated);
  const projectedUsagePct = calculateLifestyleUsage(projectedSpent, allocated);
  const currentlyOver = isLifestyleCapExceeded(spent, allocated);
  const projectedOver = isLifestyleCapExceeded(projectedSpent, allocated);
  const noAllocation = allocated <= 0;

  const status: SpendStatus = noAllocation
    ? "neutral"
    : projectedOver
      ? "danger"
      : projectedUsagePct >= 85
        ? "warn"
        : "safe";

  const remainingAfter = Math.max(0, allocated - projectedSpent);
  const overBy = Math.max(0, projectedSpent - allocated);
  const selectedCategory = getCategoryById(category);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ amount: true, date: true });
    if (!formValid || submitting) return;
    setSubmitting(true);

    const trimmedNote = note.trim();
    const log: SpendingLog = {
      id: makeLogId(),
      amount: numericAmount,
      category,
      spendDate,
      createdAt: new Date().toISOString(),
      ...(trimmedNote ? { note: trimmedNote } : {}),
    };

    const existing = readJSON<SpendingLog[]>(StorageKeys.spendingLogs, []);
    writeJSON(StorageKeys.spendingLogs, [log, ...existing]);
    router.push("/dashboard");
  }

  return (
    <AppShell
      title="Log Spending"
      subtitle="Awareness is the rep. Tag where it went — the split shows whether it's fueling the work or leaking from it."
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <SectionCard
            eyebrow="New spend"
            title="Tag it & move"
            subtitle="Log the outflow. The lifestyle cap updates the moment you type."
            elevated
          >
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Big amount input */}
              <div>
                <label
                  htmlFor="amount"
                  className="text-xs font-medium text-ink-secondary"
                >
                  Amount (USD)
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

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-ink-secondary">
                  Category
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SPEND_CATEGORIES.map((c) => {
                    const active = category === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        aria-pressed={active}
                        className={[
                          "rounded-xl border px-3 py-3 text-left transition-colors duration-200",
                          "outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
                          active
                            ? "border-gold bg-bg-card text-gold"
                            : "border-white/10 bg-bg-card/70 text-ink hover:border-strong",
                        ].join(" ")}
                      >
                        <div className="score-num text-[11px] uppercase tracking-wider">
                          {c.label}
                        </div>
                        <div className="mt-1 text-[11px] text-ink-secondary">
                          {active ? "Selected" : "Tap"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spend date */}
              <div>
                <label
                  htmlFor="spendDate"
                  className="text-xs font-medium text-ink-secondary"
                >
                  Date
                </label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-bg-card/70 px-4 focus-within:border-gold/40">
                  <CalendarClock className="h-4 w-4 shrink-0 text-gold" />
                  <input
                    id="spendDate"
                    type="date"
                    value={spendDate}
                    max={todayInputValue()}
                    onChange={(e) => setSpendDate(e.target.value)}
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
                  placeholder="What was this for?"
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
                  {submitting ? "Logging…" : "Log spend"}
                </PrimaryButton>
              </div>
            </form>
          </SectionCard>
        </div>

        {/* Live lifestyle impact */}
        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <StatusPanel
              mounted={mounted}
              status={status}
              noAllocation={noAllocation}
              allocated={allocated}
              spent={spent}
              projectedSpent={projectedSpent}
              currentUsagePct={currentUsagePct}
              projectedUsagePct={projectedUsagePct}
              remainingAfter={remainingAfter}
              overBy={overBy}
              currentlyOver={currentlyOver}
              entryAmount={entryAmount}
              categoryLabel={selectedCategory?.label}
            />
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

interface StatusPanelProps {
  mounted: boolean;
  status: SpendStatus;
  noAllocation: boolean;
  allocated: number;
  spent: number;
  projectedSpent: number;
  currentUsagePct: number;
  projectedUsagePct: number;
  remainingAfter: number;
  overBy: number;
  currentlyOver: boolean;
  entryAmount: number;
  categoryLabel?: string;
}

interface StatusPalette {
  ring: string;
  dot: string;
  usage: string;
  headline: string;
  tone: string;
}

const STATUS_PALETTE: Record<SpendStatus, StatusPalette> = {
  safe: {
    ring: "border-success/40",
    dot: "bg-success",
    usage: "text-success",
    headline: "On pace",
    tone: "Inside the cap. Stay in rhythm.",
  },
  warn: {
    ring: "border-warning/40",
    dot: "bg-warning",
    usage: "text-warning",
    headline: "Approaching cap",
    tone: "Tight zone. Make this one count.",
  },
  danger: {
    ring: "border-danger/50",
    dot: "bg-danger",
    usage: "text-danger",
    headline: "Over the cap",
    tone: "This entry breaks the lifestyle cap.",
  },
  neutral: {
    ring: "border-white/10",
    dot: "bg-ink-muted",
    usage: "text-ink-muted",
    headline: "No lifestyle bucket",
    tone: "Log a check first to set your lifestyle cap.",
  },
};

function StatusPanel({
  mounted,
  status,
  noAllocation,
  allocated,
  spent,
  projectedSpent,
  currentUsagePct,
  projectedUsagePct,
  remainingAfter,
  overBy,
  currentlyOver,
  entryAmount,
  categoryLabel,
}: StatusPanelProps) {
  const palette = STATUS_PALETTE[status];
  const projectedBarPct = Math.min(100, projectedUsagePct);
  const currentBarPct = allocated > 0 ? Math.min(100, currentUsagePct) : 0;

  return (
    <SectionCard className={`transition-colors duration-200 ${palette.ring}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-eyebrow inline-flex items-center gap-2">
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${palette.dot}`}
          />
          {palette.headline}
        </span>
        <span className="text-eyebrow text-ink-muted">Lifestyle cap</span>
      </div>

      <p className="mt-3 text-sm text-ink-secondary">{palette.tone}</p>

      <div className="my-5 h-px w-full bg-white/5" />

      {/* Big headline number */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-eyebrow">Projected usage</div>
          <div
            className={`score-num mt-1.5 text-4xl font-semibold tabular-nums leading-none ${
              mounted ? palette.usage : "text-ink-muted"
            }`}
          >
            {mounted ? `${projectedUsagePct}%` : "—"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-eyebrow">
            {status === "danger" ? "Over by" : "Remaining after"}
          </div>
          <div
            className={`score-num mt-1.5 text-2xl font-semibold tabular-nums ${
              status === "danger" ? "text-danger" : "text-ink"
            }`}
          >
            {status === "danger"
              ? `−${formatCurrency(overBy)}`
              : formatCurrency(remainingAfter)}
          </div>
        </div>
      </div>

      {/* Stacked progress bar: current vs projected */}
      <div className="mt-5">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-bg-card ring-1 ring-inset ring-white/10">
          <div
            className={`absolute inset-y-0 left-0 opacity-50 transition-[width] duration-700 ease-out ${palette.dot}`}
            style={{ width: `${projectedBarPct}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-ink/80 transition-[width] duration-700 ease-out"
            style={{ width: `${currentBarPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-ink-muted">
          <span>Now {currentUsagePct}%</span>
          <span>Cap 100%</span>
        </div>
      </div>

      <div className="my-5 h-px w-full bg-white/5" />

      {/* Numeric rows */}
      <dl className="grid grid-cols-2 gap-y-3 text-sm">
        <Row label="Allocated" value={formatCurrency(allocated)} />
        <Row
          label="Currently spent"
          value={formatCurrency(spent)}
          tone={currentlyOver ? "danger" : "ink"}
        />
        <Row
          label="This entry"
          value={entryAmount > 0 ? `+${formatCurrency(entryAmount)}` : "—"}
          tone="muted"
          subLabel={categoryLabel}
        />
        <Row
          label="Projected spent"
          value={formatCurrency(projectedSpent)}
          tone={
            status === "danger"
              ? "danger"
              : status === "warn"
                ? "warning"
                : status === "safe"
                  ? "success"
                  : "muted"
          }
          bold
        />
      </dl>

      {status === "danger" && (
        <div className="mt-5 rounded-2xl border border-danger/50 bg-danger/10 p-4">
          <div className="text-eyebrow text-danger">Warning · cap exceeded</div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink">
            Logging this spend pushes lifestyle{" "}
            <span className="score-num font-semibold text-danger">
              {formatCurrency(overBy)}
            </span>{" "}
            past your cap. The system won&apos;t stop you — only you can.
          </p>
        </div>
      )}

      {noAllocation && (
        <p className="mt-5 text-xs text-ink-secondary">
          No checks yet, so there&apos;s no lifestyle envelope to measure
          against. Spending will still save.
        </p>
      )}
    </SectionCard>
  );
}

function Row({
  label,
  value,
  tone = "ink",
  bold = false,
  subLabel,
}: {
  label: string;
  value: string;
  tone?: "ink" | "muted" | "success" | "warning" | "danger";
  bold?: boolean;
  subLabel?: string;
}) {
  const toneClass =
    tone === "danger"
      ? "text-danger"
      : tone === "warning"
        ? "text-warning"
        : tone === "success"
          ? "text-success"
          : tone === "muted"
            ? "text-ink-secondary"
            : "text-ink";
  return (
    <>
      <dt className="text-eyebrow self-center">
        {label}
        {subLabel ? (
          <span className="ml-2 normal-case tracking-normal text-ink-muted">
            · {subLabel}
          </span>
        ) : null}
      </dt>
      <dd
        className={`score-num self-center text-right tabular-nums ${
          bold ? "text-base font-semibold" : "text-sm"
        } ${toneClass}`}
      >
        {value}
      </dd>
    </>
  );
}
