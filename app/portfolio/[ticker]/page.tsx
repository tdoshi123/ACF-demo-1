"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppShell from "@/components/AppShell";
import BadgePill from "@/components/BadgePill";
import DisclaimerBox from "@/components/DisclaimerBox";
import SectionCard from "@/components/SectionCard";
import {
  findHolding,
  generateEarnings,
  generatePriceSeries,
  generateStats,
  type Holding,
  type Period,
} from "@/lib/holdings";
import { mockPortfolioBalance, portfolioByRisk } from "@/lib/mockData";
import { formatCurrency } from "@/lib/calculations";
import { StorageKeys, readJSON } from "@/lib/storage";
import type { RiskProfile } from "@/lib/types";

const PERIODS: Period[] = ["1D", "1W", "1M", "3M", "1Y", "5Y"];

const tooltipStyle = {
  background: "#0B1020",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#F8FAFC",
  fontSize: 12,
};

export default function HoldingDetailPage() {
  const params = useParams<{ ticker: string }>();
  const ticker = (params?.ticker ?? "").toString().toUpperCase();

  const holding = useMemo(() => findHolding(ticker), [ticker]);
  if (!holding) notFound();

  return <HoldingView holding={holding} />;
}

function HoldingView({ holding }: { holding: Holding }) {
  const [period, setPeriod] = useState<Period>("1M");
  const [risk, setRisk] = useState<RiskProfile>("balanced");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRisk(readJSON<RiskProfile>(StorageKeys.risk, "balanced"));
    setHydrated(true);
  }, []);

  const series = useMemo(
    () =>
      generatePriceSeries(
        holding.price,
        holding.changePct,
        holding.seed,
        period,
      ),
    [holding, period],
  );
  const stats = useMemo(() => generateStats(holding), [holding]);
  const earnings = useMemo(() => generateEarnings(holding), [holding]);

  const startPrice = series[0]?.price ?? holding.price;
  const periodChange = holding.price - startPrice;
  const periodPct = startPrice > 0 ? (periodChange / startPrice) * 100 : 0;
  const isUp = periodChange >= 0;
  const lineColor = isUp ? "#22C55E" : "#EF4444";

  const todayUp = holding.changePct >= 0;

  // Position calculations: derived from selected risk profile + this holding's
  // weight inside its slice and the ticker's slice percentage.
  const portfolio = portfolioByRisk[risk];
  const slice = portfolio.allocation.find(
    (s) => s.label === holding.sliceLabel,
  );
  const sliceValue = slice ? mockPortfolioBalance * (slice.percent / 100) : 0;
  const marketValue = sliceValue * holding.weight;
  const shares = holding.price > 0 ? marketValue / holding.price : 0;
  // Simulated average cost: a few % below current price using the inverse of
  // changePct + a small drift, so total return looks plausible.
  const avgCost = Number(
    (holding.price / (1 + 0.04 + holding.changePct / 100)).toFixed(2),
  );
  const totalReturn = (holding.price - avgCost) * shares;
  const totalReturnPct = avgCost > 0 ? ((holding.price - avgCost) / avgCost) * 100 : 0;
  const todayReturn = (holding.price - stats.open) * shares;
  const portfolioDiversity =
    mockPortfolioBalance > 0 ? (marketValue / mockPortfolioBalance) * 100 : 0;

  const periodLabel: Record<Period, string> = {
    "1D": "Today",
    "1W": "Past week",
    "1M": "Past month",
    "3M": "Past 3 months",
    "1Y": "Past year",
    "5Y": "Past 5 years",
  };

  return (
    <AppShell
      title={`${holding.ticker} · ${holding.name}`}
      subtitle={`${holding.sliceLabel} · ${holding.type === "etf" ? "ETF" : "Stock"}`}
    >
      <div className="space-y-6">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-xs text-ink-secondary transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to portfolio
        </Link>

        {/* ----- Hero: price chart ----- */}
        <section className="surface-card overflow-hidden">
          <div className="px-5 pt-5 sm:px-6 sm:pt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-eyebrow">{holding.ticker}</div>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  ${holding.price.toFixed(2)}
                </h2>
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
                    {isUp ? "+" : "−"}${Math.abs(periodChange).toFixed(2)}
                  </span>
                  <span className="text-ink-muted">
                    ({isUp ? "+" : "−"}
                    {Math.abs(periodPct).toFixed(2)}%)
                  </span>
                  <span className="text-ink-muted">· {periodLabel[period]}</span>
                </div>
              </div>
              <div className="text-right text-[11px] text-ink-muted">
                <div>Today</div>
                <div
                  className={[
                    "text-sm font-semibold",
                    todayUp ? "text-success" : "text-danger",
                  ].join(" ")}
                >
                  {todayUp ? "+" : ""}
                  {holding.changePct.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 h-[300px] w-full sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={series}
                margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(v: number) => [`$${v.toFixed(2)}`, holding.ticker]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={lineColor}
                  strokeWidth={2.25}
                  fill="url(#priceFill)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: lineColor }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-start gap-1 border-t border-white/5 px-5 py-3 text-xs sm:px-6">
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
        </section>

        {/* ----- Your position ----- */}
        <SectionCard
          eyebrow="Your position"
          title={`${shares.toFixed(3)} ${shares === 1 ? "share" : "shares"}`}
          subtitle={`Held inside ${holding.sliceLabel}.`}
          right={
            hydrated ? (
              <BadgePill tone="gold">{slice?.label ?? "—"}</BadgePill>
            ) : undefined
          }
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <PositionStat
              label="Shares"
              value={shares.toFixed(3)}
            />
            <PositionStat
              label="Average cost"
              value={`$${avgCost.toFixed(2)}`}
            />
            <PositionStat
              label="Market value"
              value={formatCurrency(marketValue)}
            />
            <PositionStat
              label="Portfolio diversity"
              value={`${portfolioDiversity.toFixed(2)}%`}
            />
            <PositionStat
              label="Today's return"
              value={`${todayReturn >= 0 ? "+" : "−"}${formatCurrency(Math.abs(todayReturn))}`}
              tone={todayReturn >= 0 ? "up" : "down"}
              hint={`${holding.changePct >= 0 ? "+" : ""}${holding.changePct.toFixed(2)}%`}
            />
            <PositionStat
              label="Total return"
              value={`${totalReturn >= 0 ? "+" : "−"}${formatCurrency(Math.abs(totalReturn))}`}
              tone={totalReturn >= 0 ? "up" : "down"}
              hint={`${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(2)}%`}
            />
          </div>
        </SectionCard>

        {/* ----- About + Statistics ----- */}
        <div className="grid gap-6 lg:grid-cols-5">
          <SectionCard
            className="lg:col-span-2"
            eyebrow="About"
            title={holding.name}
          >
            <p className="text-sm text-ink-secondary">{holding.description}</p>
            <div className="mt-5 grid gap-3">
              <AboutRow
                icon={<Briefcase className="h-4 w-4 text-gold" />}
                label={holding.type === "etf" ? "Fund issuer CEO" : "CEO"}
                value={holding.ceo ?? "—"}
              />
              <AboutRow
                icon={<Calendar className="h-4 w-4 text-needs" />}
                label="Founded"
                value={holding.founded?.toString() ?? "—"}
              />
              <AboutRow
                icon={<Users className="h-4 w-4 text-wants" />}
                label="Employees"
                value={
                  holding.employees
                    ? holding.employees.toLocaleString()
                    : "—"
                }
              />
              <AboutRow
                icon={<Building2 className="h-4 w-4 text-success" />}
                label="Headquarters"
                value={holding.headquarters ?? "—"}
              />
            </div>
          </SectionCard>

          <SectionCard
            className="lg:col-span-3"
            eyebrow="Statistics"
            title="Trading data"
            subtitle="All values shown are mock data for demo purposes."
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="Volume" value={fmtNumber(stats.volume)} />
              <Stat
                label="Overnight volume"
                value={fmtNumber(stats.overnightVolume)}
              />
              <Stat label="Average volume" value={fmtNumber(stats.avgVolume)} />
              <Stat label="Open" value={`$${stats.open.toFixed(2)}`} />
              <Stat label="Today's high" value={`$${stats.high.toFixed(2)}`} />
              <Stat label="Today's low" value={`$${stats.low.toFixed(2)}`} />
              <Stat label="Market cap" value={fmtCompact(stats.marketCap)} />
              <Stat
                label="52-week high"
                value={`$${stats.high52.toFixed(2)}`}
              />
              <Stat
                label="52-week low"
                value={`$${stats.low52.toFixed(2)}`}
              />
              <Stat
                label="P/E ratio"
                value={stats.peRatio == null ? "—" : stats.peRatio.toFixed(1)}
              />
              <Stat
                label="Dividend yield"
                value={`${stats.dividendYield.toFixed(2)}%`}
              />
              <Stat label="Short inventory" value={stats.shortInventory} />
              <Stat label="Borrow rate" value={stats.borrowRate} />
            </div>
          </SectionCard>
        </div>

        {/* ----- Quarterly earnings ----- */}
        <SectionCard
          eyebrow="Quarterly earnings"
          title="Projected vs actual EPS"
          subtitle={
            holding.type === "etf"
              ? "ETF distribution per share — projected vs actual."
              : "Earnings per share — analyst projection vs reported."
          }
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={earnings}
                margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                />
                <XAxis
                  dataKey="quarter"
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
                  cursor={{ fill: "rgba(212,175,55,0.06)" }}
                  contentStyle={tooltipStyle}
                  formatter={(v: number, name: string) => [
                    `$${v.toFixed(2)}`,
                    name,
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  iconType="circle"
                />
                <Bar
                  dataKey="projected"
                  name="Projected"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="actual"
                  name="Actual"
                  fill="#D4AF37"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {earnings.map((e) => {
              const beat = e.actual >= e.projected;
              const diff = e.actual - e.projected;
              return (
                <li
                  key={e.quarter}
                  className="rounded-xl border border-white/5 bg-bg-card/60 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{e.quarter}</span>
                    <BadgePill tone={beat ? "success" : "danger"}>
                      {beat ? "Beat" : "Miss"}
                    </BadgePill>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between text-ink-secondary">
                    <span>Projected</span>
                    <span className="font-medium text-ink">
                      ${e.projected.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between text-ink-secondary">
                    <span>Actual</span>
                    <span className="font-medium text-ink">
                      ${e.actual.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={[
                      "mt-1 text-right text-[11px] font-medium",
                      beat ? "text-success" : "text-danger",
                    ].join(" ")}
                  >
                    {beat ? "+" : "−"}${Math.abs(diff).toFixed(2)}
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <DisclaimerBox>
          {holding.ticker} price history, statistics, position calculations,
          and earnings shown on this page are illustrative mock data. Athlete
          Collective Fund does not allow buying, selling, or holding individual
          securities directly.
        </DisclaimerBox>
      </div>
    </AppShell>
  );
}

/* ----------------------------------------------------------------------------
 * Pieces
 * -------------------------------------------------------------------------- */

function PositionStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "up" | "down";
}) {
  const valueColor =
    tone === "up"
      ? "text-success"
      : tone === "down"
        ? "text-danger"
        : "text-ink";
  return (
    <div className="rounded-xl border border-white/5 bg-bg-card/60 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </div>
      <div className={`mt-1.5 text-base font-semibold ${valueColor}`}>
        {value}
      </div>
      {hint && (
        <div
          className={[
            "mt-0.5 text-[11px] font-medium",
            tone === "up"
              ? "text-success"
              : tone === "down"
                ? "text-danger"
                : "text-ink-muted",
          ].join(" ")}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function AboutRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-bg-card/60 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          {label}
        </div>
        <div className="mt-0.5 truncate text-sm font-medium text-ink">
          {value}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-bg-card/50 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function fmtNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}
