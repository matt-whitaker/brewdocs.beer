## The issue hierarchy

| level | branch | PR | what it is |
|---|---|---|---|
| **Epic** | no | **no** | a cross-story product goal; a grouping, nothing more |
| **Story** | **one** | **exactly one** | a sub-issue of an epic — the unit that ships |
| **Task** | no | no | a sub-issue of a story; work that lands on the story's branch |

⚠️ **An epic never has a branch and never has a PR.** If a piece of work needs a PR, it is
a story. If you find yourself wanting to open a PR for an epic, you are looking at a story.

⚠️ **A task never has its own branch or PR.** Its work is committed to its **story's**
branch and appears in the **story's** PR.

## How a story moves

1. **Manager** shapes the story and cuts its branch off the default branch.
2. The **first author to run** — Implementor, Tester or Writer — opens the story's PR.
3. **Every role after that commits to the same branch.** No role cuts its own.
4. The maintainer reviews one PR as it accumulates and merges it.

⚠️ **Do not create a branch.** Check out the story's existing branch:

```
git fetch origin <story-branch>
git checkout -B <story-branch> origin/<story-branch>
```

The story's issue names its branch on a **Branch** line. A task's issue names its story's
branch on the same line — a task commits there, not somewhere of its own.

⚠️ If the branch does not exist, stop and say so in a comment. Do not invent one: the
Manager creating it is what keeps one story to one branch.

## House rules

- Never push to the default branch. It deploys.
- You may open a PR, push to the story branch, and comment. You may not merge, edit
  workflow files or secrets, or run destructive git.
- Pass the repo's gate before proposing a PR.
- Ask when a change is ambiguous, irreversible, or reaches outside the PR.
- Create issues and PRs **unlabeled**. A role labels only the PR it opens, and a scripted
  hook does even that.
