Sketch a feature's big-picture proposal and — the part that matters most — a **research
path**, as a single markdown issue body for a GitHub agent to pick up, research in-repo,
and decompose into implementable sub-issues. The agent posts that breakdown back as a
comment; it writes no code.

The feature to plan: $ARGUMENTS

Do NOT implement anything. Do NOT create, label, or edit issues. Do NOT produce the final
sub-issue breakdown yourself — that's the assignee agent's job. Produce the proposal +
research path as markdown in your response and stop.

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

## 4. Output: one markdown issue body

Present everything as a **single markdown block**, ready to paste as one GitHub issue:

- **Goal** — what and why.
- **Proposal** — the high-level shape (§3).
- **Constraints** — standing + feature-specific.
- **Research path** — the reading list + questions (§2). *This is the heart of the issue.*
- **Your task** — the block below, addressed to the assignee agent.

### The "Your task" block (include in the issue, addressed to the GitHub agent)

> **This is a research-and-decompose task — not an implementation task.** Follow the Research
> path above to get your bearings, then break this feature into independently-implementable
> sub-issues. **Your deliverable is a comment on this issue containing that breakdown. Do not
> change any code, and do not open a pull request** — the breakdown *is* the work.
>
> Size each sub-issue by *exploration cost*, not just human-reviewability: a small, cohesive
> set of files (a handful, not a directory tree); if one would span a directory of
> screens/rows, split it further. Size is the hard constraint; the number of sub-issues is
> soft — prefer more small issues over one that balloons.
>
> Write each sub-issue self-contained, using the headings from
> `.github/ISSUE_TEMPLATE/claude-task.yml` (Summary / Where the code lives / What to change /
> Patterns to follow / Out of scope / Acceptance criteria / CLAUDE.md Updates). Put verified,
> exact paths in *Where the code lives*. Carry these standing Out-of-scope items into each:
> don't hand-edit generated files (`routeTree.gen.ts`); don't add lodash (use
> `packages/app/src/utils/func.ts`); don't rename under `packages/kb/data/**`. Order them by
> prerequisite and say which are parallel vs blocked.

## 5. Close with a one-liner for the maintainer

After the issue block, remind the maintainer: paste it as one issue and apply the **`claude`
label** to trigger the research + decomposition — the label tier gets the full turn budget,
while an `@claude` comment runs on the smaller poke budget and can time out on real research.
The agent will reply with the sub-issue breakdown to review and create.

## Boundaries

- Light grounding only — never produce the final per-file decomposition yourself; that's the
  assignee agent's job.
- Never implement, never apply a label, never create or edit issues.
- Stop once the proposal + research-path issue is presented.
