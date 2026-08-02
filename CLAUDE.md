# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repo. **These instructions override default behavior.**

This root file holds the **universal** rules. Each package's deep-dive lives in its own `CLAUDE.md`, loaded on demand when you work in that package (see _Packages_).

## Overview

- **What.** BrewDocs — offline-first homebrewing PWA (brew-day companion + knowledge base). **Proof-of-concept**; breaking changes are expected. There is deliberately **no data migration or on-load normalization** — assume a **pristine local store** in dev (`/?purge=true` to reset). Don't add "ensure"/backfill shims that repair old stored objects.
- **Layout.** npm-workspaces monorepo; packages named `@brewdocs.beer/<name>`.
- **Default branch.** `mainline` — also the target for all PRs and the **sole** deploy branch.
- **Node.** ≥22. ⚠️ Non-interactive shells on this machine resolve `node` to an ancient v10 — if a command fails with syntax errors inside `node_modules`, prefix it: `PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"`.
- **Verify (the gate).** `npm test -ws` (eslint — app + www + design + e2e) + `tsc --noEmit` + `vite build`. No unit-test framework, no runtime tests in that gate — Playwright functional tests (`packages/e2e`) run separately in `.github/workflows/functional-test.yaml`, not in Verify. See _Linting_ (`packages/app/CLAUDE.md`) and _Definition of done_.

| Package | Role |
|---|---|
| `core` | Shared, environment-agnostic types + helpers: `Entity`/`Units`/`Currencies`, React prop/event helpers, `createFetchClient`. |
| `kb` | Knowledge base: raw JSON data → built resource files → HTTP transport adapter (`importResource`) + `Kb*` model types. |
| `design` | React UI primitives (typography, inputs) that emit Tailwind/DaisyUI class strings. |
| `app` | The PWA itself: Vite + React + TanStack Router/Query. Deployed to app.brewdocs.beer. |
| `www` | Astro marketing/info site at brewdocs.beer. |
| `e2e` | Playwright functional-test harness (config + specs) driving the app dev server. Not part of Verify — its own `functional-test.yaml` CI workflow. |

## Legend

Field labels used throughout (root and package `CLAUDE.md` files). **Omitting** a field means it doesn't apply; **`_None._`** means it applies but is currently empty (audited — nothing to report). ⚠️ marks the easily-broken.

**Purpose** · **Where** · **Surface** (public API) · **How it works** · **Invariants** · **Gotchas** · **Example** · **Commands** / **Env**

Cross-references name the target section in _italics_. A section's deep-dive may live in its package's own `CLAUDE.md` — most app subsystems (_Routing_, _State_, _Styling_, _Linting_, _Model boundary_, …) are in `packages/app/CLAUDE.md`. Paths are repo-relative and clickable.

## Commands

Run from the repo root with `-w`:

```bash
npm run dev -w packages/app       # app dev server (auto-symlinks kb dist via predev)
npm run build -w packages/app     # tsc --noEmit && vite build → dist/
npm run preview -w packages/app   # serve the production build (needed to test PWA/service worker)
npm test -w packages/app          # eslint — the verification gate (see Linting)
npm run build -w packages/kb      # rebuild kb dist JSON from data/ (also runs on postinstall)
npm run dev -w packages/www       # astro dev
npm test -w packages/design       # eslint — the verification gate (see Linting)
npm run dev -w packages/design    # storybook dev -p 6006
npm run build -w packages/design  # storybook build -o dist → the static site the deploy workflow publishes
```

Root `build:design`/`dev:design`/`test:design` delegate to `-w packages/design`, matching the `*:app`/`*:www` pattern (used by `.github/workflows/build-test-deploy.design-prod.yaml`).

- Typecheck app only: `cd packages/app && ../../node_modules/.bin/tsc --noEmit`.
- Lint app only: `npm run lint -w packages/app` (⚠️ see _Linting_ — must resolve the app's nested eslint 9, not the root's).

## Package dependencies

```
core ← design ← app        core ← kb ← app        core ← design ← www
```

**Workspace packages ship raw TypeScript source** (`main: src/index.ts`, no build) — consumers' bundlers compile them. Consequences:

- Code in `core`/`design`/`kb` must compile under **every** consumer's tsconfig, and `core` must stay environment-agnostic (no `import.meta.env`, no Node/DOM APIs) — it's consumed by Vite (app), Astro (www), and plain-Node scripts (kb build).
- ⚠️ Tailwind v4 does not auto-scan symlinked workspace deps: `app/src/styles.css` (and www's) carry a load-bearing `@source "../../design/src";`. Without it, all design-package styling silently disappears.
- ⚠️ **Don't read `node_modules/<pkg>` at the repo root to check tailwind/daisyui behavior.** daisyui is nested per-consumer (app + www, both v5); root has no copy. Root `tailwindcss` is hoisted from the workspaces' own `^4.3.2` devDependency (no separate root declaration). The built CSS in `packages/app/dist/assets/*.css` is the only reliable answer to "what does this class do".

## Packages

Each package's deep-dive (Purpose / Where / Surface / Invariants / Gotchas …) lives in its own `CLAUDE.md`, loaded on demand when you work in that package. Read the relevant one before editing there:

- **core** → [`packages/core/CLAUDE.md`](packages/core/CLAUDE.md)
- **kb** → [`packages/kb/CLAUDE.md`](packages/kb/CLAUDE.md)
- **design** → [`packages/design/CLAUDE.md`](packages/design/CLAUDE.md) (+ long-form [`packages/design/DESIGN.md`](packages/design/DESIGN.md))
- **app** → [`packages/app/CLAUDE.md`](packages/app/CLAUDE.md) — the largest; holds Routing, Breadcrumbs, State, the Kb\*/app _Model boundary_, Derived batch data, BatchSchedule, the `useJsonEdit` editing pattern, PanelSwitcher, _Styling_, kb dev/build serving, and _Linting_.
- **www** → [`packages/www/CLAUDE.md`](packages/www/CLAUDE.md)
- **e2e** → [`packages/e2e/CLAUDE.md`](packages/e2e/CLAUDE.md)

## Deployment

GitHub Actions, path-filtered on push to `mainline` (the sole deploy branch), all delegating to the reusable `matt-whitaker/aws-static-site` workflow (S3 + CloudFront):

- `build-test-deploy.app-prod.yaml` — app dist → app S3 bucket (app.brewdocs.beer).
- `build-test-deploy.app-kb-prod.yaml` — **kb dist deploys independently** to a dedicated kb bucket behind the app's CloudFront distribution (invalidates `/kb`). This is why `importResource` fetches the relative `/kb/*` — same origin in prod, symlink in dev, and kb data updates ship without an app rebuild.
- `build-test-deploy.www-prod.yaml` — www dist → www bucket (brewdocs.beer).

The **Verify** workflow (`.github/workflows/verify.yaml`) runs `npm ci`, then `npm test` (lint) and `npm run build` across **all workspaces** (`-ws`), on every PR (no deploy) — the real pre-merge gate; the `build-test-deploy.*` workflows run only *post*-merge on push.

**Functional tests.** `.github/workflows/functional-test.yaml` runs the Playwright suite (`packages/e2e`) on every PR to `mainline`, independently of Verify — it installs the chromium browser and lets Playwright's `webServer` auto-start the app dev server, uploading the HTML report/traces as an artifact on failure. See `packages/e2e/CLAUDE.md`.

## Contributing

Guidance for human contributors **and** for the `@claude` GitHub integration.

### Branches
- `mainline` is the default branch, the target for **all** PRs, and the **only** deploy branch — a push/merge ships to prod. No separate staging branch; the open PR is the staging buffer. (`develop` is retired.)
- Branch off `mainline`, and **name branches issue-first**: `<issue#>-<kebab-summary>` (e.g. `42-derived-schedule`). Fall back to bare kebab-case for un-ticketed work.

### Commits, PRs & merging
- **Commits.** Plain imperative subject ("Add schedule phases") — no Conventional Commits prefix.
- **PR title.** Same imperative style.
- **PR description** — a light template, *Verification* load-bearing (the PR body is the only record the gate ran):
  - **Summary** — what changed and why, with `Closes #<issue>` when there's a ticket.
  - **Verification** — `npm test` (lint) ✓, `tsc --noEmit` ✓, `vite build` ✓, and which screens/flows were checked in the browser.
  - **Screenshots** — for any UI change.
- **Merge.** Squash only. **The maintainer merges** — contributors and the `@claude` bot open PRs, never merge them. No auto-merge.
- Protect `mainline` to require the **Verify** check green before merge.

### Code style
- ⚠️ **Don't write code comments.** Add one only when the maintainer explicitly asks for it in that task. This covers explanatory blocks, `⚠️` notes, JSDoc, and "why it's like this" asides — the default is **none**.
- Say it in the code instead: a precise name, a smaller function, an explicit type. If a reader would still need the *why*, it belongs in a `CLAUDE.md` — that's where this repo keeps its gotchas, and unlike an inline comment it's discoverable from outside the file and actually gets maintained.
- Deleting a stale or redundant comment is always fine and needs no permission. Adding one does.
- ⚠️ This applies to the `@claude` roles too. Comment-heavy output is a recurring failure mode: the volume buries the few things that matter and goes stale the moment the code moves.

### Definition of done
- The gate is `npm test` (eslint, errors-only) **and** `tsc --noEmit` **and** `vite build` clean, plus manual browser checks for any UI change. A green lint + typecheck + build is the floor for every change.
- ⚠️ Don't hand-edit generated files (`routeTree.gen.ts`); don't add `lodash` or `../` parent-relative intra-app imports (both lint-enforced — use `@/`).
- ⚠️ Renaming files under `packages/kb/data/**` changes derived ids — a breaking change (see `packages/kb/CLAUDE.md`); call it out in the PR.
- Prefer surfacing follow-ups over silently expanding scope; note orphaned/dead code you leave rather than deleting adjacent things unasked.

### The Claude GitHub roles

Six roles, one workflow (`.github/workflows/claude-roles.yaml`), so a comment makes one run
with the unselected roles skipping inside it rather than five skipped runs cluttering the
history.

**Routing.** The handle in the comment picks the role. Labels route nothing.

- `@claude/manager` — issues only. Shapes a rough epic and cuts its integration branch.
- `@claude/researcher` — issues only. Decomposes an epic into sub-issues.
- `@claude/implementor` — issue or PR. Writes the code and opens the PR.
- `@claude/tester` — issue or PR. Owns `packages/e2e`.
- `@claude/writer` — issue or PR. Owns every `CLAUDE.md` and `.claude/skills/`.
- **Security** — no handle. Runs on merge to `mainline` and files issues, labelled
  `@claude/security`. ⚠️ The one exception to "create issues unlabeled": it marks
  provenance so a finding stands out in a queue.

⚠️ All six `@claude/*` labels must exist in the repo or the stamp hook warns and skips.
`@claude/owner` is retired and can be deleted.

⚠️ A bare `@claude` does nothing, so a half-typed handle cannot start the wrong agent.
⚠️ Manager and Researcher require `!github.event.issue.pull_request` — `issue_comment` fires
for PRs too, and without the guard a PR comment started a role written for an epic issue.

**Tester and Writer also run on their own, chained off the Implementor.** An Implementor run
started *from an issue* that opens a PR is followed by a Tester and then a Writer, both pointed
at that PR. Their handles still work by hand; the chain is a fourth way in, not a replacement.

- The Implementor publishes the PR number as a job output (`finish-pr.sh` → `$GITHUB_OUTPUT`),
  and the two jobs `needs:` it. Same workflow run, so no new credential is involved.
- Writer waits on Tester as well, so one run sees both roles' docs candidates instead of two
  racing on the same `CLAUDE.md`.
- Chaining is narrowed to `issue_comment` **not** on a PR. Implementors re-run constantly from
  review feedback, and without that guard each re-run opened another duplicate spec and docs PR.
- An Implementor that opens no PR yields an empty output and starts neither.

⚠️ **A comment cannot chain the roles**, which is why this is `needs:` and not a hook. GitHub
refuses to start a run from an event created with `GITHUB_TOKEN`, and the `if:` guards exclude
`github-actions[bot]` besides. Posting `@claude/tester` from a hook is silently inert; making it
work would need a new `repo`-scoped PAT in reach of a step.
⚠️ **`!cancelled()` in the Tester's and Writer's `if:` is load-bearing.** With `needs:`, a
*skipped* upstream job skips its dependents, and GitHub applies an implicit "all needs
succeeded" gate; a status-check function overrides both. Drop it and a hand-typed
`@claude/tester` can never run again — the Implementor skips, so the Tester skips.
⚠️ **Their `trigger_phrase` is `"@claude/"`, not their own handle.** `track_progress: true`
forces tag mode, which gates on that phrase independently of the `if:` — and a chained run's
triggering comment says `@claude/implementor`. With the narrower phrase the step skips in `0s`
and posts a placeholder comment, the same failure that kept the retired Owner role from ever
running. The `if:` is what routes, so the wider phrase cannot start the wrong role.
⚠️ Workflow changes to any of this **cannot be tested before merge**: `issue_comment` always
runs the workflow from the default branch, so a PR branch's version is never the one that fires.

**Backlog work is scripted, never prompted.** Hooks in `.github/agent-bin/` run around each
model step.

- `stamp-role-label.sh` — pre, every role. Stamps `@claude/<role>` on the issue or PR.
- `file-sub-issues.sh` — post, Researcher. Parents and milestones from the epic's manifest.
- `set-issue-in-progress.sh` — pre, Implementor and Tester. Moves the triggering issue to
  **In Progress** on project #4, so the board reflects reality when work starts rather than
  only when it merges. Skips a closed issue, so a re-run never resurrects finished work.
- `finish-pr.sh` — post, Implementor / Tester / Writer. Labels the PR the run opened with
  its role, and appends `Closes #<issue>` if the model didn't write one.
- `open-integration-pr.sh` — post, Implementor. Opens the epic's integration PR when the
  base branch has none, marker commit included. Reads the branch and epic number out of the
  sub-issue's *Base branch* line.
- `close-merged-work.sh` — on merge. Closes the PR's issues and files them on the board.

⚠️ These were prompt instructions until a model skipped them. A label trail is worthless if
a run can forget to stamp it, and the merge hook is the only backlog behaviour that worked
on its first attempt — everything model-driven took three.
⚠️ `PROJECTS_TOKEN` appears only in `close-merged-work.sh` and `set-issue-in-progress.sh`, both scripted steps. Step env is per-step, so a model step in the same job cannot read it. It is a long-lived
classic PAT (`project` + `read:org`) covering every project the maintainer owns, secret
masking covers logs only, and a role holding `Bash(gh:*)` could publish it in a comment.

**Labels are a record, not a route.** Each role stamps its own as it starts, so the labels
read as "these agents have been here". The maintainer clears them as a check-off.

- `stamp-role-label.sh` stamps the issue or PR that **triggered** the run.
- A role that **opens** a PR labels it itself (`gh pr create --label "@claude/<role>"`) — the
  triggering stamp cannot reach a PR that did not exist yet.
- ⚠️ Two carve-outs from "create things unlabeled": a role's PR is labelled by
  `finish-pr.sh`, and Security labels the issues it files. Nothing else, and never
  someone else's.
- ⚠️ `Closes #<issue>` stays a prompt instruction *and* a hook. The model writing it puts
  the link where a human reads it; the hook is the net, because a missing keyword loses the
  close and the board move with nothing to signal it.

**Documentation belongs to the Writer.** Implementor and Tester change no `CLAUDE.md`. They
optionally end their handoff with a fenced `json` block of **docs candidates** —
`{"docsCandidates": [{"file", "note", "why"}]}` — and the Writer decides what earns a place.

- ⚠️ A candidate is a proposal, not an order. The files only stay useful if the Writer says
  no to what restates the diff or goes stale within a release.
- ⚠️ Omit the block when nothing cost you time. A dutiful list trains the Writer to skim.
- `why` is the field that decides it — a note without a real cost behind it usually isn't one.
- This exists because `CLAUDE.md` was the biggest single source of merge conflicts: every
  role edited it, so parallel branches collided on prose neither was really working on.

**Testing belongs to the Tester.** The Implementor writes no e2e specs and leaves
**Testing notes** instead. An engineer finishing a feature writes the test that passes; this repo's
actual failure mode — a save that throws inside a fire-and-forget call while lint, tsc and
build stay green — is only caught by a test written to distrust the change.

**One epic → one branch → one PR to `mainline`.**

- Manager cuts `<issue#>-<kebab-summary>` off `mainline`, empty, and records it in the epic.
- Researcher stamps it onto every sub-issue as a *Base branch* line naming the epic.
- Each Implementor branches off it and PRs into it.
- Whichever Implementor first finds no integration PR opens it, so it fills up as sub-issues
  merge instead of appearing whole at the end.

⚠️ A *Base branch* governs two things and naming only the PR's base is the trap. The runner
checks out `mainline`, so `gh pr create --base <epic>` without `git checkout -B <branch>
origin/<epic>` yields a PR that looks right but was cut from `mainline` — its diff then
carries every mainline change since, other epics' features included. Seen on PR #330.
⚠️ The first integration PR needs an `--allow-empty` marker commit; the branch is identical
to `mainline` and GitHub refuses a PR with no commits between.
⚠️ Only housekeeping may be pushed straight to an integration branch — that marker, and
merging `mainline` in. Feature work lands by merging sub-issue PRs.
⚠️ `pull_request` events run the workflow from the PR's **base** branch, so workflow fixes do
not reach in-flight epics until `mainline` is merged into them.
⚠️ GitHub ignores closing keywords unless the PR targets the default branch, so a sub-issue
PR's `Closes #N` is inert and `closingIssuesReferences` is empty. The merge hook parses the
keyword out of the body instead. The epic's integration PR must carry **exactly one** closing
keyword — its own — since it does target `mainline`; a sub-PR index written as
`· closes #341` silently attaches that sub-issue to the epic's PR.

**Budgets.** `sonnet` throughout except the Implementor, which runs `opus` — it is the only
role whose output the maintainer must review line by line. Manager 40 turns, Writer 60,
Security 40, the rest 80. Implementor and Tester run `npm ci` as a step; nobody else builds.

⚠️ Keep task checklists to 3–5 outcome-level items. The action narrates each one back to the
PR, so a 10-item list spends most of the budget before any code is written.
⚠️ `trigger_phrase` must match the handle per job. `track_progress: true` forces the action's
own tag mode, which gates on that phrase independently of our `if:` — leave it at the default
`@claude` and the job fires, the action skips in `0s`, and it posts a placeholder comment.
⚠️ Verify on a bot-opened PR waits for a maintainer to click *Approve and run*.

**House rules.** Never push to a deploy branch. May open PRs, push to feature branches and
comment; may not merge, edit `.github/workflows/**` or secrets, or run destructive git. Pass
the gate before proposing a PR. Ask when a change is ambiguous, irreversible or outward-facing.
