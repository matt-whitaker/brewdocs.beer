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
  says `gh pr diff "$PR"`. Anything else dynamic takes the same route.

**Routing.** The **`@claude` label** is the front door: applying it to an issue starts a run,
and `delegate.sh` reads the issue's state to pick the role. A bare `@claude` in a comment does
the same. A `@claude/<role>` handle in a comment names the role outright and skips the
inspection (rule 1) — still the way to override a bad guess.

- `@claude/architect` — epic or story. Shapes the issue, cuts a story's branch, and creates
  its tasks — each stamped with the role that should pick it up.
- `@claude/implementor` — issue or PR. Writes the code and opens the PR.
- `@claude/tester` — issue or PR. Owns `packages/e2e`.
- `@claude/writer` — issue or PR. Owns every `CLAUDE.md` and `.claude/skills/`.
- **Security** — no handle. Runs on merge to `mainline` and files issues, labelled
  `@claude/security`. ⚠️ The one exception to "create issues unlabeled": it marks
  provenance so a finding stands out in a queue.

⚠️ `@claude` **and** every `@claude/<role>` label must exist in the repo — `@claude` or nothing
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
`delegate.sh` fails outright. Only a *skipped* delegate skips the roles.

⚠️ `trigger_phrase` is `@claude` on every role, not `@claude/<role>`. A label trigger carries no
comment for a per-role phrase to match. It is inert today regardless — `checkContainsTrigger()`
returns early on `if (prompt) return true` and we always pass a prompt (verified at `v1.0.183`)
— but if that short-circuit ever goes, `@claude` still matches the comment path where a
per-role phrase would fail every role at once.

⚠️ The Architect requires `!github.event.issue.pull_request` on its handle arm — `issue_comment`
fires for PRs too, and without the guard a PR comment started a role written for an epic issue.
The router cannot pick it on a PR (rule 2 sends every PR to the Implementor).

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

**Backlog work is scripted, never prompted.** Hooks in `packages/claude-team/hooks/` run around each
model step.

- `stamp-role-label.sh` — pre, every role. Stamps `@claude/<role>` on the issue or PR.
- `file-sub-issues.sh` — post, Architect. Parents stories to their epic and tasks to their
  story, and copies its
  milestone down. **Discovers** them — a bot-authored issue, numbered above the epic, whose
  body references it as `epic #N` or `story #N`. Honours an old `owner-manifest` comment
  too, unioned.
- `acknowledge.sh` — the **delegate** job, first step of every run. Reacts 👀 so a trigger is
  visibly received before any model runs. ⚠️ It reacts via `issues/comments/<id>`, so it is
  handed a `COMMENT_ID` only for `issue_comment` — a review comment's id belongs to the
  *pulls* collection and would react to an unrelated comment. Empty falls back to the issue
  or PR itself.
- `delegate.sh` — the **delegate** job, and the gate every role hangs off. Picks the role(s)
  from issue state and emits them; routing is a shell script, never a model. ⚠️ A missing
  `Role:` stamp defaults to Implementor and says so — wrong is recoverable, silent is not.
- `set-issue-status.sh` — pre, Implementor and Tester. Moves the triggering issue to
  **In Progress** on project #4, so the board reflects reality when work starts rather than
  only when it merges. Skips a closed issue, so a re-run never resurrects finished work.
- `finish-pr.sh` — post, Implementor / Tester / Writer. Labels the PR the run opened with
  its role, and appends `Closes #<issue>` if the model didn't write one.
- `open-story-pr.sh` — post, every authoring role. Opens the story's PR when its branch has
  none and has commits. Reads the branch from the issue's **Branch** line.
- `close-merged-work.sh` — on merge. Closes the PR's issues and files them on the board.

⚠️ These were prompt instructions until a model skipped them. A label trail is worthless if
a run can forget to stamp it, and the merge hook is the only backlog behaviour that worked
on its first attempt — everything model-driven took three.
⚠️ **A scripted hook fed by model-written input is still model-driven.** Sub-issue filing
read a machine-readable manifest the decomposing role was told to leave; across nine epics it
wrote one exactly once, and the hook logged `No owner-manifest — nothing to file` and did
nothing. Moving the instruction from "call the API" to "write a JSON block" only moved
where it got skipped. Derive the input from something the model must produce **for another
reason** — here the **Branch** line, which the story PR already depends on.
⚠️ **A prose marker cannot be the only marker in a repo whose issues quote its own
conventions.** The first version matched a branch line plus `epic #N` and adopted a
meta-issue that quoted the convention verbatim as an example. The author check
(`.user.type == "Bot"`) is what makes it sound — with the consequence, accepted, that a
hand-written sub-issue is never auto-parented.
⚠️ `PROJECTS_TOKEN` appears only in `close-merged-work.sh` and `set-issue-status.sh`, both scripted steps. Step env is per-step, so a model step in the same job cannot read it. It is a long-lived
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

**Epic → story → task.** The team definition lives in
[`packages/claude-team`](packages/claude-team/README.md); this repo extends it with
per-role overlays in `.github/agent-prompts/`.

| level | branch | PR | is |
|---|---|---|---|
| **Epic** | no | **no** | a cross-story product goal; a grouping, nothing more |
| **Story** | **one** | **exactly one** | a sub-issue of an epic — the unit that ships |
| **Task** | no | no | a sub-issue of a story; work that lands on the story's branch |

- Architect cuts the story's branch off `mainline`, empty, and records it in the story as a
  **Branch** line.
- Architect stamps that same line onto every task, plus a **Role** line naming who picks it
  up — routing is a shell script that reads the stamp rather than judging it.
- The **first author to run** — Implementor, Tester or Writer — opens the story's PR, via
  `open-story-pr.sh`. All three carry the hook; whichever runs first wins.
- Every role after that commits to the same branch. **No role cuts its own.**

⚠️ One PR per story, growing, is the point. The maintainer reviews the story landing as a
whole — code, tests and docs — instead of one PR per role.
⚠️ A story PR targets `mainline`, so its `Closes #<story>` works normally. Tasks are closed
by the merge hook parsing the body, not by GitHub.
⚠️ `pull_request` events run the workflow from the PR's **base** branch, so workflow fixes
do not reach an in-flight story until `mainline` is merged into it.
⚠️ An epic has no branch, so nothing to merge in and nothing to keep current. That was the
main cost of the old epic-integration-branch model.


**Budgets.** `sonnet` throughout except the Implementor, which runs `opus` — it is the only
role whose output the maintainer must review line by line. Architect 100 turns, Writer 60,
Security 40, the rest 80. Implementor and Tester run `npm ci` as a step; nobody else builds.

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
- ⚠️ Denials cost turns. A Tester run hit its 80-turn cap with 11 of them and produced no PR.
- ⚠️ Widen a role's list only against a denial you have actually seen. The transcript that
  would show them is not retained (issue #431, parked), so until it is, a denial is a guess.

⚠️ Keep task checklists to 3–5 outcome-level items. The action narrates each one back to the
PR, so a 10-item list spends most of the budget before any code is written.
⚠️ `trigger_phrase` must match the handle per job — for the five comment-triggered roles. Security has none and needs none: it fires on `pull_request: closed`, not on a phrase. `track_progress: true` forces the action's
own tag mode, which gates on that phrase independently of our `if:` — leave it at the default
`@claude` and the job fires, the action skips in `0s`, and it posts a placeholder comment.
⚠️ Verify on a bot-opened PR waits for a maintainer to click *Approve and run*.

**House rules.** Never push to a deploy branch. May open PRs, push to feature branches and
comment; may not merge, edit `.github/workflows/**` or secrets, or run destructive git. Pass
the gate before proposing a PR. Ask when a change is ambiguous, irreversible or outward-facing.
