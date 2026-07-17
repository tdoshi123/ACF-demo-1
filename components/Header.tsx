"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Bell, ShieldCheck } from "lucide-react";
import { mockAthlete } from "@/lib/mockData";

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  /**
   * When set, the mobile (`lg:hidden`) title/subtitle block is not rendered at
   * all — the title is dropped on phone and tablet (<lg). The desktop
   * (`hidden lg:block`) block is unaffected.
   */
  hideTitleOnMobile?: boolean;
  /**
   * Home-only mobile header variant. When true, the mobile (`lg:hidden`) left
   * block shows the athlete avatar + "Welcome back, / <full name>" instead of
   * the ACF logo, and the right-side profile link is hidden on mobile.
   * Desktop (`lg+`) layout is unaffected.
   */
  mobileGreeting?: boolean;
  /**
   * Mobile-only minimal header for secondary pages. When true, on mobile
   * (`<lg`) the entire top row (logo/greeting, verified pill, bell, profile
   * link) is not rendered at all, and the bottom mobile title block renders
   * unconditionally as a single centered h1 with no subtitle. Desktop
   * (`lg+`) is completely unaffected — title/subtitle/pill/bell/profile link
   * render exactly as without this prop. Ignored in combination with
   * `hideTitleOnMobile` (that prop becomes moot) but NOT with
   * `mobileGreeting` — do not pass both on the same page.
   */
  minimalMobileHeader?: boolean;
  /**
   * Optional icon-button link rendered at the top-right of the header, on both
   * mobile and desktop. Renders inside the mobile minimal-header block (when
   * `minimalMobileHeader` is set) and inside the desktop right-side control
   * row. A generic slot — not feedback-specific — for pages that need a single
   * header action without the full profile/bell/pill cluster.
   */
  headerAction?: { icon: LucideIcon; label: string; href: string };
}

export function Header({
  title,
  subtitle,
  hideTitleOnMobile,
  mobileGreeting,
  minimalMobileHeader,
  headerAction,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#23232a] bg-bg/80 backdrop-blur">
      <div
        className={`items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8 lg:py-4${
          minimalMobileHeader ? " hidden lg:flex" : " flex"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {minimalMobileHeader ? null : mobileGreeting ? (
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-md border border-[#2f2f38] bg-bg shadow-[0_0_0_1px_rgba(212,175,55,0.18)_inset] score-num text-sm font-bold text-gold">
                {mockAthlete.avatarInitials}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-ink-secondary">Welcome back,</p>
                <h1 className="truncate text-base font-semibold tracking-tight text-ink">
                  {mockAthlete.firstName} {mockAthlete.lastName}
                </h1>
              </div>
            </div>
          ) : (
            /* Mobile-only inline logo */
            <Link
              href="/dashboard"
              className="flex items-center gap-2 lg:hidden"
              aria-label="Athlete Collective Fund home"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md border border-[#2f2f38] bg-bg-secondary shadow-[0_0_0_1px_rgba(212,175,55,0.18)_inset]">
                <span className="score-num text-[12px] font-bold tracking-tighter text-gold">
                  A
                </span>
              </span>
              <span className="score-num text-sm font-semibold tracking-[0.22em] text-ink">
                ACF
              </span>
            </Link>
          )}

          <div className="hidden min-w-0 lg:block">
            {title && (
              <h1 className="truncate text-xl font-semibold tracking-tight text-ink">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="truncate text-sm text-ink-secondary">{subtitle}</p>
            )}
          </div>
        </div>

        <div
          className={`items-center gap-2 sm:gap-3${
            minimalMobileHeader ? " hidden lg:flex" : " flex"
          }`}
        >
          {headerAction && (
            <Link
              href={headerAction.href}
              aria-label={headerAction.label}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#23232a] bg-bg-secondary text-ink-secondary transition-colors hover:text-ink"
            >
              <headerAction.icon className="h-4 w-4" />
            </Link>
          )}

          <span className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Teamworks verified
          </span>

          <Link
            href="/settings"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#23232a] bg-bg-secondary text-ink-secondary transition-colors hover:text-ink"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
          </Link>

          <Link
            href="/settings"
            className={`flex items-center gap-2 rounded-xl border border-[#23232a] bg-bg-secondary px-2 py-1.5 transition-colors hover:border-[#2f2f38]${
              mobileGreeting ? " hidden lg:flex" : ""
            }`}
            aria-label="Profile and settings"
          >
            <div className="grid h-7 w-7 place-items-center rounded-md border border-[#2f2f38] bg-bg shadow-[0_0_0_1px_rgba(212,175,55,0.18)_inset] score-num text-xs font-bold text-gold">
              {mockAthlete.avatarInitials}
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-medium leading-tight text-ink">
                {mockAthlete.firstName} {mockAthlete.lastName}
              </div>
              <div className="text-[10px] leading-tight text-ink-secondary">
                {mockAthlete.school} · {mockAthlete.sport}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {minimalMobileHeader ? (
        title && (
          <div className="border-t border-[#23232a] px-4 py-3 sm:px-6 lg:hidden">
            <div className="relative flex items-center justify-center">
              <h1 className="text-center text-lg font-semibold tracking-tight text-ink">
                {title}
              </h1>
              {headerAction && (
                <Link
                  href={headerAction.href}
                  aria-label={headerAction.label}
                  className="absolute right-0 flex h-8 w-8 items-center justify-center rounded-lg border border-[#23232a] bg-bg-secondary text-ink-secondary transition-colors hover:text-ink"
                >
                  <headerAction.icon className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )
      ) : (
        !hideTitleOnMobile &&
        (title || subtitle) && (
          <div className="border-t border-[#23232a] px-4 py-3 sm:px-6 lg:hidden">
            {title && (
              <h1 className="text-lg font-semibold tracking-tight text-ink">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-ink-secondary">{subtitle}</p>
            )}
          </div>
        )
      )}
    </header>
  );
}

export default Header;
