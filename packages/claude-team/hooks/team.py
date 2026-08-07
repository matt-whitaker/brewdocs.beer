"""Shared helpers for the team hooks.

Every hook imports this rather than reimplementing GitHub access. The logic here was
duplicated across five scripts before the port, and the copies were free to drift — two
hooks deriving a story differently would silently mis-route work.

Nothing here talks to the GitHub API directly. It shells out to `gh`, which already holds
the token from the environment, and parses the JSON in Python. That is the whole reason the
port removes the `jq` dependency, and with it every `--jq` quoting hazard.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys

REPO = os.environ.get("REPO", "")


def fail(message: str) -> None:
    """Stop the hook with a message. Hooks are best-effort, so this is for missing inputs."""
    sys.exit(f"::error::{message}")


def warn(message: str) -> None:
    print(f"::warning::{message}")


def gh(*args: str, check: bool = False) -> str | None:
    """Run a `gh` command and return stdout, or None if it failed.

    `gh` prints its error body to STDOUT, not stderr — so a 404 looks exactly like a
    successful response to anything that only checks for output. Callers used to capture
    that JSON blob and treat it as a value. Here a non-zero exit returns None, full stop,
    and there is no way for an error body to be mistaken for data.
    """
    result = subprocess.run(
        ["gh", *args], capture_output=True, text=True, check=False
    )
    if result.returncode != 0:
        if check:
            fail(f"gh {' '.join(args)} failed: {result.stderr.strip()}")
        return None
    return result.stdout


def gh_json(*args: str):
    """Run a `gh` command whose output is JSON, and parse it. None on any failure."""
    out = gh(*args)
    if out is None:
        return None
    try:
        return json.loads(out)
    except json.JSONDecodeError:
        return None


# ── issues ──────────────────────────────────────────────────────────────────────────────


def issue(number: str | int, *fields: str) -> dict:
    """Fetch fields of an issue. Returns {} when it cannot be read."""
    data = gh_json(
        "issue", "view", str(number), "--repo", REPO, "--json", ",".join(fields)
    )
    return data if isinstance(data, dict) else {}


def issue_body(number: str | int) -> str:
    return issue(number, "body").get("body") or ""


def issue_state(number: str | int) -> str:
    return issue(number, "state").get("state") or ""


def sub_issues(number: str | int) -> list[dict]:
    """A story's tasks, or an epic's stories. Empty when it has none or cannot be read."""
    data = gh_json("api", f"repos/{REPO}/issues/{number}/sub_issues")
    return data if isinstance(data, list) else []


def parent(number: str | int) -> str | None:
    """The parent issue number, or None.

    This endpoint 404s for anything unparented, which is most issues — so "no parent" and
    "request failed" arrive the same way and both mean absent here.
    """
    data = gh_json("api", f"repos/{REPO}/issues/{number}/parent")
    if isinstance(data, dict) and isinstance(data.get("number"), int):
        return str(data["number"])
    return None


# ── the conventions the Architect writes into an issue ──────────────────────────────────

# ⚠️ ANCHORED TO A LINE, and that is the whole point. Unanchored, these matched the first
# occurrence ANYWHERE in a body — so a task that mentioned a sibling's role in prose routed to
# the wrong one. #607 is stamped `implementor` and read as `tester`, because two earlier lines
# said "a separate task (Role: tester) depends on this". The Tester writes no production code,
# so it would have reported that it could not do the work and the story would have stalled with
# nothing obviously broken.
#
# ⚠️ This gets MORE likely as the Architect gets better: cross-referencing sibling tasks is good
# issue-writing that happens to poison an unanchored parser.
#
# Bold is optional on purpose. Every stamp in practice is written `**Role: x**`, so requiring
# the markers would work — but the defect is mid-line matching, and anchoring alone cures it.
# Demanding `**` would be a second, unrelated tightening that turns a bold-less stamp into a
# silent mis-route instead of a readable one.
_BRANCH = re.compile(r"^\s*\*{0,2}branch:\s*`([^`]+)`", re.IGNORECASE | re.MULTILINE)
_ROLE = re.compile(r"^\s*\*{0,2}role:\s*`?([a-z]+)`?", re.IGNORECASE | re.MULTILINE)


def branch_line(body: str) -> str:
    """The branch an issue names. Always the STORY's branch, on a story and on its tasks."""
    found = _BRANCH.search(body)
    return found.group(1) if found else ""


def role_stamp(body: str) -> str:
    found = _ROLE.search(body)
    return found.group(1).lower() if found else ""


EPIC_LABEL = "epic"
BUG_LABEL = "bug"
STORY_LABEL = "story"

# The CLASSIFICATION labels — what an issue *is*. Distinct from the routing labels
# (`@claude`, `@claude/<role>`), which say what should happen to it, belong to the maintainer,
# and are a record of what has run. These are safe for whoever files an issue to apply.
#
# ⚠️ EVERY KIND GETS ONE, INCLUDING `story`. An earlier version left a story unlabelled and
# called the absence the signal — which reads fine in a hook and badly on a board, where you
# cannot filter for "the ones with no classification". `kind()` still DERIVES story from the
# absence of the other markers; the label is what makes that visible.
KIND_LABELS = {"epic": EPIC_LABEL, "bug": BUG_LABEL, "story": STORY_LABEL}


def titled_epic(title: str) -> bool:
    """True when a title announces itself as an epic — `Epic: …`, `Epic —`, `Epic` alone."""
    return bool(re.match(r"\s*epic\b", title or "", re.IGNORECASE))


def titled_bug(title: str) -> bool:
    """True when a title announces itself as a bug — `Bug: …`.

    `\\b` after the word, so `Bugfix …` does not match: a title that starts by naming the fix
    is describing work, not reporting a defect.
    """
    return bool(re.match(r"\s*bug\b", title or "", re.IGNORECASE))


def kind(number: str | int, data: dict | None = None) -> str:
    """Classify an issue as `epic`, `bug` or `story`. An unprocessed issue is a STORY.

    Each classification needs a durable marker — its label, or a title that announces it.
    Durable is the point: it survives the run, so nothing has to re-derive it next time.

    ⚠️ EPIC WINS over bug, so an issue carrying both markers resolves one way every time. The
    two mean different things — epic is a size, bug is an origin — and nothing sensible happens
    if a run has to guess which it is.

    Deliberately NOT inferred from having sub-issues. A story has those too — they are its
    tasks — so that inference only ever worked because a shaped story also had a branch, and
    it read an unshaped story with tasks as an epic.

    A maintainer saying "this is an epic" in a comment is not read here. A regex for the word
    misfires on an ordinary sentence like "a story under the Claude Team epic", and a false
    positive makes the Architect decompose a story into sub-stories. The model weighs the
    comment against this default instead.

    ⚠️ FALLS BACK TO "story" ON A FAILED READ, because issue() returns {} for both "no such
    issue" and "the API said no" — and a story is the right default for an issue that exists.
    A caller that WRITES based on the answer must therefore check the read itself: pass `data`
    in and confirm it has a title first, or a rate-limited minute relabels an epic as a story.
    """
    data = data if data is not None else issue(number, "title", "labels")
    names = {(l.get("name") or "").lower() for l in data.get("labels", [])}
    title = data.get("title") or ""

    if EPIC_LABEL in names or titled_epic(title):
        return "epic"
    if BUG_LABEL in names or titled_bug(title):
        return "bug"
    return "story"


def is_epic(number: str | int) -> bool:
    return kind(number) == "epic"


def story_from_branch(branch: str) -> str:
    """A story branch is `<story#>-<summary>`, so the leading number names the story.

    Do not replace this with a walk up the issue tree. Deriving a task as "an issue whose
    parent has a parent" assumes every story sits under an epic, and they do not — a
    parentless story resolves each of its tasks to itself.
    """
    found = re.match(r"(\d+)", branch or "")
    return found.group(1) if found else ""


# ── one marked comment, rewritten in place ──────────────────────────────────────────────


def run_footer() -> str:
    """A trailing line linking the Actions run that wrote a comment, or "" outside Actions.

    ⚠️ Every hook-written comment carries this. The model's own tracking comment already links
    its job, so a run that produced BOTH reads as one story; a status comment without it is a
    dead end — the maintainer sees what changed and has no way back to why.

    `GITHUB_REPOSITORY` and `GITHUB_RUN_ID` are set for every step, so nothing has to be
    threaded through the workflow. Empty when run by hand, which keeps local output clean.

    These comments are rewritten in place, so the link always names the run that LAST touched
    it — which is the run whose reasoning explains what is on screen.
    """
    repo = os.environ.get("GITHUB_REPOSITORY") or REPO
    run = os.environ.get("GITHUB_RUN_ID")
    if not (repo and run):
        return ""
    return f"\n---\n<sub>Written by [this run](https://github.com/{repo}/actions/runs/{run}).</sub>\n"


def upsert_comment(number: str | int, marker: str, body: str) -> bool:
    """Create or update the single comment carrying `marker` on an issue or PR.

    Rewriting one comment rather than adding another is deliberate: an epic with ten tasks
    across three roles would otherwise bury itself in thirty comments.
    """
    comments = gh_json("api", f"repos/{REPO}/issues/{number}/comments", "--paginate")
    existing = None
    if isinstance(comments, list):
        for comment in comments:
            if marker in (comment.get("body") or ""):
                existing = comment["id"]

    if existing is not None:
        done = gh(
            "api", "--method", "PATCH", f"repos/{REPO}/issues/comments/{existing}",
            "-f", f"body={body}",
        )
    else:
        done = gh(
            "api", f"repos/{REPO}/issues/{number}/comments", "-f", f"body={body}",
        )
    return done is not None
