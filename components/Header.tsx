"use client";

import Link from "next/link";
import { Bell, ShieldCheck } from "lucide-react";
import { mockAthlete } from "@/lib/mockData";

export interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#23232a] bg-bg/80 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile-only inline logo */}
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

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Teamworks verified
          </span>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#23232a] bg-bg-secondary text-ink-secondary transition-colors hover:text-ink"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold animate-pulse-soft" />
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-[#23232a] bg-bg-secondary px-2 py-1.5">
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
          </div>
        </div>
      </div>

      {(title || subtitle) && (
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
      )}
    </header>
  );
}

export default Header;
