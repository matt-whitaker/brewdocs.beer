#!/usr/bin/env python3
"""Post-hook for every role that opens a PR. Does the two things a prompt kept being asked
to remember:

  1. labels the PR with the role(s) that worked it
  2. makes sure the body carries `Closes #<issue>`

(2) is the one that silently loses work: close-merged-work finds what a PR finished by
parsing that keyword, so a missing line means the issue never closes and never reaches Done,
with nothing to signal it.

ROLES is a space-separated list because the authoring roles are gated steps in ONE job and
this runs once at the end of it. A single role is a list of one; the PR should carry the
whole trail, not whichever ran last.
"""

import os
import re
import subprocess

import team

ROLES = os.environ.get("ROLES") or team.fail("ROLES is required")
ISSUE = os.environ.get("ISSUE", "")

if not team.REPO:
    team.fail("REPO is required")

branch = subprocess.run(
    ["git", "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True, text=True, check=False
).stdout.strip()

pr = ""
if branch and branch != "HEAD":
    found = team.gh_json(
        "pr", "list", "--repo", team.REPO, "--head", branch, "--state", "open", "--json", "number"
    )
    if found:
        pr = str(found[0]["number"])

# the model may have moved off the branch it pushed; fall back to the issue
if not pr and ISSUE:
    listing = team.gh_json(
        "pr", "list", "--repo", team.REPO, "--state", "open", "--json", "number,body"
    ) or []
    closes = re.compile(rf"(?i)(clos|fix|resolv)[a-z]*\s+#{ISSUE}\b")
    match = next((p for p in listing if closes.search(p.get("body") or "")), None)
    if match:
        pr = str(match["number"])

if not pr:
    print("This run opened no PR — nothing to finish.")
    raise SystemExit(0)

for role in ROLES.split():
    if team.gh("pr", "edit", pr, "--repo", team.REPO, "--add-label", f"@claude/{role}") is not None:
        print(f"PR #{pr} -> @claude/{role}")
    else:
        team.warn(f"could not label PR #{pr} — does @claude/{role} exist in this repo?")

if not ISSUE:
    print("No triggering issue — nothing to close.")
    raise SystemExit(0)

body = (team.gh_json("pr", "view", pr, "--repo", team.REPO, "--json", "body") or {}).get("body") or ""
if re.search(rf"(?i)(clos|fix|resolv)[a-z]*\s+#{ISSUE}\b", body):
    print(f"PR #{pr} already closes #{ISSUE}.")
    raise SystemExit(0)

team.gh("pr", "edit", pr, "--repo", team.REPO, "--body", f"{body}\n\nCloses #{ISSUE}\n")
print(f"PR #{pr} -> added 'Closes #{ISSUE}'")
