/**
 * Lifestyle spend categories — ported from the PWC codebase (src/data/defaults.js).
 *
 * Used by the Log Spending page to tag each spend. The stored `SpendingLog.category`
 * holds the `id` (e.g. "food"); the `label` is display-only.
 */

export interface SpendCategory {
  id: string;
  label: string;
}

export const SPEND_CATEGORIES: SpendCategory[] = [
  { id: "food", label: "Food" },
  { id: "training", label: "Training" },
  { id: "travel", label: "Travel" },
  { id: "entertainment", label: "Entertainment" },
  { id: "family", label: "Family" },
  { id: "clothes", label: "Clothes" },
  { id: "other", label: "Other" },
];

export function getCategoryById(id: string): SpendCategory | null {
  return SPEND_CATEGORIES.find((c) => c.id === id) ?? null;
}
