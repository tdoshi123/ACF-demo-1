"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  Loader2,
  Lock,
  PiggyBank,
  Receipt,
  RefreshCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import ProgressBar from "@/components/ProgressBar";
import SectionCard from "@/components/SectionCard";
import BadgePill from "@/components/BadgePill";
import DisclaimerBox from "@/components/DisclaimerBox";
import {
  buildPlan,
  determineDepositWarning,
  formatCurrency,
  recommendPortfolioFromRiskAnswers,
  riskProfileLabel,
} from "@/lib/calculations";
import { portfolioByRisk } from "@/lib/mockData";
import { StorageKeys, writeJSON } from "@/lib/storage";
import type {
  AthleteIdentity,
  DepositFrequency,
  FundingSource,
  RiskAnswer,
  WalletConnectionState,
} from "@/lib/types";

/* ----------------------------------------------------------------------------
 * Steps + progress
 * -------------------------------------------------------------------------- */

const STEPS = [
  { id: "welcome", label: "Welcome" },
  { id: "auth", label: "Teamworks" },
  { id: "rule", label: "50 / 30 / 20" },
  { id: "income", label: "Income" },
  { id: "wallet", label: "Wallet" },
  { id: "deposit", label: "Deposit" },
  { id: "risk", label: "Risk" },
  { id: "done", label: "Confirm" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

/* ----------------------------------------------------------------------------
 * Mock identity returned by the simulated Teamworks SSO
 * -------------------------------------------------------------------------- */

const MOCK_IDENTITY: AthleteIdentity = {
  name: "Jordan Carter",
  email: "jordan.carter@university.edu",
  teamworksUserId: "tw_ath_10492",
  school: "Carolina State University",
  sport: "Football",
  athleteStatus: "Verified",
  walletAvailability: "Available",
  walletConnection: "Not Connected",
};

const MOCK_WALLET_AVERAGE = 4250;

/* ----------------------------------------------------------------------------
 * Risk questionnaire
 *
 * Each option maps to a 0..3 weight. Sum of 5 questions lands in 0..15 and is
 * bucketed into one of the five model portfolios in `recommendPortfolioFromRiskAnswers`.
 * -------------------------------------------------------------------------- */

interface RiskQuestion {
  id: string;
  prompt: string;
  options: { value: number; label: string }[];
}

const RISK_QUESTIONS: RiskQuestion[] = [
  {
    id: "goal",
    prompt: "What is your main goal?",
    options: [
      { value: 0, label: "Preserve money" },
      { value: 1, label: "Grow slowly" },
      { value: 2, label: "Grow over time" },
      { value: 3, label: "Maximize long-term growth" },
    ],
  },
  {
    id: "horizon",
    prompt: "When do you think you may need this money?",
    options: [
      { value: 0, label: "Less than 1 year" },
      { value: 1, label: "1–3 years" },
      { value: 2, label: "3–5 years" },
      { value: 3, label: "5+ years" },
    ],
  },
  {
    id: "drawdown",
    prompt: "How would you react if your account dropped 15%?",
    options: [
      { value: 0, label: "Stop investing" },
      { value: 1, label: "Lower risk" },
      { value: 2, label: "Stay the course" },
      { value: 3, label: "Invest more" },
    ],
  },
  {
    id: "experience",
    prompt: "How familiar are you with investing?",
    options: [
      { value: 0, label: "Beginner" },
      { value: 1, label: "Some knowledge" },
      { value: 2, label: "Comfortable" },
      { value: 3, label: "Advanced" },
    ],
  },
  {
    id: "priority",
    prompt: "What matters more?",
    options: [
      { value: 0, label: "Stability" },
      { value: 1, label: "Balanced growth" },
      { value: 3, label: "Long-term growth" },
    ],
  },
];

/* ----------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */

export default function OnboardingPage() {
  const router = useRouter();

  // Step
  const [stepIdx, setStepIdx] = useState(0);
  const step: StepId = STEPS[stepIdx].id;

  // Step 2 — auth
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [identity, setIdentity] = useState<AthleteIdentity | null>(null);

  // Step 4 — income
  const [income, setIncome] = useState<number>(4000);
  const plan = useMemo(() => buildPlan(income), [income]);

  // Step 5 — wallet
  const [wallet, setWallet] = useState<WalletConnectionState>({
    status: "not_connected",
    connectedAt: null,
    preferredMethod: null,
  });
  const [walletLoading, setWalletLoading] = useState(false);

  // Step 6 — recurring deposit
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [frequency, setFrequency] = useState<DepositFrequency>("monthly");
  const [fundingSource, setFundingSource] =
    useState<FundingSource>("teamworks_wallet_ach");
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  // Step 7 — risk
  const [riskAnswers, setRiskAnswers] = useState<RiskAnswer[]>([]);

  const recommendedRisk = useMemo(
    () => recommendPortfolioFromRiskAnswers(riskAnswers),
    [riskAnswers],
  );
  const portfolio = portfolioByRisk[recommendedRisk];

  // Monthly equivalent for the deposit warning calculator
  const monthlyEquivalent = useMemo(() => {
    if (frequency === "weekly") return depositAmount * 4;
    if (frequency === "biweekly") return depositAmount * 2;
    return depositAmount;
  }, [depositAmount, frequency]);
  const depositWarning = determineDepositWarning(
    monthlyEquivalent,
    plan.savingsInvesting,
  );

  // Reset deposit warning visibility when income or amount changes
  useEffect(() => {
    if (depositAmount > plan.savingsInvesting * 4 && plan.savingsInvesting > 0) {
      setDepositAmount(Math.round(plan.savingsInvesting));
    }
    // we intentionally only watch income changes here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.savingsInvesting]);

  /* --------------------------------------------------------------------------
   * Step gating
   * ------------------------------------------------------------------------ */

  const allRiskAnswered = riskAnswers.length === RISK_QUESTIONS.length;

  function canAdvance(): boolean {
    switch (step) {
      case "welcome":
        return true;
      case "auth":
        return identity !== null;
      case "rule":
        return true;
      case "income":
        return income > 0;
      case "wallet":
        return true; // wallet is informational; can proceed even if not connected
      case "deposit":
        return depositAmount > 0 && Boolean(startDate);
      case "risk":
        return allRiskAnswered;
      case "done":
        return true;
    }
  }

  /* --------------------------------------------------------------------------
   * Handlers
   * ------------------------------------------------------------------------ */

  function next() {
    if (!canAdvance()) return;
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  }
  function back() {
    setStepIdx((i) => Math.max(0, i - 1));
  }

  function startMockAuth() {
    setAuthError(false);
    setAuthLoading(true);
    window.setTimeout(() => {
      setIdentity(MOCK_IDENTITY);
      setAuthLoading(false);
    }, 1200);
  }

  function connectWallet(method: WalletConnectionState["preferredMethod"]) {
    setWalletLoading(true);
    window.setTimeout(() => {
      setWallet({
        status: "connected",
        connectedAt: new Date().toISOString(),
        preferredMethod: method,
      });
      setWalletLoading(false);
      if (identity) {
        setIdentity({ ...identity, walletConnection: "Connected" });
      }
    }, 1100);
  }

  function setRiskAnswer(questionId: string, value: number) {
    setRiskAnswers((prev) => {
      const without = prev.filter((a) => a.questionId !== questionId);
      return [...without, { questionId, value }];
    });
  }

  function finish() {
    writeJSON(StorageKeys.athleteIdentity, identity);
    writeJSON(StorageKeys.income, income);
    writeJSON(StorageKeys.wallet, wallet);
    writeJSON(StorageKeys.deposit, {
      amount: depositAmount,
      frequency,
      fundingSource,
      startDate,
    });
    writeJSON(StorageKeys.risk, recommendedRisk);
    writeJSON(StorageKeys.riskAnswers, riskAnswers);
    writeJSON(StorageKeys.authed, true);
    writeJSON(StorageKeys.onboardingComplete, true);
    router.push("/dashboard");
  }

  /* --------------------------------------------------------------------------
   * Render
   * ------------------------------------------------------------------------ */

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-5 py-8 sm:py-12">
      <Header stepIdx={stepIdx} />

      <div className="mt-8">
        {step === "welcome" && <WelcomeStep />}

        {step === "auth" && (
          <AuthStep
            loading={authLoading}
            error={authError}
            identity={identity}
            onStart={startMockAuth}
            onSimulateError={() => setAuthError(true)}
            onRetry={() => {
              setAuthError(false);
              startMockAuth();
            }}
          />
        )}

        {step === "rule" && <RuleStep />}

        {step === "income" && (
          <IncomeStep income={income} setIncome={setIncome} plan={plan} />
        )}

        {step === "wallet" && (
          <WalletStep
            wallet={wallet}
            loading={walletLoading}
            onConnect={connectWallet}
            identity={identity}
          />
        )}

        {step === "deposit" && (
          <DepositStep
            amount={depositAmount}
            setAmount={setDepositAmount}
            frequency={frequency}
            setFrequency={setFrequency}
            fundingSource={fundingSource}
            setFundingSource={setFundingSource}
            startDate={startDate}
            setStartDate={setStartDate}
            savingsTarget={plan.savingsInvesting}
            monthlyEquivalent={monthlyEquivalent}
            warning={depositWarning}
          />
        )}

        {step === "risk" && (
          <RiskStep
            answers={riskAnswers}
            onAnswer={setRiskAnswer}
            recommendedRisk={recommendedRisk}
            portfolio={portfolio}
            allAnswered={allRiskAnswered}
          />
        )}

        {step === "done" && (
          <DoneStep
            identity={identity}
            income={income}
            plan={plan}
            wallet={wallet}
            depositAmount={depositAmount}
            frequency={frequency}
            fundingSource={fundingSource}
            startDate={startDate}
            recommendedRisk={recommendedRisk}
            portfolio={portfolio}
          />
        )}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SecondaryButton
          onClick={back}
          className={stepIdx === 0 ? "invisible" : ""}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </SecondaryButton>

        {step !== "done" ? (
          <PrimaryButton onClick={next} disabled={!canAdvance()} size="lg">
            {step === "welcome"
              ? "Continue with Teamworks"
              : step === "auth"
                ? "Continue"
                : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={finish} size="lg">
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 * Shared
 * ========================================================================== */

function Header({ stepIdx }: { stepIdx: number }) {
  const current = STEPS[stepIdx];
  const pct = ((stepIdx + 1) / STEPS.length) * 100;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-eyebrow">Athlete Onboarding</span>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {current.label}
          </h1>
        </div>
        <BadgePill tone="gold" icon={<Sparkles className="h-3 w-3" />}>
          Step {stepIdx + 1} of {STEPS.length}
        </BadgePill>
      </div>

      <ProgressBar value={pct} height={6} className="mt-6" />

      <div className="mt-3 hidden gap-1 overflow-x-auto sm:flex">
        {STEPS.map((s, i) => (
          <span
            key={s.id}
            className={[
              "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider",
              i < stepIdx
                ? "bg-success/15 text-success"
                : i === stepIdx
                  ? "bg-gold/20 text-gold"
                  : "bg-white/[0.04] text-ink-muted",
            ].join(" ")}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * Step 1 — Welcome
 * ========================================================================== */

function WelcomeStep() {
  return (
    <SectionCard
      eyebrow="Step 1"
      title="Build discipline with your NIL money before you invest it."
      subtitle="Athlete Collective Fund is for athletes earning NIL, endorsement, collective, revenue-share, or athletic-related income."
      elevated
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile
            icon={<Trophy className="h-4 w-4 text-gold" />}
            title="Athletes only"
            body="Sign in with Teamworks. We verify you are an athlete before unlocking the app — no public sign-ups."
          />
          <InfoTile
            icon={<Shield className="h-4 w-4 text-needs" />}
            title="Structure first, investing second"
            body="We teach you how NIL money moves, plan around it, and then automate the part you should actually be investing."
          />
        </div>

        <div className="rounded-2xl border border-white/5 bg-bg-card/60 p-4">
          <div className="text-eyebrow">What this app is not</div>
          <ul className="mt-3 space-y-2.5 text-sm text-ink-secondary">
            {[
              "You will not pick individual stocks.",
              "You will not day trade.",
              "You will not trade options or crypto.",
              "You will not manually control internal portfolio trades.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <DisclaimerBox>
          This frontend MVP uses mock data. Nothing in this flow opens a real
          brokerage account or moves real money.
        </DisclaimerBox>
      </div>
    </SectionCard>
  );
}

/* ============================================================================
 * Step 2 — Mock Teamworks Auth
 * ========================================================================== */

function AuthStep({
  loading,
  error,
  identity,
  onStart,
  onSimulateError,
  onRetry,
}: {
  loading: boolean;
  error: boolean;
  identity: AthleteIdentity | null;
  onStart: () => void;
  onSimulateError: () => void;
  onRetry: () => void;
}) {
  return (
    <SectionCard
      eyebrow="Step 2"
      title="Sign in with Teamworks"
      subtitle="We confirm you are an athlete through Teamworks. There is no separate Athlete Collective Fund account to manage."
      elevated
    >
      <div className="space-y-5">
        {!identity && !error && (
          <button
            onClick={onStart}
            disabled={loading}
            className={[
              "group flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all",
              "border-white/10 bg-bg-card/80 hover:border-white/20 hover:bg-bg-elevated",
              loading ? "cursor-wait opacity-80" : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-gold text-[#0B1020]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink">
                  Continue with Teamworks
                </div>
                <div className="text-xs text-ink-secondary">
                  Athlete identity SSO · single sign-on
                </div>
              </div>
            </div>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gold" />
            ) : (
              <ArrowRight className="h-5 w-5 text-ink-muted group-hover:text-ink" />
            )}
          </button>
        )}

        {error && !identity && (
          <AuthErrorCard onRetry={onRetry} />
        )}

        {identity && (
          <div className="space-y-3">
            <SuccessRow
              icon={<BadgeCheck className="h-5 w-5 text-success" />}
              title="Athlete identity verified"
              subtitle={`${identity.name} · ${identity.school}`}
            />
            <SuccessRow
              icon={<CheckCircle2 className="h-5 w-5 text-success" />}
              title="Teamworks account connected"
              subtitle={`${identity.email} · ${identity.teamworksUserId}`}
            />
            <SuccessRow
              icon={<Wallet className="h-5 w-5 text-gold" />}
              title="Wallet available"
              subtitle="Teamworks Wallet is available. You'll connect it in step 5."
            />

            <div className="rounded-2xl border border-white/5 bg-bg-card/60 p-4">
              <div className="text-eyebrow">Athlete profile</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <ProfileField label="Name" value={identity.name} />
                <ProfileField label="Email" value={identity.email} />
                <ProfileField label="School" value={identity.school} />
                <ProfileField label="Sport" value={identity.sport} />
                <ProfileField
                  label="Teamworks User ID"
                  value={identity.teamworksUserId}
                />
                <ProfileField
                  label="Athlete status"
                  value={identity.athleteStatus}
                />
              </div>
            </div>
          </div>
        )}

        {!identity && !error && !loading && (
          <button
            onClick={onSimulateError}
            className="text-xs text-ink-muted underline-offset-4 hover:text-ink-secondary hover:underline"
          >
            Simulate auth error (dev)
          </button>
        )}

        <DisclaimerBox>
          This is a mock sign-in. The production app will use the real Teamworks
          identity service.
        </DisclaimerBox>
      </div>
    </SectionCard>
  );
}

function AuthErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/[0.06] p-4">
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-ink">
            We couldn't verify your Teamworks account
          </div>
          <p className="mt-1 text-xs text-ink-secondary">
            Athlete Collective Fund is athlete-only and requires a verified
            Teamworks identity. If you believe this is an error, contact your
            athletic department or try again.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-ink hover:border-white/25"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-success/25 bg-success/[0.06] p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="truncate text-xs text-ink-secondary">{subtitle}</div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-muted">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

/* ============================================================================
 * Step 3 — 50 / 30 / 20 lesson
 * ========================================================================== */

const NEEDS_EXAMPLES = [
  "Rent",
  "Groceries",
  "Bills",
  "Phone",
  "Transportation",
  "Insurance",
  "Training essentials",
  "School-related costs",
];

const WANTS_EXAMPLES = [
  "Travel",
  "Clothing",
  "Jewelry",
  "Eating out",
  "Entertainment",
  "Subscriptions",
  "Lifestyle purchases",
];

const SAVINGS_EXAMPLES = [
  "Emergency fund",
  "Long-term investing",
  "Recurring investment deposits through Athlete Collective Fund",
  "Future financial goals",
];

function RuleStep() {
  return (
    <SectionCard
      eyebrow="Step 3"
      title="The 50 / 30 / 20 rule"
      subtitle="A simple split that keeps your needs covered before any money goes to investing."
      elevated
    >
      <div className="space-y-5">
        <div className="flex h-3 overflow-hidden rounded-full bg-white/5">
          <div className="h-full w-[50%] bg-needs" />
          <div className="h-full w-[30%] bg-wants" />
          <div className="h-full w-[20%] bg-savings" />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <BucketCard
            tone="needs"
            percent="50%"
            title="Needs"
            description="Money required to live and train."
            examples={NEEDS_EXAMPLES}
          />
          <BucketCard
            tone="wants"
            percent="30%"
            title="Wants"
            description="Discretionary spending. The fun stuff."
            examples={WANTS_EXAMPLES}
          />
          <BucketCard
            tone="savings"
            percent="20%"
            title="Savings & Investing"
            description="Long-term wealth-building bucket."
            examples={SAVINGS_EXAMPLES}
          />
        </div>

        <div className="rounded-2xl border border-warning/30 bg-warning/[0.07] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <p className="text-sm text-ink">
              The money invested through this app should come from your{" "}
              <span className="font-semibold text-warning">
                20% savings and investing
              </span>{" "}
              category — not your rent money, bill money, tax money, or
              emergency money.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function BucketCard({
  tone,
  percent,
  title,
  description,
  examples,
}: {
  tone: "needs" | "wants" | "savings";
  percent: string;
  title: string;
  description: string;
  examples: string[];
}) {
  const dot =
    tone === "needs"
      ? "bg-needs"
      : tone === "wants"
        ? "bg-wants"
        : "bg-savings";
  const ring =
    tone === "needs"
      ? "border-needs/30"
      : tone === "wants"
        ? "border-wants/30"
        : "border-savings/30";

  return (
    <div className={`rounded-2xl border ${ring} bg-bg-card/60 p-5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-ink-secondary">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          {title}
        </div>
        <span className="text-lg font-semibold tracking-tight text-ink">
          {percent}
        </span>
      </div>
      <p className="mt-2 text-xs text-ink-secondary">{description}</p>
      <ul className="mt-3 space-y-1.5 text-xs text-ink">
        {examples.map((e) => (
          <li key={e} className="flex items-center gap-2">
            <span className={`h-1 w-1 rounded-full ${dot}`} />
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================================
 * Step 4 — Income plan
 * ========================================================================== */

function IncomeStep({
  income,
  setIncome,
  plan,
}: {
  income: number;
  setIncome: (n: number) => void;
  plan: ReturnType<typeof buildPlan>;
}) {
  const target = plan.savingsInvesting;

  return (
    <SectionCard
      eyebrow="Step 4"
      title="How much NIL or athletic income do you usually receive per month?"
      subtitle="An honest monthly average works better than a peak month or a slow month."
      elevated
    >
      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium text-ink-secondary">
            Monthly NIL income (USD)
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-bg-card/70 px-4">
            <CircleDollarSign className="h-5 w-5 text-gold" />
            <input
              type="number"
              min={0}
              step={100}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value) || 0)}
              className="w-full bg-transparent py-3 text-lg font-semibold text-ink outline-none"
            />
            <span className="text-sm text-ink-muted">/ mo</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIncome(MOCK_WALLET_AVERAGE)}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/[0.08] px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/[0.12]"
          >
            <Wallet className="h-3.5 w-3.5" />
            Use Mock Wallet average ({formatCurrency(MOCK_WALLET_AVERAGE)})
          </button>
          {[2000, 4000, 6000, 10000].map((p) => (
            <button
              key={p}
              onClick={() => setIncome(p)}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-ink-secondary hover:border-white/20 hover:text-ink"
            >
              {formatCurrency(p)}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-bg-card/70 p-5">
          <div className="flex items-center justify-between">
            <div className="text-eyebrow">Your 50 / 30 / 20 plan</div>
            <span className="text-xs text-ink-secondary">
              Based on {formatCurrency(income)} / mo
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <PlanRow tone="needs" label="Needs · 50%" amount={plan.needs} />
            <PlanRow tone="wants" label="Wants · 30%" amount={plan.wants} />
            <PlanRow
              tone="savings"
              label="Save & invest · 20%"
              amount={plan.savingsInvesting}
            />
          </div>

          <div className="mt-5 rounded-xl border border-gold/30 bg-gold/[0.07] p-4">
            <div className="flex items-center gap-2 text-sm text-ink">
              <Target className="h-4 w-4 text-gold" />
              Based on the 50 / 30 / 20 rule, your savings and investing target
              is{" "}
              <span className="font-semibold text-gold">
                {formatCurrency(target)}
              </span>{" "}
              per month.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-bg-card/60 p-5">
          <div className="text-eyebrow">Recommended recurring investing range</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <RangeTile
              label="Conservative starter"
              percent="5%"
              amount={target * 0.05}
            />
            <RangeTile
              label="Standard"
              percent="10%"
              amount={target * 0.1}
              recommended
            />
            <RangeTile
              label="Strong"
              percent="25%"
              amount={target * 0.25}
            />
          </div>
          <p className="mt-3 text-xs text-ink-secondary">
            These are percentages of your 20% savings/investing target — not of
            your total income.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

function PlanRow({
  tone,
  label,
  amount,
}: {
  tone: "needs" | "wants" | "savings";
  label: string;
  amount: number;
}) {
  const dot =
    tone === "needs"
      ? "bg-needs"
      : tone === "wants"
        ? "bg-wants"
        : "bg-savings";
  return (
    <div className="rounded-xl border border-white/5 bg-bg-card/40 p-4">
      <div className="flex items-center gap-2 text-xs text-ink-secondary">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold tracking-tight text-ink">
        {formatCurrency(amount)}
      </div>
    </div>
  );
}

function RangeTile({
  label,
  percent,
  amount,
  recommended,
}: {
  label: string;
  percent: string;
  amount: number;
  recommended?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-4",
        recommended
          ? "border-gold/40 bg-gold/[0.07]"
          : "border-white/10 bg-bg-card/40",
      ].join(" ")}
    >
      <div className="flex items-center justify-between text-xs text-ink-secondary">
        <span>{label}</span>
        {recommended && (
          <BadgePill tone="gold" className="text-[10px]">
            Recommended
          </BadgePill>
        )}
      </div>
      <div className="mt-2 text-xl font-semibold tracking-tight text-ink">
        {formatCurrency(amount)}
      </div>
      <div className="mt-1 text-[11px] text-ink-muted">
        {percent} of your target
      </div>
    </div>
  );
}

/* ============================================================================
 * Step 5 — Wallet connection
 * ========================================================================== */

const WALLET_METHODS: {
  id: WalletConnectionState["preferredMethod"];
  label: string;
  hint: string;
  preferred?: boolean;
}[] = [
  {
    id: "ACH",
    label: "Bank account / ACH",
    hint: "Preferred for recurring deposits",
    preferred: true,
  },
  { id: "Venmo", label: "Venmo", hint: "Fast, but not ideal for recurring" },
  { id: "PayPal", label: "PayPal", hint: "Wide support" },
  { id: "Other", label: "Other Teamworks-supported payout method", hint: "" },
];

function WalletStep({
  wallet,
  loading,
  onConnect,
  identity,
}: {
  wallet: WalletConnectionState;
  loading: boolean;
  onConnect: (method: WalletConnectionState["preferredMethod"]) => void;
  identity: AthleteIdentity | null;
}) {
  const connected = wallet.status === "connected";

  return (
    <SectionCard
      eyebrow="Step 5"
      title="Connect your Teamworks Wallet"
      subtitle="The wallet is how recurring deposits will fund your investing in production. For now this is a mock connection."
      elevated
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <StatusTile
            label="Wallet status"
            value={identity?.walletAvailability ?? "Available"}
            tone="success"
            icon={<Wallet className="h-4 w-4" />}
          />
          <StatusTile
            label="Connection status"
            value={connected ? "Connected" : "Not Connected"}
            tone={connected ? "success" : "muted"}
            icon={
              connected ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )
            }
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-bg-card/70 p-5">
          <div className="text-eyebrow">Transfer methods</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {WALLET_METHODS.map((m) => (
              <div
                key={m.id}
                className={[
                  "flex items-center justify-between gap-3 rounded-xl border p-3 text-sm",
                  m.preferred
                    ? "border-gold/30 bg-gold/[0.05]"
                    : "border-white/10 bg-bg-card/40",
                ].join(" ")}
              >
                <div>
                  <div className="font-medium text-ink">{m.label}</div>
                  {m.hint && (
                    <div className="text-[11px] text-ink-secondary">
                      {m.hint}
                    </div>
                  )}
                </div>
                {m.preferred && (
                  <BadgePill tone="gold" className="text-[10px]">
                    Preferred
                  </BadgePill>
                )}
              </div>
            ))}
          </div>
        </div>

        {!connected && (
          <button
            onClick={() => onConnect("ACH")}
            disabled={loading}
            className={[
              "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-gold px-5 py-3.5 text-base font-semibold text-[#0B1020] shadow-gold transition-[transform,box-shadow,filter] duration-150 hover:brightness-105 hover:shadow-glow active:scale-[0.98]",
              loading ? "cursor-wait opacity-90" : "",
            ].join(" ")}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting wallet…
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                Connect Teamworks Wallet
              </>
            )}
          </button>
        )}

        {connected && (
          <div className="space-y-3">
            <SuccessRow
              icon={<CheckCircle2 className="h-5 w-5 text-success" />}
              title="Teamworks Wallet connected"
              subtitle="Bank/ACH is set as the preferred funding path for recurring investment deposits."
            />
            <div className="rounded-xl border border-white/5 bg-bg-card/60 p-3 text-xs text-ink-secondary">
              Some transfer setup may need to be completed inside Teamworks
              Wallet. You can switch funding methods later from settings.
            </div>
          </div>
        )}

        <DisclaimerBox tone="warning" title="Important — read this carefully">
          Athlete Collective Fund does not directly hold funds in this frontend
          MVP. Real transfers would require a regulated financial partner.
        </DisclaimerBox>
      </div>
    </SectionCard>
  );
}

function StatusTile({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "success" | "muted";
  icon: React.ReactNode;
}) {
  const palette =
    tone === "success"
      ? "border-success/30 bg-success/[0.06] text-success"
      : "border-white/10 bg-bg-card/60 text-ink-secondary";
  return (
    <div className={`rounded-2xl border p-4 ${palette}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-ink">{value}</div>
    </div>
  );
}

/* ============================================================================
 * Step 6 — Recurring deposit setup
 * ========================================================================== */

const DEPOSIT_PRESETS = [25, 50, 100, 250];

const FUNDING_SOURCES: { id: FundingSource; label: string }[] = [
  { id: "teamworks_wallet_ach", label: "Teamworks Wallet via Bank/ACH" },
  { id: "external_bank", label: "External Bank Account" },
  { id: "manual_pending", label: "Manual Setup Pending" },
];

function DepositStep({
  amount,
  setAmount,
  frequency,
  setFrequency,
  fundingSource,
  setFundingSource,
  startDate,
  setStartDate,
  savingsTarget,
  monthlyEquivalent,
  warning,
}: {
  amount: number;
  setAmount: (n: number) => void;
  frequency: DepositFrequency;
  setFrequency: (f: DepositFrequency) => void;
  fundingSource: FundingSource;
  setFundingSource: (s: FundingSource) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  savingsTarget: number;
  monthlyEquivalent: number;
  warning: ReturnType<typeof determineDepositWarning>;
}) {
  const recommended = Math.max(25, Math.round(savingsTarget * 0.1));

  return (
    <SectionCard
      eyebrow="Step 6"
      title="Set your recurring deposit"
      subtitle="You choose the amount. The 20% bucket from step 4 is your suggested ceiling — not a requirement."
      elevated
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-gold/30 bg-gold/[0.05] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-eyebrow text-gold">
                Your 20% savings target
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                {formatCurrency(savingsTarget)} / mo
              </div>
            </div>
            <PiggyBank className="h-7 w-7 text-gold" />
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-ink-secondary">
            Pick an amount
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEPOSIT_PRESETS.map((p) => (
              <PresetButton
                key={p}
                active={amount === p}
                onClick={() => setAmount(p)}
              >
                {formatCurrency(p)} / mo
              </PresetButton>
            ))}
            <PresetButton
              active={amount === recommended}
              onClick={() => setAmount(recommended)}
              gold
            >
              Recommended · {formatCurrency(recommended)}
            </PresetButton>
            <div className="col-span-2 sm:col-span-3">
              <label className="text-[10px] uppercase tracking-wider text-ink-muted">
                Custom amount
              </label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-bg-card/70 px-3">
                <CircleDollarSign className="h-4 w-4 text-gold" />
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="w-full bg-transparent py-2.5 text-sm font-semibold text-ink outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-ink-secondary">
              Frequency
            </div>
            <select
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as DepositFrequency)
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-bg-card/70 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/40"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <div className="text-xs font-medium text-ink-secondary">
              Funding source
            </div>
            <select
              value={fundingSource}
              onChange={(e) =>
                setFundingSource(e.target.value as FundingSource)
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-bg-card/70 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/40"
            >
              {FUNDING_SOURCES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <div className="text-xs font-medium text-ink-secondary">
              Start date
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-bg-card/70 px-3">
              <CalendarClock className="h-4 w-4 text-gold" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm text-ink outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-bg-card/60 p-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <div className="text-ink-secondary">Monthly equivalent</div>
              <div className="text-lg font-semibold text-ink">
                {formatCurrency(monthlyEquivalent)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-ink-secondary">20% ceiling</div>
              <div className="text-lg font-semibold text-gold">
                {formatCurrency(savingsTarget)}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={
                savingsTarget > 0
                  ? (monthlyEquivalent / savingsTarget) * 100
                  : 0
              }
              color={warning.level === "over" ? "#EF4444" : "#D4AF37"}
              height={8}
            />
          </div>
          <div
            className={[
              "mt-3 rounded-xl border p-3 text-xs",
              warning.level === "ok"
                ? "border-success/25 bg-success/[0.07]"
                : warning.level === "over"
                  ? "border-danger/25 bg-danger/[0.07]"
                  : "border-warning/25 bg-warning/[0.07]",
            ].join(" ")}
          >
            <div className="font-semibold text-ink">
              {warning.level === "over"
                ? `You selected ${formatCurrency(monthlyEquivalent)}/month, but your 20% savings target is ${formatCurrency(savingsTarget)}/month.`
                : warning.title}
            </div>
            <div className="mt-0.5 text-ink-secondary">{warning.message}</div>
          </div>
        </div>

        <DisclaimerBox>
          You are not required to invest the entire 20% bucket. The bucket is a
          ceiling — keep needs, taxes, and emergency savings ahead of investing.
        </DisclaimerBox>
      </div>
    </SectionCard>
  );
}

function PresetButton({
  active,
  onClick,
  children,
  gold,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  gold?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? gold
            ? "border-gold/60 bg-gold/[0.14] text-ink"
            : "border-gold/50 bg-gold/[0.08] text-ink"
          : gold
            ? "border-gold/30 bg-gold/[0.05] text-gold hover:bg-gold/[0.1]"
            : "border-white/10 bg-bg-card/60 text-ink-secondary hover:border-white/20 hover:text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ============================================================================
 * Step 7 — Risk profile
 * ========================================================================== */

function RiskStep({
  answers,
  onAnswer,
  recommendedRisk,
  portfolio,
  allAnswered,
}: {
  answers: RiskAnswer[];
  onAnswer: (id: string, value: number) => void;
  recommendedRisk: ReturnType<typeof recommendPortfolioFromRiskAnswers>;
  portfolio: (typeof portfolioByRisk)[keyof typeof portfolioByRisk];
  allAnswered: boolean;
}) {
  return (
    <SectionCard
      eyebrow="Step 7"
      title="Risk profile"
      subtitle="Five quick questions. We use them to recommend one of five model portfolios."
      elevated
    >
      <div className="space-y-6">
        {RISK_QUESTIONS.map((q, qIdx) => {
          const selected = answers.find((a) => a.questionId === q.id);
          return (
            <div key={q.id}>
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  Q{qIdx + 1}
                </span>
                <div className="text-sm font-medium text-ink">{q.prompt}</div>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {q.options.map((opt) => {
                  const active = selected?.value === opt.value;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => onAnswer(q.id, opt.value)}
                      className={[
                        "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                        active
                          ? "border-gold/50 bg-gold/[0.08] text-ink"
                          : "border-white/10 bg-bg-card/60 text-ink-secondary hover:border-white/20 hover:text-ink",
                      ].join(" ")}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {allAnswered && (
          <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-eyebrow text-gold">
                  Recommended portfolio
                </div>
                <div className="mt-1 text-xl font-semibold text-ink">
                  {riskProfileLabel(recommendedRisk)} · {portfolio.name}
                </div>
                <div className="text-xs text-ink-secondary">
                  {portfolio.expectedReturn} · {portfolio.volatility} volatility
                </div>
              </div>
              <Target className="h-7 w-7 text-gold" />
            </div>
            <p className="mt-3 text-sm text-ink-secondary">
              {portfolio.description}
            </p>

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
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-ink-secondary sm:grid-cols-4">
              {portfolio.allocation.map((slice) => (
                <div key={slice.label} className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: slice.color }}
                  />
                  {slice.label} {slice.percent}%
                </div>
              ))}
            </div>
          </div>
        )}

        <DisclaimerBox tone="warning">
          Portfolio values can go down. Past performance does not guarantee
          future results.
        </DisclaimerBox>
      </div>
    </SectionCard>
  );
}

/* ============================================================================
 * Step 8 — Confirmation
 * ========================================================================== */

function DoneStep({
  identity,
  income,
  plan,
  wallet,
  depositAmount,
  frequency,
  fundingSource,
  startDate,
  recommendedRisk,
  portfolio,
}: {
  identity: AthleteIdentity | null;
  income: number;
  plan: ReturnType<typeof buildPlan>;
  wallet: WalletConnectionState;
  depositAmount: number;
  frequency: DepositFrequency;
  fundingSource: FundingSource;
  startDate: string;
  recommendedRisk: ReturnType<typeof recommendPortfolioFromRiskAnswers>;
  portfolio: (typeof portfolioByRisk)[keyof typeof portfolioByRisk];
}) {
  const fundingLabel =
    FUNDING_SOURCES.find((f) => f.id === fundingSource)?.label ??
    fundingSource;
  return (
    <SectionCard
      eyebrow="Step 8"
      title="Your plan is ready"
      subtitle="Review the details. You can change any of these later in settings."
      elevated
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryCard
            icon={<User className="h-4 w-4 text-gold" />}
            label="Athlete identity"
            primary={identity?.name ?? "—"}
            secondary={
              identity
                ? `${identity.school} · ${identity.sport}`
                : "Not verified"
            }
          />
          <SummaryCard
            icon={<CircleDollarSign className="h-4 w-4 text-gold" />}
            label="Monthly NIL income"
            primary={formatCurrency(income)}
            secondary="Editable in settings"
          />
          <SummaryCard
            icon={<Building2 className="h-4 w-4 text-gold" />}
            label="50 / 30 / 20 plan"
            primary={`${formatCurrency(plan.needs)} · ${formatCurrency(plan.wants)} · ${formatCurrency(plan.savingsInvesting)}`}
            secondary="Needs · Wants · Save & invest"
          />
          <SummaryCard
            icon={<Wallet className="h-4 w-4 text-gold" />}
            label="Wallet connection"
            primary={
              wallet.status === "connected" ? "Connected" : "Not Connected"
            }
            secondary={
              wallet.preferredMethod
                ? `Preferred: ${wallet.preferredMethod}`
                : "Connect later from settings"
            }
          />
          <SummaryCard
            icon={<Receipt className="h-4 w-4 text-gold" />}
            label="Recurring deposit"
            primary={`${formatCurrency(depositAmount)} / ${frequency}`}
            secondary={`Funded via ${fundingLabel}`}
          />
          <SummaryCard
            icon={<CalendarClock className="h-4 w-4 text-gold" />}
            label="Start date"
            primary={formatDate(startDate)}
            secondary={`Frequency: ${frequency}`}
          />
          <SummaryCard
            icon={<Shield className="h-4 w-4 text-gold" />}
            label="Risk profile"
            primary={riskProfileLabel(recommendedRisk)}
            secondary={portfolio.name}
          />
          <SummaryCard
            icon={<Target className="h-4 w-4 text-gold" />}
            label="Portfolio allocation"
            primary={portfolio.allocation
              .map((s) => `${s.label.split(" ")[0]} ${s.percent}%`)
              .join(" · ")}
            secondary={`${portfolio.expectedReturn} · ${portfolio.volatility} volatility`}
          />
        </div>

        <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-4">
          <div className="flex items-center gap-2 text-sm text-ink">
            <ShieldCheck className="h-4 w-4 text-gold" />
            You are set up. From here, your only job is to keep showing up.
          </div>
        </div>

        <DisclaimerBox tone="warning">
          This is a mock onboarding. No money will move and no real portfolio
          will be opened. Athlete Collective Fund does not directly hold funds
          in this MVP.
        </DisclaimerBox>
      </div>
    </SectionCard>
  );
}

function SummaryCard({
  icon,
  label,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-bg-card/60 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-secondary">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-ink">{primary}</div>
      {secondary && (
        <div className="mt-0.5 text-[11px] text-ink-muted">{secondary}</div>
      )}
    </div>
  );
}

/* ============================================================================
 * Misc
 * ========================================================================== */

function InfoTile({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-bg-card/60 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
          {icon}
        </div>
        <div className="text-sm font-semibold text-ink">{title}</div>
      </div>
      <p className="mt-2 text-xs text-ink-secondary">{body}</p>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
