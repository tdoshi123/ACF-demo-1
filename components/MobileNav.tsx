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
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/enter-check", label: "Check", icon: CircleDollarSign },
  { href: "/log-spending", label: "Spend", icon: Receipt },
  { href: "/education", label: "Learn", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-bg-secondary/95 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1 backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-6">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                className={[
                  "flex min-w-0 flex-col items-center gap-1 px-0.5 py-2 text-[9px] font-medium transition-colors",
                  active ? "text-gold" : "text-ink-secondary",
                ].join(" ")}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="w-full truncate text-center">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileNav;
