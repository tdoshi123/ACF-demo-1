"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AppShell from "@/components/AppShell";
import PrimaryButton from "@/components/PrimaryButton";
import SectionCard from "@/components/SectionCard";

export default function FeedbackPage() {
  const [feature, setFeature] = useState("");
  const [working, setWorking] = useState("");
  const [wrong, setWrong] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit =
    feature.trim() !== "" && (working.trim() !== "" || wrong.trim() !== "");

  function submit() {
    if (!canSubmit) return;
    setSubmitted(true);
    setFeature("");
    setWorking("");
    setWrong("");
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
        title="Tell us what's working — and what's not"
      >
        <div className="space-y-6">
          <div>
            <label
              htmlFor="feature"
              className="text-xs font-medium text-ink-secondary"
            >
              What feature?{" "}
              <span className="text-ink-muted">
                (fill in at least one of the fields below)
              </span>
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-bg-card/70 px-4 focus-within:border-white/20">
              <input
                id="feature"
                type="text"
                placeholder="Which feature or page?"
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                className="w-full bg-transparent py-3 text-sm text-ink outline-none placeholder:text-ink-muted"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="working"
              className="text-xs font-medium text-ink-secondary"
            >
              What&apos;s working?
            </label>
            <textarea
              id="working"
              value={working}
              onChange={(e) => setWorking(e.target.value)}
              placeholder="What's going well?"
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-bg-card/70 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-white/20"
            />
          </div>

          <div>
            <label
              htmlFor="wrong"
              className="text-xs font-medium text-ink-secondary"
            >
              What&apos;s wrong?
            </label>
            <textarea
              id="wrong"
              value={wrong}
              onChange={(e) => setWrong(e.target.value)}
              placeholder="What's not working, or could be better?"
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-bg-card/70 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-white/20"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          {submitted && (
            <span className="self-center text-xs text-success">
              Thanks — we got it.
            </span>
          )}
          <PrimaryButton onClick={submit} disabled={!canSubmit}>
            Submit feedback
          </PrimaryButton>
        </div>
      </SectionCard>
    </AppShell>
  );
}
