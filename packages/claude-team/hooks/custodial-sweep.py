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

  MODE=deliverable  after a role runs — did it leave the artifact it exists to produce?
  MODE=branches     on merge — is the story's branch now provably dead?

⚠️ THE BRANCH CHECK MUST RUN ON MERGE. A branch becomes dead exactly when its story closes, and
nothing triggers on a closed story afterwards — so a post-role-only sweep would never collect
anything at all.
"""

from __future__ import annotations

import os

import team

MODE = os.environ.get("MODE", "")
ISSUE = os.environ.get("ISSUE", "")
ROLE = os.environ.get("ROLE", "")
PR = os.environ.get("PR", "")
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


def check_branches() -> None:
    """Delete a story branch that was never used and never will be.

    ⚠️ THE TEST IS TWO-PART AND BOTH HALVES ARE LOAD-BEARING:
      * **0 commits ahead of the default branch** — the branch contains nothing that is not already
        on the default branch, so deleting it destroys no work *by construction*.
      * **its issue is closed** — the work is finished, so nothing is about to arrive.

    Either half alone is wrong. 0-ahead by itself would have deleted `866-bug-not-all-ingredients-and`,
    which was empty only because its task had not run yet. Closed by itself would delete branches
    carrying real commits.

    ⚠️ This is the only destructive action any hook here takes. It is safe because the first half of
    the test makes it a no-op in content terms, and reversible because the ref can be recreated at
    the default branch's head — which is, by the test, exactly where it pointed.
    """
    # ⚠️ The issues come from the PR, not from an input. A merge can close more than one, and the
    # one whose branch is now dead is not necessarily the one anybody passed — `close-merged-work.py`
    # resolves them the same way, and this runs after it precisely so their state is already closed.
    issues = [str(i["number"]) for i in (team.gh_json(
        "pr", "view", PR, "--repo", team.REPO, "--json", "closingIssuesReferences"
    ) or {}).get("closingIssuesReferences", [])] if PR else ([ISSUE] if ISSUE else [])

    if not issues:
        print("This merge closed no issue — no branch to consider.")
        return
    for number in issues:
        sweep_one(number)


def sweep_one(ISSUE: str) -> None:
    branch = team.branch_line(team.issue_body(ISSUE))
    if not branch:
        print(f"#{ISSUE} names no branch — nothing to sweep.")
        return

    if team.issue_state(ISSUE).lower() != "closed":
        print(f"#{ISSUE} is still open — leaving `{branch}` alone.")
        return

    repo = team.gh_json("repo", "view", team.REPO, "--json", "defaultBranchRef") or {}
    default = (repo.get("defaultBranchRef") or {}).get("name") or ""
    if not default:
        team.warn("could not read the default branch — leaving the branch alone.")
        return
    if branch == default:
        return

    if team.gh_json("api", f"repos/{team.REPO}/git/ref/heads/{branch}") is None:
        print(f"`{branch}` is already gone.")
        return

    compare = team.gh_json("api", f"repos/{team.REPO}/compare/{default}...{branch}") or {}
    ahead = compare.get("ahead_by")
    if ahead is None:
        team.warn(f"could not compare `{branch}` against {default} — leaving it alone.")
        return
    if ahead:
        print(f"`{branch}` is {ahead} commit(s) ahead of {default} — it holds work, leaving it.")
        return

    if team.gh("api", "--method", "DELETE", f"repos/{team.REPO}/git/refs/heads/{branch}") is None:
        team.warn(f"could not delete `{branch}`.")
        return
    print(
        f"deleted `{branch}` — 0 commits ahead of {default} and #{ISSUE} is closed, so it was "
        "created for a story that turned out to need no branch of its own."
    )


if MODE == "deliverable":
    check_deliverable()
elif MODE == "branches":
    check_branches()
else:
    team.fail(f"MODE must be 'deliverable' or 'branches', got {MODE!r}")
