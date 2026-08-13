#!/usr/bin/env python3
"""The back half of the sandwich: scripted checks on what a run left behind.

⚠️ WHY THIS RUNS AFTER RATHER THAN BEFORE. Every check here is unanswerable at the front and
trivial at the back. "Does this story have tasks?" reads 0 for *every* story at branch-creation
time, because `ensure-story-branch.py` runs before `file-sub-issues.py`. "Was this branch ever
used?" is not knowable until work lands, or does not. "Did the Architect deliver?" is only knowable
once it has stopped. Attempts to answer these early produced fragile logic; observing them late is
simply cheaper.

⚠️ SCRIPTED, WITH NO MODEL STEP IN ITS JOB, and that is what lets its job hold `contents: write`.
Nothing untrusted executes there. The routing phase at the front consults the model only where the
script has no answer; this half has no such case yet, and wiring one that decides nothing would be
a channel with no reader.

TWO MODES, because the two checks become true at different moments:

  MODE=deliverable  did the role leave the artifact it exists to produce?
  MODE=branch       does this story need a branch at all — and if so, make it

⚠️ NOTHING HERE DELETES. An earlier version swept branches that nothing had used; the branches
should not have been created, and here they are not. Putting the decision where the knowledge is
removes the need for a destructive capability rather than justifying one.
"""

from __future__ import annotations

import os

import team

MODE = os.environ.get("MODE", "")
ISSUE = os.environ.get("ISSUE", "")
ROLE = os.environ.get("ROLE", "")
KIND = os.environ.get("KIND", "")

if not team.REPO:
    team.fail("REPO is required")


def check_deliverable() -> None:
    """An Architect that produced no `Branch:` line has stalled — and reports success.

    ⚠️ MEASURED TWICE, on #834 and #866: ~6 turns, ~30s, no error, no denials, nothing written,
    and a green run. Both recovered on a plain re-trigger, so the input was never the problem.
    `ensure-story-branch.py` already says exactly the right thing about it — as a `::warning::`,
    which fails nothing and nobody reads. This is the same sentence with teeth.

    ⚠️ An epic and a spike legitimately have no branch. They must not fail here.
    """
    if ROLE != "architect" or not ISSUE:
        return
    if KIND in ("epic", "spike"):
        print(f"#{ISSUE} is {'an epic' if KIND == 'epic' else 'a spike'} — no Branch line expected.")
        return

    if team.branch_line(team.issue_body(ISSUE)):
        print(f"#{ISSUE} carries its Branch line — the Architect delivered.")
        return

    team.fail(
        f"#{ISSUE} has no Branch line after the Architect ran, so the story cannot be worked: "
        "every role that follows reads that line to know where to commit. This is the stall that "
        "reports success — re-add the label to run it again."
    )


def ensure_branch() -> None:
    """Create the story's branch — but only for a story that actually has tasks.

    ⚠️ THIS IS THE FIRST MOMENT THE QUESTION CAN BE ANSWERED. `ensure-story-branch.py` runs before
    `file-sub-issues.py`, so `sub_issues()` reads 0 for *every* story where creation used to happen
    — including one the Architect had just decomposed. Here the parenting is done and the count is
    real. Everything else about branch handling follows from putting the decision where the
    knowledge is.

    ⚠️ A STORY WITH NO TASKS GETS NO BRANCH, EVER. Its author cuts off the default branch
    (`delegate.py` blanks `story_branch`) and opens its PR there (#877/#878). Creating one would
    produce a branch nothing ever commits to — which is what #883 then had to delete. Not creating
    it is the same outcome with no destructive capability anywhere in the system.

    ⚠️ NOT REDUNDANT WITH THE PRE-AUTHORS NET, though the net would eventually cover correctness.
    A story's `Branch:` line carries a compare link the maintainer clicks to open the story's PR;
    with no branch it 404s until the first task happens to run. That is user-visible.
    """
    if ROLE != "architect" or not ISSUE:
        return
    if KIND in ("epic", "spike"):
        return

    named = team.branch_line(team.issue_body(ISSUE))
    if not named:
        return
    if team.story_from_branch(named) != str(ISSUE):
        print(f"#{ISSUE} does not own `{named}` — not this issue's branch to make.")
        return

    tasks = len(team.sub_issues(ISSUE))
    if not tasks:
        print(f"#{ISSUE} has no tasks — it is worked as-is, so it needs no branch of its own.")
        return

    if team.gh_json("api", f"repos/{team.REPO}/git/ref/heads/{named}") is not None:
        print(f"`{named}` already exists.")
        return

    repo = team.gh_json("repo", "view", team.REPO, "--json", "defaultBranchRef") or {}
    default = (repo.get("defaultBranchRef") or {}).get("name") or ""
    base = team.gh_json("api", f"repos/{team.REPO}/git/ref/heads/{default}") or {}
    sha = (base.get("object") or {}).get("sha")
    if not sha:
        team.warn(f"could not read {default}'s head, so `{named}` was not created")
        return

    if team.gh(
        "api", "--method", "POST", f"repos/{team.REPO}/git/refs",
        "-f", f"ref=refs/heads/{named}", "-f", f"sha={sha}",
    ) is None:
        team.warn(f"could not create `{named}` at {default}@{sha[:7]}")
        return
    print(f"created `{named}` at {default}@{sha[:7]} — empty, for #{ISSUE}'s {tasks} task(s)")


if MODE == "deliverable":
    check_deliverable()
elif MODE == "branch":
    ensure_branch()
else:
    team.fail(f"MODE must be 'deliverable' or 'branch', got {MODE!r}")
