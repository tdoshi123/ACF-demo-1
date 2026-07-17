/**
 * Program allocation frameworks — ported from the PWC codebase.
 *
 * Each program is a fixed discipline structure the athlete enters. All
 * percentage fields are decimals (0.25 == 25%) so callers can multiply
 * directly against income / check amounts without any conversion step.
 *
 * Invariant: taxes + lifestyleCap + emergency + investing + kids
 * equals 1.00 for every program. retentionTarget == 1 - lifestyleCap.
 */

export interface Program {
  id: string;
  name: string;
  retentionTarget: number;
  taxes: number;
  lifestyleCap: number;
  emergency: number;
  investing: number;
  kids: number;
  purpose: string;
  color: string;
}

export const PROGRAMS: Program[] = [
  {
    id: "nil-foundation",
    name: "NIL Foundation",
    retentionTarget: 0.54,
    taxes: 0.25,
    lifestyleCap: 0.46,
    emergency: 0.15,
    investing: 0.14,
    kids: 0.0,
    purpose: "Build discipline, structure, and stability.",
    color: "#22c55e",
  },
  {
    id: "prime-window-protocol",
    name: "Prime Window Protocol",
    retentionTarget: 0.62,
    taxes: 0.25,
    lifestyleCap: 0.38,
    emergency: 0.12,
    investing: 0.25,
    kids: 0.0,
    purpose: "Maximize the athlete earning window.",
    color: "#d4af37",
  },
  {
    id: "legacy-builder",
    name: "Legacy Builder",
    retentionTarget: 0.72,
    taxes: 0.25,
    lifestyleCap: 0.28,
    emergency: 0.1,
    investing: 0.35,
    kids: 0.02,
    purpose: "Build generational wealth and long-term durability.",
    color: "#e5e4e2",
  },
];

export function getProgramById(id: string): Program | null {
  return PROGRAMS.find((p) => p.id === id) ?? null;
}
