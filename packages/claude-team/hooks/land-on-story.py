#!/usr/bin/env python3
"""Puts a task's commits on its story's branch, and closes the task. No PR is involved.

⚠️ A TASK HAS NO PR AND NO BRANCH OF ITS OWN — that is the whole model. One story, one branch, one
PR against the default branch, reviewed and merged as a unit. Per-task PRs were noise on the only
review surface anyone actually reads.

⚠️ THE BRANCH THE RUN IS ON IS UNAVOIDABLE, WHICH IS WHY THIS HOOK EXISTS. `setupBranch` always
*creates* a branch on an issue trigger; it has no mode that checks out an existing one. So a run
cannot start on the story branch, and the commits have to be moved afterwards. What this pushes is
a fast-forward: the branch was cut from the story branch moments earlier.

⚠️ SCRIPTED RATHER THAN PROMPTED, and that is not a style preference. Branch handling was the last
load-bearing thing a model owned here and it failed about half the time — a model asked to `git
push` at the end of its run is the same bet.

⚠️ A REJECTED PUSH MUST FAIL THE STEP. Two tasks of one story can run concurrently — the workflow's
concurrency group is keyed on the issue, and it cannot be keyed on the story, because the group is
evaluated before any job runs and the story number is not resolved yet. So the collision is real and
unclosable; what makes it survivable is that git refuses a non-fast-forward. Swallowing that would
turn a loud, correct failure into silently lost work.

⚠️ `remaining` DECIDES WHETHER THE TASK CLOSES. It is the author's only structured way to say it did
not finish, and it already governs the closing keyword elsewhere. A task closed while its work is
half-done is exactly the failure that let a story reach its Tester with no feature to test.
"""

from __future__ import annotations

import json
import os
import subprocess

import team

ISSUE = os.environ.get("ISSUE", "")
HANDOFF = os.environ.get("HANDOFF", "")

MARKER = "<!-- claude-team:task-landed -->"

if not team.REPO:
    team.fail("REPO is required")

if not ISSUE:
    print("no issue — a PR follow-up commits to the branch it was triggered on. Nothing to land.")
    raise SystemExit(0)

named = team.branch_line(team.issue_body(ISSUE))
if not named:
    print(f"#{ISSUE} carries no Branch line — nothing to land onto.")
    raise SystemExit(0)

# ⚠️ THE SAME STRUCTURAL TEST THE PR-BASE RULE USED, so the two can never disagree about what a
# task is: a task's Branch line names its STORY's branch, so the number it starts with is not its
# own. When they are equal the issue owns that branch and its work is the whole story — that case
# still opens its own PR, and this hook must not touch it.
if team.story_from_branch(named) == str(ISSUE):
    print(f"#{ISSUE} owns `{named}` — it is worked as-is and opens its own PR. Not landing.")
    raise SystemExit(0)


def git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], capture_output=True, text=True, check=False)


branch = git("rev-parse", "--abbrev-ref", "HEAD").stdout.strip()
if not branch or branch == "HEAD":
    team.fail("could not determine the current branch, so nothing could be landed")

ahead = git("rev-list", "--count", f"origin/{named}..HEAD").stdout.strip()
if ahead in ("", "0"):
    print(f"nothing to land — HEAD is not ahead of `{named}`. The run produced no commits.")
    raise SystemExit(0)

# ⚠️ An explicit refspec, not a checkout-and-merge. Nothing is merged, rebased or rewritten: either
# the story branch can fast-forward to these commits or the push is refused, and both outcomes are
# exactly what we want to happen.
pushed = git("push", "origin", f"HEAD:refs/heads/{named}")
if pushed.returncode != 0:
    team.fail(
        f"could not land {ahead} commit(s) on `{named}` — the push was refused. This usually means "
        f"another run pushed to the story branch while this one was working, so the branch is no "
        f"longer a fast-forward. The commits are safe on `{branch}`. git said: "
        f"{(pushed.stderr or pushed.stdout).strip()}"
    )

print(f"landed {ahead} commit(s) from `{branch}` onto `{named}`")

remaining = []
if HANDOFF:
    try:
        remaining = json.loads(HANDOFF).get("remaining") or []
    except json.JSONDecodeError:
        team.warn("the author's handoff was not valid JSON — treating the task as unfinished")
        remaining = ["the author's report could not be read"]

link = team.run_link()
if remaining:
    items = "\n".join(f"- {item}" for item in remaining)
    team.upsert_comment(
        ISSUE, MARKER,
        f"{MARKER}\n⚠️ **Landed on `{named}`, but this task is NOT finished.** The author reported "
        f"work remaining, so the issue stays open:\n\n{items}\n\nRe-trigger it to continue.{link}",
    )
    print(f"#{ISSUE} left open — {len(remaining)} item(s) remaining")
    raise SystemExit(0)

team.upsert_comment(
    ISSUE, MARKER,
    f"{MARKER}\n✅ **Landed on `{named}`.** {ahead} commit(s), no work reported remaining. This task "
    f"has no PR of its own by design — its work reaches the default branch through the story's "
    f"PR.{link}",
)

if team.gh("issue", "close", ISSUE, "--repo", team.REPO, "--reason", "completed") is None:
    team.warn(f"landed on `{named}` but could not close #{ISSUE}")
else:
    print(f"closed #{ISSUE}")
