import { describe, expect, it } from "vitest";

import {
  resolveAllocation,
  sumSlicePercents,
  summarizeAssetClasses,
} from "@/lib/calculations";
import { portfolioByRisk } from "@/lib/mockData";
import type { CustomAllocation, PortfolioSlice } from "@/lib/types";

function makeSlices(
  overrides: Partial<PortfolioSlice>[] = [],
): PortfolioSlice[] {
  const base: PortfolioSlice[] = [
    { label: "US Stocks", percent: 40, color: "#D4AF37" },
    { label: "International Stocks", percent: 10, color: "#8B5CF6" },
    { label: "US Bonds", percent: 40, color: "#3B82F6" },
    { label: "International Bonds", percent: 10, color: "#60A5FA" },
  ];
  return base.map((slice, i) => ({ ...slice, ...overrides[i] }));
}

describe("sumSlicePercents", () => {
  it("sums slice percents", () => {
    expect(sumSlicePercents(makeSlices())).toBe(100);
  });

  it("returns 0 for an empty array", () => {
    expect(sumSlicePercents([])).toBe(0);
  });

  it("reflects a non-100 total", () => {
    const slices = makeSlices([{ percent: 30 }]);
    expect(sumSlicePercents(slices)).toBe(90);
  });
});

describe("resolveAllocation", () => {
  it("falls back to the preset allocation when custom is null", () => {
    expect(resolveAllocation("balanced", null)).toEqual(
      portfolioByRisk.balanced.allocation,
    );
  });

  it("returns the custom slices when baseRisk matches and it sums to 100", () => {
    const custom: CustomAllocation = {
      baseRisk: "balanced",
      allocation: makeSlices(),
    };
    expect(resolveAllocation("balanced", custom)).toEqual(custom.allocation);
  });

  it("falls back to the preset when the custom baseRisk does not match", () => {
    const custom: CustomAllocation = {
      baseRisk: "growth",
      allocation: makeSlices(),
    };
    expect(resolveAllocation("balanced", custom)).toEqual(
      portfolioByRisk.balanced.allocation,
    );
  });

  it("falls back to the preset when the custom allocation does not sum to 100", () => {
    const custom: CustomAllocation = {
      baseRisk: "balanced",
      allocation: makeSlices([{ percent: 30 }]),
    };
    expect(resolveAllocation("balanced", custom)).toEqual(
      portfolioByRisk.balanced.allocation,
    );
  });
});

describe("summarizeAssetClasses", () => {
  it("groups slices into stocks / bonds / cash totals", () => {
    expect(summarizeAssetClasses(makeSlices())).toEqual({
      stocks: 50,
      bonds: 50,
      cash: 0,
    });
  });

  it("includes cash equivalent slices", () => {
    const slices: PortfolioSlice[] = [
      { label: "US Stocks", percent: 60, color: "#D4AF37" },
      { label: "US Bonds", percent: 35, color: "#3B82F6" },
      { label: "Cash Equivalent", percent: 5, color: "#22C55E" },
    ];
    expect(summarizeAssetClasses(slices)).toEqual({
      stocks: 60,
      bonds: 35,
      cash: 5,
    });
  });

  it("returns zeros for an empty array", () => {
    expect(summarizeAssetClasses([])).toEqual({
      stocks: 0,
      bonds: 0,
      cash: 0,
    });
  });

  it("matches labels case-insensitively", () => {
    const slices: PortfolioSlice[] = [
      { label: "us stocks", percent: 70, color: "#D4AF37" },
      { label: "US BONDS", percent: 30, color: "#3B82F6" },
    ];
    expect(summarizeAssetClasses(slices)).toEqual({
      stocks: 70,
      bonds: 30,
      cash: 0,
    });
  });

  it("ignores a slice whose label matches none of stocks/bonds/cash", () => {
    const slices: PortfolioSlice[] = [
      { label: "US Stocks", percent: 40, color: "#D4AF37" },
      { label: "US Bonds", percent: 40, color: "#3B82F6" },
      { label: "Commodities", percent: 20, color: "#F97316" },
    ];
    expect(summarizeAssetClasses(slices)).toEqual({
      stocks: 40,
      bonds: 40,
      cash: 0,
    });
  });
});

describe("edge cases: allocation persistence gating (spec)", () => {
  it("resolveAllocation never surfaces a custom allocation that sums to something other than 100, even off-by-one", () => {
    const custom: CustomAllocation = {
      baseRisk: "balanced",
      allocation: makeSlices([{ percent: 41 }]), // sums to 101
    };
    expect(resolveAllocation("balanced", custom)).toEqual(
      portfolioByRisk.balanced.allocation,
    );
  });

  it("resolveAllocation falls back to preset for every risk profile when custom is null (default state for all users)", () => {
    const risks: (keyof typeof portfolioByRisk)[] = [
      "conservative",
      "moderately_conservative",
      "balanced",
      "growth",
      "aggressive_growth",
    ];
    for (const risk of risks) {
      expect(resolveAllocation(risk, null)).toEqual(
        portfolioByRisk[risk].allocation,
      );
    }
  });

  it("a 0% slice is preserved (not dropped) and still counts toward the sum", () => {
    const slices = makeSlices([
      { percent: 0 },
      { percent: 30 },
      { percent: 60 },
      { percent: 10 },
    ]);
    expect(sumSlicePercents(slices)).toBe(100);
    expect(slices).toHaveLength(4);
    expect(slices[0].percent).toBe(0);
  });
});
