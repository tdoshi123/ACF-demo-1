"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import AppShell from "@/components/AppShell";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What counts as an NIL check?",
    answer:
      "Any payment you receive for name, image, and likeness activity — brand deals, appearances, social posts, and similar. Log each one under Enter Check so it can be split into buckets.",
  },
  {
    question: "How does the app split my checks?",
    answer:
      "Every check you log is split into buckets — taxes, lifestyle, emergency, investing, and kids — based on the program you selected. The split is locked in at the moment you log it, so it won't change later even if your program percentages change.",
  },
  {
    question: "Why doesn't my split add up to 100% of what I keep?",
    answer:
      "Taxes are part of the split but aren't money you keep — that portion is set aside because it will eventually leave the household. \"Retained\" refers to emergency, investing, and kids combined.",
  },
  {
    question: "What is a risk profile, and how is it different from my split?",
    answer:
      "Your split (taxes, lifestyle, emergency, investing, kids) is about how a single check is divided. Your risk profile is a separate choice about how your investing bucket is invested — from conservative to aggressive growth — and you can change it anytime in Risk Profile.",
  },
  {
    question: "Can I fine-tune my investment mix beyond the five presets?",
    answer:
      "Yes. Each risk profile page includes an allocation editor where you can nudge the stocks/bonds/cash percentages away from the preset default, as long as they still add up to 100%.",
  },
  {
    question: "Is any of this real money?",
    answer:
      "No. This is a demo build. All figures are mock data stored only in your browser — nothing here moves real money or connects to a real bank or brokerage.",
  },
  {
    question: "What happens if I reset demo data?",
    answer:
      "Reset demo data (on the Privacy page) clears everything saved in this browser, including your deposit settings, risk profile, and onboarding progress. You'll need to log back in and go through onboarding again.",
  },
  {
    question: "Who can see my activity?",
    answer:
      "Nobody but you. There are no public leaderboards or social feeds — your progress and figures are private to your browser session.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <AppShell title="FAQ" minimalMobileHeader>
      <div className="mb-5">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-bg-card/60 px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-white/20 hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to More
        </Link>
      </div>

      <div className="space-y-2.5">
        {FAQ_ITEMS.map((item, index) => {
          const open = openIndex === index;
          return (
            <div
              key={item.question}
              className="rounded-2xl border border-white/10 bg-bg-card/60"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-sm font-medium text-ink">
                  {item.question}
                </span>
                {open ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-ink-secondary" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-ink-secondary" />
                )}
              </button>
              {open && (
                <div className="px-4 pb-4 text-sm text-ink-secondary">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
