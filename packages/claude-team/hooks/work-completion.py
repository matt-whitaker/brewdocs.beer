#!/usr/bin/env python3
"""Completes an author's run: commits its changes, lands them on the story's branch, closes the
task. No PR is involved, and no author runs git for any of this.

⚠️ THE COMMIT IS SCRIPTED TOO, which removes the last load-bearing git operation any author owned.
The message rides the author's structured output (`commitMessage`); absent, a deterministic
fallback is written from the task title. An author that committed anyway is harmless — whatever is
uncommitted is committed, whatever is ahead is landed.

⚠️ A REJECTED PUSH RECONCILES BY MERGE: pull latest, commit the merge commit, push. Two tasks of
one story can run concurrently — the workflow's concurrency group is keyed on the issue and cannot
be keyed on the story, since the group is evaluated before the story is resolved — so competing
landings are expected, not exceptional. A merge that CONFLICTS is not resolved by script: the step
fails loudly with `unlandable=true`, the commits stay safe on the run's branch, and resolution is
an Implementor call. Never a force-push, never silence.

⚠️ `remaining` DECIDES WHETHER THE TASK CLOSES. It is the author's only structured way to say it
did not finish. A task closed while its work is half-done is exactly the failure that let a story
reach its Tester with no feature to test.
"""

from __future__ import annotations

import json
import os
import subprocess

import team

GIT_IDENTITY = ["-c", "user.name=claude-team", "-c", "user.email=claude-team@users.noreply.github.com"]


def emit(closed: bool, unlandable: bool = False) -> None:
    """Say what happened, so the board step and the failure-capture step can follow.

    ⚠️ FALSE IS A REAL ANSWER. A task that reported `remaining` is still open and still In
    Progress; a consumer that treated "the hook ran" as "the task finished" would march an
    unfinished task to Done. `unlandable` is the conflict signal the failure-capture step keys on.
    """
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as handle:
            handle.write(f"closed={'true' if closed else 'false'}\n")
            handle.write(f"unlandable={'true' if unlandable else 'false'}\n")


ISSUE = os.environ.get("ISSUE", "")
HANDOFF = os.environ.get("HANDOFF", "")

MARKER = "<!-- claude-team:task-landed -->"

if not team.REPO:
    team.fail("REPO is required")

if not ISSUE:
    print("no issue — a PR follow-up commits to the branch it was triggered on. Nothing to land.")
    emit(False)
    raise SystemExit(0)

named = team.branch_line(team.issue_body(ISSUE))
if not named:
    print(f"#{ISSUE} carries no Branch line — nothing to land onto.")
    emit(False)
    raise SystemExit(0)

# ⚠️ THE SAME STRUCTURAL TEST THE ROUTING RULES USE, so the two can never disagree about what a
# task is: a task's Branch line names its STORY's branch, so the number it starts with is not its
# own. When they are equal the issue owns that branch and its work is the whole story — that case
# goes through the pull-request hook instead, and this one must not touch it.
if team.story_from_branch(named) == str(ISSUE):
    print(f"#{ISSUE} owns `{named}` — it is worked as-is and opens its own PR. Not landing.")
    emit(False)
    raise SystemExit(0)


def git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *GIT_IDENTITY, *args], capture_output=True, text=True, check=False)


branch = git("rev-parse", "--abbrev-ref", "HEAD").stdout.strip()
if not branch or branch == "HEAD":
    team.fail("could not determine the current branch, so nothing could be landed")

handoff = {}
if HANDOFF:
    try:
        handoff = json.loads(HANDOFF)
    except json.JSONDecodeError:
        team.warn("the author's handoff was not valid JSON — treating the task as unfinished")
        handoff = {"remaining": ["the author's report could not be read"]}

dirty = bool(git("status", "--porcelain").stdout.strip())
if dirty:
    message = (handoff.get("commitMessage") or "").strip()
    if not message:
        title = (team.issue(ISSUE, "title") or {}).get("title") or ""
        message = f"Task #{ISSUE}: {title}" if title else f"Work from task #{ISSUE}"
    git("add", "-A")
    committed = git("commit", "-m", message)
    if committed.returncode != 0:
        team.fail(f"could not commit the run's changes: {(committed.stderr or committed.stdout).strip()}")
    print(f"committed the run's changes: {message.splitlines()[0]}")

ahead = git("rev-list", "--count", f"origin/{named}..HEAD").stdout.strip()
if ahead in ("", "0"):
    print(f"nothing to land — HEAD is not ahead of `{named}`. The run produced no changes.")
    emit(False)
    raise SystemExit(0)


def push() -> subprocess.CompletedProcess:
    return git("push", "origin", f"HEAD:refs/heads/{named}")


pushed = push()
if pushed.returncode != 0:
    # ⚠️ Reconcile by merge, once. Another run landed first; pull its work, commit the merge
    # commit, push. A conflict means two tasks touched the same lines — a script must not pick a
    # side, so it aborts, leaves everything on this branch, and fails with the signal the
    # failure-capture step reads.
    print(f"push refused — reconciling `{named}` by merge")
    git("fetch", "origin", named)
    merged = git("merge", "--no-edit", f"origin/{named}")
    if merged.returncode != 0:
        git("merge", "--abort")
        emit(False, unlandable=True)
        team.fail(
            f"could not land {ahead} commit(s) on `{named}` — the merge conflicts, and a script "
            f"must not resolve it. The commits are safe on `{branch}`; resolution is an "
            f"Implementor call. git said: {(merged.stderr or merged.stdout).strip()}"
        )
    pushed = push()
    if pushed.returncode != 0:
        emit(False, unlandable=True)
        team.fail(
            f"could not land on `{named}` even after merging — another run landed again while "
            f"this one reconciled. The commits are safe on `{branch}`. git said: "
            f"{(pushed.stderr or pushed.stdout).strip()}"
        )

landed = git("rev-list", "--count", f"origin/{named}..HEAD").stdout.strip()
print(f"landed {ahead} commit(s) from `{branch}` onto `{named}`")

remaining = handoff.get("remaining") or []

link = team.run_link()
if remaining:
    items = "\n".join(f"- {item}" for item in remaining)
    team.upsert_comment(
        ISSUE, MARKER,
        f"{MARKER}\n⚠️ **Landed on `{named}`, but this task is NOT finished.** The author reported "
        f"work remaining, so the issue stays open:\n\n{items}\n\nRe-trigger it to continue.{link}",
    )
    print(f"#{ISSUE} left open — {len(remaining)} item(s) remaining")
    emit(False)
    raise SystemExit(0)

team.upsert_comment(
    ISSUE, MARKER,
    f"{MARKER}\n✅ **Landed on `{named}`.** {ahead} commit(s), no work reported remaining. This task "
    f"has no PR of its own by design — its work reaches the default branch through the story's "
    f"PR.{link}",
)

if team.gh("issue", "close", ISSUE, "--repo", team.REPO, "--reason", "completed") is None:
    team.warn(f"landed on `{named}` but could not close #{ISSUE}")
    emit(False)
else:
    print(f"closed #{ISSUE}")
    emit(True)
