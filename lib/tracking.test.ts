import { describe, expect, it } from "vitest";

import { getProgramById, type Program } from "@/lib/programs";
import {
  calculateLifestyleUsage,
  calculateTotals,
  isLifestyleCapExceeded,
  splitIncome,
} from "@/lib/tracking";
import type { IncomeEvent, IncomeSplit, SpendingLog } from "@/lib/types";

const maybeNilFoundation = getProgramById("nil-foundation");

if (!maybeNilFoundation) {
  throw new Error("nil-foundation program fixture is missing");
}

const nilFoundation: Program = maybeNilFoundation;

function makeSplit(overrides: Partial<IncomeSplit> = {}): IncomeSplit {
  return {
    taxes: 0,
    lifestyle: 0,
    emergency: 0,
    investing: 0,
    kids: 0,
    retainedTotal: 0,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<IncomeEvent> = {}): IncomeEvent {
  return {
    id: "evt-1",
    amount: 0,
    programId: nilFoundation.id,
    receivedDate: "2026-01-01",
    split: makeSplit(),
    ...overrides,
  };
}

function makeSpend(overrides: Partial<SpendingLog> = {}): SpendingLog {
  return {
    id: "spend-1",
    amount: 0,
    category: "food",
    spendDate: "2026-01-01",
    ...overrides,
  };
}

describe("splitIncome", () => {
  it("splits a real program and amount into each bucket by its decimal", () => {
    const split = splitIncome(1000, nilFoundation);

    expect(split.taxes).toBeCloseTo(1000 * nilFoundation.taxes);
    expect(split.lifestyle).toBeCloseTo(1000 * nilFoundation.lifestyleCap);
    expect(split.emergency).toBeCloseTo(1000 * nilFoundation.emergency);
    expect(split.investing).toBeCloseTo(1000 * nilFoundation.investing);
    expect(split.kids).toBeCloseTo(1000 * nilFoundation.kids);
    expect(split.retainedTotal).toBeCloseTo(
      split.emergency + split.investing + split.kids,
    );
  });

  it("excludes taxes from retainedTotal", () => {
    const split = splitIncome(1000, nilFoundation);

    expect(split.retainedTotal).not.toBeCloseTo(
      split.taxes + split.emergency + split.investing + split.kids,
    );
    expect(split.retainedTotal).toBeCloseTo(
      split.emergency + split.investing + split.kids,
    );
  });

  it("returns the zero split when program is null", () => {
    expect(splitIncome(1000, null)).toEqual(makeSplit());
  });

  it("never produces a controlledRisk key on the split", () => {
    const split = splitIncome(1000, nilFoundation);

    expect(Object.keys(split)).not.toContain("controlledRisk");
    expect(
      (split as unknown as Record<string, unknown>).controlledRisk,
    ).toBeUndefined();
  });

  it.each([
    ["zero", 0],
    ["negative", -500],
    ["NaN", NaN],
    ["non-numeric", "not-a-number" as unknown as number],
  ])("returns the zero split when amount is %s", (_label, amount) => {
    expect(splitIncome(amount, nilFoundation)).toEqual(makeSplit());
  });
});

describe("calculateTotals", () => {
  it("sums buckets across multiple income events", () => {
    const eventA = makeEvent({
      id: "evt-a",
      amount: 1000,
      split: splitIncome(1000, nilFoundation),
    });
    const eventB = makeEvent({
      id: "evt-b",
      amount: 500,
      split: splitIncome(500, nilFoundation),
    });

    const totals = calculateTotals([eventA, eventB], []);

    expect(totals.totalIncome).toBeCloseTo(1500);
    expect(totals.totalTaxes).toBeCloseTo(
      eventA.split.taxes + eventB.split.taxes,
    );
    expect(totals.totalLifestyleAllocated).toBeCloseTo(
      eventA.split.lifestyle + eventB.split.lifestyle,
    );
    expect(totals.totalRetained).toBeCloseTo(
      eventA.split.retainedTotal + eventB.split.retainedTotal,
    );
  });

  it("uses an event's stored split rather than recomputing it", () => {
    const storedSplit = makeSplit({
      taxes: 999,
      lifestyle: 111,
      emergency: 222,
      investing: 333,
      kids: 5,
      retainedTotal: 222 + 333 + 5,
    });
    const event = makeEvent({
      amount: 1000,
      programId: nilFoundation.id,
      split: storedSplit,
    });

    const totals = calculateTotals([event], []);

    expect(totals.totalTaxes).toBeCloseTo(storedSplit.taxes);
    expect(totals.totalLifestyleAllocated).toBeCloseTo(storedSplit.lifestyle);
    expect(totals.totalEmergency).toBeCloseTo(storedSplit.emergency);
    expect(totals.totalInvesting).toBeCloseTo(storedSplit.investing);
    expect(totals.totalKids).toBeCloseTo(storedSplit.kids);
    expect(totals.totalRetained).toBeCloseTo(storedSplit.retainedTotal);
  });

  it("handles empty arrays", () => {
    const totals = calculateTotals([], []);

    expect(totals.totalIncome).toBe(0);
    expect(totals.totalRetained).toBe(0);
    expect(totals.lifestyleRemaining).toBe(0);
  });

  it("skips null entries in either array", () => {
    const event = makeEvent({
      amount: 1000,
      split: splitIncome(1000, nilFoundation),
    });
    const spend = makeSpend({ amount: 50 });

    const totals = calculateTotals(
      [event, null as unknown as IncomeEvent],
      [spend, null as unknown as SpendingLog],
    );

    expect(totals.totalIncome).toBeCloseTo(1000);
    expect(totals.totalLifestyleSpent).toBeCloseTo(50);
  });

  it("ignores a stale controlledRisk key on a historical stored split (edge case 6)", () => {
    // Older localStorage IncomeEvents may still carry a controlledRisk key
    // from before the field was removed from IncomeSplit. resolveEventSplit
    // uses the stored split as-is, and calculateTotals must not read or sum
    // that extra key.
    const staleSplit = {
      taxes: 250,
      lifestyle: 380,
      emergency: 150,
      investing: 200,
      kids: 0,
      controlledRisk: 20,
      retainedTotal: 350,
    } as unknown as IncomeSplit;
    const event = makeEvent({ amount: 1000, split: staleSplit });

    const totals = calculateTotals([event], []);

    expect(totals.totalRetained).toBeCloseTo(350);
    expect(
      (totals as unknown as Record<string, unknown>).totalControlledRisk,
    ).toBeUndefined();
    expect(Object.keys(totals)).not.toContain("totalControlledRisk");
  });

  it("does not define totalControlledRisk on aggregated totals", () => {
    const event = makeEvent({
      amount: 1000,
      split: splitIncome(1000, nilFoundation),
    });

    const totals = calculateTotals([event], []);

    expect(Object.keys(totals)).not.toContain("totalControlledRisk");
  });

  it("handles non-array input without throwing", () => {
    const totals = calculateTotals(
      undefined as unknown as IncomeEvent[],
      null as unknown as SpendingLog[],
    );

    expect(totals).toEqual({
      totalIncome: 0,
      totalTaxes: 0,
      totalLifestyleAllocated: 0,
      totalLifestyleSpent: 0,
      totalEmergency: 0,
      totalInvesting: 0,
      totalKids: 0,
      totalRetained: 0,
      lifestyleRemaining: 0,
    });
  });

  it("computes lifestyleRemaining as allocated minus spent", () => {
    const event = makeEvent({
      amount: 1000,
      split: splitIncome(1000, nilFoundation),
    });
    const spend = makeSpend({ amount: 100 });

    const totals = calculateTotals([event], [spend]);

    expect(totals.lifestyleRemaining).toBeCloseTo(
      totals.totalLifestyleAllocated - totals.totalLifestyleSpent,
    );
  });
});

describe("calculateLifestyleUsage", () => {
  it("returns 0 when allocated is 0", () => {
    expect(calculateLifestyleUsage(100, 0)).toBe(0);
  });
});

describe("isLifestyleCapExceeded", () => {
  it("is true only when spent is greater than allocated", () => {
    expect(isLifestyleCapExceeded(150, 100)).toBe(true);
    expect(isLifestyleCapExceeded(100, 100)).toBe(false);
    expect(isLifestyleCapExceeded(50, 100)).toBe(false);
  });
});
