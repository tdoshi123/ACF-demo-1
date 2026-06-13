"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CircleDollarSign,
  EyeOff,
  LineChart,
  Lock,
  ShieldCheck,
  Target,
  Wallet,
} from "lucide-react";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import DisclaimerBox from "@/components/DisclaimerBox";
import { StorageKeys, writeJSON } from "@/lib/storage";

export default function LandingPage() {
  const router = useRouter();

  function continueWithTeamworks() {
    // Mock auth only — no real Teamworks API is called.
    writeJSON(StorageKeys.authed, { provider: "teamworks", at: Date.now() });
    router.push("/onboarding");
  }

  return (
    <div className="relative min-h-screen">
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-[#2f2f38] bg-bg-secondary shadow-[0_0_0_1px_rgba(212,175,55,0.18)_inset]">
            <span className="score-num text-[12px] font-bold tracking-tighter text-gold">
              A
            </span>
          </span>
          <span className="score-num text-sm font-semibold tracking-[0.22em] text-ink">
            Athlete Collective Fund
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-ink-secondary sm:flex">
          <a
            href="#how-it-works"
            className="score-num text-[11px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
          >
            How it works
          </a>
          <a
            href="#principles"
            className="score-num text-[11px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
          >
            Principles
          </a>
          <a
            href="#privacy"
            className="score-num text-[11px] uppercase tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
          >
            Privacy
          </a>
        </div>

        <div className="flex items-center gap-2">
          <SecondaryButton href="/dashboard">View demo</SecondaryButton>
        </div>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-gold" />
              <span className="score-num text-[10px] uppercase tracking-[0.32em] text-gold sm:text-[11px]">
                Built for NIL athletes · Private Discipline OS
              </span>
            </div>

            <h1 className="mt-6 max-w-4xl text-[44px] font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Discipline First.
              <br />
              <span className="text-gold">Freedom</span> Later.
            </h1>

            <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-ink-secondary sm:text-lg">
              Learn how to control NIL money first, then invest with structure.
              No day trading. No crypto. No public leaderboards — just your
              receipts against your own.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton size="lg" onClick={continueWithTeamworks}>
                <ShieldCheck className="h-4 w-4" />
                Continue with Teamworks
              </PrimaryButton>
              <SecondaryButton size="lg" href="/dashboard">
                View demo dashboard
                <ArrowRight className="h-4 w-4" />
              </SecondaryButton>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Athlete-only access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <EyeOff className="h-3.5 w-3.5" />
                Private by default
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Built on the 50/30/20 rule
              </span>
            </div>

            <div className="mt-10 grid w-full max-w-2xl grid-cols-3 gap-4 border-y border-[#23232a] py-5 sm:gap-6 sm:py-6">
              <Scoreboard value="84%" label="Retention" tone="gold" />
              <Scoreboard value="27" label="Day Streak" tone="ink" />
              <Scoreboard value="06" label="Badges" tone="green" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroMockCard />
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8"
      >
        <SectionHeading
          eyebrow="How it works"
          title="Four steps. Built like a training plan."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureTile
            step="01"
            icon={ShieldCheck}
            title="Sign in with Teamworks"
            body="Athlete Collective Fund is athlete-only. You verify through your existing Teamworks identity — no extra account to manage."
          />
          <FeatureTile
            step="02"
            icon={Wallet}
            title="Connect your NIL flow"
            body="See how money moves from brand to agency to your Teamworks Wallet to your bank — and where to intercept it for investing."
          />
          <FeatureTile
            step="03"
            icon={Target}
            title="Apply the 50/30/20 rule"
            body="Half for needs, 30% for wants, 20% to save and invest. Athlete Collective Fund calculates your target every month."
          />
          <FeatureTile
            step="04"
            icon={LineChart}
            title="Auto-invest with structure"
            body="Pick a model portfolio that matches your risk profile and set a recurring contribution from your 20% bucket."
          />
        </div>
      </section>

      <section
        id="principles"
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8"
      >
        <SectionHeading
          eyebrow="Principles"
          title="What this app refuses to do."
          subtitle="Discipline is what separates compounding from gambling. These rules are non-negotiable."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <PrincipleCard
            title="No day trading"
            body="You will not be nudged to time the market or make impulsive trades. Athlete Collective Fund only supports recurring, scheduled contributions."
          />
          <PrincipleCard
            title="No crypto"
            body="Crypto markets are volatile and unsuitable for athletes building disciplined recurring investing habits."
          />
          <PrincipleCard
            title="No manual stock picking"
            body="You choose a model portfolio matched to your risk profile. Allocation is set. Discipline does the work."
          />
        </div>
      </section>

      <section
        id="privacy"
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8"
      >
        <div className="surface-elevated grid items-start gap-8 p-6 sm:p-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="text-eyebrow">Private progress</span>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Your numbers are yours. No public leaderboards. No social feed.
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-ink-secondary">
              Everything you see — your savings target, your contributions,
              and your streaks — is private to you. No teammates, no boosters,
              and no brands can see what you are building. We are not a
              social network. We are a private command center for athlete
              money.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <PrivacyRow
                icon={EyeOff}
                label="Private by default"
                body="No public profile. No follower counts."
              />
              <PrivacyRow
                icon={Lock}
                label="Athlete-only access"
                body="Verified through your Teamworks identity."
              />
              <PrivacyRow
                icon={BookOpen}
                label="Education first"
                body="Every screen explains the 'why', not just the 'what'."
              />
              <PrivacyRow
                icon={CircleDollarSign}
                label="Discipline-led"
                body="Recurring contributions, model portfolios, no gambling."
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <DisclaimerBox>
              Athlete Collective Fund is an educational frontend MVP. It does
              not move real money, does not execute real trades, and does not
              provide investment advice. All numbers shown are mock data.
            </DisclaimerBox>

            <div className="mt-4 surface-card p-6">
              <div className="text-eyebrow">Ready to start?</div>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-ink">
                Continue with Teamworks
              </h3>
              <p className="mt-2 text-sm text-ink-secondary">
                Verify once. Build a private, athlete-only investing routine.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <PrimaryButton
                  fullWidth
                  onClick={continueWithTeamworks}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Continue with Teamworks
                </PrimaryButton>
                <SecondaryButton fullWidth href="/dashboard">
                  View demo
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#23232a]">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-3 px-5 py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:px-8">
          <div>
            © {new Date().getFullYear()} Athlete Collective Fund. Educational
            MVP — not financial advice.
          </div>
          <div className="flex items-center gap-4">
            <a className="hover:text-ink" href="#how-it-works">
              How it works
            </a>
            <a className="hover:text-ink" href="#principles">
              Principles
            </a>
            <a className="hover:text-ink" href="#privacy">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Scoreboard({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: "gold" | "ink" | "green";
}) {
  const toneClass =
    tone === "gold"
      ? "text-gold"
      : tone === "green"
        ? "text-success"
        : "text-ink";
  return (
    <div className="flex flex-col">
      <span className={`score-num text-2xl font-semibold sm:text-3xl ${toneClass}`}>
        {value}
      </span>
      <span className="mt-1.5 score-num text-[10px] uppercase tracking-[0.24em] text-ink-muted">
        {label}
      </span>
    </div>
  );
}

function HeroMockCard() {
  return (
    <div className="relative">
      <div className="surface-elevated relative overflow-hidden p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-80"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--color-gold), transparent)",
          }}
        />
        <div className="flex items-start justify-between">
          <div>
            <div className="text-eyebrow">June plan</div>
            <div className="mt-1 text-xs text-ink-secondary">
              50 / 30 / 20 — auto-calculated
            </div>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-md border border-[#2f2f38] bg-bg shadow-[0_0_0_1px_rgba(212,175,55,0.18)_inset] text-gold">
            <Target className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-end gap-2">
            <div className="score-num text-3xl font-semibold tracking-tight text-ink">
              $4,200
            </div>
            <div className="mb-1 text-xs text-ink-secondary">
              monthly NIL income
            </div>
          </div>

          <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-bg">
            <div className="h-full w-[50%] bg-ink-muted/60" />
            <div className="h-full w-[30%] bg-gold" />
            <div className="h-full w-[20%] bg-success" />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
            <Allocation tone="needs" label="Needs" value="$2,100" pct="50%" />
            <Allocation tone="wants" label="Wants" value="$1,260" pct="30%" />
            <Allocation
              tone="savings"
              label="Invest"
              value="$840"
              pct="20%"
            />
          </div>
        </div>

        <div className="hairline mt-6" />

        <div className="mt-6 rounded-2xl border border-[#23232a] bg-bg p-4">
          <div className="flex items-center justify-between">
            <div className="text-eyebrow">Recurring deposit</div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft"
              />
              Active
            </span>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="score-num text-xl font-semibold text-ink">
                $250{" "}
                <span className="text-xs font-normal text-ink-secondary">
                  / biweekly
                </span>
              </div>
              <div className="text-xs text-ink-secondary">
                Next: Wed, Jun 24
              </div>
            </div>
            <div className="text-right">
              <div className="score-num text-[10px] uppercase tracking-[0.24em] text-ink-muted">
                of 20% bucket
              </div>
              <div className="score-num text-sm font-semibold text-gold">
                60%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Allocation({
  tone,
  label,
  value,
  pct,
}: {
  tone: "needs" | "wants" | "savings";
  label: string;
  value: string;
  pct: string;
}) {
  const dot =
    tone === "needs"
      ? "bg-ink-muted"
      : tone === "wants"
        ? "bg-gold"
        : "bg-success";
  return (
    <div className="rounded-xl border border-[#23232a] bg-bg p-3">
      <div className="flex items-center gap-1.5 text-ink-secondary">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="mt-1 score-num text-sm font-semibold text-ink">
        {value}
      </div>
      <div className="score-num text-[10px] text-ink-muted">{pct}</div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-3xl">
      <span className="text-eyebrow">{eyebrow}</span>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-ink-secondary">{subtitle}</p>
      )}
    </div>
  );
}

function FeatureTile({
  step,
  icon: Icon,
  title,
  body,
}: {
  step: string;
  icon: typeof Target;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-[#23232a] bg-bg-secondary p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2f2f38] hover:shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--color-gold), transparent)",
        }}
      />
      <div className="flex items-center justify-between">
        <span className="score-num text-[11px] uppercase tracking-[0.28em] text-gold">
          {step}
        </span>
        <span className="score-num text-[10px] uppercase tracking-[0.24em] text-ink-muted">
          Step
        </span>
      </div>
      <div className="mt-6 grid h-10 w-10 place-items-center rounded-md border border-[#2f2f38] bg-bg text-gold">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-secondary">
        {body}
      </p>
    </div>
  );
}

function PrincipleCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-[#23232a] bg-bg-secondary p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2f2f38]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--color-red), transparent)",
        }}
      />
      <div className="flex items-center justify-between">
        <span className="score-num text-[11px] uppercase tracking-[0.28em] text-danger">
          ✕
        </span>
        <span className="score-num text-[10px] uppercase tracking-[0.24em] text-ink-muted">
          Not allowed
        </span>
      </div>
      <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-secondary">
        {body}
      </p>
    </div>
  );
}

function PrivacyRow({
  icon: Icon,
  label,
  body,
}: {
  icon: typeof Lock;
  label: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#23232a] bg-bg p-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#23232a] bg-bg-secondary text-ink-secondary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold text-ink">{label}</div>
        <div className="text-xs text-ink-secondary">{body}</div>
      </div>
    </div>
  );
}
