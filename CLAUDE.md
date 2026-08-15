# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repo. **These instructions override default behavior.**

This root file holds the **universal** rules. Each package's deep-dive lives in its own `CLAUDE.md`, loaded on demand when you work in that package (see _Packages_).

⚠️ **Read `LOCAL.md` at the repo root if it exists, and keep it current.** It holds facts about *the machine you are on* — which browser the functional suite can actually launch, which runtime versions differ from CI, which tool is broken here and what to use instead. It is **gitignored**, because every line in it would be wrong or misleading elsewhere; this pointer is committed because that is the half that has to survive a fresh session. The dividing rule: *would a contributor on a different laptop need this line?* If yes it belongs in a `CLAUDE.md`, not there. Absent on a fresh clone, which is fine — write one when you learn something the hard way.

## Overview

- **What.** BrewDocs — offline-first homebrewing PWA (brew-day companion + knowledge base). **Proof-of-concept**; breaking changes are expected. Stored data is versioned and carried forward through a dedicated migration framework, not normalized ad hoc — `Entity` carries an optional `version` (missing ⇒ `1`), and a `Migration` up/down pair plus a registry/runner (`packages/app/src/storage/migration/`) apply the chain on read; `batches` is the reference integration today, other domains aren't wired yet. Don't add "ensure"/backfill shims outside that framework — see _Data compatibility_ (`packages/app/CLAUDE.md`).
- **Layout.** npm-workspaces monorepo; packages named `@brewdocs.beer/<name>`.
- **Default branch.** `mainline` — also the target for all PRs and the **sole** deploy branch.
- **Node.** ≥22. ⚠️ Non-interactive shells on this machine resolve `node` to an ancient v10 — if a command fails with syntax errors inside `node_modules`, prefix it: `PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"`.
- **Verify (the gate).** `nx run-many --target=test` (eslint — app + www + design + e2e) + `tsc --noEmit` + `nx run-many --target=build`. ⚠️ nx, not `npm … -ws`: that flag is accepted by CI's npm and **rejected** by the one shipping with Node 22, so the gate was not reproducible locally on a supported Node. No unit-test framework, no runtime tests in that gate — Playwright functional tests (`packages/e2e`) run separately in `.github/workflows/functional-test.yaml`, not in Verify. See _Linting_ (`packages/app/CLAUDE.md`) and _Definition of done_.

| Package | Role |
|---|---|
| `core` | Shared, environment-agnostic types + helpers: `Entity`/`Units`/`Currencies`, React prop/event helpers, `createFetchClient`. |
| `kb` | Knowledge base: raw JSON data → built resource files → HTTP transport adapter (`importResource`) + `Kb*` model types. |
| `design` | React UI primitives (typography, inputs) that emit Tailwind/DaisyUI class strings. |
| `app` | The PWA itself: Vite + React + TanStack Router/Query. Deployed to app.brewdocs.beer. |
| `www` | Astro marketing/info site at brewdocs.beer. |
| `e2e` | Playwright functional-test harness (config + specs) driving the app dev server. Not part of Verify — its own `functional-test.yaml` CI workflow. |
| `spec` | The **product specification** — what the app should do, in a brewer's terms. Markdown, **not** an npm workspace; no CI workflow runs for it. The durable source of expected behaviour a story cannot be. |

## Legend

Field labels used throughout (root and package `CLAUDE.md` files). **Omitting** a field means it doesn't apply; **`_None._`** means it applies but is currently empty (audited — nothing to report). ⚠️ marks the easily-broken.

**Purpose** · **Where** · **Surface** (public API) · **How it works** · **Invariants** · **Gotchas** · **Example** · **Commands** / **Env**

Cross-references name the target section in _italics_. A section's deep-dive may live in its package's own `CLAUDE.md` — most app subsystems (_Routing_, _State_, _Styling_, _Linting_, _Model boundary_, …) are in `packages/app/CLAUDE.md`. Paths are repo-relative and clickable.

## Commands

Run from the repo root via nx:

```bash
nx dev app       # app dev server (auto-symlinks kb dist via predev)
nx build app     # tsc --noEmit && vite build → dist/
nx preview app   # serve the production build (needed to test PWA/service worker)
nx test app      # eslint — the verification gate (see Linting)
nx build kb      # rebuild kb dist JSON from data/ (also runs on postinstall)
nx dev www       # astro dev
nx test design   # eslint — the verification gate (see Linting)
nx dev design    # storybook dev -p 6006
nx build design  # storybook build -o dist → the static site the deploy workflow publishes
```

`nx run-many --target=<target>` runs a target across every project that has it — `dev` is the
root `package.json`'s own example of this pattern.

Root `build:<pkg>`/`test:<pkg>` are **CI-only** — each `build-test-deploy.*` workflow calls one by name, so the names have to survive. All eight are now thin wrappers over `nx build <pkg>` / `nx test <pkg>`, so there is one implementation rather than two: the deploy workflows keep working untouched, and a contributor's local path is the `nx` form directly. ⚠️ Deleting them is not free — a rename lands in a **post-merge** deploy, so it is discovered in production rather than on a PR.

- Typecheck app only: `cd packages/app && ../../node_modules/.bin/tsc --noEmit`.
- Lint app only: `nx test app` (⚠️ see _Linting_ — must resolve the app's nested eslint 9, not the root's).

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
- **app** → [`packages/app/CLAUDE.md`](packages/app/CLAUDE.md) — the largest; holds Routing, Breadcrumbs, State, the Kb\*/app _Model boundary_, _Actions_ vs _Live computation_, BatchSchedule, the `useJsonEdit` editing pattern, PanelSwitcher, _Styling_, kb dev/build serving, and _Linting_.
- **www** → [`packages/www/CLAUDE.md`](packages/www/CLAUDE.md)
- **e2e** → [`packages/e2e/CLAUDE.md`](packages/e2e/CLAUDE.md)
- **spec** → [`packages/spec/CLAUDE.md`](packages/spec/CLAUDE.md) (+ [`packages/spec/README.md`](packages/spec/README.md) for humans). ⚠️ Describes **behaviour**, never mechanism — the moment it explains *how*, it duplicates a `CLAUDE.md` and the two drift.

## Deployment

GitHub Actions, path-filtered on push to `mainline` (the sole deploy branch), all delegating to the reusable `matt-whitaker/aws-static-site` workflow (S3 + CloudFront):

- `build-test-deploy.app-prod.yaml` — app dist → app S3 bucket (app.brewdocs.beer).
- `build-test-deploy.app-kb-prod.yaml` — **kb dist deploys independently** to a dedicated kb bucket behind the app's CloudFront distribution (invalidates `/kb`). This is why `importResource` fetches the relative `/kb/*` — same origin in prod, symlink in dev, and kb data updates ship without an app rebuild.
- `build-test-deploy.www-prod.yaml` — www dist → www bucket (brewdocs.beer).

The **Verify** workflow (`.github/workflows/verify.yaml`) runs `npm ci`, then `nx run-many --target=test` (lint) and `nx run-many --target=build` across **every project**, on every PR **whatever its base** (no deploy) — the real pre-merge gate; the `build-test-deploy.*` workflows run only *post*-merge on push.

**Functional tests.** `.github/workflows/functional-test.yaml` runs the Playwright suite (`packages/e2e`) on PRs **to `mainline` only**, independently of Verify — it installs the chromium browser and lets Playwright's `webServer` auto-start the app dev server, uploading the HTML report/traces as an artifact on failure. See `packages/e2e/CLAUDE.md`.

⚠️ **The two differ on purpose, and the axis is base branch.** `pull_request.branches` matches the PR's **base**, so scoping it to `mainline` would exclude any PR that is not aimed there. Verify carries no filter because it is the cheap half; functional test keeps the `mainline` scope because it is the expensive half (browser install, a real dev server) and the story PR is the right granularity for it. ⚠️ **Since tasks no longer open PRs, neither workflow runs on a task at all** — both first fire on the story's PR, with every task's diff accumulated. That is a known cost of removing task PRs (#1057), not an oversight: a `push:` trigger on Verify would restore per-task feedback and was declined.

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
  - **Verification** — `nx run-many --target=test` (lint) ✓, `tsc --noEmit` ✓, `nx build app` ✓, and which screens/flows were checked in the browser.
  - **Screenshots** — for any UI change.
- **Merge.** Squash only. **The maintainer merges** — contributors and the `@claude` bot open PRs, never merge them. No auto-merge.
- Protect `mainline` to require the **Verify** check green before merge.

### Code style
- ⚠️ **Don't write code comments.** Add one only when the maintainer explicitly asks for it in that task. This covers explanatory blocks, `⚠️` notes, JSDoc, and "why it's like this" asides — the default is **none**.
- Say it in the code instead: a precise name, a smaller function, an explicit type. If a reader would still need the *why*, it belongs in a `CLAUDE.md` — that's where this repo keeps its gotchas, and unlike an inline comment it's discoverable from outside the file and actually gets maintained.
- Deleting a stale or redundant comment is always fine and needs no permission. Adding one does.
- ⚠️ This applies to the `@claude` roles too. Comment-heavy output is a recurring failure mode: the volume buries the few things that matter and goes stale the moment the code moves.

### Definition of done
- The gate is `nx run-many --target=test` (eslint, errors-only) **and** `tsc --noEmit` **and** `nx build app` clean, plus manual browser checks for any UI change. A green lint + typecheck + build is the floor for every change.
- ⚠️ Don't hand-edit generated files (`routeTree.gen.ts`); don't add `lodash` or `../` parent-relative intra-app imports (both lint-enforced — use `@/`).
- ⚠️ Renaming files under `packages/kb/data/**` changes derived ids — a breaking change (see `packages/kb/CLAUDE.md`); call it out in the PR.
- Prefer surfacing follow-ups over silently expanding scope; note orphaned/dead code you leave rather than deleting adjacent things unasked.

### The Claude GitHub roles

Eight roles, one workflow (`.github/workflows/claude-roles.yaml`), so a comment makes one run
with the unselected roles skipping inside it rather than seven skipped runs cluttering the
history.

**Each role's prompt is a file** — `.github/agent-prompts/<role>.md`. Editing a role means
editing its markdown, not hunting a block scalar; the workflow went 1102 lines to 607.

- A local composite action, `./.github/actions/load-prompt`, reads the file into a step
  output; the job passes `prompt: ${{ steps.prompt.outputs.body }}`. It's a shared action
  rather than an inline step per job because six copies of the same loader — comment and
  all — were 15% of the workflow, which is the readability problem this was meant to fix.
- ⚠️ **`prompt_file` is not available to us.** It exists on the inner `base-action`, but the
  composite `anthropics/claude-code-action@v1` exposes only `prompt` and points
  `INPUT_PROMPT_FILE` at its own temp path. Passing a path would send the path as the prompt.
- ⚠️ **`$(cat file)` in `prompt:` does nothing.** `with:` values are inputs, not shell —
  Actions expands `${{ }}` and nothing else, so the literal `$(cat …)` reaches the model.
- ⚠️ **Load before the model step.** A `run:` reads the working tree, and the model checks out
  a feature branch partway through; a branch cut before a prompt landed would not carry it.
  Same trap as the claude-team hooks. The ordering is load-bearing.
- ⚠️ **Random heredoc delimiter.** A fixed `EOF` truncates at any prompt line that is itself
  bare `EOF`, and these prompts carry fenced examples.
- ⚠️ **A prompt file cannot hold `${{ }}`** — it is never evaluated inside a file. Security
  needed the merged PR number, so it arrives as `PR` in the model step's env and the prompt
  says `gh pr diff "$PR"`. The authoring roles get `ISSUE` and `STORY` the same way.
- ⚠️ **Our prompt is not the whole prompt.** `track_progress: true` forces the action's tag
  mode, and `generatePrompt` returns `defaultPrompt + "<custom_instructions>" + ours`. For
  **comment** events that default prompt says, four separate times, that the model's
  instructions are the triggering comment — so a conversational `@claude/architect take
  stock…` became the brief and the role file was demoted to background. The observed result
  was a run that replied *"I'll analyze this and get back to you"* and stopped. Label
  triggers are unaffected: no `<trigger_comment>` block is emitted, and the text becomes
  "read the entire issue body to understand the task".
  - `_shared.md` therefore **opens** by overriding that framing — the trigger is routing,
    the brief is the role file plus the issue — and forbids ending a run on an intention.
  - ⚠️ That is why `load-prompt` composes `_shared.md` **before** `<role>.md`: the override
    has to be the first thing inside `<custom_instructions>`. The code and its own header
    comment disagreed on this order once already.
  - ⚠️ **Agent mode is not the escape hatch.** It would make our prompt authoritative, but
    it sets `claudeCommentId: undefined` — no tracking comment at all, which is the
    maintainer's only window into a run and where handoffs land.

**Routing.** The **`@claude` label** is the front door: applying it to an issue starts a run,
and `delegate.py` reads the issue's state to pick the role. A bare `@claude` in a comment does
the same. A `@claude/<role>` handle in a comment names the role outright and skips the
inspection (rule 1) — still the way to override a bad guess.

- `@claude` **(no handle)** — the root role, reached by naming it in a **comment**. It answers:
  explains why a run did what it did, says which role owns something, and points at what would fix
  a process problem. It writes no code, cuts no branch and starts no role. ⚠️ **The label still
  routes** — the split is that the label does the work and a comment talks about it, which also
  means a bare `@claude` on a PR now answers instead of running an Implementor (#798).
  ⚠️ **It is also reached without being named**, as a step inside `delegate` whenever the router
  had to guess: it reads the issue, returns a role, and the script's default becomes the fallback
  rather than the decision. Its second prompt is `route.md`; the mechanics and the three job shapes
  that do *not* work are in `packages/claude-team/CLAUDE.md`.
- `@claude/architect` — epic or story. Shapes the issue, cuts a story's branch, and creates
  its tasks — each stamped with the role that should pick it up.
- `@claude/researcher` — a **spike**: an issue titled `Spike:` or labelled `spike`, whose answer
  nobody knows yet. Investigates, measures, and appends a recommendation to the issue. Ships no
  code, cuts no branch, creates no tasks. ⚠️ `delegate.py` routes a spike here rather than to the
  Architect, because an Architect handed one decomposes a solution nobody has chosen — that is the
  whole reason the role exists (#659, after #284 sat open with no role that fitted it).
  ⚠️ **The only role that reads the open web**, which is most of its value on a question about
  platform support or cost — and the reason it holds **no shell at all**: no `Bash`, no `Write`,
  no `npm ci`. The host action re-injects `GH_TOKEN` and `CLAUDE_CODE_OAUTH_TOKEN` into the
  agent's environment whatever the workflow declares, so the credential cannot be removed — only
  the ability to read it (#665). A measurement it needs becomes a separate task someone else runs.
- `@claude/implementor` — issue or PR. Writes the code and opens the PR. Owns the
  *consumers* of the design system (`packages/app`, `packages/www`), not the system itself.
- `@claude/designer` — issue or PR. An Implementor whose subject is `packages/design`: the
  primitives, their props and class strings, the stories and the tokens.
  ⚠️ The split is by **package**, not by judgement, so it can be checked rather than
  negotiated. ⚠️ **The Designer does repair the consumers its own change breaks** (#701) — a
  breaking primitive change cannot pass `tsc`/`vite build` otherwise, and it was previously told
  both to stop at the boundary and to hand over a green gate. The licence is mechanical only:
  repair what your change broke, never what was already broken. A consumer needing a *different
  value*, rather than the same value spelled differently, is behavioural and still the
  Implementor's. Implementor and Designer never both run for one task.
- `@claude/tester` — issue or PR. Owns `packages/e2e`.
- `@claude/writer` — issue or PR. Owns every `CLAUDE.md` and `.claude/skills/`.
- `@claude/security` — PR. Runs **automatically on every merge** to `mainline`, and the
  handle asks for the same review *before* merging — the only role with both. It files
  issues labelled `@claude/security`. ⚠️ The one exception to "create issues unlabeled": it
  marks provenance so a finding stands out in a queue.
  ⚠️ `$TRIGGER` tells it which it is, and they end differently: a clean **merge** review
  posts nothing (a routine "no problems found" on every merge is noise), while a clean
  **requested** review always answers — silence is a non-answer to a direct question and
  reads identically to a failed run.
  ⚠️ Its job carries `always()` on top of `needs: delegate`, because `delegate` skips on
  `pull_request` events; without it, adding the handle would have silently removed the
  automatic review.

⚠️ `@claude`, every `@claude/<role>` label, and the classification labels (`epic`, `spike`, `bug`, `story`) must exist in the repo — `@claude` or nothing
triggers, and a missing role label makes the stamp hook warn and skip.

⚠️ **The delegator is its own job and every role carries `needs: delegate`.** A job cannot gate
on a step inside itself. This is not the `needs:` shape reverted below: there, roles needed
`implementor`, which *itself* skipped most runs, and a job needing a skipped job reports
cancelled. `delegate` always runs when the workflow triggers, so dependents reach their own
`if:` and skip cleanly.

⚠️ **The loop guard is the exact label name.** Roles stamp `@claude/<role>`, and every stamp is
another `labeled` event. The delegate job requires `github.event.label.name == '@claude'` —
an exact match — backed by the bot-actor guard. Both hold independently; either alone is one
edit away from an infinite loop rather than a visible failure.

⚠️ **Re-adding `@claude` is the "run again" gesture**, deliberately — `labeled` fires on every
add, so remove-and-re-add re-runs the delegator against current issue state.

⚠️ **A handle is never blocked by the router.** Each role's `if:` is
`always() && (router picked me || the comment names me)`, so an explicit handle still routes if
`delegate.py` fails outright. Only a *skipped* delegate skips the roles.

⚠️ **`trigger_phrase` must be the role's exact handle, `@claude/<role>`.** It does **not** gate
anything for us — `checkContainsTrigger()` returns early on `if (prompt) return true` and we
always pass a prompt. Its only effect is that the action extracts everything *after* the phrase
as "the user request" (`src/utils/extract-user-request.ts`) and yields it as the **final content
block**, which the CLI scans for a slash command. Set to a bare `@claude`, the comment
`@claude/architect do X` extracts as `/architect do X` — dispatched as an unknown slash command,
so the run returns success in ~150ms with `num_turns: 0` having never called the model. Every
comment-triggered role was dead this way between #485 and #488. Label triggers were unaffected:
no comment means no user-request block.

⚠️ **A dead run looks like a working one.** It reports success, raises no error, and leaves the
comment reading *"I'll analyze this and get back to you."* — which is **not a model response**
but `createCommentBody()`, the action's hardcoded placeholder, never updated. Diagnose a
suspicious run by `num_turns` in the log, never by the comment: #487 was built on the assumption
that sentence was the model talking, and fixed something else entirely.

⚠️ The Architect requires `!github.event.issue.pull_request` on its handle arm — `issue_comment`
fires for PRs too, and without the guard a PR comment started a role written for an epic issue.
Excluding a PR is the job `if:`'s job, not routing's: `delegate.py` rule 1 matches an explicit
`@claude/<role>` handle and short-circuits before rule 2's every-PR-to-Implementor default ever
runs, so the router hands `architect`/`researcher` a PR trigger the moment a comment names the
handle. The workflow `if:` guards only the arm reading the comment body directly — the arm
reading `needs.delegate.outputs.roles` carries no such guard, so a PR comment naming the handle
still routes through unguarded (#873).

⚠️ Every run is started by hand — a label or a comment — and the delegator picks the role from
there. No role chains off another. **Tester and Writer briefly chained off the Implementor via
`needs:` and it was reverted** — the job graph left them queued behind every run, and a role
that skips after waiting reports as cancelled, so the history filled with cancelled jobs. If
it is ever retried, the constraint that shaped it still holds: a comment cannot chain the
roles, because GitHub refuses to start a run from an event created with `GITHUB_TOKEN` and the
`if:` guards exclude `github-actions[bot]` besides. `needs:` within the one workflow was the
only route without a new `repo`-scoped PAT in reach of a step — and `needs:` is what produced
the noise. Cost the chain carried, for whoever revisits it: `!cancelled()` in both `if:` blocks
(without it a skipped Implementor skips them, so a hand-typed handle could never run), and
`trigger_phrase: "@claude/"` (tag mode gates on the phrase independently of the `if:`, and a
chained run's comment says `@claude/implementor`).
⚠️ Workflow changes to any of this **cannot be tested before merge**: `issues` and
`issue_comment` both always run the workflow from the default branch, so a PR branch's version
is never the one that fires.

**The mechanics are in the package.** Hooks and the traps each was written around, the
handoff contract, labels-as-record, routing and its loop guard all live in
[`packages/claude-team/CLAUDE.md`](packages/claude-team/CLAUDE.md). ⚠️ Do not restate them
here — two copies drift, and they did: this file documented a sub-issue expansion that #503
had already removed, and the package README described the pre-#503 branching model for a
whole session without anyone noticing.

What is BrewDocs-specific:

- ⚠️ **`PROJECTS_TOKEN` appears in `close-merged-work.py` and `set-issue-status.py`, and
  nowhere else.** It is a long-lived classic PAT needing `project` **and** `read:org` (a
  fine-grained token cannot reach user-owned Projects v2), covering every project the
  maintainer owns. It is safe because it lives in *step* env on a **scripted** step, and step env is
  per-step — the model step beside it cannot read it, whatever tools that model holds. ⚠️ Never
  put it in **job**-level env, and never on a step a model can influence. (An earlier version of
  this line said "never add it to a job whose model step holds `Bash(gh:*)`" — that never
  described the repo, since the authors job's Implementor holds exactly that.)
- The board is **project #4**: `gh project item-add 4 --owner "@me" --url <url>`.
- The handoff schema is
  [`packages/claude-team/schemas/handoff.json`](packages/claude-team/schemas/handoff.json);
  a workflow step compacts and inlines it, and **fails the run** if the file ever gains a
  single quote.
- ⚠️ **`@claude/security` on issues Security files is this repo's one exception to "create
  issues unlabeled"** — it marks provenance so a finding stands out in a queue. Every other
  label is applied by a hook to something a role opened.


**Epic → story → task.** ⚠️ **The model itself lives in
[`packages/claude-team/CLAUDE.md`](packages/claude-team/CLAUDE.md)** — the hierarchy, how a
story moves, routing, the handoff contract and the hooks. It is portable and this file must
not restate it; two copies drift, and they already had. What follows is only how *this repo*
applies it.

- **Default branch** `mainline`. A story's PR targets it and a merge ships to prod, so the
  story PR is the last gate before deploy.
- **Overlays** live in `.github/agent-prompts/` — `_shared.md` plus an optional
  `<role>.md`, appended to the package's prompt of the same name.
- **Board.** Issues and PRs go on project #4 (`gh project item-add 4 --owner "@me"`);
  `set-issue-status.py` and `close-merged-work.py` move them, and are the only steps holding
  `PROJECTS_TOKEN`.
- **The front door is the `@claude` label.** ⚠️ It and every `@claude/<role>` label must
  exist in the repo — the front door triggers nothing if absent, and a missing role label
  makes the stamp hook warn and skip.

⚠️ Workflow changes to any of this **cannot be tested before merge**: `issues` and
`issue_comment` both run the workflow from the default branch, so a PR branch's version is
never the one that fires. Diagnose a suspicious run by `num_turns` in its log — a dead run
reports success and leaves the action's placeholder comment behind, which reads exactly like
a real reply.

**Budgets.** `sonnet` throughout except the Implementor, which runs `opus` — it is the only
role whose output the maintainer must review line by line. Architect 100 turns,
Security 40, the rest 80. Implementor, Designer, Tester **and Writer** run `npm ci` as a step; the
Architect, Researcher and root role build nothing — the Researcher deliberately so, since it holds
no shell to run anything with.

⚠️ **The Writer is on that list for a reason that reads backwards.** Its normal job is written from
intent *before* any implementation exists, which argues it should need nothing. The #579 backfill
stories are the exception: they specify screens that already ship, so the only honest source is the
running app. ⚠️ It therefore also needs `npx playwright install`, which is a **separate** step —
`npm ci` installs the playwright package, never a browser binary, and under `CI` the e2e config
selects the bundled chromium rather than the system Chrome (see `packages/e2e/CLAUDE.md`). Missing
that step, a Writer reaches a running dev server and dies on a missing executable, which reads as
"cannot verify" rather than as a failure. Cost, accepted: every Writer run pays a chromium download,
and most never open a browser — nothing can tell in advance which will (#749, #1012).

**Allowlists union, they don't replace.** A role's `claude_args --allowedTools` is merged with
the action's own base set, not substituted for it — `mergedAllowedTools = [...new Set([...
extraArgsAllowedTools, ...directAllowedTools])]` in `anthropics/claude-code-action`,
`base-action/src/parse-sdk-options.ts`. So every role also has the base grant:

```
Glob, Grep, LS, Read, mcp__github_comment__update_claude_comment,
Bash(git add:*), Bash(git commit:*), Bash(git rm:*), Bash(git-push.sh:*)
```

- This is why `implementor` and `tester` still read files despite neither listing `Read`.
- What is granted is the union of the two lists and **nothing else** — every other binary
  (`python3`, `node`, `mkdir`, `mv`, `cp`, `cat`, `chmod`, `sed`) is denied, as is any
  `&&`-chained command. That is the usual source of a run's permission denials.
- ⚠️ Denials cost turns. A Tester run hit its 80-turn cap with 11 of them and produced no PR;
  a Security run spent 8 of 13. ⚠️ **The usual cause is the prompt, not the allowlist** —
  everything that review needed was already permitted, and it burned the budget
  rediscovering that. Telling a role what it has (`Read` not `cat`, `Grep` not shell `grep`,
  one command per Bash call, a denial is settled) took it to 4 of 16 without widening
  anything.
- ⚠️ **Security is allowlisted by SUBCOMMAND, not by family** (#492), and it is the one role
  where that matters: it reads unmerged diffs, so its input is authored by whoever wrote the
  change it is judging. `Bash(gh:*)` plus `pull-requests: write` would let a successful
  prompt injection run `gh pr review --approve` on the very PR the maintainer asked it to
  distrust. `gh api` is deliberately absent — it reaches every endpoint the token has.
  - The rule the list is built on is **no mutating form**, which is why `git branch` and
    `git remote` are out despite being useful.
  - ⚠️ **Too narrow starves it, and that failure is silent** (#494). Cut to only the
    playbook's own commands, the next run spent 5 of 6 turns denied and reported nothing —
    and a clean merge review posts nothing, so "found nothing" and "could do nothing" are
    indistinguishable from outside. The read-only orientation commands a review opens with
    (`git status`, `git rev-parse`, `gh pr list`, `gh issue list`) are as load-bearing as
    the ones that do the work.
  - ⚠️ Judge a denial count as a **rate over a whole run**, and distrust it when the run is
    short: across three runs the absolute counts moved 8 → 4 → 5 while the rates read
    62% → 25% → 83%.
- ⚠️ **An allowlist has a floor no role can go below.** `Bash(git add|commit|rm:*)` and
  `git-push.sh` union in from the action's base set and cannot be removed. What stops
  Security pushing is `contents: read`, not its allowlist.
- ⚠️ Widen a role's list only against a denial you have actually seen. The transcript that
  would show them is not retained (issue #431, parked), so until it is, a denial is a guess.

⚠️ Keep task checklists to 3–5 outcome-level items. The action narrates each one back to the
PR, so a 10-item list spends most of the budget before any code is written.
⚠️ `trigger_phrase` must match the handle per job — for the five comment-triggered roles. Security has none and needs none: it fires on `pull_request: closed`, not on a phrase. `track_progress: true` forces the action's
own tag mode, which gates on that phrase independently of our `if:` — leave it at the default
`@claude` and the job fires, the action skips in `0s`, and it posts a placeholder comment.
⚠️ **An approval prompt tells you a run failed to open its own PR.** Workflows on a PR opened
with `GITHUB_TOKEN` wait for a maintainer's *Approve and run* — GitHub's guard against
workflows triggering workflows. That is **not** "bot-opened PRs": a PR the model opens carries
the `claude[bot]` identity and runs unattended (#564). Only a **hook** opens a PR as
`github-actions[bot]`, and the only hook that opens one is `finish-pr.py`'s stranded-commit
recovery — so the click means an authoring run committed and stopped without a PR, and the
hook rescued it (#566). Read it as a diagnostic, not as friction. ⚠️ The fingerprint on a past
run is `actor` a bot with `triggering_actor` the maintainer; the click reattributes the trigger.

**Agent transcripts.** Every model step already writes its full turn-by-turn to
`claude-execution-output.json`; `.github/actions/capture-transcript` gzips it to
`s3://brewdocs-logs/transcripts/<role>/<entity>/<run_id>-<attempt>.json.gz`.

- ⚠️ **Controlled at runtime by the `AGENT_TRANSCRIPTS` repository variable** (Settings → Secrets
  and variables → Actions → *Variables*) — no commit, no deploy. Unset or empty means **off**, so
  it is inert until someone opts in. Values are `all`, or a comma list of
  `architect,claude,researcher,authors,security,route`.
- ⚠️ **`contains()` is substring matching**, so a role name that is a substring of another would
  silently over-match. The current names are all distinct; adding one called `test` would collide
  with `tester`.
- ⚠️ **`route` is the routing interception, not the conversational root role** — a different prompt
  (`route.md` vs `claude.md`) and a different contract, so they capture separately. It was the last
  model step here shipping nothing, and that is exactly how #807 stayed inert for days: green
  steps, a posted routing notice and a plausible role, with no record of what the model actually
  answered. ⚠️ **A decision with no record is worse than a channel with no reader** — there is
  nothing to go back and read. This is why `delegate` carries `id-token: write`.
- **AWS:** bucket `brewdocs-logs`, prefix `transcripts/` (lifecycle-expired at 30 days), region
  `us-west-2`. Auth is **OIDC** — `AWS_TRANSCRIPTS_ROLE` may only `s3:PutObject` to that prefix:
  no read, no list, no delete. ⚠️ **Never point this at the deploy credentials**
  (`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/`AWS_ROLE_TO_ASSUME`), which can write the site
  buckets and invalidate CloudFront.
- ⚠️ **It cannot fail a run** — `continue-on-error` plus `always()`, so a failed run still yields
  its transcript, which is exactly when one is wanted.
- ⚠️ **It also NAMES an upstream failure, and that half is deliberately not gated.** The execution
  file carries `api_error_status` and `terminal_reason`; without reading them, a 529 surfaces only
  as the host action's own *"--json-schema was provided but Claude did not return
  structured_output"*, which sends the reader at the schema, the prompt and the allowlist — none of
  which are involved. Measured on run `31777199643`: ten `api_retry` events, `api_error_status: 529`
  and `input_tokens: 0, output_tokens: 0`, i.e. the model never ran. ⚠️ Ungated because
  `AGENT_TRANSCRIPTS` is **off by default**, and an error report that appears only when capture
  happens to be enabled is the channel-with-no-reader failure this repo keeps rediscovering.
  ⚠️ It is written in **Python rather than jq** — the surrounding workflow uses jq, but a jq filter
  can only be checked by running jq, which the runner has and a laptop usually does not, and this
  is the one step that has to be right on the run where everything else broke.
- ⚠️ **`id-token: write` on `claude`, `researcher` and `delegate` is for this and nothing else.**
  All three pass `github_token`, so the OIDC path for *GitHub* auth stays short-circuited, and the
  agent cannot use the permission: the action deletes `ACTIONS_ID_TOKEN_REQUEST_*` from the
  environment it hands the model.

**House rules.** Never push to a deploy branch. May open PRs, push to feature branches and
comment; may not merge, edit `.github/workflows/**` or secrets, or run destructive git. Pass
the gate before proposing a PR. Ask when a change is ambiguous, irreversible or outward-facing.
