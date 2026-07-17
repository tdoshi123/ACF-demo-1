"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import PrimaryButton from "@/components/PrimaryButton";
import SectionCard from "@/components/SectionCard";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    if (feedback.trim() === "") return;
    setSubmitted(true);
    setFeedback("");
    setTimeout(() => setSubmitted(false), 2200);
  }

  return (
    <AppShell title="Feedback" minimalMobileHeader>
      <div className="mb-5">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-bg-card/60 px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:border-white/20 hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to More
        </Link>
      </div>

      <SectionCard
        eyebrow="Feedback"
        title="Tell us what's working"
      >
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What's working? What's not? Tell us."
          rows={5}
          className="w-full resize-none rounded-2xl border border-white/10 bg-bg-card/70 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-white/20"
        />

        <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          {submitted && (
            <span className="self-center text-xs text-success">
              Thanks — we got it.
            </span>
          )}
          <PrimaryButton onClick={submit} disabled={feedback.trim() === ""}>
            Submit feedback
          </PrimaryButton>
        </div>
      </SectionCard>
    </AppShell>
  );
}
