#!/usr/bin/env python3
"""Ensures an issue is ON the project board, with the Status it should have.

Parameterised on STATUS so one hook serves every caller — an author starting work, and an
issue arriving on the board. Two hooks running the same GraphQL against the same field would
drift the moment one is fixed and the other is not.

PROJECT_OWNER, PROJECT_NUMBER and STATUS are INPUTS: the mechanism is package-side, the
values belong to the consuming repo. ONLY_IF_UNSET and INCLUDE_SUB_ISSUES tune it for the two
callers — an Architect placing what it just shaped, and an author claiming a task.

This is one of the two places PROJECTS_TOKEN may appear. Step env is per-step, so a model
step in the same job cannot read it.
"""

import os

import team

STATUS = os.environ.get("STATUS") or team.fail("STATUS is required")
# write the status only when the item has none — see place()
ONLY_IF_UNSET = os.environ.get("ONLY_IF_UNSET", "").lower() == "true"
# also place the issue's children: a story's tasks, or an epic's stories
INCLUDE_SUB_ISSUES = os.environ.get("INCLUDE_SUB_ISSUES", "").lower() == "true"
ISSUE = os.environ.get("ISSUE", "")
OWNER = os.environ.get("PROJECT_OWNER", "")
PROJECT = os.environ.get("PROJECT_NUMBER", "")

if not team.REPO:
    team.fail("REPO is required")

if not ISSUE:
    print("Not triggered on an issue — nothing to move.")
    raise SystemExit(0)

token = os.environ.get("PROJECTS_TOKEN", "")
if not token:
    team.warn(f"PROJECTS_TOKEN is not set — cannot set #{ISSUE} to {STATUS}.")
    raise SystemExit(0)

os.environ["GH_TOKEN"] = token

# `--owner "@me"`, never the literal login: gh otherwise probes user-vs-org, which needs
# read:org and fails with a bare "unknown owner type".
project = team.gh_json("project", "view", PROJECT, "--owner", OWNER, "--format", "json")
if not project:
    team.warn(
        f"PROJECTS_TOKEN cannot reach project {PROJECT} — needs 'read:org' as well as 'project'."
    )
    raise SystemExit(0)

fields = team.gh_json("project", "field-list", PROJECT, "--owner", OWNER, "--format", "json") or {}
status_field = next(
    (f for f in fields.get("fields", []) if f.get("name") == "Status"), None
)
option = next(
    (o for o in (status_field or {}).get("options", []) if o.get("name") == STATUS), None
)
if not option:
    team.warn(f"Project {PROJECT} has no Status option named '{STATUS}' — skipping.")
    raise SystemExit(0)

listing = team.gh_json(
    "project", "item-list", PROJECT, "--owner", OWNER, "--format", "json", "--limit", "500"
) or {}
on_board = {
    (i.get("content") or {}).get("number"): i
    for i in listing.get("items", [])
    if (i.get("content") or {}).get("type") == "Issue"
}


def place(number: str | int) -> None:
    """Put an issue on the board and set its Status.

    ⚠️ ADDING IS PART OF THE JOB, and used to be nobody's. This warned "not on project —
    skipping" and left it there, while the only other candidate — a model told to run
    `gh project item-add` — has no PROJECTS_TOKEN and cannot authenticate. So an
    Architect-created issue reached the board only if the maintainer added it by hand. "Set the
    status" and "be on the board" are one intent; splitting them across a hook that would not
    add and a model that could not is what left the gap.
    """
    if team.issue_state(number) != "OPEN":
        print(f"#{number} is closed — leaving its board status alone.")
        return

    item = on_board.get(int(number))
    if not item:
        added = team.gh_json(
            "project", "item-add", PROJECT, "--owner", OWNER,
            "--url", f"https://github.com/{team.REPO}/issues/{number}", "--format", "json",
        )
        if not (added or {}).get("id"):
            team.warn(f"could not add #{number} to project {PROJECT}")
            return
        print(f"#{number} -> added to project {PROJECT}")
        item = {"id": added["id"], "status": None}

    current = item.get("status")
    if current == STATUS:
        print(f"#{number} is already {STATUS}.")
        return
    # ⚠️ The Architect can be re-run on a story that is already In Progress. Without this the
    # re-shape would knock live work back to Todo, so the placing caller sets the flag and the
    # authors' caller does not — moving to In Progress *should* override whatever was there.
    if ONLY_IF_UNSET and current:
        print(f"#{number} is already {current} — leaving it.")
        return

    if team.gh(
        "project", "item-edit", "--id", item["id"], "--project-id", project["id"],
        "--field-id", status_field["id"], "--single-select-option-id", option["id"],
    ) is None:
        team.warn(f"could not set #{number} to {STATUS}")
        return
    print(f"#{number} -> {STATUS}")


place(ISSUE)

# An Architect run produces a story AND its tasks (or an epic and its stories). Placing only the
# triggering issue would leave everything it just created invisible on the board.
if INCLUDE_SUB_ISSUES:
    for child in team.sub_issues(ISSUE):
        place(child["number"])
