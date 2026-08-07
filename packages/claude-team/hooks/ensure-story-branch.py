#!/usr/bin/env python3
"""Post-hook for the Architect. Guarantees the story's branch exists on the remote.

WHY A HOOK AT ALL. Cutting the branch was the Architect's job and it silently failed about half
the time, because the host action and our prompt give contradictory instructions and the model
picks one:

    Creating local branch 537-bug-deriveschedule-should-be-a ... from source branch: mainline
      - You are already on the correct branch (537-...). Do not create a new branch.

The action creates that branch LOCALLY and never pushes a branch with no commits — and an
Architect's branch is required to be empty. So a model that obeys the action leaves nothing on
the remote while reporting the branch as cut. The next author then finds no branch and targets
the default branch instead, which takes the story out of the story model entirely.

⚠️ POST, NEVER PRE — and this inverts the obvious implementation. `setupBranch` checks whether
the name it is about to generate already exists remotely and, if it does, throws away our
template and falls back to `claude/<entity>-<n>-<timestamp>`:

    Branch '${newBranch}' already exists, falling back to default format

Our template mints exactly the name the Architect records, so pushing it up front would collide
with the action's own generation and strand the whole run on a `claude/...` branch nobody
looks at. Running after the model means the action has already generated its name.

⚠️ NEVER TOUCHES AN EXISTING BRANCH. Absent is the only case this handles. A branch that
exists may carry an author's commits, and resetting it to the default branch would discard
them — the failure this hook exists to prevent, inflicted by the fix for it.
"""

import os
import re

import team

ISSUE = os.environ.get("ISSUE", "")
KIND = os.environ.get("KIND", "")


def link_branch_line(branch: str, default: str) -> None:
    """Append a compare link to the Branch line, so opening the story's PR is one click.

    ⚠️ AFTER the closing backtick, never inside it. `team.branch_line` is anchored to the start
    of a line and captures only what sits between the backticks, so trailing text is invisible
    to it — a property to preserve deliberately, not to rely on by accident.

    Idempotent, because the Architect can be re-run on a story and a second link is noise.

    One link serves the whole life of the branch: GitHub redirects a compare URL to the existing
    PR once one is open, so this is not replaced when open-story-pr.py opens the story's PR.
    """
    body = team.issue_body(ISSUE)
    if "/compare/" in body:
        print("the Branch line already carries its link")
        return

    url = f"https://github.com/{team.REPO}/compare/{default}...{branch}?expand=1"
    # a function as the replacement, so nothing in the URL is read as a backreference
    updated, count = re.subn(
        rf"^(\s*\*{{0,2}}branch:\s*`{re.escape(branch)}`\*{{0,2}})",
        lambda m: f"{m.group(1)} · [open its PR]({url})",
        body, count=1, flags=re.IGNORECASE | re.MULTILINE,
    )
    if not count:
        team.warn(f"could not find #{ISSUE}'s Branch line to link")
        return

    if team.gh("issue", "edit", str(ISSUE), "--repo", team.REPO, "--body", updated) is not None:
        print(f"linked the Branch line -> {url}")
    else:
        team.warn(f"could not write the PR link onto #{ISSUE}'s Branch line")

if not team.REPO:
    team.fail("REPO is required")

if not ISSUE:
    print("Not triggered on an issue — no story branch to ensure.")
    raise SystemExit(0)

# An epic has no branch by design, so a missing one is correct and must not warn.
if KIND == "epic":
    print(f"#{ISSUE} is an epic — epics have no branch.")
    raise SystemExit(0)

named = team.branch_line(team.issue_body(ISSUE))
if not named:
    team.warn(
        f"#{ISSUE} carries no Branch line, so there is no story branch to create. Every role "
        "that follows reads that line to know where to commit; without it the story cannot be "
        "worked. Re-run the Architect on it."
    )
    raise SystemExit(0)

default = (
    team.gh_json("repo", "view", team.REPO, "--json", "defaultBranchRef") or {}
).get("defaultBranchRef", {}).get("name")
if not default:
    team.warn(f"could not read the default branch, so nothing could be done for {named}")
    raise SystemExit(0)

# Resolved BEFORE the exists check, so a re-run on an already-cut story still gets its link.
if team.gh("api", f"repos/{team.REPO}/branches/{named}") is not None:
    print(f"branch {named} already exists — leaving it alone")
    link_branch_line(named, default)
    raise SystemExit(0)

head = team.gh_json("api", f"repos/{team.REPO}/git/ref/heads/{default}") or {}
sha = (head.get("object") or {}).get("sha")
if not sha:
    team.warn(f"could not read {default}'s head, so {named} was not created")
    raise SystemExit(0)

# The API, not a push: the model has switched branches by now and the working tree is not a
# reliable place to cut from. A ref created at the default branch's head is empty by
# construction, which is what the story model wants — the first author's work is its first commit.
if team.gh(
    "api", "--method", "POST", f"repos/{team.REPO}/git/refs",
    "-f", f"ref=refs/heads/{named}", "-f", f"sha={sha}",
) is None:
    team.warn(f"could not create branch {named} at {default}@{sha[:7]}")
    raise SystemExit(0)

print(f"created branch {named} at {default}@{sha[:7]} — empty, ready for its first task")
link_branch_line(named, default)
