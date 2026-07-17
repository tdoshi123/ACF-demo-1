"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ChevronRight,
  EyeOff,
  HelpCircle,
  Languages,
  LifeBuoy,
  Lock,
  LogOut,
  Repeat,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { StorageKeys, readJSON, remove, writeJSON } from "@/lib/storage";
import type { Language } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  hint?: string;
}

interface NavSection {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    label: "Account",
    icon: User,
    items: [
      { label: "Profile", href: "/settings/profile", icon: User, hint: "Athlete identity & Teamworks sync" },
      { label: "Wallet", href: "/settings/wallet", icon: Wallet, hint: "Connected funding source" },
    ],
  },
  {
    label: "Investing",
    icon: TrendingUp,
    items: [
      { label: "Recurring Deposit", href: "/settings/recurring-deposit", icon: Repeat, hint: "Amount, frequency, pause" },
      { label: "Risk Profile", href: "/settings/risk-profile", icon: Shield, hint: "Model portfolio & allocation" },
    ],
  },
  {
    label: "Security & Privacy",
    icon: ShieldCheck,
    items: [
      { label: "Security", href: "/settings/security", icon: Lock },
      { label: "Privacy", href: "/settings/privacy", icon: EyeOff, hint: "Legal, data, reset demo" },
    ],
  },
  {
    label: "Support",
    icon: LifeBuoy,
    items: [{ label: "FAQ", href: "/settings/faq", icon: HelpCircle }],
  },
];

export default function SettingsHubPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    setLanguage(readJSON<Language>(StorageKeys.language, "en"));
    setMounted(true);
  }, []);

  function toggleLanguage() {
    const next: Language = language === "en" ? "es" : "en";
    setLanguage(next);
    writeJSON(StorageKeys.language, next);
  }

  function handleLogout() {
    remove(StorageKeys.authed);
    router.push("/");
  }

  return (
    <AppShell title="More Actions" minimalMobileHeader>
      <div className="space-y-7">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <SectionHeader icon={section.icon} label={section.label} />
            <div className="mt-2.5 space-y-2">
              {section.items.map((item) => (
                <NavCard key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}

        {/* ----- App Settings ----- */}
        <div>
          <SectionHeader icon={SlidersHorizontal} label="App Settings" />
          <div className="mt-2.5 space-y-2">
            <NavCard
              item={{
                label: "Preferences",
                href: "/settings/preferences",
                icon: Bell,
                hint: "Notification reminders",
              }}
            />
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-bg-card/60 px-4 py-3.5 text-left transition-colors hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <Languages className="h-4 w-4 text-gold" />
                <span className="text-sm font-medium text-ink">Languages</span>
              </div>
              <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">
                {mounted && language === "es" ? "ES" : "EN"}
              </span>
            </button>
          </div>
        </div>

        {/* ----- Logout ----- */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/10 px-5 py-3 text-sm font-medium text-danger transition-colors hover:bg-danger/15"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </AppShell>
  );
}

/* ===== */

function SectionHeader({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-gold" />
      <span className="text-sm font-semibold tracking-tight text-ink">{label}</span>
    </div>
  );
}

function NavCard({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-bg-card/60 px-4 py-3.5 transition-colors hover:border-white/20"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-gold" />
        <div>
          <div className="text-sm font-medium text-ink">{item.label}</div>
          {item.hint && (
            <div className="text-xs text-ink-secondary">{item.hint}</div>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-secondary" />
    </Link>
  );
}
