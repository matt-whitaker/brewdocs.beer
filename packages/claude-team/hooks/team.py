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

_BRANCH = re.compile(r"branch:\s*`([^`]+)`", re.IGNORECASE)
_ROLE = re.compile(r"role:\s*`?([a-z]+)`?", re.IGNORECASE)


def branch_line(body: str) -> str:
    """The branch an issue names. Always the STORY's branch, on a story and on its tasks."""
    found = _BRANCH.search(body)
    return found.group(1) if found else ""


def role_stamp(body: str) -> str:
    found = _ROLE.search(body)
    return found.group(1).lower() if found else ""


def story_from_branch(branch: str) -> str:
    """A story branch is `<story#>-<summary>`, so the leading number names the story.

    Do not replace this with a walk up the issue tree. Deriving a task as "an issue whose
    parent has a parent" assumes every story sits under an epic, and they do not — a
    parentless story resolves each of its tasks to itself.
    """
    found = re.match(r"(\d+)", branch or "")
    return found.group(1) if found else ""


# ── one marked comment, rewritten in place ──────────────────────────────────────────────


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
