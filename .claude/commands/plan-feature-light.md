Sketch a feature's big-picture proposal and — the part that matters most — a **research
path**, and **create it as a single GitHub issue** (unlabeled) for a GitHub agent to pick
up, research in-repo, and decompose into implementable sub-issues. The agent creates those
sub-issues and posts an index comment; it writes no code.

The feature to plan: $ARGUMENTS

Do NOT implement anything. Do NOT produce the final sub-issue breakdown yourself — that's
the assignee agent's job. **Create the one research/decompose issue** with `gh issue create`
(unlabeled) — don't apply the `claude` label; that's the maintainer's trigger. The created
issue is a draft to iterate on.

## When to reach for this vs `plan-feature`

- **`plan-feature`** — you do the deep, file-by-file grounding and hand back ready-to-implement
  sub-issues. Best when the change is well-understood and you already hold the context.
- **`plan-feature-light`** (this) — you draw the map and the research path; a GitHub agent
  does the deep grounding + decomposition in the actual repo and posts it. Best for larger
  or fuzzier features, or when you'd rather the in-repo agent do the file-by-file research
  than reproduce it from memory.

## 1. Ground lightly — draw the map, not every street

Read enough to state the feature's shape and where it lives: the packages/subsystems and the
handful of anchor files it touches. Confirm what you assert — a named file or subsystem must
exist — but stop at "here's the area and why it's relevant." You are not producing diffs or a
file-by-file plan. This is an npm-workspaces monorepo: `packages/{app,core,design,kb,www}`,
default branch `mainline`; see CLAUDE.md for architecture and conventions.

## 2. Write the research path — the deliverable that matters most

This is the point of the command. A GitHub agent starts cold, and its single biggest failure
mode is burning its turn budget on blind exploration before it writes anything. A precise
research path is the fix: it onboards the agent fast so it spends its turns *deciding*, not
*discovering*.

Make it a concrete **reading list + question list**:

- The files/dirs to read first, in order, and what to take from each.
- The subsystems, models, and patterns that bear on the feature — point at CLAUDE.md sections
  by name.
- The **questions the agent must answer before it can decompose**: the unknowns, the "does X
  already exist / is there a primitive for this" checks, the decisions a human might need to
  weigh in on.
- The ⚠️ constraints and gotchas that will shape the work.

Every exact path you give is a path the agent doesn't have to discover — precision here
directly buys it turns.

## 3. State the proposal

The goal and why; the rough, conceptual shape of the solution (not per-file); the shared
constraints; and the seams and decisions you can already see. Enough for a competent agent to
turn into a sized breakdown — no more.

## 4. Create the issue

**Create one GitHub issue** with `gh issue create` (no labels), body built from:

- **Goal** — what and why.
- **Proposal** — the high-level shape (§3).
- **Constraints** — standing + feature-specific.
- **Research path** — the reading list + questions (§2). *This is the heart of the issue.*
- **Integration branch** — the epic's feature branch (cut below) and the branch-per-epic flow.
- **Your task** — the block below, addressed to the assignee agent.

**Then cut the epic's feature branch — always.** This issue *is* the epic (the agent's sub-issues
link to it as native sub-issues), so it gets one integration branch that all that work targets, not
`mainline` — the feature lands together and merges as a single PR. Capture the issue number, then:

```
git checkout mainline && git pull --ff-only
git checkout -b <issue#>-<kebab-summary>
git push -u origin <issue#>-<kebab-summary>
```

The branch is empty (off `mainline`) until the first sub-issue PR merges in. After cutting it,
`gh issue edit` the issue to fill the concrete branch name into its **Integration branch** section
and the *Your task* block.

### The "Your task" block (include in the issue, addressed to the GitHub agent)

> **This is a research-and-decompose task — not an implementation task.** Follow the Research
> path above to get your bearings, break this feature into independently-implementable
> sub-issues, and **create each as its own GitHub issue** (`gh issue create`). **Do not change
> any code and do not open a pull request** — the created issues are the deliverable.
>
> ⚠️ **Do NOT apply the `claude` label — or any label — to the issues you create. Leave them
> unlabeled.** Labeling is the maintainer's alone: it's their review gate and the trigger that
> starts an implementation run, so auto-labeling would kick off work they never approved.
>
> **Link each new issue as a native GitHub sub-issue of *this* issue** (this issue is the
> parent) so they show in its Sub-issues list — a `Part of #N` text line is not sufficient. Use
> the REST sub-issues API: get the child's numeric id with
> `gh api repos/<owner>/<repo>/issues/<child-number> --jq .id`, then
> `gh api --method POST repos/<owner>/<repo>/issues/<this-issue-number>/sub_issues -F sub_issue_id=<that-id>`.
> Note the API wants the integer REST `id`, **not** the issue number (`<owner>/<repo>` is this
> repo, i.e. `$GITHUB_REPOSITORY`). If that API is unavailable, fall back to a
> `Part of #<this-issue-number>` line in each body.
>
> **Target the epic's feature branch.** A branch `<issue#>-<kebab-summary>` has been cut off
> `mainline` for this epic (its name is in the *Integration branch* section above). Every sub-issue
> you create must carry a **Base branch** note telling its worker to *branch off that branch and open
> the PR against it, not `mainline`; rebase onto it once the prerequisite sub-issue has landed there.*
> Land the prerequisite sub-issue into the branch first.
>
> ⚠️ When your index comment or any issue body references sub-issues by number, use their **real
> issue numbers** (assigned after creation), never ordinals like #1…#7 — GitHub auto-links `#N` to
> whatever issue/PR already holds that number, so low ordinals silently point at unrelated old PRs.
>
> Then post ONE comment on *this* issue listing the sub-issues (with links) in prerequisite
> order, marking which are parallel vs blocked — a single index to review.
>
> Size each sub-issue by *exploration cost*, not just human-reviewability: a small, cohesive
> set of files (a handful, not a directory tree); if one would span a directory of
> screens/rows, split it further. Size is the hard constraint; the number of sub-issues is
> soft — prefer more small issues over one that balloons.
>
> ⚠️ **Every sub-issue must be independently mergeable — its PR has to pass the gate alone.**
> The gate is repo-wide (`npm test -ws` + `tsc --noEmit` + `vite build`), so a sub-issue that
> leaves the tree not compiling can *never* go green and its worker will burn its whole turn
> budget trying. **Never** write "it's fine if this doesn't compile yet" or "the next
> sub-issue fixes the type errors". A rename/signature change and its call sites are **one**
> sub-issue. If a split would break the build, fold the consumers in, or make the step
> **additive** (new shape alongside old, old deleted later) — and keep it
> behaviour-preserving, so old consumers' data isn't silently dropped.
>
> Write each sub-issue self-contained, using the headings from
> `.github/ISSUE_TEMPLATE/claude-task.yml` (Summary / Where the code lives / What to change /
> Patterns to follow / Out of scope / Acceptance criteria / CLAUDE.md Updates). Put verified,
> exact paths in *Where the code lives*. Carry these standing Out-of-scope items into each:
> don't hand-edit generated files (`routeTree.gen.ts`); don't add lodash (use
> `packages/app/src/utils/func.ts`); don't rename under `packages/kb/data/**`.

## 5. Close with a one-liner for the maintainer

After creating it, post the issue link **and the epic's feature-branch name** in your response
and remind the maintainer: review / iterate, then apply the **`claude` label** to trigger the
research + decomposition — the label tier gets the full turn budget, while an `@claude` comment
runs on the smaller poke budget and can time out on real research. The agent's sub-issues will
target the feature branch, not `mainline`. The agent will then **create the sub-issues
(unlabeled), link them as native sub-issues of the parent**, and post an index comment; the
maintainer reviews and applies the `claude` label to whichever ones to start.

## Boundaries

- Light grounding only — never produce the final per-file decomposition yourself; that's the
  assignee agent's job.
- Never implement and never apply a label. Create **only** the single research issue
  (unlabeled) — never the sub-issues; those are the agent's job. Cutting the epic's **empty**
  feature branch off `mainline` is the one expected exception — it's not code; write nothing onto it.
- Stop once the research-path issue is created, its feature branch is cut, and its link + branch
  name are posted.
