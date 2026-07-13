# PRD — Unified App (ACF Foundation + PWC Tracking Workflow)

**Status:** Draft v2 — architecture confirmed
**Author:** Prepared with Claude, for review before Cursor Plan Mode
**Last updated:** July 13, 2026

---

## 1. Summary

We are building **one cohesive app on the ACF codebase** (TypeScript, `app/` router, ACF's existing design system — `AppShell`, `SectionCard`, etc.).

- **ACF Dashboard, Portfolio, and Settings (including Teamworks Wallet)** are kept essentially as-is — this is the visual and structural foundation of the merged app.
- **Enter Check and Log Spending** are ported over from the old PWC codebase as **new, separate pages** linked from the ACF Dashboard. They keep PWC's underlying logic (income splitting, spending-cap math) but are **rebuilt in ACF's visual style** (`SectionCard`/`AppShell` components, TypeScript), and gain a **back button** and a **delete button** for individual entries.
- The **50/30/20 onboarding step is removed** from the flow (code kept, not deleted, for a future "level up" tier).
- The old PWC codebase (`src/app/*`, `.jsx`) becomes a **reference/source only** — nothing in it ships as-is; its logic gets ported into the ACF codebase in TypeScript.

This replaces the earlier "two linked apps with a handoff" model. There is no handoff anymore — it's one app, one nav, one Dashboard.

---

## 2. Goals

1. Single Next.js app, ACF's codebase as the base.
2. Remove the 50/30/20 onboarding step (keep the code for later).
3. Port Enter Check and Log Spending into the ACF app as new pages:
   - Rebuilt in ACF's component style.
   - Keep PWC's income-split / spending-cap logic.
   - Add a back button (in-flow + to-Dashboard).
   - Add a delete button for individual check/spend entries.
4. ACF Dashboard becomes the single home screen: keeps its existing investing summary, and gains a "recent activity" view (checks + spends, deletable) plus entry points into Enter Check / Log Spending.
5. Keep ACF Portfolio, Settings, and Teamworks Wallet unchanged.
6. Resolve where "program selection" (the athlete's investing split — NIL Foundation / Prime Window Protocol / Legacy Builder) lives now that it's one app (see §4, open question).

## 3. Non-Goals

- Redesigning Portfolio, Settings, or Wallet.
- Real money movement / brokerage integration — still mock data.
- Rebuilding the risk quiz or model portfolio logic.
- Bringing back the 50/30/20 rule in this pass.
- Migrating existing PWC users' Supabase data — this is a rebuild of the pages, not a data migration project (see §4 for the storage decision needed).

---

## 4. Resolved Decisions

| # | Decision | Details |
|---|---|---|
| D1 | **Program selection** happens in onboarding, in the slot freed up by removing the 50/30/20 step. | New "Choose your program" step presents NIL Foundation / Prime Window Protocol / Legacy Builder, matching PWC's existing copy. This is also the athlete's "investing number" from the original brief. |
| D2 | **Storage:** localStorage only for this pass. | Checks/spends use ACF's existing `writeJSON`/`StorageKeys` pattern — no Supabase in this phase. Adding a real backend is explicitly a separate, later project. Data will not persist across devices until that phase. |
| D3 | **Dashboard activity view has a day/month toggle.** | Recent Activity on the Dashboard supports switching between a day view and a month view, matching the client's original "day to day tracking or month to month tracking" ask. |
| D4 | **Delete confirmation uses the existing arm/confirm pattern.** | First tap arms the delete control (inline state change, no modal); second tap confirms and deletes. Reuses the pattern already built for ACF's reset control — no new UI system needed. |

---

## 5. User Flow (target end-state)

```
New athlete
   │
   ▼
Onboarding (ACF-style: identity → auth → risk profile
            → [NEW] choose program → wallet)
   │   (50/30/20 step removed, code kept)
   ▼
ACF Dashboard (single home screen)
   │  ├─ Investing summary (unchanged)
   │  ├─ Recent activity: checks + spends, each deletable
   │  ├─ [+ Enter Check] ──▶ separate page, ACF style, back button
   │  └─ [+ Log Spending] ─▶ separate page, ACF style, back button
   │
   ▼
Portfolio (unchanged) ──▶ Settings incl. Teamworks Wallet (unchanged)
```

---

## 6. Feature Specifications

### 6.1 Remove the 50/30/20 step from onboarding

**Where:** `app/onboarding/page.tsx` — the `STEPS` array and `RuleStep` component.

**Requirements:**
- Remove `RuleStep` from the active step sequence.
- Keep the component and all of `lib/calculations.ts`'s 50/30/20 functions (`buildPlan`, `calculateNeeds/Wants/SavingsInvesting`) in the codebase, unused for now.
- Replace the freed slot with a new "Choose your program" step (see 6.2), per D1.
- Confirm `DepositStep`'s `savingsTarget` still resolves sensibly — today it depends on `plan.savingsInvesting` from the 50/30/20 calculation. If program selection replaces that step, `DepositStep` should derive its target from the selected program's `investing` percentage instead (ported from PWC's `programs.js` data).
- Renumber the visible `Step X of Y` indicator.

**Acceptance criteria:**
- Athlete never sees the 50/30/20 screen during onboarding.
- `DepositStep` still shows a working, sensible target.
- Step counter is accurate.

---

### 6.2 Program selection

**Where:** New step in `app/onboarding/page.tsx`; port `PROGRAMS` data from PWC's `src/data/programs.js` into a TS equivalent (e.g. `lib/programs.ts`).

**Requirements:**
- Present the three programs (NIL Foundation, Prime Window Protocol, Legacy Builder) with their purpose/retention target, matching PWC's existing copy.
- Store the selected program in the athlete's local state, using the same `writeJSON`/`StorageKeys` localStorage pattern as the rest of onboarding (per D2).
- This selection becomes the input to Enter Check's split calculation (6.3).

**Acceptance criteria:**
- Athlete picks one of the three programs during onboarding.
- Selection persists and is available to Enter Check.

---

### 6.3 Enter Check (new page, ACF style)

**Where:** New file, e.g. `app/enter-check/page.tsx`. Port logic from `src/app/enter-check/page.jsx` and `src/lib/calculations.js` (`splitIncome`).

**Requirements:**
- Rebuild the form using ACF's `SectionCard`/`AppShell` components — big amount input, date, optional note, matching ACF's visual language rather than PWC's current styling.
- Port `splitIncome` logic (TS conversion) so the check amount splits correctly according to the athlete's selected program.
- Add a **back button**: visible near the top of the page (in the header area, not just a bottom "Cancel"), returning to the Dashboard without saving.
- On submit: save to localStorage per D2, then return to Dashboard.

**Acceptance criteria:**
- Visually consistent with ACF's other pages.
- Split math matches the athlete's selected program.
- Back button works from anywhere on the page without requiring a scroll.

---

### 6.4 Log Spending (new page, ACF style)

**Where:** New file, e.g. `app/log-spending/page.tsx`. Port logic from `src/app/log-spending/page.jsx` and the lifestyle-cap calculations (`calculateLifestyleUsage`, `isLifestyleCapExceeded`).

**Requirements:**
- Rebuild using ACF's components: amount, category, date, note, and the live "lifestyle cap usage" status panel (safe/warn/danger), restyled to match ACF.
- Add the same top-of-page **back button** pattern as Enter Check.
- On submit: save to localStorage per D2, return to Dashboard.

**Acceptance criteria:**
- Visually consistent with ACF's other pages.
- Status panel accurately reflects projected spend vs. the lifestyle cap.
- Back button present and working.

---

### 6.5 Delete individual check / spending entries

**Where:** ACF Dashboard's new "recent activity" list (see 6.6); localStorage layer per D2.

**Requirements:**
- Each activity row (check or spend) gets a delete control.
- Uses the arm/confirm interaction pattern per D4: first tap arms the control (inline state change — e.g. icon turns red / label changes to "Confirm?"), second tap deletes. Tapping elsewhere or a timeout disarms it. No modal.
- Deleting recalculates all derived totals shown on the Dashboard (and the Log Spending status panel, if the athlete is mid-entry) immediately.

**Acceptance criteria:**
- Deleting an entry removes it from the activity list and updates totals with no stale numbers.
- Confirm step prevents accidental deletion.

---

### 6.6 ACF Dashboard — add recent activity + entry points

**Where:** existing ACF Dashboard page.

**Requirements:**
- Keep all existing investing-summary content unchanged.
- Add a "Recent Activity" section with a day/month toggle (per D3): a day view showing that day's checks/spends, and a month view showing month-to-date totals and entries, checks + spends together, most recent first within each view.
- Add two entry points: "+ Enter Check" and "+ Log Spending," linking to the new pages in 6.3/6.4.
- Empty state: if the athlete has no checks/spends yet, show a simple prompt into Enter Check (mirroring PWC's existing empty-state tone, restyled to ACF).

**Acceptance criteria:**
- Dashboard shows recent check/spend activity alongside the existing investing summary.
- Both entry points are visible without digging through menus.
- Empty state guides a brand-new athlete to log their first check.

---

### 6.7 ACF Portfolio, Settings, Teamworks Wallet — unchanged

**Where:** `app/portfolio/*` (confirm exact path), `app/settings/page.tsx`.

**Requirements:** No functional or visual changes. Only touch if something in 6.1–6.6 breaks a dependency (e.g., `DepositStep`'s target calculation, per 6.1).

**Acceptance criteria:** Existing behavior fully preserved.

---

## 7. Data Model Touchpoints

| Entity | Old location (PWC) | New location (merged app) |
|---|---|---|
| `PROGRAMS` data | `src/data/programs.js` | Port to `lib/programs.ts` |
| `splitIncome`, `calculateTotals` | `src/lib/calculations.js` | Port to TS, merge into or sit alongside `lib/calculations.ts` (watch for naming collisions with existing ACF functions) |
| `incomeEvents`, `spendingLogs` | Supabase + localStorage (PWC) | localStorage only for this pass, per D2 — using ACF's existing `writeJSON`/`StorageKeys` pattern |
| Selected program | Did not clearly exist in reviewed PWC files | New: stored alongside other onboarding state, per D1/6.2 |

---

## 8. Sequencing for Cursor Plan Mode

1. **Phase 1 — Onboarding**: remove 50/30/20 step, add the program-selection step (D1), fix `DepositStep` dependency, fix step counter.
2. **Phase 2 — Port data/logic layer**: `programs.ts`, ported `splitIncome`/cap-usage functions, in TypeScript, unit-testable independent of any UI.
3. **Phase 3 — Enter Check page**: new ACF-styled page using the ported logic.
4. **Phase 4 — Log Spending page**: same pattern.
5. **Phase 5 — Dashboard updates**: recent activity list with day/month toggle, arm/confirm delete controls, entry points, empty state.
6. **Phase 6 — Regression pass**: confirm Portfolio, Settings, and Teamworks Wallet are untouched and still working.

---

## 9. Acceptance Checklist (Definition of Done)

- [ ] One app, ACF codebase, no separate PWC app remains in the shipped product
- [ ] 50/30/20 step no longer appears in onboarding; code retained
- [ ] Program selection has a clear home in the flow (onboarding, per Q1)
- [ ] Enter Check and Log Spending exist as ACF-styled pages with working back buttons
- [ ] Every check/spend entry can be deleted, with a confirm step, from the Dashboard
- [ ] ACF Dashboard shows recent activity + entry points, alongside its existing investing summary
- [ ] Portfolio, Settings, and Teamworks Wallet behave exactly as they do today
