---
name: plan-feature
description: Decompose a feature into an epic issue plus independently-implementable sub-issues, and create them on GitHub, linked and unlabeled.
---

Decompose a feature into a parent (epic) issue and independently-implementable
sub-issues, and **create them on GitHub yourself** with `gh` — each sub-issue linked as a
native GitHub sub-issue of the epic — left **unlabeled** for the maintainer to review and
iterate on.

The feature to plan: $ARGUMENTS

Do NOT implement anything and do NOT write code. **Create the issues yourself** with `gh`
(you have access) — but leave them **unlabeled**: role labels are the
maintainer's to assign (see Boundaries). The created issues are drafts to iterate on, not a
final hand-off.

## 1. Ground yourself in the codebase first

Read the packages and directories this feature actually touches, so every issue names
real paths. Never write a path you haven't confirmed exists — a wrong path costs the
worker turns rediscovering the repo, which is the whole reason this command exists.

This is an npm-workspaces monorepo: `packages/{app,core,design,kb,www}`. Default branch
is `mainline`. See CLAUDE.md for architecture and conventions.

## 2. Draft the parent (epic)

The overall goal and why, the shared constraints, and a short codebase map of where the
relevant code lives. This is the review artifact — it's what the maintainer reads to
decide whether the decomposition is right. ⚠️ **No branch section** — an epic has neither a
branch nor a PR.

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

⚠️ **Every sub-issue must be independently mergeable — its PR has to pass the gate alone.**
The gate is repo-wide (`npm test -ws` + `tsc --noEmit` + `vite build`), so a sub-issue that
leaves the tree not compiling can *never* go green, and its worker will burn the whole turn
budget trying. **Never** write "it's fine if this doesn't compile yet" or "the next sub-issue
fixes the type errors" — that's an unsatisfiable task, not a scoping decision. A
rename/signature change and its call sites are **one** sub-issue, not two. If a split would
break the build, either fold the consumers in, or make the step **additive** (new shape
alongside old, both working, old one deleted in a later sub-issue — mark the transitional
code in-file with the issue that removes it). An additive step must also be
**behaviour-preserving**: if old consumers still write data the new code ignores, keep the
old path live until they migrate rather than shipping silent data loss.

**Write every sub-issue self-contained.** There is no runtime parent lookup — a worker
picks up one labeled issue and sees only that issue. Restating shared constraints in
each child is correct here; a child that says "see the parent for context" will be
implemented without that context.

Order them so prerequisites come first, and say plainly which are independent (safe to
start in parallel) and which are blocked on an earlier child.

## 4. Propose the epic — do not create it

⚠️ **Epics are the maintainer's to create.** You never file one on your own initiative. Put
the epic body from §2 in your response, say plainly that it is a proposal, and **stop for
agreement**. If they say go, create it then and not before.

⚠️ **An epic has no branch and no PR.** Do not cut one. A story owns a branch and a PR
against `mainline`; a task cuts its own off the story's and PRs back into it. If you find
yourself wanting an integration branch, you are looking at the retired model.

Once the maintainer agrees:

1. **Epic** — `gh issue create --title "Epic: <title>" --body "<the body from §2>"`, no
   labels. ⚠️ The `Epic:` prefix is load-bearing: it is how every later run classifies the
   issue, and a scripted hook applies the `epic` label from it.
2. **Stories** — one `gh issue create` per story, no labels, each body built from the
   `.github/ISSUE_TEMPLATE/claude-task.yml` headings.
3. **Link each story to the epic** as a native sub-issue. ⚠️ The REST API wants the child's
   integer database `id`, not its issue number:
   ```
   gh api repos/{owner}/{repo}/issues/<child-number> --jq .id
   gh api --method POST repos/{owner}/{repo}/issues/<epic-number>/sub_issues -F sub_issue_id=<that-id>
   ```
4. Add the epic and every story to the project:
   `gh project item-add 4 --owner "@me" --url <url>`.

⚠️ **Do not cut any branch here.** The Architect cuts a story's branch when that story is
triggered — see the Architect prompt in https://github.com/matt-whitaker/claude-team.

### Handoff for cheap follow-ups

Every run on a PR starts cold — a follow-up (a review comment, a requested fix) re-reads
the code from scratch unless the prior run left it a note. Have each worker leave a
**handoff** so the next run orients in one read instead of re-exploring the tree. It lives
as a block at the bottom of the PR's Claude comment (not a committed file — that would ride
the diff into mainline and mislead the next feature's branch). Carry this into every
sub-issue's **Acceptance criteria**:

- Before opening the PR — and again before finishing any later run on this PR — end the PR
  comment with a collapsible **Handoff** block covering: what's implemented and what's still
  open, the decisions and gotchas discovered (so the next run doesn't re-derive them), a
  one-line-per-file map of what changed and why, and how to verify.
- ⚠️ Keep it a **scannable status doc, not a narrative** — a bloated handoff costs the
  turns it was meant to save, the same trap as an over-granular checklist.

The reciprocal *read the prior Handoff block first, and refresh it before finishing* half
already lives in the `.github/workflows/claude.yaml` standing prompt (it can't live in the
issue body — a follow-up is triggered by a PR comment and never re-reads the issue). So a
sub-issue only needs to state the handoff as an acceptance criterion; the read/refresh
cadence is already wired for every run.

## 5. Close with a plan of attack

After creating them, post the summary in your response: the epic link, then each story's title
+ link, which are independent vs. blocked and on what, and the order to work them. The issues
are **unlabeled drafts** — the maintainer reviews and iterates, then starts one by **applying
the `@claude` label**, which routes it to the Architect. Labels only
mark ownership; the comment is what starts a run.

## Boundaries

- Create the issues **unlabeled**. Never apply a `@claude/*` label — assigning a role is the
  maintainer's review gate.
- Never implement any of it — issues only, no code, no PR. Cutting the epic's **empty** feature
  branch off `mainline` (step 4.2) is the one expected exception — it's not code; write nothing onto it.
- Stop once the issues are created, linked, the feature branch is cut, and everything is summarized.
