import { describe, expect, it } from "vitest";

import { getProgramById, PROGRAMS, type Program } from "@/lib/programs";

const BUCKET_KEYS = ["taxes", "lifestyleCap", "emergency", "investing", "kids"] as const;

describe("PROGRAMS", () => {
  it("has exactly the three known programs", () => {
    expect(PROGRAMS.map((p) => p.id)).toEqual([
      "nil-foundation",
      "prime-window-protocol",
      "legacy-builder",
    ]);
  });

  it.each(PROGRAMS.map((p) => [p.id, p] as const))(
    "sums taxes + lifestyleCap + emergency + investing + kids to 1.00 for %s",
    (_id, program) => {
      const sum = BUCKET_KEYS.reduce((acc, key) => acc + program[key], 0);
      expect(sum).toBeCloseTo(1.0, 5);
    },
  );

  it.each(PROGRAMS.map((p) => [p.id, p] as const))(
    "does not define a controlledRisk field on %s",
    (_id, program) => {
      expect((program as unknown as Record<string, unknown>).controlledRisk).toBeUndefined();
      expect(Object.keys(program)).not.toContain("controlledRisk");
    },
  );

  it("keeps retentionTarget consistent with 1 - lifestyleCap", () => {
    for (const program of PROGRAMS) {
      expect(program.retentionTarget).toBeCloseTo(1 - program.lifestyleCap, 5);
    }
  });

  it("folded each program's freed controlledRisk % into investing per the spec", () => {
    // NIL Foundation: investing 0.10 -> 0.14 (was controlledRisk 0.04)
    // Prime Window Protocol: investing 0.20 -> 0.25 (was controlledRisk 0.05)
    // Legacy Builder: investing 0.30 -> 0.35 (was controlledRisk 0.05)
    const expected: Record<string, number> = {
      "nil-foundation": 0.14,
      "prime-window-protocol": 0.25,
      "legacy-builder": 0.35,
    };

    for (const [id, investing] of Object.entries(expected)) {
      const program = getProgramById(id);
      expect(program).not.toBeNull();
      expect(program?.investing).toBeCloseTo(investing, 5);
    }
  });
});

describe("getProgramById", () => {
  it("returns the matching program for a known id", () => {
    const program = getProgramById("legacy-builder");
    expect(program?.name).toBe("Legacy Builder");
  });

  it("returns null for an unknown id", () => {
    expect(getProgramById("does-not-exist")).toBeNull();
  });
});
