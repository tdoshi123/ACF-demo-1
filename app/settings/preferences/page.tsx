"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import AppShell from "@/components/AppShell";
import SectionCard from "@/components/SectionCard";
import { StorageKeys, readJSON, writeJSON } from "@/lib/storage";

interface NotificationPrefs {
  deposit: boolean;
  education: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  deposit: true,
  education: false,
};

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    setPrefs(readJSON<NotificationPrefs>(StorageKeys.notifications, DEFAULT_PREFS));
  }, []);

  function updatePref<K extends keyof NotificationPrefs>(
    key: K,
    value: boolean,
  ) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      writeJSON(StorageKeys.notifications, next);
      return next;
    });
  }

  return (
    <AppShell title="Preferences" minimalMobileHeader>
      <div className="mb-5">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-bg-card/60 px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-white/20 hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to More
        </Link>
      </div>

      <div className="space-y-6">
        <SectionCard eyebrow="Notifications" title="Stay nudged, not noisy">
          <div className="divide-y divide-white/5 md:space-y-3 md:divide-y-0">
            <Toggle
              label="Recurring deposit reminders"
              hint="Heads-up the day before a scheduled contribution."
              icon={<Bell className="h-4 w-4 text-gold" />}
              value={prefs.deposit}
              onChange={(v) => updatePref("deposit", v)}
            />
            <Toggle
              label="Education suggestions"
              hint="Occasional module recommendations."
              icon={<Bell className="h-4 w-4 text-gold" />}
              value={prefs.education}
              onChange={(v) => updatePref("education", v)}
            />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}

/* ===== */

function Toggle({
  label,
  hint,
  icon,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors md:rounded-2xl md:border md:border-white/5 md:bg-bg-card/60 md:p-4 md:hover:border-white/15"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
            {icon}
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-ink">{label}</div>
          {hint && <div className="text-xs text-ink-secondary">{hint}</div>}
        </div>
      </div>
      <span
        className={[
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
          value ? "bg-gradient-gold" : "bg-white/10",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
            value ? "left-[22px]" : "left-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
