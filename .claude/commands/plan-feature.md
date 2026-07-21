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

## 3. Decompose into 2–5 sub-issues

Each one independently implementable and small enough for a single reviewable PR.

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
and on what, and the order to apply the `claude` label.

## Boundaries

- Never apply the `claude` label — the maintainer's label-apply is both the review gate
  and the trigger.
- Never implement any of it.
- Stop once the tree is presented and summarized.
