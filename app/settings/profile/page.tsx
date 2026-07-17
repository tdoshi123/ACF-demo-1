"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import BadgePill from "@/components/BadgePill";
import SectionCard from "@/components/SectionCard";
import { mockAthlete, mockTeamworksIdentity } from "@/lib/mockData";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" minimalMobileHeader>
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
        <SectionCard
          eyebrow="Athlete profile"
          title={`${mockAthlete.firstName} ${mockAthlete.lastName}`}
          subtitle={`${mockAthlete.school} · ${mockAthlete.sport} · ${mockAthlete.classYear}`}
          right={
            <BadgePill
              tone="success"
              icon={<ShieldCheck className="h-3 w-3" />}
            >
              Teamworks verified
            </BadgePill>
          }
        >
          <div className="divide-y divide-white/5 md:grid md:gap-3 md:grid-cols-2 md:divide-y-0 lg:grid-cols-4">
            <Row label="Teamworks email" value={mockTeamworksIdentity.email} />
            <Row label="Teamworks ID" value={mockTeamworksIdentity.teamworksId} />
            <Row
              label="Last sync"
              value={formatDateTime(mockTeamworksIdentity.lastSync)}
            />
            <Row label="Status" value="Verified" />
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}

/* ===== */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 py-2.5 md:rounded-xl md:border md:border-white/5 md:bg-bg-card/60 md:p-3">
      <div className="text-[11px] uppercase tracking-wide text-ink-muted">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-medium text-ink">
        {value}
      </div>
    </div>
  );
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
