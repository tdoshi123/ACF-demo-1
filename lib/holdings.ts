/**
 * Mock per-holding data used by the portfolio page and the per-asset detail
 * page. Everything here is illustrative — no real prices, no real market data.
 *
 * Per-holding curated fields (description, CEO, headquarters, etc.) live on
 * `HOLDINGS`. Statistics, price history, and earnings are derived from the
 * holding's `seed` so values are deterministic and stable across renders.
 */

export type HoldingType = "stock" | "etf";

export interface Holding {
  ticker: string;
  name: string;
  /** Weight inside its asset-class slice (sums to 1.0 within slice). */
  weight: number;
  /** Current/last price in USD. */
  price: number;
  /** Today's percent change. */
  changePct: number;
  /** Stable seed for deterministic mock data. */
  seed: number;
  /** Slice label this holding belongs to. */
  sliceLabel: string;
  type: HoldingType;
  description: string;
  ceo?: string;
  founded?: number;
  employees?: number;
  headquarters?: string;
}

export const HOLDINGS: Holding[] = [
  // ---------------- US Stocks ----------------
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    weight: 0.4,
    price: 285.2,
    changePct: 0.42,
    seed: 11,
    sliceLabel: "US Stocks",
    type: "etf",
    description:
      "Tracks the CRSP US Total Market Index — broad exposure to the entire US stock market across large, mid, and small-cap companies.",
    ceo: "Salim Ramji",
    founded: 1975,
    employees: 20000,
    headquarters: "Valley Forge, PA",
  },
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    weight: 0.15,
    price: 232.1,
    changePct: 1.08,
    seed: 12,
    sliceLabel: "US Stocks",
    type: "stock",
    description:
      "Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories. Operates a services business spanning the App Store, iCloud, Apple Music, and more.",
    ceo: "Tim Cook",
    founded: 1976,
    employees: 164000,
    headquarters: "Cupertino, CA",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    weight: 0.12,
    price: 498.4,
    changePct: 0.66,
    seed: 13,
    sliceLabel: "US Stocks",
    type: "stock",
    description:
      "Develops, licenses, and supports software, services, devices, and solutions worldwide. Major segments include Productivity & Business Processes, Intelligent Cloud (Azure), and More Personal Computing.",
    ceo: "Satya Nadella",
    founded: 1975,
    employees: 228000,
    headquarters: "Redmond, WA",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    weight: 0.1,
    price: 142.85,
    changePct: 2.41,
    seed: 14,
    sliceLabel: "US Stocks",
    type: "stock",
    description:
      "Designs graphics processing units (GPUs), system-on-chip units, and accelerated computing platforms used in gaming, professional visualization, data center, and automotive markets.",
    ceo: "Jensen Huang",
    founded: 1993,
    employees: 36000,
    headquarters: "Santa Clara, CA",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    weight: 0.08,
    price: 198.32,
    changePct: -0.51,
    seed: 15,
    sliceLabel: "US Stocks",
    type: "stock",
    description:
      "Parent of Google. Operates the world's leading search engine, the Android operating system, YouTube, Google Cloud, Waymo, and DeepMind.",
    ceo: "Sundar Pichai",
    founded: 1998,
    employees: 182000,
    headquarters: "Mountain View, CA",
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    weight: 0.08,
    price: 224.6,
    changePct: 0.92,
    seed: 16,
    sliceLabel: "US Stocks",
    type: "stock",
    description:
      "Engages in e-commerce, cloud computing (AWS), digital advertising, streaming, and AI services across North America and international markets.",
    ceo: "Andy Jassy",
    founded: 1994,
    employees: 1540000,
    headquarters: "Seattle, WA",
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    weight: 0.07,
    price: 612.8,
    changePct: -0.21,
    seed: 17,
    sliceLabel: "US Stocks",
    type: "stock",
    description:
      "Operates Facebook, Instagram, WhatsApp, Messenger, and Reality Labs. Generates revenue primarily from advertising on its family of apps.",
    ceo: "Mark Zuckerberg",
    founded: 2004,
    employees: 74000,
    headquarters: "Menlo Park, CA",
  },

  // ---------------- International Stocks ----------------
  {
    ticker: "VXUS",
    name: "Vanguard Total International Stock ETF",
    weight: 0.5,
    price: 68.4,
    changePct: 0.18,
    seed: 21,
    sliceLabel: "International Stocks",
    type: "etf",
    description:
      "Tracks the FTSE Global All Cap ex US Index — exposure to thousands of stocks in developed and emerging markets outside the United States.",
    ceo: "Salim Ramji",
    founded: 1975,
    employees: 20000,
    headquarters: "Valley Forge, PA",
  },
  {
    ticker: "ASML",
    name: "ASML Holding NV",
    weight: 0.14,
    price: 720.1,
    changePct: 1.32,
    seed: 22,
    sliceLabel: "International Stocks",
    type: "stock",
    description:
      "Sole supplier of extreme-ultraviolet lithography systems used by leading semiconductor manufacturers to produce the most advanced chips in the world.",
    ceo: "Christophe Fouquet",
    founded: 1984,
    employees: 44000,
    headquarters: "Veldhoven, Netherlands",
  },
  {
    ticker: "TSM",
    name: "Taiwan Semiconductor Manufacturing Co.",
    weight: 0.12,
    price: 198.5,
    changePct: 1.85,
    seed: 23,
    sliceLabel: "International Stocks",
    type: "stock",
    description:
      "World's largest dedicated semiconductor foundry. Manufactures chips on contract for fabless customers including Apple, NVIDIA, and AMD.",
    ceo: "C.C. Wei",
    founded: 1987,
    employees: 76000,
    headquarters: "Hsinchu, Taiwan",
  },
  {
    ticker: "NVO",
    name: "Novo Nordisk A/S",
    weight: 0.1,
    price: 122.4,
    changePct: -0.45,
    seed: 24,
    sliceLabel: "International Stocks",
    type: "stock",
    description:
      "Global healthcare company specializing in diabetes care and obesity treatments, including the GLP-1 drugs Ozempic and Wegovy.",
    ceo: "Lars Fruergaard Jørgensen",
    founded: 1923,
    employees: 64000,
    headquarters: "Bagsværd, Denmark",
  },
  {
    ticker: "NESN",
    name: "Nestlé SA",
    weight: 0.08,
    price: 92.8,
    changePct: 0.12,
    seed: 25,
    sliceLabel: "International Stocks",
    type: "stock",
    description:
      "World's largest food and beverage company by revenue, with brands across coffee, water, dairy, confectionery, pet care, and nutrition.",
    ceo: "Laurent Freixe",
    founded: 1866,
    employees: 277000,
    headquarters: "Vevey, Switzerland",
  },
  {
    ticker: "TM",
    name: "Toyota Motor Corp.",
    weight: 0.06,
    price: 184.2,
    changePct: 0.34,
    seed: 26,
    sliceLabel: "International Stocks",
    type: "stock",
    description:
      "Designs, manufactures, and sells passenger vehicles, light trucks, and components worldwide under the Toyota and Lexus brands.",
    ceo: "Koji Sato",
    founded: 1937,
    employees: 380000,
    headquarters: "Toyota City, Japan",
  },

  // ---------------- US Bonds ----------------
  {
    ticker: "BND",
    name: "Vanguard Total Bond Market ETF",
    weight: 0.6,
    price: 73.4,
    changePct: 0.08,
    seed: 31,
    sliceLabel: "US Bonds",
    type: "etf",
    description:
      "Broad exposure to taxable, investment-grade US bonds — Treasuries, agency mortgage-backed securities, and investment-grade corporates.",
    ceo: "Salim Ramji",
    founded: 1975,
    employees: 20000,
    headquarters: "Valley Forge, PA",
  },
  {
    ticker: "AGG",
    name: "iShares Core US Aggregate Bond ETF",
    weight: 0.25,
    price: 99.1,
    changePct: 0.05,
    seed: 32,
    sliceLabel: "US Bonds",
    type: "etf",
    description:
      "Tracks the Bloomberg US Aggregate Bond Index — broad investment-grade US bond exposure across Treasuries, MBS, and corporates.",
    ceo: "Larry Fink",
    founded: 1988,
    employees: 19000,
    headquarters: "New York, NY",
  },
  {
    ticker: "IEF",
    name: "iShares 7-10 Year Treasury Bond ETF",
    weight: 0.1,
    price: 96.2,
    changePct: -0.04,
    seed: 33,
    sliceLabel: "US Bonds",
    type: "etf",
    description:
      "Holds US Treasury bonds with remaining maturities between 7 and 10 years. Commonly used as a core intermediate-duration Treasury exposure.",
    ceo: "Larry Fink",
    founded: 1988,
    employees: 19000,
    headquarters: "New York, NY",
  },
  {
    ticker: "TIP",
    name: "iShares TIPS Bond ETF",
    weight: 0.05,
    price: 109.85,
    changePct: 0.11,
    seed: 34,
    sliceLabel: "US Bonds",
    type: "etf",
    description:
      "Holds Treasury Inflation-Protected Securities (TIPS). Principal is adjusted with the US Consumer Price Index, providing inflation protection.",
    ceo: "Larry Fink",
    founded: 1988,
    employees: 19000,
    headquarters: "New York, NY",
  },

  // ---------------- International Bonds ----------------
  {
    ticker: "BNDX",
    name: "Vanguard Total International Bond ETF",
    weight: 0.7,
    price: 49.2,
    changePct: 0.06,
    seed: 41,
    sliceLabel: "International Bonds",
    type: "etf",
    description:
      "Currency-hedged exposure to investment-grade bonds issued by governments and corporations outside the United States.",
    ceo: "Salim Ramji",
    founded: 1975,
    employees: 20000,
    headquarters: "Valley Forge, PA",
  },
  {
    ticker: "IGOV",
    name: "iShares International Treasury Bond ETF",
    weight: 0.2,
    price: 41.8,
    changePct: -0.02,
    seed: 42,
    sliceLabel: "International Bonds",
    type: "etf",
    description:
      "Holds developed-market sovereign bonds (ex-US). Provides geographic diversification away from US interest-rate risk.",
    ceo: "Larry Fink",
    founded: 1988,
    employees: 19000,
    headquarters: "New York, NY",
  },
  {
    ticker: "EMB",
    name: "iShares JPMorgan EM Bond ETF",
    weight: 0.1,
    price: 89.4,
    changePct: 0.21,
    seed: 43,
    sliceLabel: "International Bonds",
    type: "etf",
    description:
      "USD-denominated bonds issued by emerging-market governments. Higher yield in exchange for additional credit and country risk.",
    ceo: "Larry Fink",
    founded: 1988,
    employees: 19000,
    headquarters: "New York, NY",
  },

  // ---------------- Cash Equivalent ----------------
  {
    ticker: "SHV",
    name: "iShares Short Treasury Bond ETF",
    weight: 0.6,
    price: 110.2,
    changePct: 0.01,
    seed: 51,
    sliceLabel: "Cash Equivalent",
    type: "etf",
    description:
      "Holds US Treasury bonds with remaining maturities of one year or less. Effectively a cash-like exposure with minimal duration risk.",
    ceo: "Larry Fink",
    founded: 1988,
    employees: 19000,
    headquarters: "New York, NY",
  },
  {
    ticker: "BIL",
    name: "SPDR Bloomberg 1-3 Month T-Bill ETF",
    weight: 0.4,
    price: 91.8,
    changePct: 0.0,
    seed: 52,
    sliceLabel: "Cash Equivalent",
    type: "etf",
    description:
      "Holds US Treasury bills with remaining maturities of 1-3 months. One of the lowest-volatility ETFs available.",
    ceo: "Yie-Hsin Hung",
    founded: 1978,
    employees: 12000,
    headquarters: "Boston, MA",
  },
];

export function findHolding(ticker: string): Holding | undefined {
  const t = ticker.toUpperCase();
  return HOLDINGS.find((h) => h.ticker === t);
}

export function holdingsForSlice(sliceLabel: string): Holding[] {
  return HOLDINGS.filter((h) => h.sliceLabel === sliceLabel);
}

/* ----------------------------------------------------------------------------
 * Deterministic mock generators — keyed off the holding's `seed` so charts and
 * stats are stable across re-renders and route navigations.
 * -------------------------------------------------------------------------- */

export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export type Period = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";

interface PeriodConfig {
  points: number;
  drift: number;
  noise: number;
}

const PERIOD_CONFIG: Record<Period, PeriodConfig> = {
  "1D": { points: 48, drift: 0.005, noise: 0.004 },
  "1W": { points: 56, drift: 0.015, noise: 0.008 },
  "1M": { points: 60, drift: 0.05, noise: 0.012 },
  "3M": { points: 90, drift: 0.1, noise: 0.018 },
  "1Y": { points: 120, drift: 0.22, noise: 0.022 },
  "5Y": { points: 130, drift: 0.6, noise: 0.025 },
};

/**
 * Generates a price series ending exactly at `endPrice`. Drift and noise scale
 * with the period so longer periods show bigger ranges.
 */
export function generatePriceSeries(
  endPrice: number,
  changePctToday: number,
  seed: number,
  period: Period = "1M",
): { i: number; price: number }[] {
  const cfg = PERIOD_CONFIG[period];
  const periodSeed = seed * 31 + period.charCodeAt(0);
  const rand = seeded(periodSeed);

  // Start price: invert the drift, with a small seeded skew so different
  // tickers don't all have the same shape.
  const driftSign = rand() > 0.5 ? 1 : -1;
  const driftMag = cfg.drift * (0.6 + rand() * 0.8);
  const startPrice = endPrice / (1 + driftSign * driftMag);

  const noise = endPrice * cfg.noise;
  const out: { i: number; price: number }[] = [];

  for (let i = 0; i < cfg.points; i++) {
    const t = i / (cfg.points - 1);
    const trend = startPrice + (endPrice - startPrice) * t;
    const wobble = (rand() - 0.5) * 2 * noise * (1 - 0.3 * t);
    const price =
      i === cfg.points - 1
        ? endPrice
        : i === 0
          ? Number(startPrice.toFixed(2))
          : Math.max(0.01, trend + wobble);
    out.push({ i, price: Number(price.toFixed(2)) });
  }

  // Make 1D respect today's change %: snap start to today's open.
  if (period === "1D") {
    const open = endPrice / (1 + changePctToday / 100);
    out[0] = { i: 0, price: Number(open.toFixed(2)) };
  }

  return out;
}

export interface HoldingStats {
  open: number;
  high: number;
  low: number;
  volume: number;
  overnightVolume: number;
  avgVolume: number;
  marketCap: number;
  high52: number;
  low52: number;
  peRatio: number | null;
  dividendYield: number;
  shortInventory: string;
  borrowRate: string;
}

export function generateStats(h: Holding): HoldingStats {
  const r = seeded(h.seed * 7919);
  const open = Number((h.price / (1 + h.changePct / 100)).toFixed(2));
  const high = Number((h.price * (1 + 0.005 + r() * 0.012)).toFixed(2));
  const low = Number((h.price * (1 - 0.005 - r() * 0.012)).toFixed(2));
  const volume = Math.round(800_000 + r() * 12_000_000);
  const overnightVolume = Math.round(volume * (0.04 + r() * 0.08));
  const avgVolume = Math.round(volume * (0.7 + r() * 0.6));

  // Market cap scaled roughly by ticker class.
  const sizeMultiplier = h.type === "etf" ? 0.5 : 5;
  const marketCap = Math.round(
    h.price * (1_000_000_000 * sizeMultiplier + r() * 1_500_000_000_000),
  );
  const high52 = Number((h.price * (1.05 + r() * 0.45)).toFixed(2));
  const low52 = Number((h.price * (0.55 + r() * 0.3)).toFixed(2));
  const peRatio =
    h.type === "etf" ? null : Number((10 + r() * 35).toFixed(1));
  const dividendYield = Number((r() * 3.5).toFixed(2));
  const shortInventory = `${(0.5 + r() * 8).toFixed(1)}M`;
  const borrowRate = `${(0.25 + r() * 1.75).toFixed(2)}%`;
  return {
    open,
    high,
    low,
    volume,
    overnightVolume,
    avgVolume,
    marketCap,
    high52,
    low52,
    peRatio,
    dividendYield,
    shortInventory,
    borrowRate,
  };
}

export interface QuarterlyEarnings {
  quarter: string;
  projected: number;
  actual: number;
}

export function generateEarnings(h: Holding): QuarterlyEarnings[] {
  const r = seeded(h.seed * 13 + 5);
  const baseEps = h.type === "etf" ? 0.6 + r() * 0.8 : 1 + r() * 4;
  const quarters = ["Q3 '25", "Q4 '25", "Q1 '26", "Q2 '26"];
  return quarters.map((q, i) => {
    const trend = baseEps * (1 + i * 0.04);
    const projected = Number((trend * (0.92 + r() * 0.16)).toFixed(2));
    const actual = Number((projected * (0.88 + r() * 0.28)).toFixed(2));
    return { quarter: q, projected, actual };
  });
}
