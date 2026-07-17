# Feature Pipeline

Run the feature pipeline for: $ARGUMENTS

Before starting:
- Delete any files left in .pipeline/ from a previous run.
- Check the current git branch. If we're on main, create and switch to a
  feature branch named after the request (feature/kebab-case-name) and tell
  me you did. Never run this pipeline on main.

## Stage 1 — Plan
Delegate to the planner subagent. Wait for .pipeline/spec.md.

STOP HERE. Render the spec dashboard as laid out below, then ask:
approve, revise, or abort? Do not continue without an explicit answer.

If the spec has OPEN QUESTIONS, put them at the very top and resolve them
with me before anything else.

## Stage 2 — Code
Delegate to the coder subagent. Wait for .pipeline/changes.md.

No gate. Print two lines (files touched, what was built) and continue.

## Stage 3 — Test
Delegate to the tester subagent. Wait for .pipeline/test-results.md.

If anything failed, STOP and show me the failures with full output.
Do not continue to review with a red build.

## Stage 4 — Review
Run /security-review and save the output to .pipeline/security-review.md.
Delegate to the reviewer subagent. Wait for .pipeline/review.md.

STOP HERE. Render the review dashboard as laid out below.

## Stage 5 — Merge gate
Only reachable when the verdict is SHIP.

Ask: approve and merge, or decline?

On approve, using the Bash tool — I am not running these myself:
- Stage and commit the changes with a message describing the feature
- Check out main, merge the feature branch, push to origin
- Delete the feature branch
- Update .claude/memory.md: add an entry to the top of "Features shipped"
  with the date, the feature name, one line on what it does, and the key
  files. If a new pattern was established, add it to "Patterns worth
  copying" with the path. If a real decision was made, add it to
  "Decisions" with the reasoning. If the reviewer flagged debt we're
  shipping anyway, add it to "Known gaps". Append only — never rewrite
  existing entries. Skip trivial changes entirely.
  Show me the memory.md diff, then commit and push it.
- Report what was merged and what was added to memory.

On decline: leave the branch untouched. Tell me what's where.

---

# Dashboard formats

Use these exactly. Plain language over jargon. No walls of text.

## Spec dashboard

**What we're building**
Two sentences, plain English. What the athlete can do that they couldn't before.

**Files**

| File | New or edit | What it's for |
|---|---|---|

**Functions and types**

| Name | Takes | Gives back | What it does |
|---|---|---|---|

**Edge cases**
Numbered. One line each, as "if X happens, then Y."

**Touches**
One line each, only if relevant: localStorage keys used, design tokens used,
existing file the pattern comes from.

**Open questions**
Only if there are any. Otherwise omit the section.

## Review dashboard

**Verdict: SHIP / NEEDS WORK / BLOCK**

**Does the code do what we planned?**
One line, then anything that drifted from the spec.

**Does it break our rules?**
Checked against memory.md's hard constraints. One line if clean.

**Security**

| Issue | How bad | Where | What to do |
|---|---|---|---|

One line saying so if nothing was found.

**Code quality**
Up to five things, worst first. One line each, with file and line.
Fewer if the code is clean.

**Tests**
One line: are these actually proving the feature works, or going through the
motions? Name anything important that isn't covered.

**If not SHIP**
Numbered list of exactly what to fix and where. Nothing vague.
