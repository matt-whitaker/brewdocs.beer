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

### The Claude GitHub roles (Manager / Researcher / Implementor)
- **One workflow, `.github/workflows/claude-roles.yaml`, with three role jobs**, each narrowly triggered. The old single do-everything `claude.yaml` is **retired & disabled** — kept for reference but subscribes to nothing but `workflow_dispatch`, and its job `if:` matches no dispatch context, so it never runs. The roles:
  - **`manager` job** — trigger: the **`@claude/manager`** label on an issue. The least-active role: turns a rough, loosely-defined epic into a filled-out one (Goal / Proposal / Constraints / Research path / Codebase map) by editing the issue body + a summary comment. No code, no sub-issues, no PR. `sonnet`, 40 turns, `contents: read` + `issues: write`, no `npm ci`.
  - **`researcher` job** — trigger: the **`@claude/researcher`** label on an issue. The product owner: follows a well-defined epic's Research path, then creates **unlabeled** sub-issues (self-contained, `claude-task.yml` headings), links each as a **native sub-issue** of the epic, and posts one index comment. No code, no PR. `sonnet`, 80 turns, `contents: read` + `issues: write`, no `npm ci`.
  - **`implementor` job** — triggers (a combination): the **`@claude/implementor`** label on an issue (fresh execution) **or** an `@claude` mention on an issue comment, PR comment, or PR review (follow-up: bug fixes, requested changes, merge conflicts). The main engineer: reads the issue + its comments (or, on a PR, the description + current comments + any Handoff block) for context, then changes code and opens a PR against `mainline`. `sonnet`, 80 turns, write access to contents/PRs/issues (+ `actions: read` for a red **Verify**), and the only job that runs `npm ci`.
  - ⚠️ **Why one workflow, not three files.** GitHub has **no label filter on `on.issues`** (only `types`), so a run is always created and the role must be selected by a job-level `if:`. As three files, applying one label created **three runs — one real, two skipped** — cluttering the Actions history. As one file it's a **single run per event**, with the unselected roles skipping *inside* it. A dynamic `run-name` ("Claude · Researcher #251") keeps that single row self-describing.
  - ⚠️ The three trigger labels — **`@claude/manager`**, **`@claude/researcher`**, **`@claude/implementor`** — must exist in the repo for the label triggers to fire. (The old `claude` label no longer triggers anything.)
- ⚠️ **Keep the task checklist coarse — 3–5 outcome-level items** ("Add the version field to the models", not one line per file). The action narrates every checklist item back to the PR, so each item costs a turn; a 10-item list spends most of the budget before any code is written. This is the single biggest budget consumer.
- **Deps are pre-installed (Implementor); it builds before opening the PR.** The **Implementor** runs `npm ci` as its own step (zero turns) — its prompt tells it *not* to run `npm ci`/`install`, but to run `npm run build` once before opening the PR. (An earlier config with no `npm ci` step made it chase a phantom TS-version error for eleven turns; that's also why the prompt says a denied tool call is settled — don't re-quote and retry — and hands it the `$`-in-filename escape directly.) **Manager** and **Researcher** don't build, so they skip `npm ci`.
- **It writes back to the issue.** For label-triggered work it posts a short summary comment with the PR link, on top of the `track_progress` comment.
- ⚠️ **Verify on a bot-opened PR waits for approval.** A PR opened with `GITHUB_TOKEN` creates `pull_request` runs that require a maintainer to click *Approve and run* — the check isn't broken, it's held.
- **Issues are label-triggered per role, not mention-triggered.** `issues: [opened]` is deliberately not subscribed (a job-level `if:` can't stop a run from being *created*, so it'd grey-out a skipped run per new issue). The workflow subscribes to `issues: [labeled]` once, and each role job gates on its own label (`@claude/manager`/`@claude/researcher`/`@claude/implementor`) via `label_trigger` + the job `if:` — so creating an issue produces no run; only applying a role label fires one. Only the **implementor** job also matches the `@claude` comment/review events (for follow-ups); manager and researcher are label-only. One `concurrency` group (`claude-<issue/PR number>`) now serializes **all** roles per issue/PR — queued, not cancelled, since killing a run midway can leave a half-pushed branch and no PR.
- **House rules.** Never push to a deploy branch — open a PR. May open PRs, push to feature branches, comment; may **not** merge its own PR, edit `.github/workflows/**` or secrets, or run destructive git. Pass the gate before proposing a PR. Proceed on clearly-scoped tasks; ask when a change is ambiguous, irreversible, or outward-facing.
