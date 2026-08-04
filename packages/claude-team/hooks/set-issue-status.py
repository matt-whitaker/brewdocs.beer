#!/usr/bin/env python3
"""Sets an issue's Status on the project board.

Parameterised on STATUS so one hook serves every caller — an author starting work, and an
issue arriving on the board. Two hooks running the same GraphQL against the same field would
drift the moment one is fixed and the other is not.

PROJECT_OWNER, PROJECT_NUMBER and STATUS are INPUTS: the mechanism is package-side, the
values belong to the consuming repo.

This is one of the two places PROJECTS_TOKEN may appear. Step env is per-step, so a model
step in the same job cannot read it.
"""

import os

import team

STATUS = os.environ.get("STATUS") or team.fail("STATUS is required")
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

# don't resurrect finished work: a re-run on a closed issue leaves the board alone
if team.issue_state(ISSUE) != "OPEN":
    print(f"#{ISSUE} is closed — leaving its board status alone.")
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
item = next(
    (
        i for i in listing.get("items", [])
        if (i.get("content") or {}).get("type") == "Issue"
        and (i.get("content") or {}).get("number") == int(ISSUE)
    ),
    None,
)
if not item:
    team.warn(f"Issue #{ISSUE} is not on project {PROJECT} — skipping.")
    raise SystemExit(0)

if item.get("status") == STATUS:
    print(f"#{ISSUE} is already {STATUS}.")
    raise SystemExit(0)

team.gh(
    "project", "item-edit", "--id", item["id"], "--project-id", project["id"],
    "--field-id", status_field["id"], "--single-select-option-id", option["id"],
)
print(f"#{ISSUE} -> {STATUS}")
