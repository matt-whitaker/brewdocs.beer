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

### The Claude GitHub roles (Manager / Researcher / Implementor / Tester / Owner)
- **One workflow, `.github/workflows/claude-roles.yaml`, with five role jobs**, each narrowly triggered. The old single do-everything `claude.yaml` is **retired & disabled** — kept for reference but subscribes to nothing but `workflow_dispatch`, and its job `if:` matches no dispatch context, so it never runs.
- ⚠️ **The handle in the comment routes. Labels do not.** You start a role by naming it — `@claude/manager`, `@claude/researcher`, `@claude/implementor`, `@claude/tester`, `@claude/owner`. A **bare `@claude` does nothing at all**, deliberately: a half-typed handle can never start the wrong agent. `on.issues` is still not subscribed, so labels trigger nothing either.
- ⚠️ **`trigger_phrase` must match the handle, per job.** `track_progress: true` forces the action's own **tag mode**, which gates on `trigger_phrase` (default `@claude`) *independently of our `if:`*. `@claude/implementor` is not a match for `@claude`, so the job fired, the action skipped itself in `0s`, and it posted a placeholder *"I'll analyze this and get back to you"* — twice. Each tag-mode role therefore sets `trigger_phrase` to its own handle. ⚠️ The **Owner sets no `track_progress`**, deliberately: it must run after a comment naming *another* role, and after a merged PR with no comment at all, so a single trigger phrase can't express it. Without `track_progress` the action runs the prompt directly (agent mode) and our `if:` is the only gate.
- ⚠️ **Labels are now a record of what has run**, not a route. Each role stamps its own `@claude/<role>` label on the issue or PR as it starts (`gh api repos/{owner}/{repo}/issues/<n>/labels`, which works for PRs too), so the labels read as "these agents have been here". The maintainer clears them as a check-off. A role adds **only its own** and never removes any; only the **Owner** prunes, and only when asked. All five labels must exist in the repo.
  - **`manager` job** — shapes a rough epic into a filled-out one (Goal / Proposal / Constraints / Research path / Codebase map / **Integration branch**) by editing the issue body + a summary comment, **and cuts the epic's integration branch** (`<issue#>-<kebab-summary>`, empty, off `mainline`). No code, no sub-issues, no PR. `sonnet`, 40 turns, `issues: write` + `contents: write` — ⚠️ write *only* to push that empty branch; its prompt forbids committing to it.
  - **`researcher` job** — the product owner: follows a well-defined epic's Research path, then creates **unlabeled** sub-issues (self-contained, `claude-task.yml` headings) and posts one index comment. ⚠️ It **propagates the epic's integration branch into every sub-issue** as a *Base branch* line naming the epic number. ⚠️ It does **not** link, parent or milestone anything — that is the Owner's, and its **index comment is the handoff**, so each sub-issue must appear there as `#<number> — <title>` or the Owner can't file it. `sonnet`, 80 turns, no `npm ci`.
  - **`implementor` job** — the main engineer. Reads the issue + comments (or, on a PR, the description + comments + any Handoff), then changes code and opens a PR — ⚠️ **cut from** the issue's stated *Base branch*, not merely aimed at it (see below), else `mainline`. It also opens the epic's integration PR the first time it finds one missing. ⚠️ It writes **no e2e tests** (the Tester's) and does **no backlog management** beyond putting `Closes #<issue>` in the PR body — that line is the Owner's input. **`opus`**, 80 turns, write access to contents/PRs/issues (+ `actions: read` for a red **Verify**). ⚠️ It is the only role on `opus` — it is the one that writes code the maintainer has to review, and the failure mode the other roles have (a wasted run) is cheaper than the one it has (a plausible-looking wrong change). The others stay on `sonnet`.
  - **`tester` job** — owns `packages/e2e`: turns an Implementor's *Testing notes* into Playwright specs, **runs them**, and opens a PR. Split from the Implementor because the two pull in opposite directions — an engineer finishing a feature writes the test that passes, and this repo's actual failure mode (a save that throws inside a fire-and-forget call while lint/tsc/build stay green) is only caught by a test written to distrust the change. ⚠️ It stays inside `packages/e2e`; a failing test is a *report*, not licence to edit `packages/app` (sole exception: adding a missing `aria-label` via a design component's `label` prop). `sonnet`, 80 turns; runs `npm ci` **and** `npx playwright install --with-deps chromium` as workflow steps so it can run what it writes.
  - **`owner` job** — the backlog agent, and the only role that is **additive**. It runs when summoned with `@claude/owner`, **and automatically after** whichever role a comment started (`needs:` + `always()`), **and** after a merged PR. It owns everything about how work is *filed*: parenting sub-issues to their epic, propagating the epic's milestone, linking a PR to the issue it finishes, keeping project #4 honest, and pruning role labels on request. It writes no code and merges nothing. `sonnet`, 40 turns, `Read` + `Bash(gh:*)` only.
- ⚠️ **Why the Owner runs last, not alongside.** Its whole job is to file work that already exists — link the PR the Implementor *just* opened, parent the sub-issues the Researcher *just* created. Running it in parallel would race work that isn't there yet. It is also not a blanket trigger: no role ran and nothing merged means no Owner.
- ⚠️ **The Owner's deterministic half stays a script.** "Parse the closing keyword, close the issue, set one field" is fully determined, so it runs as its own step *before* Claude starts; the model handles only judgment work (parenting, milestones, reconciling, pruning). That step needs a **`PROJECTS_TOKEN`** secret — a **classic** PAT with the **`project` *and* `read:org`** scopes. Fine-grained tokens cannot reach *user-owned* Projects v2 at all (project #4 is user-owned), and ⚠️ `gh project` demands `read:org` even for a user-owned project — a **second gate**, separate from the owner-type probe that `--owner "@me"` handles. Its raw error (*"missing required scopes [read:org read:discussion]"*) names neither the secret nor the command, so the step preflights project access and warns rather than failing a merged PR. (`read:discussion` is listed by `gh` but not actually needed — `project` + `read:org` is enough.) It uses **two tokens**: the built-in `GITHUB_TOKEN` (`issues: write`) reads the PR and closes issues, `PROJECTS_TOKEN` touches only the board — so that PAT needs `project` and nothing else. ⚠️ Project commands must pass `--owner "@me"`; the literal login makes `gh project` probe user-vs-org, which needs `read:org` and fails with a bare *"unknown owner type"*.
- ⚠️ **GitHub ignores closing keywords unless the PR targets the default branch.** Every sub-issue PR targets an epic branch instead, so its `Closes #N` is inert and `closingIssuesReferences` comes back empty. The Owner falls back to parsing the keyword out of the PR body — that is the only reason sub-issues get closed or filed at all.
- ⚠️ **Manager and Researcher are issue-only.** Both work on an epic *issue*, so their `if:` requires `!github.event.issue.pull_request` — `issue_comment` fires for pull requests too, and the payload puts the PR in `github.event.issue`. Naming them on a PR does nothing.
- ⚠️ **Why one workflow, not five files.** The role is chosen by a job-level `if:`, so as separate files every comment would create one real run and four skipped ones, cluttering the Actions history. As one file it is a **single run per comment**, with the unselected roles skipping *inside* it, and a dynamic `run-name` keeps that row self-describing.
- **One epic → one branch → one PR to `mainline`.** The Manager cuts `<issue#>-<kebab-summary>` off `mainline` and records it in the epic; the Researcher stamps it onto every sub-issue as a *Base branch* line naming the epic; each Implementor branches off it and PRs **into** it. **Whichever Implementor first finds no integration PR opens it** (branch → `mainline`, `Closes #<epic>`), so it exists from the start and fills up as sub-issues merge.
  - ⚠️ **A *Base branch* governs two things, and only naming the PR's base is the trap.** The workflow checks the runner out on **`mainline`**, so an Implementor that runs `gh pr create --base <epic-branch>` without first `git checkout -B <branch> origin/<epic-branch>` produces a PR that looks correct but whose branch was cut from `mainline` — the diff then carries every mainline change since the epic branch was cut, other epics' features included. Seen live: PR #330's parent commit was mainline's #313 merge, and its 12-file diff hauled in the whole recipe/batch delete feature. The prompt spells out the fetch/checkout and makes the Implementor verify `git log origin/<base>..HEAD` shows only its own commits.
  - ⚠️ **The first integration PR needs a marker commit.** The Manager cuts the branch empty, so at the first Implementor's run it is identical to `mainline` and GitHub refuses the PR with *"No commits between mainline and \<branch\>"*. The Implementor pushes a single `--allow-empty` commit and retries.
  - ⚠️ **What may be pushed straight to an integration branch** is housekeeping only: that empty marker, and merging `mainline` in to keep the branch current. **Feature work never** goes there directly; it lands by merging sub-issue PRs, which is the review the branch exists to collect.
  - ⚠️ **A side benefit: e2e coverage starts on day one.** `functional-test.yaml` only runs on PRs **to `mainline`**, so sub-issue PRs into an epic branch never run Playwright. With the integration PR open from the start, the suite runs against the accumulating feature the whole way through.
  - ⚠️ **`pull_request` events run the workflow from the PR's *base* branch.** A sub-PR merging into an epic branch therefore runs whatever version of this file that branch was cut with — so workflow fixes don't reach in-flight epics until `mainline` is merged into them.
- ⚠️ **Keep the task checklist coarse — 3–5 outcome-level items** ("Add the version field to the models", not one line per file). The action narrates every checklist item back to the PR, so each item costs a turn; a 10-item list spends most of the budget before any code is written. This is the single biggest budget consumer.
- **Deps are pre-installed (Implementor and Tester); the Implementor builds before opening the PR.** Their prompts tell them *not* to run `npm ci`/`install`. (An earlier config with no `npm ci` step made the Implementor chase a phantom TS-version error for eleven turns; that's also why the prompt says a denied tool call is settled — don't re-quote and retry — and hands it the `$`-in-filename escape directly.) Manager, Researcher and Owner don't build, so they skip `npm ci`.
- ⚠️ **Verify on a bot-opened PR waits for approval.** A PR opened with `GITHUB_TOKEN` creates `pull_request` runs that require a maintainer to click *Approve and run* — the check isn't broken, it's held.
- ⚠️ **The actor guard** (`github.actor != 'claude[bot]' && != 'github-actions[bot]'`) stops the `track_progress` comment from re-triggering the workflow.
- **House rules.** Never push to a deploy branch — open a PR. May open PRs, push to feature branches, comment; may **not** merge its own PR, edit `.github/workflows/**` or secrets, or run destructive git. Pass the gate before proposing a PR. Proceed on clearly-scoped tasks; ask when a change is ambiguous, irreversible, or outward-facing.
