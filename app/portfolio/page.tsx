"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppShell from "@/components/AppShell";
import BadgePill from "@/components/BadgePill";
import DisclaimerBox from "@/components/DisclaimerBox";
import SecondaryButton from "@/components/SecondaryButton";
import SectionCard from "@/components/SectionCard";
import {
  mockContributions,
  mockPortfolioBalance,
  mockPortfolioGrowth,
  mockTotalContributed,
  portfolioByRisk,
} from "@/lib/mockData";
import { holdingsForSlice } from "@/lib/holdings";
import { formatCurrency, riskProfileLabel } from "@/lib/calculations";
import { StorageKeys, readJSON, writeJSON } from "@/lib/storage";
import type { RiskProfile } from "@/lib/types";

const riskOrder: RiskProfile[] = [
  "conservative",
  "moderately_conservative",
  "balanced",
  "growth",
  "aggressive_growth",
];

/**
 * Build a color-code legend from every unique asset class used across all
 * risk profiles, so the legend stays in sync with portfolio data.
 */
const assetClassLegend: { label: string; color: string }[] = (() => {
  const map = new Map<string, string>();
  for (const r of riskOrder) {
    for (const slice of portfolioByRisk[r].allocation) {
      if (!map.has(slice.label)) map.set(slice.label, slice.color);
    }
  }
  return Array.from(map.entries()).map(([label, color]) => ({ label, color }));
})();

export default function PortfolioPage() {
  const [selected, setSelected] = useState<RiskProfile>("balanced");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSelected(readJSON<RiskProfile>(StorageKeys.risk, "balanced"));
    setHydrated(true);
  }, []);

  const portfolio = portfolioByRisk[selected];

  const growthPct = useMemo(() => {
    if (mockTotalContributed <= 0) return 0;
    return Math.round((mockPortfolioGrowth / mockTotalContributed) * 1000) / 10;
  }, []);

  const isUp = mockPortfolioGrowth >= 0;

  const balanceVsContributions = useMemo(() => {
    const total = mockContributions.length;
    return mockContributions.map((c, i) => {
      const t = (i + 1) / total;
      const balance = c.cumulative + Math.round(mockPortfolioGrowth * t);
      return {
        date: c.date,
        contributions: c.cumulative,
        balance,
      };
    });
  }, []);

  function selectProfile(r: RiskProfile) {
    setSelected(r);
    writeJSON(StorageKeys.risk, r);
  }

  return (
    <AppShell
      title="Portfolio"
      subtitle="Your model portfolio, holdings, and contribution history."
    >
      <div className="space-y-6">
        <MockBanner />

        {/* ------- 1. MAIN: Allocation w/ total balance + pie chart ------- */}
        <SectionCard
          eyebrow="Allocation"
          title={portfolio.name}
          subtitle={portfolio.description}
          right={
            <BadgePill tone="gold" icon={<Target className="h-3 w-3" />}>
              {hydrated ? riskProfileLabel(selected) : "—"}
            </BadgePill>
          }
        >
          {/* Total balance */}
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <div className="text-eyebrow">Total balance</div>
              <div className="mt-1 flex items-baseline gap-3">
                <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {formatCurrency(mockPortfolioBalance)}
                </h2>
                <span
                  className={[
                    "inline-flex items-center gap-1 text-sm font-medium",
                    isUp ? "text-success" : "text-danger",
                  ].join(" ")}
                >
                  {isUp ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {isUp ? "+" : "−"}
                  {formatCurrency(Math.abs(mockPortfolioGrowth))}
                  <span className="text-ink-muted">
                    ({isUp ? "+" : "−"}
                    {Math.abs(growthPct).toFixed(1)}%)
                  </span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-ink-muted">
              <div>
                <div>Contributed</div>
                <div className="text-sm font-semibold text-ink">
                  {formatCurrency(mockTotalContributed)}
                </div>
              </div>
              <div>
                <div>Mock growth</div>
                <div className="text-sm font-semibold text-success">
                  +{formatCurrency(mockPortfolioGrowth)}
                </div>
              </div>
            </div>
          </div>

          {/* Hero pie chart + asset-class legend */}
          <div className="mt-6 grid items-center gap-8 lg:grid-cols-2">
            <div className="relative mx-auto h-[360px] w-full max-w-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolio.allocation}
                    dataKey="percent"
                    nameKey="label"
                    innerRadius={92}
                    outerRadius={158}
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
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                  {portfolio.name}
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                  {formatCurrency(mockPortfolioBalance)}
                </div>
                <div className="mt-0.5 text-[11px] text-ink-muted">
                  across {portfolio.allocation.length} asset classes
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {portfolio.allocation.map((slice) => {
                const sliceValue =
                  mockPortfolioBalance * (slice.percent / 100);
                return (
                  <div
                    key={slice.label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-bg-card/60 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ background: slice.color }}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-ink">
                          {slice.label}
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {formatCurrency(sliceValue)}
                        </div>
                      </div>
                    </div>
                    <div className="text-base font-semibold text-ink">
                      {slice.percent}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* ------- 1b. Holdings drill-down (links to /portfolio/[ticker]) ------- */}
        <SectionCard
          eyebrow="Holdings"
          title="What's inside each asset class"
          subtitle="Tap a ticker to open its full asset page."
        >
          <div className="space-y-4">
            {portfolio.allocation.map((slice) => {
              const holdings = holdingsForSlice(slice.label);
              const sliceValue = mockPortfolioBalance * (slice.percent / 100);
              return (
                <div
                  key={slice.label}
                  className="rounded-2xl border border-white/5 bg-bg-card/40"
                >
                  <div className="flex items-center justify-between gap-3 px-4 pt-3.5">
                    <div className="flex items-center gap-2.5 text-sm">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: slice.color }}
                      />
                      <span className="font-semibold text-ink">
                        {slice.label}
                      </span>
                      <span className="text-ink-muted">
                        · {slice.percent}%
                      </span>
                    </div>
                    <span className="text-xs font-medium text-ink-secondary">
                      {formatCurrency(sliceValue)}
                    </span>
                  </div>

                  {holdings.length === 0 ? (
                    <div className="px-4 pb-3.5 pt-2 text-xs text-ink-muted">
                      No holdings configured.
                    </div>
                  ) : (
                    <ul className="mt-2 divide-y divide-white/5">
                      {holdings.map((h) => {
                        const holdingValue = sliceValue * h.weight;
                        const shares =
                          h.price > 0 ? holdingValue / h.price : 0;
                        const up = h.changePct >= 0;
                        return (
                          <li key={h.ticker}>
                            <Link
                              href={`/portfolio/${h.ticker}`}
                              className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
                                  style={{
                                    color: slice.color,
                                    background: `${slice.color}1A`,
                                  }}
                                >
                                  {h.ticker.slice(0, 4)}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                                    {h.ticker}
                                    <span className="truncate text-[11px] font-normal text-ink-muted">
                                      {h.name}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-ink-muted">
                                    {shares.toFixed(3)} shares ·{" "}
                                    {formatCurrency(holdingValue)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-3">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-ink">
                                    ${h.price.toFixed(2)}
                                  </div>
                                  <div
                                    className={[
                                      "text-[11px] font-medium",
                                      up ? "text-success" : "text-danger",
                                    ].join(" ")}
                                  >
                                    {up ? "+" : ""}
                                    {h.changePct.toFixed(2)}%
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-ink-muted" />
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ------- 2. Risk profile (left) + Balance/Contribution charts stacked (right) ------- */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Risk profile vertical list w/ color legend */}
          <SectionCard
            eyebrow="Risk profile"
            title="Pick the structure that fits"
            subtitle="No stock picking. No timing. Choose a model and let it work."
          >
            <div className="space-y-2.5">
              {riskOrder.map((r) => {
                const p = portfolioByRisk[r];
                const active = selected === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => selectProfile(r)}
                    className={[
                      "w-full rounded-xl border p-3.5 text-left transition-all",
                      active
                        ? "border-gold/40 bg-gold/[0.07] shadow-gold"
                        : "border-white/10 bg-bg-card/70 hover:border-white/20",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-eyebrow">
                          {riskProfileLabel(r)}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-ink">
                          {p.name}
                        </div>
                        <div className="mt-0.5 text-[11px] text-ink-secondary">
                          {p.expectedReturn} · {p.volatility}
                        </div>
                      </div>
                      {active && hydrated && (
                        <BadgePill tone="gold">Selected</BadgePill>
                      )}
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

            {/* Color code legend */}
            <div className="mt-4 rounded-xl border border-white/5 bg-bg-card/40 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Color code
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-ink-secondary">
                {assetClassLegend.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Right: stacked charts that grow to match the left card height */}
          <div className="grid h-full grid-rows-2 gap-6">
            <SectionCard
              className="flex flex-col"
              bodyClassName="flex flex-1 flex-col"
              eyebrow="Balance vs contributions"
              title="Money in vs money now"
              subtitle="The gap between the two lines is your mock growth."
              right={
                <BadgePill
                  tone="success"
                  icon={<TrendingUp className="h-3 w-3" />}
                >
                  +{formatCurrency(mockPortfolioGrowth)}
                </BadgePill>
              }
            >
              <div className="min-h-[180px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={balanceVsContributions}
                  margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "rgba(255,255,255,0.15)",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                    contentStyle={tooltipStyle}
                    formatter={(v: number, name: string) => [
                      `$${v.toLocaleString()}`,
                      name,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="contributions"
                    name="Contributions"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#3B82F6", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Balance"
                    stroke="#22C55E"
                    strokeWidth={2.25}
                    dot={{ r: 3, fill: "#22C55E", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

            <SectionCard
              className="flex flex-col"
              bodyClassName="flex flex-1 flex-col"
              eyebrow="Contribution history"
              title="Six months of recurring deposits"
              subtitle="Building the habit one month at a time."
            >
              <div className="min-h-[180px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockContributions}
                  margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(212,175,55,0.08)" }}
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [`$${v}`, "Contribution"]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#D4AF37"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* ------- 4. Risk disclosure ------- */}
        <SectionCard
          eyebrow="Risk disclosure"
          title="Read before you assume anything"
          right={
            <SecondaryButton href="/education" size="md">
              <BookOpen className="h-4 w-4" /> Learn more
            </SecondaryButton>
          }
        >
          <ul className="space-y-2 text-sm text-ink-secondary">
            <li>• Investing involves risk, including possible loss of principal.</li>
            <li>• Portfolio values can go down as well as up.</li>
            <li>• Past performance does not guarantee future results.</li>
            <li>
              • Athlete Collective Fund does not provide investment, legal, or
              tax advice.
            </li>
            <li>
              • All portfolio numbers shown on this page are mock/demo values.
            </li>
          </ul>
        </SectionCard>

        <DisclaimerBox>
          Tickers, prices, holdings, and per-stock charts are illustrative mock
          data. Holdings shown here do not represent real positions.
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

function MockBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-warning/25 bg-warning/[0.06] p-3 text-xs text-ink-secondary sm:text-sm">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <div>
        <span className="font-semibold text-ink">Demo values.</span> Balance,
        growth, holdings, prices, and contribution history shown here are
        mock/demo numbers and do not represent a real account.
      </div>
    </div>
  );
}
