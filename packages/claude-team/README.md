# claude-team

The abstract definition of a Claude/GitHub role team: what the roles are, how work is
shaped, and how changes reach the default branch. A repo **consumes** this by pointing its
workflow at these prompts and hooks, and **extends** it with a per-role overlay carrying
its own specifics.

BrewDocs is the first consumer. Nothing in this directory should name BrewDocs, its gate,
its packages or its conventions — if it does, it belongs in the consumer's overlay.

## The issue hierarchy

| level | branch | PR | what it is |
|---|---|---|---|
| **Epic** | no | **no** | a cross-story product goal; a grouping, nothing more |
| **Story** | **one** | **exactly one** | a sub-issue of an epic — the unit that ships |
| **Task** | no | no | a sub-issue of a story; divided work that lands on the story's branch |

- An epic never has a branch and never has a PR. If something needs a PR, it is a story.
- A story owns one branch and one PR against the default branch.
- A task is a slice of a story. Its work is committed to the **story's** branch and shows
  up in the **story's** PR.

## How a story moves

1. **Manager** shapes the story and cuts its branch off the default branch.
2. The **first author to run** — Implementor, Tester or Writer — opens the story's PR.
3. **Every subsequent role commits to that same branch.** No role cuts its own.
4. The maintainer reviews one PR as it accumulates each role's contribution, and merges.

⚠️ This is the point of the design: one PR per story, growing, instead of one PR per role.
A reviewer sees the story land as a whole.

## Roles

| role | trigger | works on | writes |
|---|---|---|---|
| Manager | `@claude/manager` | epic or story | the issue, and a story's branch |
| Researcher | `@claude/researcher` | epic or story | sub-issues (stories, or tasks) |
| Implementor | `@claude/implementor` | story or task | code |
| Tester | `@claude/tester` | story or task | tests |
| Writer | `@claude/writer` | story or task | documentation |
| Security | none — runs on merge | the merged PR | issues it files |

**The handle in a comment picks the role.** Labels record which roles have been here; they
route nothing. A bare `@claude` does nothing, so a half-typed handle cannot start the wrong
agent.

## Prompt composition

A role's prompt is `prompts/<role>.md` (this package) concatenated with the consumer's
overlay. The base says how the role behaves and how the hierarchy works; the overlay says
what the repo's gate is, where its code lives, and any house rules.

⚠️ Keep the split honest. A rule that would be true in any repo belongs in the base; a rule
that names a command, a path or a package belongs in the overlay.

## Hooks

Deterministic steps that run around each model step, so backlog bookkeeping cannot be
forgotten by a model that ran out of turns or simply skipped it.

| hook | when | does |
|---|---|---|
| `stamp-role-label.sh` | pre, every role | stamps `@claude/<role>` on the triggering issue or PR |
| `set-issue-in-progress.sh` | pre, authors | moves the issue to In Progress on the board |
| `file-sub-issues.sh` | post, Researcher | parents stories to their epic, tasks to their story |
| `open-story-pr.sh` | post, authors | opens the story's PR if it has none |
| `finish-pr.sh` | post, authors | labels the PR and ensures it closes its issue |
| `close-merged-work.sh` | on merge | closes the PR's issues and files them on the board |

⚠️ These were prompt instructions until a model skipped them. A scripted step costs no
turns and cannot be forgotten.
