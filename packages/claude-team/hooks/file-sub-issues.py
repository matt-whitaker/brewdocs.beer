#!/usr/bin/env python3
"""Post-hook for the Architect. Parents an epic's sub-issues to it and copies the epic's
milestone down.

Children are DISCOVERED, not declared. This used to read a machine-readable manifest the
model left in a comment; across nine epics it wrote one exactly once, so the hook silently
filed nothing. The anchor is now the reference the Architect must already put in every
child's body — `epic #N` or `story #N`.

A manifest is still honoured when one exists, unioned with what was discovered, so epics
decomposed under the old contract keep working.
"""

import json
import os
import re

import team

ISSUE = os.environ.get("ISSUE") or team.fail("ISSUE is required")

if not team.REPO:
    team.fail("REPO is required")

children: set[int] = set()

comments = team.gh_json("api", f"repos/{team.REPO}/issues/{ISSUE}/comments", "--paginate") or []
manifests = [c.get("body") or "" for c in comments if "owner-manifest" in (c.get("body") or "")]
if manifests:
    found = re.search(r"owner-manifest\s*(\{.*?\})\s*-->", manifests[-1], re.S)
    listed = []
    if found:
        try:
            listed = json.loads(found.group(1)).get("children") or []
        except json.JSONDecodeError:
            listed = []
    if listed:
        children.update(int(c) for c in listed)
        print(f"manifest on #{ISSUE} lists:", " ".join(str(c) for c in listed))
    else:
        team.warn(f"#{ISSUE} has an owner-manifest marker with no usable children — ignoring it.")

# The REST list endpoint, never the search API. Issue search is asynchronously indexed and
# these issues are seconds old when this hook runs, so a search would intermittently return
# nothing at all.
#
# Three markers, all required:
#   1. the author is a Bot — the Architect creates sub-issues through the action
#   2. a reference to this parent, as `epic #<N>` or `story #<N>`
#   3. a number above the parent's
#
# The body markers alone are not enough in a repo that documents its own conventions: a
# meta-issue quoting the convention verbatim satisfied every text rule and was adopted as a
# child of the issue it was describing. The author check is what makes this sound.
#
# The consequence is that a sub-issue the maintainer writes BY HAND is never auto-parented.
# That is the intended trade: this hook exists to clean up after the model.
#
# `.number > epic` is both a correctness filter and the pagination bound — a child is always
# created after its epic, so it always has a higher number.
listing = team.gh_json(
    "api", "--paginate",
    f"repos/{team.REPO}/issues?state=all&sort=created&direction=desc&per_page=100",
) or []
# the trailing (non-digit|end) stops `epic #412` from matching `epic #4123`
refers = re.compile(rf"(?i)(epic|story) +#{ISSUE}([^0-9]|$)")
discovered = sorted(
    i["number"] for i in listing
    if not i.get("pull_request")
    and i.get("number", 0) > int(ISSUE)
    and (i.get("user") or {}).get("type") == "Bot"
    and refers.search(i.get("body") or "")
)
if discovered:
    print(f"discovered for #{ISSUE}:", " ".join(str(d) for d in discovered))
else:
    print(f"no issue body references epic/story #{ISSUE}")
children.update(discovered)

if not children:
    print(f"Nothing to file for #{ISSUE}.")
    raise SystemExit(0)

milestone = (team.issue(ISSUE, "milestone").get("milestone") or {}).get("title") or ""
existing = {i["number"] for i in team.sub_issues(ISSUE)}

for child in sorted(children):
    if child in existing:
        print(f"#{child} already a sub-issue of #{ISSUE}")
    else:
        # this API wants the child's integer REST id, not its issue number
        data = team.gh_json("api", f"repos/{team.REPO}/issues/{child}")
        cid = (data or {}).get("id")
        if cid and team.gh(
            "api", "--method", "POST", f"repos/{team.REPO}/issues/{ISSUE}/sub_issues",
            "-F", f"sub_issue_id={cid}",
        ) is not None:
            print(f"#{child} -> sub-issue of #{ISSUE}")
        else:
            team.warn(f"could not parent #{child} to #{ISSUE}")

    if milestone:
        if team.gh("issue", "edit", str(child), "--repo", team.REPO, "--milestone", milestone) is not None:
            print(f"#{child} -> milestone {milestone}")
        else:
            team.warn(f"could not set milestone '{milestone}' on #{child}")
