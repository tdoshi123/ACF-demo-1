import type {
  ContributionPoint,
  EducationModule,
  FiftyThirtyTwentyPlan,
  RiskAnswer,
  RiskProfile,
} from "./types";

export function calculateNeeds(income: number): number {
  return round2(income * 0.5);
}

export function calculateWants(income: number): number {
  return round2(income * 0.3);
}

export function calculateSavingsInvesting(income: number): number {
  return round2(income * 0.2);
}

export function buildPlan(income: number): FiftyThirtyTwentyPlan {
  return {
    income,
    needs: calculateNeeds(income),
    wants: calculateWants(income),
    savingsInvesting: calculateSavingsInvesting(income),
  };
}

/**
 * Returns a 0..100 percentage of the monthly savings/investing target that the
 * current recurring deposit consumes.
 *
 * - Capped at 999 to keep the UI from blowing up if the user enters something silly.
 * - Treats 0 income or 0 target as 0 to avoid divide-by-zero.
 */
export function calculatePercentOfSavingsTargetUsed(
  monthlyDeposit: number,
  savingsTarget: number,
): number {
  if (!savingsTarget || savingsTarget <= 0) return 0;
  const pct = (monthlyDeposit / savingsTarget) * 100;
  return Math.min(999, Math.max(0, Math.round(pct)));
}

export type DepositWarningLevel = "ok" | "low" | "over";

export interface DepositWarning {
  level: DepositWarningLevel;
  title: string;
  message: string;
}

/**
 * The 20% savings/investing bucket is the ceiling for what we recommend depositing.
 * - "over": deposit exceeds the 20% bucket
 * - "low":  deposit is below 25% of the bucket — likely under-using NIL income
 * - "ok":   deposit is in the healthy band
 */
export function determineDepositWarning(
  monthlyDeposit: number,
  savingsTarget: number,
): DepositWarning {
  if (savingsTarget <= 0) {
    return {
      level: "low",
      title: "Add your monthly NIL income first",
      message:
        "We need your monthly NIL income to calculate a safe recurring amount.",
    };
  }

  if (monthlyDeposit > savingsTarget) {
    return {
      level: "over",
      title: "Above your 20% target",
      message:
        "You selected an amount higher than your 20% savings/investing target. Make sure this does not interfere with needs, taxes, or emergency savings.",
    };
  }

  if (monthlyDeposit < savingsTarget * 0.25) {
    return {
      level: "low",
      title: "Below the recommended range",
      message:
        "You are using less than 25% of your savings/investing bucket. You can safely contribute more without affecting needs or wants.",
    };
  }

  return {
    level: "ok",
    title: "In a healthy range",
    message:
      "Your recurring amount fits inside the 20% savings/investing bucket from your monthly plan.",
  };
}

/**
 * 5-tier risk scoring.
 *
 * Each answer carries a 0..3 weight (higher = more growth-tolerant).
 * With 5 questions, the total score lands in 0..15. We bucket evenly:
 *
 *   0–3   → conservative
 *   4–6   → moderately_conservative
 *   7–9   → balanced
 *   10–12 → growth
 *   13–15 → aggressive_growth
 *
 * Falls back to "balanced" when no answers are provided, which is the safe
 * middle-of-the-road default we show during onboarding.
 */
export function recommendPortfolioFromRiskAnswers(
  answers: RiskAnswer[],
): RiskProfile {
  if (!answers.length) return "balanced";
  const total = answers.reduce((sum, a) => sum + a.value, 0);
  if (total <= 3) return "conservative";
  if (total <= 6) return "moderately_conservative";
  if (total <= 9) return "balanced";
  if (total <= 12) return "growth";
  return "aggressive_growth";
}

/** Human-readable label for a 5-tier risk profile (e.g. "Moderately Conservative"). */
export function riskProfileLabel(profile: RiskProfile): string {
  switch (profile) {
    case "conservative":
      return "Conservative";
    case "moderately_conservative":
      return "Moderately Conservative";
    case "balanced":
      return "Balanced";
    case "growth":
      return "Growth";
    case "aggressive_growth":
      return "Aggressive Growth";
  }
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatCurrencyPrecise(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* ----------------------------------------------------------------------------
 * Education progress helpers
 *
 * Education progress is keyed by module id and lives in localStorage. A module
 * is treated as "complete" when its stored progress hits 100. When no value is
 * stored, we fall back to the module's `defaultProgress` so first-time users
 * still see a populated UI.
 * -------------------------------------------------------------------------- */

export type ProgressMap = Record<string, number>;

export function getModuleProgress(
  module: EducationModule,
  progressMap: ProgressMap,
): number {
  const stored = progressMap[module.id];
  if (typeof stored === "number") return clampPct(stored);
  return clampPct(module.defaultProgress);
}

export type ModuleStatusComputed =
  | "complete"
  | "in_progress"
  | "not_started"
  | "locked";

export function getModuleStatus(
  module: EducationModule,
  progressMap: ProgressMap,
): ModuleStatusComputed {
  if (module.locked) return "locked";
  const pct = getModuleProgress(module, progressMap);
  if (pct >= 100) return "complete";
  if (pct > 0) return "in_progress";
  return "not_started";
}

export function overallEducationProgress(
  modules: EducationModule[],
  progressMap: ProgressMap,
): number {
  if (!modules.length) return 0;
  const total = modules.reduce(
    (sum, m) => sum + getModuleProgress(m, progressMap),
    0,
  );
  return Math.round(total / modules.length);
}

export function moduleCtaLabel(status: ModuleStatusComputed): string {
  switch (status) {
    case "complete":
      return "Review";
    case "in_progress":
      return "Continue";
    case "not_started":
      return "Start";
    case "locked":
      return "Locked";
  }
}

export function moduleStatusLabel(status: ModuleStatusComputed): string {
  switch (status) {
    case "complete":
      return "Complete";
    case "in_progress":
      return "In Progress";
    case "not_started":
      return "Not Started";
    case "locked":
      return "Locked";
  }
}

/* ----------------------------------------------------------------------------
 * Mock portfolio math
 *
 * The frontend MVP does not move money, so portfolio metrics are derived from
 * contribution history + a flat mock "growth" delta. Keeps the demo honest.
 * -------------------------------------------------------------------------- */

export function totalContributed(history: ContributionPoint[]): number {
  return history.reduce((sum, p) => sum + p.amount, 0);
}

export function monthlyDepositEquivalent(
  amount: number,
  frequency: "weekly" | "biweekly" | "monthly",
): number {
  if (frequency === "weekly") return amount * 4;
  if (frequency === "biweekly") return amount * 2;
  return amount;
}

/**
 * Returns formatted balance change vs. the previous month using the last two
 * cumulative points from the contribution history.
 */
export function lastMonthDelta(history: ContributionPoint[]): number {
  if (history.length === 0) return 0;
  return history[history.length - 1].amount;
}

function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
