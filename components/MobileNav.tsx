"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  PieChart,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/education", label: "Learn", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-bg-secondary/95 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1 backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-xl grid-cols-4">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={[
                  "flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-gold" : "text-ink-secondary",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileNav;
