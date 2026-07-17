"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import BadgePill from "@/components/BadgePill";
import DisclaimerBox from "@/components/DisclaimerBox";
import Modal from "@/components/Modal";
import PrimaryButton from "@/components/PrimaryButton";
import ProgressBar from "@/components/ProgressBar";
import SectionCard from "@/components/SectionCard";
import SecondaryButton from "@/components/SecondaryButton";
import { mockBadges, mockEducationModules } from "@/lib/mockData";
import {
  getModuleProgress,
  getModuleStatus,
  moduleCtaLabel,
  moduleStatusLabel,
  overallEducationProgress,
} from "@/lib/calculations";
import type { ProgressMap } from "@/lib/calculations";
import { StorageKeys, readJSON, writeJSON } from "@/lib/storage";
import type { EducationCategory, EducationModule } from "@/lib/types";

const categories: ReadonlyArray<"All" | EducationCategory> = [
  "All",
  "NIL",
  "Budgeting",
  "Investing",
  "Taxes",
  "Mindset",
];
type Category = (typeof categories)[number];

export default function EducationPage() {
  const [filter, setFilter] = useState<Category>("All");
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgressMap(readJSON<ProgressMap>(StorageKeys.educationProgress, {}));
    setHydrated(true);
  }, []);

  const modules = useMemo(() => {
    if (filter === "All") return mockEducationModules;
    return mockEducationModules.filter((m) => m.category === filter);
  }, [filter]);

  const overallPct = overallEducationProgress(
    mockEducationModules,
    progressMap,
  );
  const completed = mockEducationModules.filter(
    (m) => getModuleProgress(m, progressMap) >= 100,
  ).length;

  function markComplete(id: string) {
    const next: ProgressMap = { ...progressMap, [id]: 100 };
    setProgressMap(next);
    writeJSON(StorageKeys.educationProgress, next);
  }

  function startOrContinue(id: string) {
    const current = progressMap[id];
    if (typeof current !== "number" || current < 50) {
      const next = { ...progressMap, [id]: Math.max(50, current ?? 0) };
      setProgressMap(next);
      writeJSON(StorageKeys.educationProgress, next);
    }
  }

  function reset(id: string) {
    const next = { ...progressMap, [id]: 0 };
    setProgressMap(next);
    writeJSON(StorageKeys.educationProgress, next);
  }

  const activeModule = activeModuleId
    ? mockEducationModules.find((m) => m.id === activeModuleId) ?? null
    : null;

  return (
    <AppShell
      title="Education hub"
      subtitle="Learn how NIL money moves, then learn how to keep it."
      minimalMobileHeader
    >
      <div className="space-y-6">
        <SectionCard
          eyebrow="Your progress"
          title="Discipline starts with literacy"
          subtitle={`${completed} of ${mockEducationModules.length} modules complete · ${overallPct}% overall`}
          right={
            <BadgePill tone="gold" icon={<Sparkles className="h-3 w-3" />}>
              Athlete curriculum
            </BadgePill>
          }
        >
          <ProgressBar value={overallPct} color="#D4AF37" height={10} />
          <DisclaimerBox className="mt-5 hidden md:block">
            Modules teach concepts. They are not financial, legal, or tax
            advice. When the dollar amounts are real, talk to a professional.
          </DisclaimerBox>
        </SectionCard>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => {
            const active = filter === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={[
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-gold/40 bg-gold/[0.1] text-gold"
                    : "border-white/10 bg-bg-card/60 text-ink-secondary hover:border-white/20 hover:text-ink",
                ].join(" ")}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Tablet/desktop: bordered card grid. */}
        <div className="hidden gap-4 md:grid md:grid-cols-2">
          {modules.map((m) => (
            <ModuleCard
              key={m.id}
              module={m}
              progressMap={hydrated ? progressMap : {}}
              onOpen={() => setActiveModuleId(m.id)}
            />
          ))}
        </div>

        {/* Phones: lightweight divided list, no boxes-within-boxes (3.12). */}
        <ul className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-bg-card/40 px-4 md:hidden">
          {modules.map((m) => {
            const status = getModuleStatus(m, hydrated ? progressMap : {});
            const pct = getModuleProgress(m, hydrated ? progressMap : {});
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setActiveModuleId(m.id)}
                  disabled={m.locked}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left disabled:opacity-60"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                      <BookOpen className="h-3 w-3" />
                      {m.category} · {m.estimatedMinutes} min
                    </div>
                    <div className="mt-0.5 truncate text-sm font-medium text-ink">
                      {m.title}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[11px] text-ink-muted">{pct}%</span>
                    <StatusPill status={status} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {/* ------- Badges section ------- */}
        <div id="badges">
          <SectionCard
            eyebrow="Badges"
            title="Discipline, earned"
            subtitle="Rewards for showing up, not for size of account."
            right={
              <BadgePill tone="gold" icon={<Award className="h-3 w-3" />}>
                {mockBadges.filter((b) => b.defaultProgress >= 100).length} of{" "}
                {mockBadges.length} unlocked
              </BadgePill>
            }
          >
            {/* Tablet/desktop: bordered badge cards. */}
            <div className="hidden gap-4 sm:grid-cols-2 md:grid lg:grid-cols-3">
              {mockBadges.map((b) => (
                <BadgeCard
                  key={b.id}
                  label={b.label}
                  description={b.description}
                  requirement={b.requirement}
                  progress={b.defaultProgress}
                />
              ))}
            </div>

            {/* Phones: compact divided list to match the module list (3.12). */}
            <ul className="divide-y divide-white/5 md:hidden">
              {mockBadges.map((b) => {
                const unlocked = b.defaultProgress >= 100;
                return (
                  <li key={b.id} className="flex items-center gap-3 py-3">
                    <div
                      className={[
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        unlocked
                          ? "bg-gradient-gold text-[#0B1020]"
                          : "bg-white/5 text-ink-muted",
                      ].join(" ")}
                    >
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink">
                        {b.label}
                      </div>
                      <div className="truncate text-[11px] text-ink-muted">
                        {b.requirement}
                      </div>
                    </div>
                    <BadgePill tone={unlocked ? "gold" : "muted"}>
                      {unlocked ? "Unlocked" : `${b.defaultProgress}%`}
                    </BadgePill>
                  </li>
                );
              })}
            </ul>
            <DisclaimerBox className="mt-5">
              No public leaderboards. No social comparison. Progress is yours
              alone — reward for discipline, consistency, and education.
            </DisclaimerBox>
          </SectionCard>
        </div>
      </div>

      <LessonModal
        module={activeModule}
        progressMap={progressMap}
        onClose={() => setActiveModuleId(null)}
        onMarkComplete={(id) => {
          markComplete(id);
          setActiveModuleId(null);
        }}
        onStart={(id) => startOrContinue(id)}
        onReset={(id) => reset(id)}
      />
    </AppShell>
  );
}

/* ----------------------------------------------------------------------------
 * Module card
 * -------------------------------------------------------------------------- */

function ModuleCard({
  module: m,
  progressMap,
  onOpen,
}: {
  module: EducationModule;
  progressMap: ProgressMap;
  onOpen: () => void;
}) {
  const status = getModuleStatus(m, progressMap);
  const pct = getModuleProgress(m, progressMap);

  return (
    <article
      className={[
        "surface-card relative flex flex-col gap-4 p-5",
        m.locked ? "opacity-70" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-eyebrow">
            <BookOpen className="h-3.5 w-3.5" />
            {m.category}
            <span className="text-ink-muted">·</span>
            <Clock className="h-3 w-3" />
            {m.estimatedMinutes} min
          </div>
          <h3 className="mt-2 text-base font-semibold leading-tight text-ink">
            {m.title}
          </h3>
        </div>
        <StatusPill status={status} />
      </div>

      <p className="text-sm leading-relaxed text-ink-secondary">
        {m.shortDescription}
      </p>

      <div>
        <ProgressBar value={pct} color="#D4AF37" height={6} />
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-muted">
          <span>{pct}% complete</span>
          <span>{moduleStatusLabel(status)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        disabled={m.locked}
        className={[
          "inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
          m.locked
            ? "cursor-not-allowed border-white/5 bg-white/[0.02] text-ink-muted"
            : "border-white/10 bg-bg-card/60 text-ink hover:border-white/20",
        ].join(" ")}
      >
        {m.locked ? (
          <Lock className="h-3.5 w-3.5" />
        ) : (
          <PlayCircle className="h-3.5 w-3.5" />
        )}
        {moduleCtaLabel(status)}
      </button>
    </article>
  );
}

function StatusPill({
  status,
}: {
  status: ReturnType<typeof getModuleStatus>;
}) {
  if (status === "locked") {
    return (
      <BadgePill tone="muted" icon={<Lock className="h-3 w-3" />}>
        Locked
      </BadgePill>
    );
  }
  if (status === "complete") {
    return (
      <BadgePill tone="success" icon={<CheckCircle2 className="h-3 w-3" />}>
        Complete
      </BadgePill>
    );
  }
  if (status === "in_progress") {
    return <BadgePill tone="gold">In Progress</BadgePill>;
  }
  return <BadgePill tone="neutral">Not Started</BadgePill>;
}

/* ----------------------------------------------------------------------------
 * Lesson modal
 * -------------------------------------------------------------------------- */

function LessonModal({
  module: m,
  progressMap,
  onClose,
  onMarkComplete,
  onStart,
  onReset,
}: {
  module: EducationModule | null;
  progressMap: ProgressMap;
  onClose: () => void;
  onMarkComplete: (id: string) => void;
  onStart: (id: string) => void;
  onReset: (id: string) => void;
}) {
  useEffect(() => {
    if (m && !m.locked) onStart(m.id);
    // intentionally only when module changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m?.id]);

  if (!m) return null;

  const pct = getModuleProgress(m, progressMap);
  const done = pct >= 100;

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={`${m.category} · ${m.estimatedMinutes} min read`}
      title={m.title}
      subtitle={m.shortDescription}
      maxWidthClassName="max-w-3xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => onReset(m.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-bg-card/60 px-4 py-2 text-xs font-medium text-ink-secondary hover:border-white/20 hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset progress
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            <PrimaryButton
              onClick={() => onMarkComplete(m.id)}
              disabled={done}
              className={done ? "opacity-60" : ""}
            >
              <CheckCircle2 className="h-4 w-4" />
              {done ? "Already complete" : "Mark complete"}
            </PrimaryButton>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <ProgressBar value={pct} color="#D4AF37" height={6} />

        <p className="text-base leading-relaxed text-ink">{m.content.intro}</p>

        <div className="space-y-3">
          {m.content.body.map((p) => (
            <p key={p} className="text-sm leading-relaxed text-ink-secondary">
              {p}
            </p>
          ))}
        </div>

        <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-4">
          <div className="text-eyebrow text-gold">Key takeaways</div>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            {m.content.keyTakeaways.map((k) => (
              <li key={k} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------------------------------------------------------------
 * Badge card
 * -------------------------------------------------------------------------- */

function BadgeCard({
  label,
  description,
  requirement,
  progress,
}: {
  label: string;
  description: string;
  requirement: string;
  progress: number;
}) {
  const unlocked = progress >= 100;
  return (
    <div
      className={[
        "relative flex flex-col gap-3 rounded-2xl border p-4",
        unlocked
          ? "border-gold/30 bg-gold/[0.06]"
          : "border-white/10 bg-bg-card/60",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl",
            unlocked
              ? "bg-gradient-gold text-[#0B1020]"
              : "bg-white/5 text-ink-muted",
          ].join(" ")}
        >
          <Award className="h-5 w-5" />
        </div>
        <BadgePill tone={unlocked ? "gold" : "muted"}>
          {unlocked ? "Unlocked" : "Locked"}
        </BadgePill>
      </div>
      <div>
        <div className="text-sm font-semibold text-ink">{label}</div>
        <p className="mt-1 text-xs text-ink-secondary">{description}</p>
      </div>
      <div>
        <ProgressBar
          value={progress}
          color={unlocked ? "#D4AF37" : "#94A3B8"}
          height={5}
        />
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-muted">
          <span>{progress}%</span>
          <span className="truncate pl-2 text-right">{requirement}</span>
        </div>
      </div>
    </div>
  );
}
