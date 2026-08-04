#!/usr/bin/env python3
"""Post-hook for the Architect. Applies the `epic` label to an issue whose title says it is
one, and never removes it.

DERIVED FROM THE TITLE, which the Architect must write anyway. Asking the model to also
remember a `gh` call is the shape that fails — the manifest it was told to leave got written
once across nine epics. A title it cannot avoid producing is a reliable trigger; an
instruction it can skip is not.

Only ever adds. If the maintainer labelled or titled something an epic, that is the
classification and this run keeps it.
"""

import os

import team

ISSUE = os.environ.get("ISSUE", "")

if not team.REPO:
    team.fail("REPO is required")

if not ISSUE:
    print("Not triggered on an issue — nothing to label.")
    raise SystemExit(0)

data = team.issue(ISSUE, "title", "labels")
title = data.get("title") or ""

if not team.titled_epic(title):
    print(f'#{ISSUE} is not titled as an epic — leaving its labels alone.')
    raise SystemExit(0)

if any((l.get("name") or "").lower() == team.EPIC_LABEL for l in data.get("labels", [])):
    print(f"#{ISSUE} is already labelled {team.EPIC_LABEL}.")
    raise SystemExit(0)

if team.gh("api", f"repos/{team.REPO}/issues/{ISSUE}/labels",
           "-f", f"labels[]={team.EPIC_LABEL}") is not None:
    print(f"#{ISSUE} -> {team.EPIC_LABEL}")
else:
    team.warn(f"could not label #{ISSUE} — does the '{team.EPIC_LABEL}' label exist in this repo?")
