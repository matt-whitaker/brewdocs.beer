#!/usr/bin/env python3
"""Keeps ONE rolling work-log comment on an epic, so the maintainer can see the state of the
whole epic in one place and decide what to assign next — without opening every story.

FULLY DERIVED. Nothing here is written by a model. Which issue ran, which roles ran, what is
still open and what comes next are all readable from GitHub, so none of it can be skipped or
misreported. The opposite shape is what this repo keeps being bitten by: sub-issue filing
asked the deciding role to leave a machine-readable manifest, and across nine epics it wrote
one exactly once.

ONE COMMENT, REWRITTEN — not one per run. An epic with ten tasks and three roles each would
otherwise accumulate thirty comments. The status table is rebuilt from live state every time,
so it is never stale; only the Recent lines accumulate, and they are capped.
"""

import datetime as dt
import os
import re

import team

ISSUE = os.environ.get("ISSUE", "")
ROLES = os.environ.get("ROLES", "").strip()
PR = os.environ.get("PR", "")
MARKER = "<!-- claude-team:worklog -->"
KEEP = 12

if not team.REPO:
    team.fail("REPO is required")

if not ISSUE:
    print("Not triggered on an issue — no epic to log against.")
    raise SystemExit(0)

# A task's parent is its story and the story's parent is the epic; a story's parent is the
# epic directly. Walk up at most two levels and stop at whatever has no parent.
p1 = team.parent(ISSUE)
if not p1:
    print(f"#{ISSUE} has no parent — an epic itself, or unparented work. Nothing to log.")
    raise SystemExit(0)
p2 = team.parent(p1)
STORY, EPIC = (p1, p2) if p2 else (ISSUE, p1)

print(f"logging #{ISSUE} (story #{STORY}) against epic #{EPIC}")


def first_open(number: str, exclude: str) -> dict | None:
    return next(
        (k for k in team.sub_issues(number)
         if k.get("state") == "open" and str(k["number"]) != str(exclude)),
        None,
    )


# The next open task of the story just worked; failing that, the next open story of the epic.
# Named with its Role stamp so the maintainer can act on it without opening it.
nxt, scope, kind = first_open(STORY, ISSUE), f"task of story #{STORY}", "task"
if not nxt:
    nxt, scope, kind = first_open(EPIC, STORY), f"story of epic #{EPIC}", "story"

if not nxt:
    next_line = "_Nothing open — the epic looks complete._"
else:
    if kind == "task":
        # Only a TASK carries a `Role:` stamp — it is what routes an author to it. A story is
        # shaped by the Architect and has no stamp by design, so demanding one there would be
        # a standing false alarm on every epic.
        role = team.role_stamp(team.issue_body(nxt["number"]))
        note = (
            f", stamped `Role: {role}`" if role
            else ", **no `Role:` stamp** — the Architect should add one"
        )
    else:
        note = " — label it `@claude` and the Architect will shape it"
    next_line = f"**#{nxt['number']} — {nxt.get('title','')}**  \nnext open {scope}{note}"

table = ["| story | state | tasks |", "|---|---|---|"]
for story in team.sub_issues(EPIC):
    kids = team.sub_issues(story["number"])
    if not kids:
        counts = "—"
    else:
        done = sum(1 for k in kids if k.get("state") == "closed")
        open_ns = " ".join(f"#{k['number']}" for k in kids if k.get("state") == "open")
        counts = f"{done}/{len(kids)}" + (f" · open: {open_ns}" if open_ns else "")
    mark = "✅" if story.get("state") == "closed" else "⬜"
    table.append(f"| #{story['number']} {story.get('title','')} | {mark} {story.get('state','')} | {counts} |")

# carry the previous Recent lines forward
previous: list[str] = []
comments = team.gh_json("api", f"repos/{team.REPO}/issues/{EPIC}/comments", "--paginate") or []
for comment in comments:
    if MARKER in (comment.get("body") or ""):
        after = re.split(r"^### Recent", comment["body"], maxsplit=1, flags=re.M)
        if len(after) > 1:
            previous = [l for l in after[1].splitlines() if l.startswith("- ")]

entry = (
    f"- `{dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%d %H:%M')}` "
    f"**#{ISSUE}** {team.issue(ISSUE, 'title').get('title','')} — {ROLES or '（unknown）'}"
    + (f" · PR #{PR}" if PR else "")
)
recent = ([entry] + previous)[:KEEP]

body = "\n".join(
    [
        MARKER,
        "## Work log",
        "",
        "Rebuilt automatically after every authoring run. Status is read live from the",
        "issues, so it is current as of the newest entry below.",
        "",
        "### Next up",
        "",
        next_line,
        "",
        "### Stories",
        "",
        *table,
        "",
        "### Recent",
        "",
        *recent,
    ]
) + "\n"

if team.upsert_comment(EPIC, MARKER, body):
    print(f"updated the work log on epic #{EPIC}")
else:
    team.warn(f"could not update the work log comment on epic #{EPIC}")
