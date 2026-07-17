/**
 * PWC check-tracking math — pure, side-effect-free helpers.
 *
 * Ported from the PWC codebase (src/lib/calculations.js). These power the
 * Enter Check split preview, the Log Spending cap panel, and the dashboard
 * activity totals. They operate on plain data so they're trivial to unit test
 * and safe to call with partial / malformed input from localStorage.
 *
 * Conventions:
 *   - Program percentage fields are decimals (0.25 == 25%).
 *   - Amounts are raw dollars; no rounding happens here. Rounding/formatting
 *     is a display concern (see `formatCurrency` in lib/calculations.ts).
 *   - "Retained" = capital that stays under the athlete's control after a
 *     check clears: emergency + investing + kids. Taxes are
 *     NOT retained — that money leaves the household.
 */

import { getProgramById, type Program } from "./programs";
import type {
  IncomeEvent,
  IncomeSplit,
  SpendingLog,
  TrackingTotals,
} from "./types";

/** Coerce anything to a finite, positive number, else 0. */
function toAmount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const ZERO_SPLIT: IncomeSplit = {
  taxes: 0,
  lifestyle: 0,
  emergency: 0,
  investing: 0,
  kids: 0,
  retainedTotal: 0,
};

const ZERO_TOTALS: TrackingTotals = {
  totalIncome: 0,
  totalTaxes: 0,
  totalLifestyleAllocated: 0,
  totalLifestyleSpent: 0,
  totalEmergency: 0,
  totalInvesting: 0,
  totalKids: 0,
  totalRetained: 0,
  lifestyleRemaining: 0,
};

/**
 * Break a single check into its program-defined buckets.
 *
 * A null program or non-positive amount returns a zeroed split so callers can
 * render previews without guarding every field.
 */
export function splitIncome(
  amount: number,
  program: Program | null,
): IncomeSplit {
  const value = toAmount(amount);
  if (!program || value === 0) return { ...ZERO_SPLIT };

  const taxes = value * (Number(program.taxes) || 0);
  const lifestyle = value * (Number(program.lifestyleCap) || 0);
  const emergency = value * (Number(program.emergency) || 0);
  const investing = value * (Number(program.investing) || 0);
  const kids = value * (Number(program.kids) || 0);

  return {
    taxes,
    lifestyle,
    emergency,
    investing,
    kids,
    retainedTotal: emergency + investing + kids,
  };
}

/**
 * Resolve the split for an income event. Prefers the split stored at entry
 * time (historical accuracy); falls back to recomputing from the event's
 * program if the stored split is missing (malformed / partial localStorage).
 */
function resolveEventSplit(event: IncomeEvent): IncomeSplit {
  if (event.split) return event.split;
  return splitIncome(event.amount, getProgramById(event.programId));
}

/**
 * Aggregate every check + spending log into a single dashboard payload.
 *
 * Income buckets come from each event's stored `split`. Every logged spend
 * draws from the lifestyle bucket — non-lifestyle categories are tracked
 * elsewhere.
 */
export function calculateTotals(
  incomeEvents: IncomeEvent[],
  spendingLogs: SpendingLog[],
): TrackingTotals {
  const checks = Array.isArray(incomeEvents) ? incomeEvents : [];
  const spends = Array.isArray(spendingLogs) ? spendingLogs : [];

  const totals: TrackingTotals = { ...ZERO_TOTALS };

  for (const event of checks) {
    if (!event) continue;
    const split = resolveEventSplit(event);
    totals.totalIncome += toAmount(event.amount);
    totals.totalTaxes += split.taxes;
    totals.totalLifestyleAllocated += split.lifestyle;
    totals.totalEmergency += split.emergency;
    totals.totalInvesting += split.investing;
    totals.totalKids += split.kids;
    totals.totalRetained += split.retainedTotal;
  }

  for (const log of spends) {
    if (!log) continue;
    totals.totalLifestyleSpent += toAmount(log.amount);
  }

  totals.lifestyleRemaining =
    totals.totalLifestyleAllocated - totals.totalLifestyleSpent;

  return totals;
}

/** Lifestyle spend as a 0–100+ integer percentage of the lifestyle envelope. */
export function calculateLifestyleUsage(
  totalLifestyleSpent: number,
  totalLifestyleAllocated: number,
): number {
  const spent = Number(totalLifestyleSpent);
  const allocated = Number(totalLifestyleAllocated);
  if (!Number.isFinite(spent) || !Number.isFinite(allocated) || allocated <= 0) {
    return 0;
  }
  return Math.round((spent / allocated) * 100);
}

/** True when spend has passed the lifestyle cap for the period. */
export function isLifestyleCapExceeded(
  totalLifestyleSpent: number,
  totalLifestyleAllocated: number,
): boolean {
  const spent = Number(totalLifestyleSpent);
  const allocated = Number(totalLifestyleAllocated);
  if (!Number.isFinite(spent) || !Number.isFinite(allocated)) return false;
  return spent > allocated;
}
