"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import BadgePill from "@/components/BadgePill";
import SectionCard from "@/components/SectionCard";
import { mockWallet } from "@/lib/mockData";
import { formatCurrency } from "@/lib/calculations";

export default function WalletPage() {
  return (
    <AppShell title="Wallet" minimalMobileHeader>
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
          eyebrow="Wallet"
          title="Teamworks Wallet"
          subtitle="Bank/ACH is the preferred funding path for recurring deposits."
          right={
            <BadgePill tone="success">
              {mockWallet.status === "connected" ? "Connected" : "Not connected"}
            </BadgePill>
          }
        >
          <div className="divide-y divide-white/5 md:grid md:gap-3 md:grid-cols-3 md:divide-y-0">
            <Row label="Account" value={mockWallet.maskedAccount} />
            <Row
              label="Last deposit"
              value={formatNiceDate(mockWallet.lastDeposit)}
            />
            <Row
              label="MTD deposits"
              value={formatCurrency(mockWallet.monthToDateDeposits)}
            />
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

function formatNiceDate(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso + (iso.includes("T") ? "" : "T00:00:00"));
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
