"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Trash2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import DisclaimerBox from "@/components/DisclaimerBox";
import SectionCard from "@/components/SectionCard";
import { clearAll } from "@/lib/storage";

export default function PrivacyPage() {
  const [confirmReset, setConfirmReset] = useState(false);

  function resetDemoData() {
    clearAll();
    setConfirmReset(false);
  }

  return (
    <AppShell title="Privacy" minimalMobileHeader>
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
        {/* ----- Legal / Disclaimers ----- */}
        <SectionCard
          eyebrow="Legal & disclaimers"
          title="Read before assuming anything"
          subtitle="Important context for everything you see in this app."
        >
          <ul className="divide-y divide-white/5 text-sm text-ink-secondary md:space-y-2.5 md:divide-y-0">
            {[
              "Investing involves risk, including possible loss of principal.",
              "Portfolio values can go down as well as up.",
              "Past performance does not guarantee future results.",
              "Athlete Collective Fund does not provide tax advice.",
              "NIL payments may create tax obligations.",
              "Users should consult a tax professional for their personal situation.",
              "This frontend MVP uses mock data and does not move real money.",
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 py-2.5 md:rounded-xl md:border md:border-white/5 md:bg-bg-card/60 md:p-3"
              >
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
                <span className="text-ink">{line}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* ----- Privacy & data ----- */}
        <SectionCard eyebrow="Privacy & data" title="Your data is yours">
          <DisclaimerBox>
            All saved values live in this browser&apos;s local storage only. There is
            no backend, no shared profile, and no money movement.
          </DisclaimerBox>

          <div className="mt-4">
            {confirmReset ? (
              <div className="flex flex-col gap-2 rounded-2xl border border-danger/30 bg-danger/[0.06] p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-danger">
                  Reset all demo data? This cannot be undone.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="rounded-xl border border-white/10 bg-bg-card/60 px-3 py-1.5 text-xs text-ink-secondary hover:border-white/20 hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={resetDemoData}
                    className="rounded-xl border border-danger/40 bg-danger/15 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/25"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/10 px-5 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/15"
              >
                <Trash2 className="h-4 w-4" />
                Reset demo data
              </button>
            )}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
