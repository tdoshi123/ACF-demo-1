# Project Memory — Athlete Collective Fund

## What this is
Frontend-only MVP for Athlete Collective Fund (ACF) — an athlete-only NIL
financial literacy and recurring-investing experience. Athletes log NIL checks,
the app splits each check into locked buckets by their chosen program, they log
lifestyle spending against a cap, and they see an investing portfolio.

Stage: MVP / demo. Nothing here is production. No real money moves.

## Stack
- Next.js 14.2.5, App Router
- TypeScript (strict)
- Tailwind CSS 3.4
- Recharts (charts), lucide-react (icons), Geist fonts, Vercel Analytics
- Storage: browser localStorage only
- Tests: Vitest, unit tests for pure logic in lib/ only
- Lint: ESLint via next/core-web-vitals (.eslintrc.json)

Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`,
`npm test`, `npm run test:watch`

## Hard constraints — do not violate
- No backend. No API routes. No Supabase. No database.
- No real money movement, brokerage integration, or investing API.
- No real Teamworks integration — auth is a mock flow.
- All data is mocked (`lib/mockData.ts`) or in localStorage.
- If a feature request needs a server, flag it as an OPEN QUESTION. Do not build one.

## File structure
app/                  App Router pages
page.tsx            Landing
onboarding/         Multi-step onboarding (welcome → auth → program → deposit → risk → done)
dashboard/          Home. Investing summary, recent activity, quick actions
portfolio/          Holdings, risk profiles, charts
education/          Lesson modules + badges
settings/           Deposit, risk, notifications, reset demo data
enter-check/        Log a NIL check, see the split preview
log-spending/       Log lifestyle spend against the cap
globals.css         Design tokens + surface/eyebrow component classes
components/           AppShell, SectionCard, PrimaryButton, SecondaryButton,
BadgePill, DisclaimerBox, Modal, ProgressBar
lib/                  types.ts, storage.ts, tracking.ts, programs.ts,
calculations.ts, mockData.ts, holdings.ts, categories.ts
Path alias is `@/` → repo root. Import as `@/components/SectionCard`, `@/lib/tracking`.

## Conventions
- Every page is a client component (`"use client"`) — they all read localStorage.
- Hydration pattern: initialize state to a mock default, load real values in a
  `useEffect`, flip a `mounted` / `hydrated` boolean, and gate anything that
  would mismatch between server and client render. Follow this exactly — skipping
  it causes hydration errors.
- Pages are wrapped in `<AppShell title subtitle>`. Content sits in `<SectionCard>`.
- Buttons: `PrimaryButton` (gold gradient) / `SecondaryButton`. Don't hand-roll one.
- Icons: lucide-react only.
- Layout inside a page is a plain Tailwind grid; SectionCard handles the chrome.
- Sub-components live in the same file as the page, below the default export,
  separated by a `/* ===== */` banner comment. Don't split into new files unless
  the thing is reused across pages.
- TypeScript: no `any`. Interfaces for object shapes. Types live in `lib/types.ts`
  when shared, inline at the top of the file when local.
- All money math is raw dollars, unrounded. Rounding/formatting is display-only —
  use `formatCurrency` from `lib/calculations.ts`.
- Program percentages are decimals: `0.25` means 25%.
- Anything user-facing about money gets a `<DisclaimerBox>` noting it's mock data.

## Design language
Warm near-black, gold accent, restrained. Tokens live in `tailwind.config.ts`
and mirror `app/globals.css`.

- Backgrounds: `bg` (#070708), `bg-secondary`, `bg-card`, `bg-elevated`
- Text: `ink` (#f4f4f2), `ink-secondary` (#8a8a85), `ink-muted` (#4f4f55)
- Brand: `gold` (#d4af37), `gold-soft`
- Semantic: `success` (#22c55e), `warning`, `danger`
- Bucket tones: `needs`, `wants`, `savings`
- Surfaces: `.surface-card`, `.surface-elevated` (rounded-2xl, subtle inset)
- Eyebrows: `.text-eyebrow` — mono, uppercase, 0.24em tracking, 10px
- Selected state: `border-gold/60 bg-gold/[0.06] shadow-gold`
- Unselected: `border-white/10 bg-bg-card/60`

Never introduce a new color. Never use a raw hex outside `globals.css` /
`tailwind.config.ts`. If a color doesn't exist in the token set, that's an
OPEN QUESTION, not a judgment call.

## Domain model
A **check** (`IncomeEvent`) is split into buckets the moment it's logged, by the
athlete's selected **program**. The split is stored on the event — historical
checks keep their original allocation even if program percentages change later.
Never recompute a stored split.

Buckets: `taxes`, `lifestyle`, `emergency`, `investing`, `controlledRisk`, `kids`.
**Retained** = emergency + investing + controlledRisk + kids. Taxes are NOT
retained — that money leaves the household.

Every `SpendingLog` draws from the lifestyle bucket.

Programs (`lib/programs.ts`): NIL Foundation (54% retention target),
Prime Window Protocol, Legacy Builder.

## Storage
`lib/storage.ts` — localStorage wrapper, `acf:` prefix, SSR-safe (no-ops when
`window` is undefined), swallows parse errors and returns the fallback.

Always `readJSON` / `writeJSON` with a key from `StorageKeys`. Never touch
`window.localStorage` directly. Never add a raw string key — add it to
`StorageKeys` first.

## Patterns worth copying
- Page shell + card layout: `app/dashboard/page.tsx`
- Form with live preview + validation: `app/enter-check/page.tsx`
- Pure calculation module: `lib/tracking.ts`
- Multi-step flow with a step machine: `app/onboarding/page.tsx`
- Shared type definitions: `lib/types.ts`
- Unit test for a pure module: `lib/tracking.test.ts`

## Decisions
- 2026-07 — App is a merge of the ACF codebase and the older PWC codebase.
  ACF is the base (TypeScript, App Router, its design system). PWC's logic
  (income splitting, spending caps) was ported into TS. The old PWC `.jsx`
  code is reference only — nothing from it ships as-is. See PRD-Unified-App.md.
- 2026-07 — 50/30/20 onboarding step removed. Code kept, not deleted, for a
  future tier. Don't bring it back.
- 2026-07 — Program selection lives in onboarding, in the slot the 50/30/20
  step freed up. It's the input to Enter Check's split math.
- localStorage over Supabase for this pass. It's a demo; there's no migration.
- Splits are frozen at entry time rather than recomputed, for historical accuracy.
- 2026-07 — Chose Vitest over Jest for speed and zero-config TS. Scoped to
  lib/ pure functions — the money math is where a bug actually costs
  something. Component testing deliberately skipped at MVP stage.
- 2026-07 — Chose Next's Strict ESLint preset over Base. The repo is already
  TypeScript strict and the pipeline's coder and tester agents gate on
  `npm run lint`, so a real config was required — an unconfigured
  `next lint` opens an interactive prompt that would hang an agent
  mid-run.

## Known gaps
- No error boundaries.
- `lib/mockData.ts` is large and mixes fixtures with lesson copy.
- Portfolio holdings data is static and will look stale.
- Only lib/ pure functions are tested. No component or E2E testing —
  pages, forms, and hydration are unverified by automated tests.
- ESLint was never configured until 2026-07 — the repo had
  eslint-config-next installed but no .eslintrc.json, so `npm run lint`
  had never run and three errors were latent. Config is now
  next/core-web-vitals, which does not load @typescript-eslint rules.
- app/onboarding/page.tsx had a dead inline eslint-disable comment
  predating any lint config. If you find others, delete rather than
  reinstate.

## Don't do this
- Don't add a backend, API route, or database.
- Don't invent design tokens or use raw hex in components.
- Don't bypass `readJSON`/`writeJSON`.
- Don't recompute a stored `IncomeSplit`.
- Don't skip the `mounted`/`hydrated` gate on localStorage reads.
- Don't bring back 50/30/20.
- Don't refactor code outside the spec's scope.

## Features shipped
Appended after every merge. Newest first.
