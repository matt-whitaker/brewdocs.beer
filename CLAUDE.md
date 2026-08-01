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

### The Claude GitHub roles (Manager / Researcher / Implementor / Tester)
- **One workflow, `.github/workflows/claude-roles.yaml`, with four role jobs**, each narrowly triggered. The old single do-everything `claude.yaml` is **retired & disabled** — kept for reference but subscribes to nothing but `workflow_dispatch`, and its job `if:` matches no dispatch context, so it never runs. The roles:
  - **`manager` job** — owns issues labelled **`@claude/manager`**. The least-active role: turns a rough, loosely-defined epic into a filled-out one (Goal / Proposal / Constraints / Research path / Codebase map / **Integration branch**) by editing the issue body + a summary comment, **and cuts the epic's integration branch** (`<issue#>-<kebab-summary>`, empty, off `mainline`). No code, no sub-issues, no PR. `sonnet`, 40 turns, `issues: write` + `contents: write` — ⚠️ write *only* to push that empty branch; its prompt forbids committing to it. It also owns a second, **model-free** job (`manager_pr_merged`) — see _Merge housekeeping_ below.
  - **`researcher` job** — owns issues labelled **`@claude/researcher`**. The product owner: follows a well-defined epic's Research path, then creates **unlabeled** sub-issues (self-contained, `claude-task.yml` headings), links each as a **native sub-issue** of the epic, and posts one index comment. ⚠️ It **propagates the epic's integration branch into every sub-issue** as a *Base branch* line **naming the epic number** — the Implementor needs that number to open the integration PR. It no longer asks any sub-issue to open that PR (the Implementor does it on first run). ⚠️ It also puts every sub-issue on the **epic's milestone** (read from the epic, never invented — if the epic has none, neither do its children), so release scope stays whole. No code, no PR. `sonnet`, 80 turns, `contents: read` + `issues: write`, no `npm ci`.
  - **`implementor` job** — owns PRs, issues labelled **`@claude/implementor`**, and any issue with no role label. Handles fresh execution and follow-ups alike (bug fixes, requested changes, merge conflicts). The main engineer: reads the issue + its comments (or, on a PR, the description + current comments + any Handoff block) for context, then changes code and opens a PR — ⚠️ against the issue's stated **Base branch** when it names one (sub-issues land on the epic branch), else `mainline`. It also **opens the epic's integration PR the first time it finds one missing** (see _One epic → one branch → one PR_). ⚠️ It **writes no e2e tests** — `packages/e2e` is the Tester's, and the Implementor instead ends its Handoff with a **Testing notes** section the Tester works from. `sonnet`, 80 turns, write access to contents/PRs/issues (+ `actions: read` for a red **Verify**).
  - **`tester` job** — owns issues **and PRs** labelled **`@claude/tester`**. Owns `packages/e2e`: turns an Implementor's *Testing notes* into Playwright specs, **runs them**, and opens a PR. Split from the Implementor because the two pull in opposite directions — an engineer finishing a feature writes the test that passes, and this repo's actual failure mode (a save that throws inside a fire-and-forget call while lint/tsc/build stay green) is only caught by a test written to distrust the change. ⚠️ It stays inside `packages/e2e`: a failing test is a *report*, not licence to edit `packages/app` (sole exception: adding a missing `aria-label` via a design component's existing `label` prop). `sonnet`, 80 turns; runs `npm ci` **and** `npx playwright install --with-deps chromium` as workflow steps, so it can actually run what it writes.
  - ⚠️ **Why one workflow, not four files.** The role is chosen by a job-level `if:`, so as separate files every comment would create **one real run and three skipped ones**, cluttering the Actions history. As one file it's a **single run per comment**, with the unselected roles skipping *inside* it. A dynamic `run-name` ("Claude · Researcher #251") keeps that single row self-describing.
  - ⚠️ The four role labels — **`@claude/manager`**, **`@claude/researcher`**, **`@claude/implementor`**, **`@claude/tester`** — must exist in the repo for routing to work. (The old `claude` label means nothing now.)
  - ⚠️ **Manager and Researcher are issue-only.** Both work on an *epic issue*, so their `if:` requires `!github.event.issue.pull_request` — `issue_comment` fires for pull requests too, and without that guard a PR labelled `@claude/manager` routed to the Manager, which then tried to rewrite the PR description into an epic and cut a branch. On a PR those two labels mean nothing and the comment goes to the **Implementor**, which also matches what a *review* comment on the same PR has always done.
  - ⚠️ **`@claude/tester` is the one label that also routes PRs.** `issue_comment` fires for pull requests too (the PR arrives as `github.event.issue`), so labelling a **PR** `@claude/tester` sends its follow-up comments to the Tester instead of the Implementor — which is what you want on a PR that is only test changes. Every other PR comment still goes to the Implementor.
  - **One epic → one branch → one PR to `mainline`.** The Manager cuts `<issue#>-<kebab-summary>` off `mainline` and records it in the epic; the Researcher stamps it onto every sub-issue as a *Base branch* line naming the epic; each Implementor branches off it and PRs **into** it. **Whichever Implementor first finds no integration PR opens it** (branch → `mainline`, `Closes #<epic>`), so it exists from the start of the epic and fills up as sub-issues merge — the maintainer reviews the feature as it accumulates instead of meeting it whole at the end. ⚠️ Every link is required — a sub-issue without the *Base branch* line silently targets `mainline` and bypasses the epic branch, since a worker only ever sees its own issue.
  - ⚠️ **A *Base branch* governs two things, and only naming the PR's base is the trap.** The workflow checks the runner out on **`mainline`**, so an Implementor that runs `gh pr create --base <epic-branch>` without first `git checkout -B <branch> origin/<epic-branch>` produces a PR that looks correct but whose branch was cut from `mainline` — the diff then carries every mainline change since the epic branch was cut, other epics' features included. Seen live: PR #330's parent commit was mainline's #313 merge, and its 12-file diff hauled in the whole recipe/batch delete feature. The prompt now spells out the fetch/checkout and makes the Implementor verify `git log origin/<base>..HEAD` shows only its own commits before opening the PR.
  - ⚠️ **The first integration PR needs a marker commit.** The Manager cuts the branch empty, so at the first Implementor's run it is identical to `mainline` and GitHub refuses the PR with *"No commits between mainline and \<branch\>"*. The Implementor's prompt handles this by pushing a single `--allow-empty` commit to the branch and retrying. ⚠️ **What may be pushed straight to an integration branch** is housekeeping only: that empty marker, and merging `mainline` in to keep the branch current (routine — it's what un-sticks a stale epic, and the Tester already does it on request). **Feature work never** goes there directly; it lands by merging sub-issue PRs, which is the review the branch exists to collect.
  - ⚠️ **A side benefit: e2e coverage starts on day one.** `functional-test.yaml` only runs on PRs **to `mainline`**, so sub-issue PRs into an epic branch never run Playwright. With the integration PR open from the start, the suite runs against the accumulated feature the whole way through instead of only at the end.
  - **The label says who's in charge; `@claude` continues that conversation.** An issue's `@claude/*` label marks its current owner, and an `@claude` comment routes to **that** role — comment on an issue labelled `@claude/researcher` and the *Researcher* answers, not the Implementor. Hand the issue to a different role by changing the label. An `@claude` comment on a **PR**, or on an issue carrying no role label, goes to the **Implementor** (it owns PR follow-ups). Applying a label always starts a fresh pass; a comment is a follow-up, and the role is told to act on the comment rather than redo its work.
  - ⚠️ Exactly one role claims any given event, because the Implementor's comment branch excludes issues (and PRs) labelled for the Manager, Researcher or Tester. Putting **two** role labels on one issue breaks that and runs both — the label is meant to be singular.
  - **Merge housekeeping (`manager_pr_merged`).** On `pull_request: closed` where the PR merged **and** either carries any `@claude/*` label or was opened by a bot (sub-issue PRs are unlabeled), the issues it closes are **closed** and moved to **Done** on project #4. ⚠️ **GitHub only acts on closing keywords when a PR targets the default branch**, so a sub-issue PR into an epic branch has an inert `Closes #N` and an empty `closingIssuesReferences` — the job falls back to parsing the keyword out of the PR body, which is the only reason sub-issues get closed or filed at all. It uses **two tokens**: the built-in `GITHUB_TOKEN` (`issues: write`) reads the PR and closes issues, and `PROJECTS_TOKEN` touches only the board — so that PAT needs the `project` scope and nothing else. ⚠️ **No model runs** — "find the linked issue, set one field" is a fully determined API call, so it's a dozen lines of `gh` rather than a turn budget that can go wrong. ⚠️ It needs a **`PROJECTS_TOKEN`** secret: the built-in `GITHUB_TOKEN` cannot write to Projects v2 at any permission level, it needs a **classic** PAT with the `project` scope. ⚠️ A *fine-grained* token cannot reach user-owned Projects v2 at all — that permission only exists for organization projects, and project #4 is user-owned. `project` is the only scope required (the repo is public, so reading PR data needs none), but note it is account-wide: it grants read/write on every project you own. ⚠️ The job passes `--owner "@me"` rather than the literal login for exactly this reason — `gh project` otherwise probes whether the owner is a user or an org, which needs `read:org` and fails with a bare *"unknown owner type"*. Without the secret the step logs a warning and exits clean, so a merge never fails over bookkeeping. This is also the **one trigger that isn't an `@claude` comment**.
- ⚠️ **Keep the task checklist coarse — 3–5 outcome-level items** ("Add the version field to the models", not one line per file). The action narrates every checklist item back to the PR, so each item costs a turn; a 10-item list spends most of the budget before any code is written. This is the single biggest budget consumer.
- **Deps are pre-installed (Implementor); it builds before opening the PR.** The **Implementor** runs `npm ci` as its own step (zero turns) — its prompt tells it *not* to run `npm ci`/`install`, but to run `npm run build` once before opening the PR. (An earlier config with no `npm ci` step made it chase a phantom TS-version error for eleven turns; that's also why the prompt says a denied tool call is settled — don't re-quote and retry — and hands it the `$`-in-filename escape directly.) **Manager** and **Researcher** don't build, so they skip `npm ci`.
- **It writes back to the issue.** It posts a short summary comment with the PR link, on top of the `track_progress` comment.
- ⚠️ **Verify on a bot-opened PR waits for approval.** A PR opened with `GITHUB_TOKEN` creates `pull_request` runs that require a maintainer to click *Approve and run* — the check isn't broken, it's held.
- ⚠️ **Labels never trigger a run; comments do.** `on.issues` is deliberately **not subscribed**, so adding or removing a role label produces no workflow run at all — you can re-label freely while deciding. The only triggers are `issue_comment`, `pull_request_review_comment` and `pull_request_review`, and a run needs an **`@claude`** mention in the body. The flow is: **label the issue for the role you want, then comment `@claude` to start it.** Re-running a role is just another comment. The actor guard (`github.actor != 'github-actions[bot]'`) stops the `track_progress` comment from re-triggering the workflow.
- **House rules.** Never push to a deploy branch — open a PR. May open PRs, push to feature branches, comment; may **not** merge its own PR, edit `.github/workflows/**` or secrets, or run destructive git. Pass the gate before proposing a PR. Proceed on clearly-scoped tasks; ask when a change is ambiguous, irreversible, or outward-facing.
