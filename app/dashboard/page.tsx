"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CircleDollarSign,
  Pause,
  PiggyBank,
  Play,
  TrendingDown,
  TrendingUp,
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
import Modal from "@/components/Modal";
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
  buildPlan,
  formatCurrency,
  monthlyDepositEquivalent,
  overallEducationProgress,
  riskProfileLabel,
} from "@/lib/calculations";
import { StorageKeys, readJSON, writeJSON } from "@/lib/storage";
import type { DepositFrequency, RiskProfile } from "@/lib/types";
import type { ProgressMap } from "@/lib/calculations";

interface StoredDeposit {
  amount: number;
  frequency: DepositFrequency;
}

type Period = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

export default function DashboardPage() {
  const [income, setIncome] = useState<number>(mockMonthlyIncome.amount);
  const [deposit, setDeposit] = useState<StoredDeposit>({
    amount: mockDeposit.amount,
    frequency: mockDeposit.frequency,
  });
  const [paused, setPaused] = useState<boolean>(!mockDeposit.active);
  const [risk, setRisk] = useState<RiskProfile>("balanced");
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [showDepositModal, setShowDepositModal] = useState(false);

  useEffect(() => {
    setIncome(readJSON<number>(StorageKeys.income, mockMonthlyIncome.amount));
    const savedDeposit = readJSON<StoredDeposit | null>(
      StorageKeys.deposit,
      null,
    );
    if (savedDeposit) setDeposit(savedDeposit);
    setPaused(readJSON<boolean>(StorageKeys.depositPaused, !mockDeposit.active));
    setRisk(readJSON<RiskProfile>(StorageKeys.risk, "balanced"));
    setProgressMap(readJSON<ProgressMap>(StorageKeys.educationProgress, {}));
  }, []);

  const plan = useMemo(() => buildPlan(income), [income]);
  const portfolio = portfolioByRisk[risk];

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

  function togglePause() {
    setPaused((p) => {
      const next = !p;
      writeJSON(StorageKeys.depositPaused, next);
      return next;
    });
  }

  return (
    <AppShell
      title={`Welcome back, ${mockAthlete.firstName}`}
      subtitle={`${mockAthlete.sport} · ${mockAthlete.school} · ${mockMonthlyIncome.month}`}
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
                    data={portfolio.allocation}
                    dataKey="percent"
                    nameKey="label"
                    innerRadius={56}
                    outerRadius={96}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {portfolio.allocation.map((slice) => (
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
              {portfolio.allocation.map((slice) => (
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
            <ul className="mt-4 space-y-2.5">
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
              {mockBadges.slice(0, 8).map((b) => {
                const unlocked = b.defaultProgress >= 100;
                return (
                  <div
                    key={b.id}
                    title={b.label}
                    className={[
                      "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center",
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

        {/* ------- 4. Quick Actions ------- */}
        <SectionCard
          eyebrow="Quick actions"
          title="What do you want to do next?"
          subtitle="Every action is reversible. Discipline is built one button at a time."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ActionButton
              icon={<Wallet className="h-4 w-4" />}
              label="Change recurring deposit"
              onClick={() => setShowDepositModal(true)}
            />
            <ActionButton
              icon={paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              label={paused ? "Resume deposit" : "Pause deposit"}
              onClick={togglePause}
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

      <ChangeDepositModal
        open={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        deposit={deposit}
        savingsTarget={plan.savingsInvesting}
        onSave={(next) => {
          setDeposit(next);
          writeJSON(StorageKeys.deposit, next);
          setShowDepositModal(false);
        }}
      />
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
        <div className="flex items-center gap-4 text-[11px] text-ink-muted">
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

function ChangeDepositModal({
  open,
  onClose,
  deposit,
  savingsTarget,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  deposit: StoredDeposit;
  savingsTarget: number;
  onSave: (next: StoredDeposit) => void;
}) {
  const [amount, setAmount] = useState(deposit.amount);
  const [frequency, setFrequency] = useState<DepositFrequency>(
    deposit.frequency,
  );

  useEffect(() => {
    if (open) {
      setAmount(deposit.amount);
      setFrequency(deposit.frequency);
    }
  }, [open, deposit]);

  const monthly = monthlyDepositEquivalent(amount, frequency);
  const pct =
    savingsTarget > 0
      ? Math.min(150, Math.round((monthly / savingsTarget) * 100))
      : 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Recurring deposit"
      title="Change your recurring amount"
      subtitle="Stays inside your 20% savings/investing bucket from the 50/30/20 plan."
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton
            onClick={() => onSave({ amount, frequency })}
          >
            Save changes
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium text-ink-secondary">
            Amount (USD)
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-bg-card/70 px-4">
            <CircleDollarSign className="h-5 w-5 text-gold" />
            <input
              type="number"
              min={0}
              step={25}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full bg-transparent py-3 text-base font-semibold text-ink outline-none"
            />
            <span className="text-xs text-ink-muted">/ {frequency}</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-ink-secondary">
            Frequency
          </label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["weekly", "biweekly", "monthly"] as DepositFrequency[]).map(
              (f) => (
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
              ),
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-bg-card/70 p-4">
          <div className="flex items-center justify-between text-xs text-ink-secondary">
            <span>Monthly equivalent</span>
            <span className="text-ink">
              {formatCurrency(monthly)} of {formatCurrency(savingsTarget)}
            </span>
          </div>
          <ProgressBar
            className="mt-2"
            value={Math.min(100, pct)}
            color={pct > 100 ? "#EF4444" : "#D4AF37"}
            height={8}
          />
          <div className="mt-2 text-[11px] text-ink-muted">
            {pct}% of your 20% savings/investing bucket.
          </div>
        </div>
      </div>
    </Modal>
  );
}
