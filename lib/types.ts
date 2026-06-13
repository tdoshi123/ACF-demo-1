export type RiskProfile =
  | "conservative"
  | "moderately_conservative"
  | "balanced"
  | "growth"
  | "aggressive_growth";

export type WalletStatus = "connected" | "pending" | "not_connected";

export type DepositFrequency = "weekly" | "biweekly" | "monthly";

export type FundingSource =
  | "teamworks_wallet_ach"
  | "external_bank"
  | "manual_pending";

export interface AthleteProfile {
  firstName: string;
  lastName: string;
  school: string;
  sport: string;
  classYear: string;
  avatarInitials: string;
}

export interface TeamworksIdentity {
  teamworksId: string;
  email: string;
  verified: boolean;
  lastSync: string;
}

/**
 * Snapshot of the mock Teamworks athlete returned by the simulated auth flow.
 * Used by the onboarding flow to display the post-auth "identity verified" card
 * and to persist a baseline athlete profile to localStorage.
 */
export interface AthleteIdentity {
  name: string;
  email: string;
  teamworksUserId: string;
  school: string;
  sport: string;
  athleteStatus: "Verified" | "Pending" | "Unverified";
  walletAvailability: "Available" | "Unavailable";
  walletConnection: "Connected" | "Not Connected";
}

export interface TeamworksWallet {
  status: WalletStatus;
  maskedAccount: string;
  lastDeposit: string;
  monthToDateDeposits: number;
}

export interface WalletConnectionState {
  status: WalletStatus;
  connectedAt: string | null;
  preferredMethod: "ACH" | "Venmo" | "PayPal" | "Other" | null;
}

export interface MonthlyIncome {
  month: string;
  amount: number;
  source: string;
}

export interface FiftyThirtyTwentyPlan {
  income: number;
  needs: number;
  wants: number;
  savingsInvesting: number;
}

export interface RecurringDeposit {
  amount: number;
  frequency: DepositFrequency;
  nextDate: string;
  active: boolean;
  fundingSource?: FundingSource;
  startDate?: string;
}

export interface PortfolioSlice {
  label: string;
  percent: number;
  color: string;
}

export interface ModelPortfolio {
  risk: RiskProfile;
  name: string;
  expectedReturn: string;
  volatility: string;
  description: string;
  allocation: PortfolioSlice[];
}

export interface ContributionPoint {
  date: string;
  amount: number;
  cumulative: number;
}

export type EducationCategory =
  | "NIL"
  | "Budgeting"
  | "Investing"
  | "Taxes"
  | "Mindset";

export type ModuleStatus =
  | "complete"
  | "in_progress"
  | "not_started"
  | "locked";

/**
 * Education module shape. `content` is rendered inline inside a lesson
 * modal/expanded card so we keep it short, structured, and skim-friendly.
 */
export interface EducationModule {
  id: string;
  title: string;
  shortDescription: string;
  category: EducationCategory;
  estimatedMinutes: number;
  /** Lesson body — paragraph + key takeaways. */
  content: {
    intro: string;
    body: string[];
    keyTakeaways: string[];
  };
  /** Default progress percent if user has no saved state. */
  defaultProgress: number;
  /** True if module is locked until prerequisites are met. */
  locked: boolean;
}

export interface BadgeDefinition {
  id: string;
  label: string;
  description: string;
  requirement: string;
  /** 0..100 default progress shown before any user activity overrides it. */
  defaultProgress: number;
}

export interface RiskAnswer {
  questionId: string;
  /** 0..3 risk-tolerance weight. Higher = more growth-oriented. */
  value: number;
}
