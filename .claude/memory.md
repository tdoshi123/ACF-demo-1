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
settings/           "More Actions" nav hub (bottom-nav "More" tab), with a
                    feedback icon button top-right (headerAction prop) linking
                    to feedback/. Sub-pages: profile/, wallet/,
                    recurring-deposit/, risk-profile/, security/ (stub),
                    privacy/ (legal + reset demo data), faq/ (accordion),
                    preferences/ (notifications), feedback/ (mock form, no
                    persistence; three fields — what feature, what's working,
                    what's wrong). Languages is an inline EN/ES segmented
                    toggle (both options always visible) on the hub itself,
                    not a page — cosmetic, no real translation. Section
                    headers (Account, Investing, etc.) are plain text, no
                    icon; item cards show icon + title only, no hint text.
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

Buckets: `taxes`, `lifestyle`, `emergency`, `investing`, `kids`.
**Retained** = emergency + investing + kids. Taxes are NOT retained — that
money leaves the household.

Investment risk is a separate concept from the split buckets: `RiskProfile`
(`conservative` … `aggressive_growth`, `StorageKeys.risk`) picks the athlete's
model portfolio and is user-set directly (onboarding, Settings, Portfolio),
not derived from the check split.

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
- Shared prop-controlled component reused across pages (no page/storage
  knowledge of its own): `components/AllocationEditor.tsx`
- Header prop-threading (page → `AppShell` → `Header`) for optional header
  variants: `mobileGreeting`, `minimalMobileHeader`, `headerAction` in
  `components/Header.tsx` — each is a no-op unless a page explicitly passes
  it, so adding a new one never affects existing pages.

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
- 2026-07-16 — Removed the `controlledRisk` split bucket entirely, folding its
  percentage into `investing` on all three programs (NIL 0.10→0.14, Prime
  0.20→0.25, Legacy 0.30→0.35). This supersedes the earlier bucket-list
  decision above. Reasoning: `controlledRisk` conflated a program-fixed money
  slice with the athlete's investment risk profile — the athlete now sets
  their own `RiskProfile` directly (onboarding, Settings, Portfolio) instead
  of having a risk allocation baked into the program split. Every program
  still sums to 1.00.
- 2026-07-17 — Made onboarding's risk quiz mandatory (removed the bypass that
  let an athlete skip straight to a preset pick) and added a fine-tune
  allocation editor (`components/AllocationEditor.tsx`) so athletes can adjust
  per-asset-class percentages (stocks/bonds/cash) away from the 5 presets, in
  onboarding, Settings, and Portfolio. Custom mixes are stored in a new
  `StorageKeys.riskAllocation` key layered on top of the existing preset
  (`StorageKeys.risk`), resolved via `resolveAllocation()` in
  `lib/calculations.ts`. Picking a different preset clears any stored custom
  mix for the prior preset.
- 2026-07-18 — `SectionCard`'s header/body padding (`components/SectionCard.tsx`)
  is fixed and must not be overridden via `className`/`bodyClassName` —
  Tailwind's class-order-independent CSS generation makes a later-appended
  conflicting utility class unreliable to win. When a page needs a tighter
  `SectionCard`, trim spacing/copy inside the step's own markup instead.
- 2026-07-18 — `truncate` (`white-space:nowrap` + `overflow:hidden` +
  ellipsis) on text nested a few block-levels below a flex/grid ancestor can
  force that ancestor wider than its container — `overflow:hidden` on the
  leaf does NOT stop its full unwrapped width from counting toward an
  ancestor flex item's automatic-minimum-size calculation; only `min-width:0`
  on the actual flex/grid item does, and only within that one context. This
  caused a real, hard-to-diagnose horizontal-overflow bug in onboarding Step
  2 (`SuccessRow`'s subtitle) that static code review didn't catch — found
  only by live DOM bisection. Prefer `break-words` over `truncate` for any
  text whose length isn't tightly bounded, unless you specifically want
  silent clipping. `app/settings/risk-profile/page.tsx`'s truncated-label
  bug (see Known gaps) is the same family of issue.

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
- Risk fine-tune feature (2026-07-17): `AllocationEditor` and the page-level
  logic around it (mandatory-quiz gating, number-input clamping,
  preset-switch clearing the custom allocation) are unverified by automated
  tests — only the pure helpers in `lib/calculations.ts` are covered. Same
  root cause as the general "no component testing" gap above; verified
  manually instead.
- `app/settings/risk-profile/page.tsx`'s "Allocation" summary row truncates
  each slice label to its first word (`s.label.split(" ")[0]`), so "US
  Bonds" and "US Stocks" both render as just "US" — ambiguous display bug.
  Pre-existing (moved verbatim from the old flat settings page during the
  2026-07-17 More Actions hub refactor, not introduced by it). Flagged as a
  follow-up, not fixed inline per "don't refactor outside scope."
- More Actions hub sub-pages (2026-07-17): same root cause as above — Logout
  click, Reset demo data, and the Profile/Wallet/Recurring-Deposit/Security/
  Privacy pages were verified by code read only, not live-clicked, since no
  component test harness exists.

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

- 2026-07-18 — Fixed onboarding Step 2 (Teamworks auth) horizontal cutoff
  and vertical scroll at 390×844. The verified-identity view was
  overflowing 69px right and 150px bottom of an iPhone 12 Pro viewport.
  Root cause (found by live DOM bisection, not visible from static review):
  `SuccessRow`'s `truncate` subtitle text was forcing the whole page wider
  than the viewport. Fixed by swapping `truncate` → `break-words` (zero
  content removed — full text now wraps instead of clipping) plus
  mobile-only spacing trims. Removed the "Educational, not financial
  advice" disclaimer from this step only (authorized). Live-verified 0px
  overflow both directions across all 4 `AuthStep` states. Key file:
  `app/onboarding/page.tsx`.
- 2026-07-18 — Condensed onboarding Welcome step to fit 390×844 with no
  scroll. Tightened spacing, `InfoTile` padding/icon size, and copy on the
  Welcome step (hero card, two info tiles, "what this app is not" list,
  disclaimer) so the full step fits an iPhone 12 Pro viewport with zero
  vertical scroll (live-measured: `scrollHeight` 844 == `innerHeight` 844).
  Also trimmed shared onboarding chrome (page padding, header/footer
  margins, step-0 Back button) mobile-only via `sm:`-gating — desktop
  unaffected, other 7 steps get slightly tighter mobile spacing as a side
  benefit. No content block removed, only whitespace and copy length. Key
  file: `app/onboarding/page.tsx`.
- 2026-07-18 — Landing page synced with current product. Replaced all
  stale "50/30/20 needs/wants/savings" copy (hero trust pill, "How it
  works" step 03/04, hero mock card's split bar/tiles/deposit footer,
  and a "your streaks" line in the Privacy section) with the real
  program-based split model (NIL Foundation / Prime Window Protocol /
  Legacy Builder; buckets taxes/lifestyle/emergency/investing/kids).
  Also fixed a hero scoreboard stat advertising a nonexistent "Day
  Streak" feature (now "Modules") and removed a redundant duplicate
  Continue-with-Teamworks/View-demo button pair from the bottom "Ready
  to start?" card, replacing it with a single text link that reuses
  the existing `continueWithTeamworks` handler. Content/copy-only —
  no logic, storage, or token changes. Key file: `app/page.tsx`.
- 2026-07-17 — Structured feedback form. Split the single free-text feedback
  textarea into three fields: "What feature?" (plain text input), "What's
  working?" and "What's wrong?" (textareas). Submit requires the feature field
  plus at least one of the two textareas (not both). Still a pure mock — no
  backend, no persistence, same 2.2s "Thanks — we got it." fake-submit as
  before. Key file: `app/settings/feedback/page.tsx`.
- 2026-07-17 — More Actions hub visual tidy-up + feedback button. Removed
  section-header icons (item cards keep theirs) and the secondary hint text
  under each card. Replaced the single flipping Languages pill with a
  two-option English/Español segmented toggle (both always visible, English
  default). Added a new generic `headerAction` prop on `Header`/`AppShell`
  (mirrors the `mobileGreeting`/`minimalMobileHeader` pattern) rendering an
  icon-button link at top-right on both mobile and desktop, wired to a new
  mock Feedback sub-page (`app/settings/feedback/page.tsx` — textarea +
  submit, no persistence, no backend). Key files: `app/settings/page.tsx`,
  `components/Header.tsx`, `components/AppShell.tsx`,
  `app/settings/feedback/page.tsx`.
- 2026-07-17 — "More Actions" navigation hub. Relabeled the bottom-nav /
  sidebar "Settings" tab to "More" with a hamburger icon. The old flat
  settings page is now a grouped nav hub (Account, Investing, Security &
  Privacy, Support, App Settings) with a Logout button, splitting existing
  functionality into 8 nested sub-pages under `app/settings/`: profile,
  wallet, recurring-deposit, risk-profile, security (stub), privacy, faq
  (accordion), preferences. Adds a cosmetic EN/ES language toggle
  (`StorageKeys.language`) inline on the hub — no real translation. Key
  files: `app/settings/page.tsx` and its 8 sub-pages, `components/MobileNav.tsx`,
  `components/Sidebar.tsx`, `lib/storage.ts`, `lib/types.ts`.
- 2026-07-17 — Simplified mobile headers on 5 secondary pages. On mobile
  only, Portfolio, Enter Check, Log Spending, Education, and Settings now
  show just a centered page title in the header — no logo, verified pill,
  bell, or profile link. Desktop is unchanged everywhere. Adds a
  `minimalMobileHeader` prop threaded page → `AppShell` → `Header`,
  mirroring the existing `mobileGreeting` pattern; a follow-up fix also
  hides the (previously still-rendered-but-empty) top row div on mobile so
  no blank padded strip appears above the centered title. Key files:
  `components/Header.tsx`, `components/AppShell.tsx`, `app/portfolio/page.tsx`,
  `app/enter-check/page.tsx`, `app/log-spending/page.tsx`,
  `app/education/page.tsx`, `app/settings/page.tsx`.
- 2026-07-17 — Mobile home header: avatar + greeting. On mobile only, Home's
  header now shows the athlete's avatar initials and "Welcome back, / <full
  name>" instead of the ACF logo, with the right-side profile link hidden
  (content moved into the greeting) and the now-duplicate in-body greeting
  text removed from the dashboard. Gated behind a new `mobileGreeting` prop
  threaded page → `AppShell` → `Header` so every other page's mobile header is
  unaffected. Key files: `components/Header.tsx`, `components/AppShell.tsx`,
  `app/dashboard/page.tsx`.
- 2026-07-17 — Mandatory risk quiz + fine-tune allocation editor. The
  onboarding risk quiz can no longer be skipped by clicking a preset card
  directly. Added a shared `AllocationEditor` letting athletes fine-tune
  per-asset-class percentages (stocks/bonds/cash) away from the 5 presets, in
  onboarding, Settings, and Portfolio. Key files: `components/AllocationEditor.tsx`,
  `app/onboarding/page.tsx`, `app/settings/page.tsx`, `app/portfolio/page.tsx`,
  `app/dashboard/page.tsx`, `lib/calculations.ts`, `lib/storage.ts`, `lib/types.ts`.
- 2026-07-16 — Athlete-set risk profile + controlled-risk removal. Added a
  direct 5-option risk-profile selector to onboarding (quiz kept as an
  optional recommendation the selector can override) and to Settings, with
  the choice reflected on onboarding's Confirm step. Removed the
  `controlledRisk` money bucket from the split model and UI (Enter Check,
  onboarding Program Select, onboarding Income step). Key files:
  `app/onboarding/page.tsx`, `app/settings/page.tsx`, `app/enter-check/page.tsx`,
  `lib/programs.ts`, `lib/types.ts`, `lib/tracking.ts`.
