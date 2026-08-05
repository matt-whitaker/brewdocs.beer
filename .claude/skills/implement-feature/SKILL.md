---
name: implement-feature
description: Take a single well-scoped task end to end: research it, file a tracking issue, cut a branch, implement, and open a PR.
---

Take a single, well-scoped task end to end: research it, file a tracking issue with a short
plan, cut a feature branch **linked to that issue**, implement it, verify the gate, commit, push,
and open a PR that closes the issue — then add both to the BrewDocs project. Stops **before**
merge; the maintainer merges (squash).

The task: $ARGUMENTS

Use this for **one well-understood change that fits in a single PR**. If the work is large,
fuzzy, or needs to be split across multiple PRs, stop and use `plan-feature` (you decompose it)
or `plan-feature-light` (a GitHub agent decomposes it) — don't force a big feature through this
single-PR loop.

⚠️ **Node ≥22.** Non-interactive shells on this machine resolve `node` to an ancient v10 —
prefix build/lint/test commands with `PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"`. This
is an npm-workspaces monorepo (`packages/{app,core,design,kb,www,e2e}`), default branch
`mainline`; see CLAUDE.md for architecture and conventions.

## 1. Get context & research

Read the files and subsystems the task actually touches **before writing anything** — confirm
real paths (a guessed path wastes the whole run), find the seam where the change goes, and the
existing pattern to mirror. Point yourself at the relevant CLAUDE.md sections and note the ⚠️
gotchas that will shape the change.

If the task is **ambiguous, a design fork, irreversible, or outward-facing beyond the PR**, stop
and ask before proceeding — don't guess on a decision the maintainer should make.

## 2. File the tracking issue (with a short plan)

`gh issue create --title "<imperative title>" --body-file <plan>` — **unlabeled**. Capture the
number from the returned URL. Keep the body tight (this is one task, not an epic):

- **Summary** — what needs to change and why.
- **Plan** — the concrete steps / files you'll touch.
- **Verification** — the checks you'll run (the gate + any screens).

Then add it to the **BrewDocs project**:
```
OWNER=$(gh repo view --json owner --jq .owner.login)
# Resolve the project the input named (e.g. "…with the BrewDocs project") to its number —
# case-insensitive, first match. Swap "brewdocs" for whatever name the input gives.
PROJECT=$(gh project list --owner "$OWNER" --format json \
  --jq '[.projects[] | select(.title | ascii_downcase | contains("brewdocs"))][0].number')

gh project item-add "$PROJECT" --owner "$OWNER" --url <issue-or-pr-url>
```.

⚠️ Never apply a `@claude/*` label (or any label) — assigning a role is the maintainer's alone.

## 3. Cut a feature branch linked to the issue

Create the branch **through the issue** so it appears in the issue's *Development* section, off an
up-to-date `mainline`:

```
gh issue develop <issue#> --base mainline --name <issue#>-<kebab-summary> --checkout
```

If `gh issue develop` isn't available, fall back to
`git checkout mainline && git pull --ff-only && git checkout -b <issue#>-<kebab-summary>` — the
PR's `Closes #<issue>` (step 7) still links it under *Development*. Together the linked branch
and the closing PR give the issue its full Development link.

⚠️ Never commit to or push `mainline` — it's the sole deploy branch; a push ships to prod.

## 4. Implement

Make the change, mirroring the pattern you found in §1. Standing rules:

- Don't hand-edit generated files (`routeTree.gen.ts`).
- No `lodash` — use `packages/app/src/utils/func.ts`.
- Don't rename anything under `packages/kb/data/**` (it changes derived ids).
- Intra-package imports go through the `@/` alias, not `../` (lint-enforced).
- Update the relevant `CLAUDE.md` when the change alters something it documents.

## 5. Verify (the gate)

Make the gate green **before** committing (Node-22 PATH prefix):

- **eslint** — `nx test <pkg>` (or `nx run-many --target=test` across all).
- **`tsc --noEmit`** — `cd packages/app && ../../node_modules/.bin/tsc --noEmit`.
- **`vite build`** — `nx build app`.
- For a **UI change**, check the screen/flow in the browser and capture a screenshot.

If a check fails, fix it and re-run — never commit a red gate.

## 6. Commit

Plain imperative subject (no Conventional Commits prefix); body says what changed and why. End
with the trailer:

```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

⚠️ Write the message with `git commit -F <file>` or a quoted heredoc — **never** `-m "…"` with
backticks in it: backticks inside a double-quoted `-m` are shell-expanded and silently gut the
message.

## 7. Push & open the PR

Push the branch, then open the PR (unlabeled), `--base mainline`:

```
git push -u origin <issue#>-<kebab-summary>
gh pr create --base mainline --head <issue#>-<kebab-summary> --title "<same title>" --body-file <pr-body>
```

PR body:

- **Summary** — what changed and why, with **`Closes #<issue>`** (this links the PR to the
  issue's *Development* section and auto-closes it on squash-merge).
- **Verification** — `nx run-many --target=test` (lint) ✓, `tsc --noEmit` ✓, `nx build app` ✓, and which screens/
  flows you checked. This is the only record the gate ran — don't omit it.
- **Screenshots** — for any UI change.
- End the body with: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

Then add the PR to the project:
`gh project item-add 4 --owner matt-whitaker --url <pr-url>`.

## 8. Close out

Post in your response: the issue link, the branch name, the PR link, and the gate result. Remind
the maintainer that **they** merge (squash only) — never merge your own PR.

## Boundaries

- **One well-scoped task, one PR.** If it grows into multiple PRs or needs decomposition, stop
  and switch to `plan-feature`.
- Create the issue and PR **unlabeled**; never apply a `@claude/*` label.
- Branch → PR. Never commit to or push `mainline`; never merge the PR (the maintainer does).
- No destructive git. Ask before anything irreversible or outward-facing beyond opening the PR.