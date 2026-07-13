"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CircleDollarSign,
  LayoutDashboard,
  PieChart,
  Receipt,
  Settings,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/enter-check", label: "Enter Check", icon: CircleDollarSign },
  { href: "/log-spending", label: "Log Spending", icon: Receipt },
  { href: "/education", label: "Education", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-[#23232a] bg-bg/60 backdrop-blur-sm lg:sticky lg:top-0 lg:flex">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-6 py-6"
        aria-label="Athlete Collective Fund home"
      >
        <Logo />
        <div className="leading-tight">
          <div className="score-num text-sm font-semibold tracking-[0.22em] text-ink">
            ACF
          </div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-ink-muted">
            Private · v1
          </div>
        </div>
      </Link>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-bg-card text-ink shadow-[inset_0_0_0_1px_#2f2f38]"
                  : "text-ink-secondary hover:bg-bg-card/60 hover:text-ink",
              ].join(" ")}
            >
              <Icon
                className={`h-4 w-4 ${active ? "text-gold" : "text-ink-secondary"}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-[#23232a] bg-bg-secondary p-4">
        <div className="flex items-center gap-2 text-xs text-ink-secondary">
          <ShieldCheck className="h-4 w-4 text-success" />
          Private mode
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
          Your progress is visible only to you. No public leaderboards. No social
          feeds.
        </p>
      </div>
    </aside>
  );
}

function Logo() {
  return (
    <div className="relative grid h-9 w-9 place-items-center rounded-md border border-[#2f2f38] bg-bg-secondary shadow-[0_0_0_1px_rgba(212,175,55,0.18)_inset]">
      <span className="score-num text-sm font-bold tracking-tighter text-gold">
        A
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-bg" />
    </div>
  );
}

export default Sidebar;
