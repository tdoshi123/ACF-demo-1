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
  Lock,
  LogOut,
  MessageSquare,
  Repeat,
  Shield,
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
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/settings/profile", icon: User },
      { label: "Wallet", href: "/settings/wallet", icon: Wallet },
    ],
  },
  {
    label: "Investing",
    items: [
      { label: "Recurring Deposit", href: "/settings/recurring-deposit", icon: Repeat },
      { label: "Risk Profile", href: "/settings/risk-profile", icon: Shield },
    ],
  },
  {
    label: "Security & Privacy",
    items: [
      { label: "Security", href: "/settings/security", icon: Lock },
      { label: "Privacy", href: "/settings/privacy", icon: EyeOff },
    ],
  },
  {
    label: "Support",
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

  function selectLanguage(next: Language) {
    setLanguage(next);
    writeJSON(StorageKeys.language, next);
  }

  function handleLogout() {
    remove(StorageKeys.authed);
    router.push("/");
  }

  return (
    <AppShell
      title="More Actions"
      minimalMobileHeader
      headerAction={{ icon: MessageSquare, label: "Feedback", href: "/settings/feedback" }}
    >
      <div className="space-y-7">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <SectionHeader label={section.label} />
            <div className="mt-2.5 space-y-2">
              {section.items.map((item) => (
                <NavCard key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}

        {/* ----- App Settings ----- */}
        <div>
          <SectionHeader label="App Settings" />
          <div className="mt-2.5 space-y-2">
            <NavCard
              item={{
                label: "Preferences",
                href: "/settings/preferences",
                icon: Bell,
              }}
            />
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-bg-card/60 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Languages className="h-4 w-4 text-gold" />
                <span className="text-sm font-medium text-ink">Languages</span>
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-bg/40 p-1">
                {(["en", "es"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => selectLanguage(code)}
                    className={[
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      (mounted ? language : "en") === code
                        ? "bg-gold/[0.12] text-ink"
                        : "text-ink-secondary hover:text-ink",
                    ].join(" ")}
                  >
                    {code === "en" ? "English" : "Español"}
                  </button>
                ))}
              </div>
            </div>
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

function SectionHeader({ label }: { label: string }) {
  return (
    <span className="text-sm font-semibold tracking-tight text-ink">{label}</span>
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
        <div className="text-sm font-medium text-ink">{item.label}</div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-secondary" />
    </Link>
  );
}
