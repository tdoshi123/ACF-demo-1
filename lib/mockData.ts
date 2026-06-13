import type {
  AthleteProfile,
  BadgeDefinition,
  ContributionPoint,
  EducationModule,
  FiftyThirtyTwentyPlan,
  ModelPortfolio,
  MonthlyIncome,
  RecurringDeposit,
  RiskProfile,
  TeamworksIdentity,
  TeamworksWallet,
} from "./types";

export const mockAthlete: AthleteProfile = {
  firstName: "Jordan",
  lastName: "Reeves",
  school: "State University",
  sport: "Basketball",
  classYear: "Junior",
  avatarInitials: "JR",
};

export const mockTeamworksIdentity: TeamworksIdentity = {
  teamworksId: "TW-2841-JR",
  email: "jordan.reeves@stateu.edu",
  verified: true,
  lastSync: "2026-06-12T14:22:00Z",
};

export const mockWallet: TeamworksWallet = {
  status: "connected",
  maskedAccount: "Wallet •••• 4421",
  lastDeposit: "2026-06-10",
  monthToDateDeposits: 500,
};

export const mockMonthlyIncome: MonthlyIncome = {
  month: "June 2026",
  amount: 4200,
  source: "NIL — Local Auto Dealer + Apparel Drop",
};

export const mockPlan: FiftyThirtyTwentyPlan = {
  income: mockMonthlyIncome.amount,
  needs: mockMonthlyIncome.amount * 0.5,
  wants: mockMonthlyIncome.amount * 0.3,
  savingsInvesting: mockMonthlyIncome.amount * 0.2,
};

export const mockDeposit: RecurringDeposit = {
  amount: 250,
  frequency: "biweekly",
  nextDate: "2026-06-24",
  active: true,
  fundingSource: "teamworks_wallet_ach",
  startDate: "2026-01-15",
};

export const mockRisk: RiskProfile = "balanced";

/**
 * Five model portfolios. The bond/stock split intentionally matches the
 * onboarding risk-profile lesson — the split is the "headline" allocation,
 * with the equity slice broken further into US / International / Cash to give
 * the portfolio page a chart with substance.
 */
export const portfolioByRisk: Record<RiskProfile, ModelPortfolio> = {
  conservative: {
    risk: "conservative",
    name: "Capital Preservation",
    expectedReturn: "3–5% / yr",
    volatility: "Low",
    description:
      "80% bonds, 20% stocks. Designed to protect what you have today. Slow growth, small drawdowns.",
    allocation: [
      { label: "US Bonds", percent: 60, color: "#3B82F6" },
      { label: "International Bonds", percent: 20, color: "#60A5FA" },
      { label: "US Stocks", percent: 15, color: "#D4AF37" },
      { label: "Cash Equivalent", percent: 5, color: "#22C55E" },
    ],
  },
  moderately_conservative: {
    risk: "moderately_conservative",
    name: "Steady Base",
    expectedReturn: "4–6% / yr",
    volatility: "Low-Medium",
    description:
      "60% bonds, 40% stocks. Tilted toward stability, with enough equity to keep up with long-term inflation.",
    allocation: [
      { label: "US Bonds", percent: 45, color: "#3B82F6" },
      { label: "International Bonds", percent: 15, color: "#60A5FA" },
      { label: "US Stocks", percent: 30, color: "#D4AF37" },
      { label: "International Stocks", percent: 10, color: "#8B5CF6" },
    ],
  },
  balanced: {
    risk: "balanced",
    name: "Balanced Build",
    expectedReturn: "5–7% / yr",
    volatility: "Medium",
    description:
      "50% bonds, 50% stocks. A true middle path — meaningful long-term growth without the full swing of an all-equity portfolio.",
    allocation: [
      { label: "US Bonds", percent: 40, color: "#3B82F6" },
      { label: "International Bonds", percent: 10, color: "#60A5FA" },
      { label: "US Stocks", percent: 35, color: "#D4AF37" },
      { label: "International Stocks", percent: 15, color: "#8B5CF6" },
    ],
  },
  growth: {
    risk: "growth",
    name: "Long Horizon Growth",
    expectedReturn: "6–9% / yr",
    volatility: "Higher",
    description:
      "30% bonds, 70% stocks. Built for athletes with a long horizon who can tolerate bigger short-term moves.",
    allocation: [
      { label: "US Stocks", percent: 50, color: "#D4AF37" },
      { label: "International Stocks", percent: 20, color: "#8B5CF6" },
      { label: "US Bonds", percent: 25, color: "#3B82F6" },
      { label: "International Bonds", percent: 5, color: "#60A5FA" },
    ],
  },
  aggressive_growth: {
    risk: "aggressive_growth",
    name: "Aggressive Growth",
    expectedReturn: "7–10% / yr",
    volatility: "High",
    description:
      "10% bonds, 90% stocks. Maximum long-term growth potential. Expect large swings — only fits a long horizon and steady nerves.",
    allocation: [
      { label: "US Stocks", percent: 65, color: "#D4AF37" },
      { label: "International Stocks", percent: 25, color: "#8B5CF6" },
      { label: "US Bonds", percent: 8, color: "#3B82F6" },
      { label: "International Bonds", percent: 2, color: "#60A5FA" },
    ],
  },
};

export const mockPortfolio: ModelPortfolio = portfolioByRisk[mockRisk];

/**
 * Six months of contribution history. Monthly amounts match the spec
 * (Jan 100, Feb 100, Mar 150, Apr 100, May 250, Jun 250) with a running
 * cumulative total for the dashboard area chart.
 */
export const mockContributions: ContributionPoint[] = (() => {
  const monthlyAmounts: [string, number][] = [
    ["Jan", 100],
    ["Feb", 100],
    ["Mar", 150],
    ["Apr", 100],
    ["May", 250],
    ["Jun", 250],
  ];
  let running = 0;
  return monthlyAmounts.map(([month, amount]) => {
    running += amount;
    return { date: month, amount, cumulative: running };
  });
})();

export const mockTotalContributed = mockContributions.reduce(
  (sum, c) => sum + c.amount,
  0,
);

/**
 * Mock portfolio balance = contributions + a small flat mock growth
 * (so the UI can show a "growth" line without pretending to be real).
 */
export const mockPortfolioGrowth = 78;
export const mockPortfolioBalance = mockTotalContributed + mockPortfolioGrowth;

export const mockStreakMonths = 6;
export const mockStreakDays = 178;

/* ----------------------------------------------------------------------------
 * Education modules — the 10 topics required by the product brief.
 * Each module has bite-sized content that is rendered inside the lesson modal.
 * -------------------------------------------------------------------------- */

export const mockEducationModules: EducationModule[] = [
  {
    id: "nil-basics",
    title: "NIL income basics",
    shortDescription:
      "How NIL money is earned, paid, and what makes it different from a normal paycheck.",
    category: "NIL",
    estimatedMinutes: 5,
    defaultProgress: 100,
    locked: false,
    content: {
      intro:
        "Name, Image and Likeness (NIL) lets college athletes earn money from their personal brand. The income is real — but it does not behave like a W-2 job.",
      body: [
        "NIL payments can come from a brand, collective, agency, or marketplace. They are usually treated as self-employment income, which means you are responsible for tracking and reporting it.",
        "Payments may land in your bank account, your Teamworks Wallet, or a third-party platform. The path depends on the deal.",
        "Because NIL is not consistent month-to-month, planning matters more than for a salaried job. A good month is not a budget — it is an opportunity.",
      ],
      keyTakeaways: [
        "NIL is most often self-employment income.",
        "Payment paths vary by deal — track every one.",
        "Plan against your average month, not your peak month.",
      ],
    },
  },
  {
    id: "taxes-not-withheld",
    title: "Taxes are not always withheld",
    shortDescription:
      "Why NIL checks usually land 'gross' and how to set money aside before April.",
    category: "Taxes",
    estimatedMinutes: 6,
    defaultProgress: 60,
    locked: false,
    content: {
      intro:
        "Most NIL payments arrive without any taxes taken out. That money is not all yours — a chunk belongs to the IRS and your state.",
      body: [
        "A good rule of thumb is to set aside 25–30% of each NIL payment for federal and state taxes. The exact number depends on your bracket.",
        "If your NIL income is large, the IRS expects you to pay estimated quarterly taxes (April, June, September, January). Missing them can mean penalties.",
        "Keep a separate savings account for taxes. Treat that money as already-spent.",
      ],
      keyTakeaways: [
        "Default to 25–30% set aside per NIL payment.",
        "Quarterly estimated payments may apply.",
        "Use a separate 'tax' bucket — do not co-mingle with spending money.",
      ],
    },
  },
  {
    id: "503020-rule",
    title: "50/30/20 budget rule",
    shortDescription:
      "The simple split: half to needs, 30% to wants, 20% to save and invest.",
    category: "Budgeting",
    estimatedMinutes: 4,
    defaultProgress: 80,
    locked: false,
    content: {
      intro:
        "The 50/30/20 rule is a starting framework, not a law. It works because it is simple enough to use every month.",
      body: [
        "50% Needs — rent, groceries, bills, transportation, insurance, school costs, training essentials.",
        "30% Wants — eating out, clothes, travel, subscriptions, lifestyle purchases.",
        "20% Save & Invest — emergency fund, recurring investing through this app, future goals.",
        "The 20% bucket is the ceiling for what you should be investing — not the floor.",
      ],
      keyTakeaways: [
        "Half of income goes to required living expenses.",
        "20% is your investing ceiling, not floor.",
        "Adjust the split for your real life — keep the structure.",
      ],
    },
  },
  {
    id: "needs-vs-wants",
    title: "Needs vs wants",
    shortDescription:
      "A 30-second test for whether a purchase belongs in your needs bucket.",
    category: "Budgeting",
    estimatedMinutes: 4,
    defaultProgress: 40,
    locked: false,
    content: {
      intro:
        "The hardest part of 50/30/20 is being honest about what is actually a 'need.'",
      body: [
        "A need is something you cannot reasonably function without — shelter, food, transport to practice and class, insurance, phone, training basics.",
        "A want is anything optional — even if everyone around you is buying it. Eating out, new shoes, a vacation, a nicer car than you need.",
        "When in doubt, ask: 'If my income dropped 30% next month, would I still buy this?'",
      ],
      keyTakeaways: [
        "If income dropped 30%, would you still buy it? If no, it is a want.",
        "Status purchases are wants, even when teammates frame them as needs.",
        "Move wants out of the 50% bucket — that is where overspending hides.",
      ],
    },
  },
  {
    id: "emergency-fund",
    title: "Emergency funds",
    shortDescription:
      "Why a 3-month buffer is what lets you invest with discipline instead of panic.",
    category: "Budgeting",
    estimatedMinutes: 5,
    defaultProgress: 20,
    locked: false,
    content: {
      intro:
        "An emergency fund is the difference between 'investing for the long term' and 'selling investments at the worst possible time.'",
      body: [
        "Target: 3 months of essential expenses (rent, food, bills, transport).",
        "Park it in a high-yield savings account — not invested, not in checking.",
        "Build it before you scale up investing. Once it exists, leave it alone.",
        "A real emergency is a medical bill, lost income, or a car repair — not a sale at your favorite store.",
      ],
      keyTakeaways: [
        "Start with 3 months of essential expenses.",
        "Hold it in cash — high-yield savings, not investments.",
        "Build the fund first, then scale your investing.",
      ],
    },
  },
  {
    id: "compound-growth",
    title: "Compound growth",
    shortDescription:
      "Why steady, boring contributions outperform brilliant timing.",
    category: "Investing",
    estimatedMinutes: 6,
    defaultProgress: 10,
    locked: false,
    content: {
      intro:
        "Compound growth is what happens when your returns also earn returns. Over decades it does most of the heavy lifting — not your stock picks.",
      body: [
        "$200/month at a 7% average return becomes roughly $24,000 in 8 years, ~$104,000 in 20, and over $260,000 in 30.",
        "The single biggest input is time. The second is consistency. The third — distantly — is rate of return.",
        "Skipping a year early in your career costs more than any single year later. Showing up matters.",
      ],
      keyTakeaways: [
        "Time is the strongest input. Start now, not later.",
        "Consistency beats timing.",
        "Returns matter — but less than people think.",
      ],
    },
  },
  {
    id: "bonds-vs-stocks",
    title: "Bonds vs stocks",
    shortDescription:
      "What you actually own when you buy each, and why the mix matters.",
    category: "Investing",
    estimatedMinutes: 6,
    defaultProgress: 0,
    locked: false,
    content: {
      intro:
        "Every model portfolio in this app is some mix of stocks and bonds. Knowing what each one is changes how you react to market moves.",
      body: [
        "Stocks = partial ownership of a company. Higher long-term returns, bigger short-term swings.",
        "Bonds = loans to a company or government. Lower long-term returns, smaller swings, regular interest.",
        "A 'balanced' portfolio uses both — the bond piece is shock absorption when stocks fall.",
        "Younger investors with long horizons usually carry more stocks. As you get closer to using the money, you generally shift toward bonds.",
      ],
      keyTakeaways: [
        "Stocks = ownership + bigger swings.",
        "Bonds = lending + smaller swings.",
        "The mix is what controls your portfolio's behavior.",
      ],
    },
  },
  {
    id: "risk-volatility",
    title: "Risk and volatility",
    shortDescription:
      "Why a portfolio that drops 20% is not the same as a portfolio that 'lost money.'",
    category: "Investing",
    estimatedMinutes: 5,
    defaultProgress: 0,
    locked: false,
    content: {
      intro:
        "Volatility is how much your portfolio moves up and down. Risk is the chance of permanently losing money.",
      body: [
        "Markets fall regularly. 10–15% drops happen roughly once a year. 20%+ drops happen every few years.",
        "If you stay invested through a drop, history shows recovery. If you sell during the drop, the loss becomes real.",
        "Your tolerance for volatility is what your risk-profile quiz measures. The right portfolio is the one you will not sell out of when it falls.",
      ],
      keyTakeaways: [
        "Volatility = movement. Risk = permanent loss.",
        "Selling during a drop converts paper losses into real ones.",
        "The right portfolio is the one you can hold through the worst week.",
      ],
    },
  },
  {
    id: "no-day-trade",
    title: "Why not to day trade",
    shortDescription:
      "The math on active trading vs recurring, structured investing.",
    category: "Investing",
    estimatedMinutes: 5,
    defaultProgress: 0,
    locked: false,
    content: {
      intro:
        "Day trading looks exciting. The data is brutal: most day traders lose money, and the ones who do not still rarely beat a boring index fund.",
      body: [
        "Multiple academic studies find that 70–90% of active day traders lose money over any meaningful period.",
        "Trading has hidden costs: fees, taxes on short-term gains (taxed at higher rates), and time you cannot get back.",
        "Recurring investing into a diversified model portfolio is what works for most people. Athlete Collective Fund only supports that path on purpose.",
      ],
      keyTakeaways: [
        "Most day traders lose money over time.",
        "Short-term gains are taxed at higher rates.",
        "Discipline beats activity. This app is built that way on purpose.",
      ],
    },
  },
  {
    id: "long-term-discipline",
    title: "Long-term investing discipline",
    shortDescription:
      "The handful of rules that separate compounding from gambling.",
    category: "Mindset",
    estimatedMinutes: 6,
    defaultProgress: 0,
    locked: false,
    content: {
      intro:
        "Discipline is the difference between a portfolio that compounds for 30 years and an account that gets blown up in 18 months.",
      body: [
        "Automate your contributions. Take willpower out of the loop.",
        "Pick a portfolio you can hold through a bad week. Then leave it alone.",
        "Review monthly, not daily. Daily watching invites bad decisions.",
        "When you get a windfall (a big NIL drop), put it through the same plan instead of inventing a new one.",
      ],
      keyTakeaways: [
        "Automate. Diversify. Review monthly. Repeat.",
        "Windfalls do not get special treatment — same plan.",
        "Showing up beats being clever.",
      ],
    },
  },
];

/* ----------------------------------------------------------------------------
 * Badges — exactly the 7 specified by the product brief.
 * Each one has a written requirement and a default progress value used when
 * we do not have user-driven progress to override it with.
 * -------------------------------------------------------------------------- */

export const mockBadges: BadgeDefinition[] = [
  {
    id: "first-deposit",
    label: "First Deposit Complete",
    description: "You made your first recurring contribution. Compounding begins.",
    requirement: "Complete 1 recurring deposit.",
    defaultProgress: 100,
  },
  {
    id: "three-month-streak",
    label: "3-Month Investing Streak",
    description: "Three months of staying on plan. Habits are forming.",
    requirement: "Invest consistently for 3 months in a row.",
    defaultProgress: 100,
  },
  {
    id: "six-month-streak",
    label: "6-Month Consistency Badge",
    description: "Half a year of discipline. The hard part is behind you.",
    requirement: "Invest consistently for 6 months in a row.",
    defaultProgress: 100,
  },
  {
    id: "503020-certified",
    label: "50/30/20 Certified",
    description: "You understand and follow the 50/30/20 structure.",
    requirement: "Complete the 50/30/20 budget rule lesson.",
    defaultProgress: 80,
  },
  {
    id: "risk-discipline",
    label: "Risk Discipline Badge",
    description: "You completed the risk profile quiz and stuck with the plan.",
    requirement: "Complete the risk and volatility lesson and hold your portfolio through a drawdown.",
    defaultProgress: 40,
  },
  {
    id: "emergency-fund-complete",
    label: "Emergency Fund Lesson Complete",
    description: "You understand why a 3-month buffer comes before investing.",
    requirement: "Complete the emergency fund lesson.",
    defaultProgress: 20,
  },
  {
    id: "long-term-investor",
    label: "Long-Term Investor Badge",
    description: "You have built the mindset to stay invested for the long run.",
    requirement: "Complete the long-term investing discipline lesson.",
    defaultProgress: 0,
  },
];

