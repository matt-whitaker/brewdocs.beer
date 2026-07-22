Decompose a feature into a parent (epic) issue and independently-implementable
sub-issues, and hand them back as markdown for the maintainer to paste into GitHub.

The feature to plan: $ARGUMENTS

Do NOT implement anything. Do NOT create, label, or edit issues. Produce the issue
tree as markdown in your response and stop.

## 1. Ground yourself in the codebase first

Read the packages and directories this feature actually touches, so every issue names
real paths. Never write a path you haven't confirmed exists — a wrong path costs the
worker turns rediscovering the repo, which is the whole reason this command exists.

This is an npm-workspaces monorepo: `packages/{app,core,design,kb,www}`. Default branch
is `mainline`. See CLAUDE.md for architecture and conventions.

## 2. Draft the parent (epic)

The overall goal and why, the shared constraints, and a short codebase map of where the
relevant code lives. This is the review artifact — it's what the maintainer reads to
decide whether the decomposition is right.

## 3. Decompose into sub-issues sized for a bounded-turn worker

Each sub-issue is implemented by a worker with a **fixed turn budget** (~40 turns on the
label tier) that must **read the files it will touch before it can edit them** — reading
is most of what it spends turns on. So a sub-issue that's "one reviewable PR" for a human
can still be too big for the worker: if it has to read ~40 files to understand the change,
it exhausts the budget on exploration and runs out before writing code. This has actually
happened — a single "wire the edit page" issue that spanned a whole screen tree died at the
turn cap having made almost no edits.

**Size by exploration cost, not just human-reviewability:**

- Keep each sub-issue to a **small, cohesive set of files** — roughly a handful, not a
  whole directory tree.
- ⚠️ If a sub-issue would touch a **directory of screens/rows** (e.g. `recipe-edit-ingredients/`
  and its per-ingredient row files), that's the signal to **split it further** — one
  screen, or one slice, per sub-issue — rather than let one issue span the tree.
- **Size is the hard constraint; the number of sub-issues is soft.** Prefer more small
  issues over one that balloons — seven right-sized children beat five oversized ones. (If
  a feature genuinely needs a dozen, that's a signal to narrow its scope with the maintainer.)
- Precise paths in *Where the code lives* directly cut exploration cost — the more exact,
  the fewer files the worker reads to orient.

**Write every sub-issue self-contained.** There is no runtime parent lookup — a worker
picks up one labeled issue and sees only that issue. Restating shared constraints in
each child is correct here; a child that says "see the parent for context" will be
implemented without that context.

Order them so prerequisites come first, and say plainly which are independent (safe to
start in parallel) and which are blocked on an earlier child.

## 4. Output format

Present the parent as one markdown block, then each sub-issue as its own block, each
ready to paste as a GitHub issue body. Use the section headings from
`.github/ISSUE_TEMPLATE/claude-task.yml`:

- **Summary** — what needs to happen and why
- **Where the code lives** — specific, verified paths
- **What to change** — concrete requirements, bulleted
- **Patterns to follow** — an existing file to mirror
- **Out of scope** — what not to touch; prevents over-engineering
- **Acceptance criteria** — a short checklist
- **CLAUDE.md Updates (Optional)** — note anything that will need to be updated in the CLAUDE.md

Carry these standing constraints into every sub-issue's Out of scope:

- Don't hand-edit generated files (`routeTree.gen.ts`).
- Don't add lodash; use `packages/app/src/utils/func.ts`.
- Don't rename anything under `packages/kb/data/**` — it changes derived ids.

Don't ask a worker to run builds. The **Verify** workflow runs the gate on the PR, and
`npm ci` plus the package builds would eat most of a run's turn budget.

## 5. Close with a plan of attack

After the blocks, summarize: each sub-issue's title, which are independent vs. blocked
and on what, and the order to apply the `claude` label. Remind the maintainer to **start a
sub-issue by applying the `claude` label** (the full feature-work turn budget) — an `@claude`
comment runs on the smaller poke budget and can time out on real implementation work.

## Boundaries

- Never apply the `claude` label — the maintainer's label-apply is both the review gate
  and the trigger.
- Never implement any of it.
- Stop once the tree is presented and summarized.
