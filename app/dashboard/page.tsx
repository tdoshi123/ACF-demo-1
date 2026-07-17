"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Pause,
  PiggyBank,
  Play,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import AppShell from "@/components/AppShell";
import BadgePill from "@/components/BadgePill";
import DisclaimerBox from "@/components/DisclaimerBox";
import PrimaryButton from "@/components/PrimaryButton";
import ProgressBar from "@/components/ProgressBar";
import SectionCard from "@/components/SectionCard";
import SecondaryButton from "@/components/SecondaryButton";
import {
  mockAthlete,
  mockBadges,
  mockDeposit,
  mockEducationModules,
  mockMonthlyIncome,
  mockPortfolioBalance,
  mockPortfolioGrowth,
  mockTotalContributed,
  portfolioByRisk,
} from "@/lib/mockData";
import {
  formatCurrency,
  overallEducationProgress,
  resolveAllocation,
  riskProfileLabel,
} from "@/lib/calculations";
import { getCategoryById } from "@/lib/categories";
import { StorageKeys, readJSON, writeJSON } from "@/lib/storage";
import { calculateTotals } from "@/lib/tracking";
import type {
  CustomAllocation,
  IncomeEvent,
  RiskProfile,
  SpendingLog,
} from "@/lib/types";
import type { ProgressMap } from "@/lib/calculations";

type Period = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

type ActivityView = "day" | "month";

type ActivityKind = "check" | "spend";

interface ActivityItem {
  id: string;
  kind: ActivityKind;
  amount: number;
  /** ISO date string (YYYY-MM-DD) the money moved. */
  date: string;
  /** Sort key: prefers createdAt, falls back to the entry date. */
  ts: number;
  title: string;
  note?: string;
  categoryLabel?: string;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState<boolean>(!mockDeposit.active);
  const [risk, setRisk] = useState<RiskProfile>("balanced");
  const [customAlloc, setCustomAlloc] = useState<CustomAllocation | null>(
    null,
  );
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [events, setEvents] = useState<IncomeEvent[]>([]);
  const [logs, setLogs] = useState<SpendingLog[]>([]);

  useEffect(() => {
    setPaused(readJSON<boolean>(StorageKeys.depositPaused, !mockDeposit.active));
    setRisk(readJSON<RiskProfile>(StorageKeys.risk, "balanced"));
    setCustomAlloc(
      readJSON<CustomAllocation | null>(StorageKeys.riskAllocation, null),
    );
    setProgressMap(readJSON<ProgressMap>(StorageKeys.educationProgress, {}));
    setEvents(readJSON<IncomeEvent[]>(StorageKeys.incomeEvents, []));
    setLogs(readJSON<SpendingLog[]>(StorageKeys.spendingLogs, []));
    setMounted(true);
  }, []);

  const portfolio = portfolioByRisk[risk];
  const allocation = resolveAllocation(risk, customAlloc);

  const educationPct = overallEducationProgress(
    mockEducationModules,
    progressMap,
  );
  const completedModules = mockEducationModules.filter(
    (m) => (progressMap[m.id] ?? m.defaultProgress) >= 100,
  ).length;

  const earnedBadges = mockBadges.filter(
    (b) => b.defaultProgress >= 100,
  ).length;

  function deleteEvent(id: string) {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      writeJSON(StorageKeys.incomeEvents, next);
      return next;
    });
  }

  function deleteLog(id: string) {
    setLogs((prev) => {
      const next = prev.filter((l) => l.id !== id);
      writeJSON(StorageKeys.spendingLogs, next);
      return next;
    });
  }

  const hasActivity = events.length > 0 || logs.length > 0;

  return (
    <AppShell
      title={`Welcome back, ${mockAthlete.firstName}`}
      subtitle={`${mockAthlete.sport} · ${mockAthlete.school} · ${mockMonthlyIncome.month}`}
      hideTitleOnMobile
      mobileGreeting
    >
      <div className="space-y-6">
        {/* ------- 1. Portfolio Value (main insight) ------- */}
        <PortfolioValueChart
          balance={mockPortfolioBalance}
          totalContributed={mockTotalContributed}
          growth={mockPortfolioGrowth}
        />

        {/* ------- 2. Portfolio Allocation ------- */}
        <SectionCard
          eyebrow="Portfolio allocation"
          title={portfolio.name}
          subtitle={`${riskProfileLabel(risk)} · ${portfolio.expectedReturn} · ${portfolio.volatility} volatility`}
          right={
            <SecondaryButton href="/portfolio" size="md">
              View portfolio
            </SecondaryButton>
          }
        >
          <div className="grid items-center gap-6 sm:grid-cols-2">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    dataKey="percent"
                    nameKey="label"
                    innerRadius={56}
                    outerRadius={96}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {allocation.map((slice) => (
                      <Cell key={slice.label} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number, name: string) => [`${v}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {allocation.map((slice) => (
                <div
                  key={slice.label}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-bg-card/60 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm text-ink-secondary">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: slice.color }}
                    />
                    {slice.label}
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {slice.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ------- 3. Education + Badges ------- */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            eyebrow="Education"
            title={`${educationPct}% complete`}
            subtitle="Keep building literacy alongside the deposits."
            right={
              <SecondaryButton href="/education" size="md">
                <BookOpen className="h-4 w-4" /> All modules
              </SecondaryButton>
            }
          >
            <ProgressBar value={educationPct} color="#D4AF37" height={8} />
            <div className="mt-2 text-[11px] text-ink-muted">
              {completedModules} of {mockEducationModules.length} modules
              complete
            </div>
            {/* Module preview is lower-priority on phones (3.4). */}
            <ul className="mt-4 hidden space-y-2.5 md:block">
              {mockEducationModules.slice(0, 3).map((m) => {
                const pct = progressMap[m.id] ?? m.defaultProgress;
                return (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-bg-card/60 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink">
                        {m.title}
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {m.category} · {m.estimatedMinutes} min
                      </div>
                    </div>
                    <BadgePill tone={pct >= 100 ? "success" : "muted"}>
                      {pct >= 100 ? "Done" : `${pct}%`}
                    </BadgePill>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          <SectionCard
            eyebrow="Badges"
            title="Discipline earned"
            subtitle={`${earnedBadges} of ${mockBadges.length} unlocked`}
            right={
              <BadgePill tone="gold" icon={<Award className="h-3 w-3" />}>
                Private
              </BadgePill>
            }
          >
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
              {mockBadges.slice(0, 8).map((b, i) => {
                const unlocked = b.defaultProgress >= 100;
                return (
                  <div
                    key={b.id}
                    title={b.label}
                    className={[
                      "flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center",
                      // Only the first row shows on phones (3.4); full set on sm+.
                      i >= 3 ? "hidden sm:flex" : "flex",
                      unlocked
                        ? "border-gold/30 bg-gold/[0.07]"
                        : "border-white/5 bg-bg-card/40 opacity-60",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        unlocked
                          ? "bg-gradient-gold text-[#0B1020]"
                          : "bg-white/5 text-ink-muted",
                      ].join(" ")}
                    >
                      <Award className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-[10px] font-medium leading-tight text-ink">
                      {b.label.replace(/ Complete| Badge/g, "")}
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              href="/education#badges"
              className="mt-4 inline-flex text-xs text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
            >
              View all badges →
            </Link>
          </SectionCard>
        </div>

        {/* ------- 4. Recent Activity ------- */}
        <RecentActivity
          mounted={mounted}
          hasActivity={hasActivity}
          events={events}
          logs={logs}
          onDeleteEvent={deleteEvent}
          onDeleteLog={deleteLog}
        />

        {/* ------- 5. Quick Actions ------- */}
        <SectionCard
          eyebrow="Quick actions"
          title="What do you want to do next?"
          subtitle="Every action is reversible. Discipline is built one button at a time."
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
            <ActionButton
              icon={<Plus className="h-4 w-4" />}
              label="Enter check"
              href="/enter-check"
            />
            <ActionButton
              icon={<Receipt className="h-4 w-4" />}
              label="Log spending"
              href="/log-spending"
            />
            <ActionButton
              icon={<Wallet className="h-4 w-4" />}
              label="Change recurring deposit"
              href="/settings"
            />
            <ActionButton
              icon={paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              label={paused ? "Resume deposit" : "Pause deposit"}
              href="/settings"
            />
            <ActionButton
              icon={<BookOpen className="h-4 w-4" />}
              label="View education"
              href="/education"
            />
            <ActionButton
              icon={<PiggyBank className="h-4 w-4" />}
              label="View portfolio"
              href="/portfolio"
            />
          </div>
        </SectionCard>

        <DisclaimerBox>
          All portfolio numbers shown — balance, growth, contributions — are
          mock data for demo purposes. This frontend MVP does not move real
          money.
        </DisclaimerBox>
      </div>
    </AppShell>
  );
}

/* ----------------------------------------------------------------------------
 * Pieces
 * -------------------------------------------------------------------------- */

const tooltipStyle = {
  background: "#0B1020",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#F8FAFC",
  fontSize: 12,
};

const PERIODS: Period[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

/**
 * Deterministic pseudo-random for stable mock chart data per period.
 */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/**
 * Generates a mock portfolio value series ending at `endValue`.
 * Each period has its own start value, point count, and noise profile.
 */
function generateSeries(
  period: Period,
  endValue: number,
): { i: number; value: number }[] {
  const config: Record<
    Period,
    { points: number; startValue: number; noise: number; seed: number }
  > = {
    "1D": { points: 48, startValue: endValue - 6, noise: 4, seed: 1 },
    "1W": { points: 56, startValue: endValue - 32, noise: 8, seed: 2 },
    "1M": { points: 60, startValue: endValue - 250, noise: 18, seed: 3 },
    "3M": { points: 90, startValue: endValue - 500, noise: 24, seed: 4 },
    "1Y": { points: 120, startValue: endValue - 900, noise: 28, seed: 5 },
    ALL: { points: 80, startValue: 0, noise: 14, seed: 6 },
  };

  const { points, startValue, noise, seed } = config[period];
  const rand = seeded(seed);
  const out: { i: number; value: number }[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const trend = startValue + (endValue - startValue) * t;
    const wobble = (rand() - 0.5) * 2 * noise * (1 - 0.6 * t);
    const v = i === points - 1 ? endValue : Math.max(0, trend + wobble);
    out.push({ i, value: Number(v.toFixed(2)) });
  }
  return out;
}

function PortfolioValueChart({
  balance,
  totalContributed,
  growth,
}: {
  balance: number;
  totalContributed: number;
  growth: number;
}) {
  const [period, setPeriod] = useState<Period>("ALL");

  const series = useMemo(() => generateSeries(period, balance), [period, balance]);

  const startValue = series[0]?.value ?? balance;
  const periodChange = balance - startValue;
  const periodPct = startValue > 0 ? (periodChange / startValue) * 100 : 0;
  const isUp = periodChange >= 0;
  const lineColor = isUp ? "#22C55E" : "#EF4444";

  const periodLabel: Record<Period, string> = {
    "1D": "Today",
    "1W": "Past week",
    "1M": "Past month",
    "3M": "Past 3 months",
    "1Y": "Past year",
    ALL: "All time",
  };

  return (
    <section className="surface-card overflow-hidden">
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="text-eyebrow">Portfolio value</div>
        <div className="mt-1 flex items-baseline gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {formatCurrency(balance)}
          </h2>
        </div>
        <div
          className={[
            "mt-1 inline-flex items-center gap-2 text-sm font-medium",
            isUp ? "text-success" : "text-danger",
          ].join(" ")}
        >
          {isUp ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>
            {isUp ? "+" : "−"}
            {formatCurrency(Math.abs(periodChange))}
          </span>
          <span className="text-ink-muted">
            ({isUp ? "+" : "−"}
            {Math.abs(periodPct).toFixed(2)}%)
          </span>
          <span className="text-ink-muted">· {periodLabel[period]}</span>
        </div>
      </div>

      <div className="mt-4 h-[260px] w-full sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={series}
            margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              cursor={{
                stroke: "rgba(255,255,255,0.2)",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
              contentStyle={tooltipStyle}
              labelFormatter={() => ""}
              formatter={(v: number) => [
                `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                "Value",
              ]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2.25}
              fill="url(#portfolioFill)"
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: lineColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-3 sm:px-6">
        <div className="flex items-center gap-1 text-xs">
          {PERIODS.map((p) => {
            const active = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={[
                  "rounded-lg px-2.5 py-1.5 font-semibold transition-colors",
                  active
                    ? "bg-white/10 text-ink"
                    : "text-ink-muted hover:text-ink",
                ].join(" ")}
              >
                {p}
              </button>
            );
          })}
        </div>
        <div className="hidden items-center gap-4 text-[11px] text-ink-muted md:flex">
          <span>
            Contributed{" "}
            <span className="text-ink-secondary">
              {formatCurrency(totalContributed)}
            </span>
          </span>
          <span>
            Growth{" "}
            <span className="text-success">+{formatCurrency(growth)}</span>
          </span>
        </div>
      </div>
    </section>
  );
}

/** Local YYYY-MM-DD for "today" (avoids UTC drift from toISOString). */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Local YYYY-MM prefix for the current month. */
function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Format a YYYY-MM-DD entry date as e.g. "Jul 13" in local time. */
function formatActivityDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function RecentActivity({
  mounted,
  hasActivity,
  events,
  logs,
  onDeleteEvent,
  onDeleteLog,
}: {
  mounted: boolean;
  hasActivity: boolean;
  events: IncomeEvent[];
  logs: SpendingLog[];
  onDeleteEvent: (id: string) => void;
  onDeleteLog: (id: string) => void;
}) {
  const [view, setView] = useState<ActivityView>("day");
  const [armedId, setArmedId] = useState<string | null>(null);

  const { items, totals } = useMemo(() => {
    const inView = (dateStr: string) =>
      view === "day"
        ? dateStr === todayKey()
        : Boolean(dateStr) && dateStr.startsWith(monthKey());

    const filteredEvents = events.filter((e) => inView(e.receivedDate));
    const filteredLogs = logs.filter((l) => inView(l.spendDate));

    const checkItems: ActivityItem[] = filteredEvents.map((e) => ({
      id: e.id,
      kind: "check",
      amount: e.amount,
      date: e.receivedDate,
      ts: Date.parse(e.createdAt ?? e.receivedDate) || 0,
      title: e.source?.trim() || "Check",
      note: e.note,
    }));

    const spendItems: ActivityItem[] = filteredLogs.map((l) => {
      const cat = getCategoryById(l.category);
      return {
        id: l.id,
        kind: "spend",
        amount: l.amount,
        date: l.spendDate,
        ts: Date.parse(l.createdAt ?? l.spendDate) || 0,
        title: l.note?.trim() || cat?.label || "Spend",
        categoryLabel: cat?.label ?? "Spend",
      };
    });

    return {
      items: [...checkItems, ...spendItems].sort((a, b) => b.ts - a.ts),
      totals: calculateTotals(filteredEvents, filteredLogs),
    };
  }, [events, logs, view]);

  function handleDelete(item: ActivityItem) {
    if (item.kind === "check") onDeleteEvent(item.id);
    else onDeleteLog(item.id);
    setArmedId(null);
  }

  return (
    <SectionCard
      eyebrow="Recent activity"
      title="Checks & spends"
      subtitle={
        view === "day" ? "What moved today." : "Month to date, newest first."
      }
      right={
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-bg-card/60 p-1 text-xs">
          {(["day", "month"] as ActivityView[]).map((v) => {
            const active = view === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setView(v);
                  setArmedId(null);
                }}
                className={[
                  "rounded-lg px-3 py-1.5 font-semibold capitalize transition-colors",
                  active
                    ? "bg-white/10 text-ink"
                    : "text-ink-muted hover:text-ink",
                ].join(" ")}
              >
                {v}
              </button>
            );
          })}
        </div>
      }
    >
      {!mounted ? (
        <div className="h-24 animate-pulse rounded-2xl border border-white/5 bg-bg-card/40" />
      ) : !hasActivity ? (
        <EmptyActivity />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <ActivityStat
              label="Checks in"
              value={formatCurrency(totals.totalIncome)}
              tone="success"
            />
            <ActivityStat
              label="Spent"
              value={formatCurrency(totals.totalLifestyleSpent)}
              tone="ink"
            />
            <ActivityStat
              label="Retained"
              value={formatCurrency(totals.totalRetained)}
              tone="gold"
            />
          </div>

          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 bg-bg-card/40 px-4 py-8 text-center text-sm text-ink-secondary">
              {view === "day"
                ? "Nothing logged today yet."
                : "Nothing logged this month yet."}
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {items.map((item) => (
                <ActivityRow
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  armed={armedId === item.id}
                  onArm={() => setArmedId(item.id)}
                  onCancel={() => setArmedId(null)}
                  onDelete={() => handleDelete(item)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function ActivityStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "ink" | "gold";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "gold"
        ? "text-gold"
        : "text-ink";
  return (
    <div className="rounded-2xl border border-white/5 bg-bg-card/60 px-3 py-2.5">
      <div className="text-eyebrow">{label}</div>
      <div
        className={`score-num mt-1 text-base font-semibold tabular-nums ${toneClass}`}
      >
        {value}
      </div>
    </div>
  );
}

function ActivityRow({
  item,
  armed,
  onArm,
  onCancel,
  onDelete,
}: {
  item: ActivityItem;
  armed: boolean;
  onArm: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const isCheck = item.kind === "check";
  return (
    <li className="flex items-center justify-between gap-3 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={[
              "score-num shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider",
              isCheck
                ? "border-success/30 bg-success/5 text-success"
                : "border-white/10 bg-bg-card/60 text-ink-muted",
            ].join(" ")}
          >
            {isCheck ? "Check" : item.categoryLabel}
          </span>
          <span className="truncate text-sm text-ink">{item.title}</span>
        </div>
        <div className="mt-1 text-[11px] text-ink-muted">
          {formatActivityDate(item.date)}
          {isCheck && item.note ? ` · ${item.note}` : ""}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span
          className={[
            "score-num text-right text-base font-semibold tabular-nums",
            isCheck ? "text-success" : "text-ink",
          ].join(" ")}
        >
          {isCheck ? "+" : "−"}
          {formatCurrency(item.amount)}
        </span>
        {armed ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-white/10 bg-bg-card/60 px-2.5 py-1 text-[11px] text-ink-secondary transition-colors hover:border-white/20 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-danger/40 bg-danger/15 px-2.5 py-1 text-[11px] font-semibold text-danger transition-colors hover:bg-danger/25"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onArm}
            aria-label="Delete entry"
            className="rounded-lg border border-white/10 bg-bg-card/60 p-1.5 text-ink-muted transition-colors hover:border-danger/30 hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-10 text-center">
      <span
        aria-hidden
        className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-bg-card/60 text-ink-muted"
      >
        <Receipt className="h-5 w-5" />
      </span>
      <div className="px-6">
        <p className="text-sm font-medium text-ink">No checks or spends yet.</p>
        <p className="mt-1 text-[13px] text-ink-secondary">
          Start with your first check — the split locks the moment it lands.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <PrimaryButton href="/enter-check">+ Enter Check</PrimaryButton>
        <SecondaryButton href="/log-spending">+ Log Spending</SecondaryButton>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-bg-card/70 px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-white/20 hover:bg-bg-elevated";
  if (href) {
    return (
      <Link href={href} className={className}>
        {icon}
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
      {label}
    </button>
  );
}
