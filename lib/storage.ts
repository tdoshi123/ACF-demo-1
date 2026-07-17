/**
 * Thin localStorage wrapper.
 * Safe to call on the server — all reads/writes no-op when `window` is undefined.
 */

const PREFIX = "acf:";

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota / serialization errors — this is a mock store
  }
}

export function remove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

/**
 * Remove every acf:* key. Used by the "reset demo data" action in settings.
 */
export function clearAll(): void {
  if (typeof window === "undefined") return;
  try {
    const toDelete: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(PREFIX)) toDelete.push(key);
    }
    toDelete.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

export const StorageKeys = {
  authed: "authed",
  onboardingComplete: "onboarding-complete",
  athleteIdentity: "athlete-identity",
  income: "income",
  incomeEvents: "income-events",
  spendingLogs: "spending-logs",
  program: "selected-program",
  wallet: "wallet-connection",
  deposit: "deposit",
  depositPaused: "deposit-paused",
  risk: "risk",
  riskAllocation: "risk-allocation",
  riskAnswers: "risk-answers",
  educationProgress: "education-progress",
  notifications: "notification-prefs",
  language: "language",
} as const;
