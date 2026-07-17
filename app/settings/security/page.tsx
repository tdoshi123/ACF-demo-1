"use client";

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import AppShell from "@/components/AppShell";
import SectionCard from "@/components/SectionCard";

export default function SecurityPage() {
  return (
    <AppShell title="Security" minimalMobileHeader>
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
        <SectionCard eyebrow="Security" title="Coming soon">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ink-secondary" />
            <p className="text-sm text-ink-secondary">
              Security settings — like device management and login controls —
              are coming soon.
            </p>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
