"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CircleDollarSign,
  LogOut,
  Pause,
  Play,
  Shield,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import BadgePill from "@/components/BadgePill";
import DisclaimerBox from "@/components/DisclaimerBox";
import PrimaryButton from "@/components/PrimaryButton";
import ProgressBar from "@/components/ProgressBar";
import SecondaryButton from "@/components/SecondaryButton";
import SectionCard from "@/components/SectionCard";
import {
  mockAthlete,
  mockDeposit,
  mockMonthlyIncome,
  mockTeamworksIdentity,
  mockWallet,
  portfolioByRisk,
} from "@/lib/mockData";
import {
  buildPlan,
  determineDepositWarning,
  formatCurrency,
  monthlyDepositEquivalent,
  riskProfileLabel,
} from "@/lib/calculations";
import { StorageKeys, clearAll, readJSON, writeJSON } from "@/lib/storage";
import type { DepositFrequency, RiskProfile } from "@/lib/types";

interface NotificationPrefs {
  deposit: boolean;
  education: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  deposit: true,
  education: false,
};

export default function SettingsPage() {
  const [income, setIncome] = useState(mockMonthlyIncome.amount);
  const [depositAmount, setDepositAmount] = useState(mockDeposit.amount);
  const [frequency, setFrequency] = useState<DepositFrequency>(
    mockDeposit.frequency,
  );
  const [paused, setPaused] = useState<boolean>(!mockDeposit.active);
  const [risk, setRisk] = useState<RiskProfile>("balanced");
  const [savedToast, setSavedToast] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pauseArmed, setPauseArmed] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

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
    setRisk(readJSON<RiskProfile>(StorageKeys.risk, "balanced"));
    setPrefs(readJSON<NotificationPrefs>(StorageKeys.notifications, DEFAULT_PREFS));
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
  const portfolio = portfolioByRisk[risk];

  function save() {
    writeJSON(StorageKeys.income, income);
    writeJSON(StorageKeys.deposit, { amount: depositAmount, frequency });
    writeJSON(StorageKeys.notifications, prefs);
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

  function updatePref<K extends keyof NotificationPrefs>(
    key: K,
    value: boolean,
  ) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      writeJSON(StorageKeys.notifications, next);
      return next;
    });
  }

  function resetDemoData() {
    clearAll();
    setIncome(mockMonthlyIncome.amount);
    setDepositAmount(mockDeposit.amount);
    setFrequency(mockDeposit.frequency);
    setPaused(!mockDeposit.active);
    setRisk("balanced");
    setPrefs(DEFAULT_PREFS);
    setConfirmReset(false);
  }

  return (
    <AppShell
      title="Settings"
      subtitle="Update your inputs. Plans recompute instantly."
    >
      <div className="space-y-6">
        {/* ----- Athlete profile ----- */}
        <SectionCard
          eyebrow="Athlete profile"
          title={`${mockAthlete.firstName} ${mockAthlete.lastName}`}
          subtitle={`${mockAthlete.school} · ${mockAthlete.sport} · ${mockAthlete.classYear}`}
          right={
            <BadgePill
              tone="success"
              icon={<ShieldCheck className="h-3 w-3" />}
            >
              Teamworks verified
            </BadgePill>
          }
        >
          <div className="divide-y divide-white/5 md:grid md:gap-3 md:grid-cols-2 md:divide-y-0 lg:grid-cols-4">
            <Row label="Teamworks email" value={mockTeamworksIdentity.email} />
            <Row label="Teamworks ID" value={mockTeamworksIdentity.teamworksId} />
            <Row
              label="Last sync"
              value={formatDateTime(mockTeamworksIdentity.lastSync)}
            />
            <Row label="Status" value="Verified" />
          </div>
        </SectionCard>

        {/* ----- Wallet status ----- */}
        <SectionCard
          eyebrow="Wallet"
          title="Teamworks Wallet"
          subtitle="Bank/ACH is the preferred funding path for recurring deposits."
          right={
            <BadgePill tone="success">
              {mockWallet.status === "connected" ? "Connected" : "Not connected"}
            </BadgePill>
          }
        >
          <div className="divide-y divide-white/5 md:grid md:gap-3 md:grid-cols-3 md:divide-y-0">
            <Row label="Account" value={mockWallet.maskedAccount} />
            <Row
              label="Last deposit"
              value={formatNiceDate(mockWallet.lastDeposit)}
            />
            <Row
              label="MTD deposits"
              value={formatCurrency(mockWallet.monthToDateDeposits)}
            />
          </div>
        </SectionCard>

        {/* ----- Recurring deposit summary + edit ----- */}
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
            <SecondaryButton href="/dashboard">Cancel</SecondaryButton>
            <PrimaryButton onClick={save}>Save changes</PrimaryButton>
          </div>
        </SectionCard>

        {/* ----- Risk profile summary ----- */}
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
              value={portfolio.allocation
                .map((s) => `${s.label.split(" ")[0]} ${s.percent}%`)
                .join(" · ")}
            />
          </div>

          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/5">
            {portfolio.allocation.map((slice) => (
              <div
                key={slice.label}
                style={{
                  width: `${slice.percent}%`,
                  background: slice.color,
                }}
              />
            ))}
          </div>

          <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end">
            <SecondaryButton href="/portfolio">Change profile</SecondaryButton>
            <SecondaryButton href="/onboarding">Retake quiz</SecondaryButton>
          </div>
        </SectionCard>

        {/* ----- Notifications ----- */}
        <SectionCard
          eyebrow="Notifications"
          title="Stay nudged, not noisy"
        >
          <div className="divide-y divide-white/5 md:space-y-3 md:divide-y-0">
            <Toggle
              label="Recurring deposit reminders"
              hint="Heads-up the day before a scheduled contribution."
              icon={<Bell className="h-4 w-4 text-gold" />}
              value={prefs.deposit}
              onChange={(v) => updatePref("deposit", v)}
            />
            <Toggle
              label="Education suggestions"
              hint="Occasional module recommendations."
              icon={<Bell className="h-4 w-4 text-gold" />}
              value={prefs.education}
              onChange={(v) => updatePref("education", v)}
            />
          </div>
        </SectionCard>

        {/* ----- Legal / Disclaimers ----- */}
        <SectionCard
          eyebrow="Legal & disclaimers"
          title="Read before assuming anything"
          subtitle="Important context for everything you see in this app."
        >
          <ul className="divide-y divide-white/5 text-sm text-ink-secondary md:space-y-2.5 md:divide-y-0">
            {[
              "Investing involves risk, including possible loss of principal.",
              "Portfolio values can go down as well as up.",
              "Past performance does not guarantee future results.",
              "Athlete Collective Fund does not provide tax advice.",
              "NIL payments may create tax obligations.",
              "Users should consult a tax professional for their personal situation.",
              "This frontend MVP uses mock data and does not move real money.",
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 py-2.5 md:rounded-xl md:border md:border-white/5 md:bg-bg-card/60 md:p-3"
              >
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
                <span className="text-ink">{line}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* ----- Privacy & data ----- */}
        <SectionCard eyebrow="Privacy & data" title="Your data is yours">
          <DisclaimerBox>
            All saved values live in this browser's local storage only. There is
            no backend, no shared profile, and no money movement.
          </DisclaimerBox>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <SecondaryButton href="/" fullWidth>
              <LogOut className="h-4 w-4" />
              Sign out (mock)
            </SecondaryButton>
            {confirmReset ? (
              <div className="flex flex-col gap-2 rounded-2xl border border-danger/30 bg-danger/[0.06] p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-danger">
                  Reset all demo data? This cannot be undone.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="rounded-xl border border-white/10 bg-bg-card/60 px-3 py-1.5 text-xs text-ink-secondary hover:border-white/20 hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={resetDemoData}
                    className="rounded-xl border border-danger/40 bg-danger/15 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/25"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/10 px-5 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/15"
              >
                <Trash2 className="h-4 w-4" />
                Reset demo data
              </button>
            )}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}

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

function Toggle({
  label,
  hint,
  icon,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors md:rounded-2xl md:border md:border-white/5 md:bg-bg-card/60 md:p-4 md:hover:border-white/15"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
            {icon}
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-ink">{label}</div>
          {hint && <div className="text-xs text-ink-secondary">{hint}</div>}
        </div>
      </div>
      <span
        className={[
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
          value ? "bg-gradient-gold" : "bg-white/10",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
            value ? "left-[22px]" : "left-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatNiceDate(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso + (iso.includes("T") ? "" : "T00:00:00"));
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
