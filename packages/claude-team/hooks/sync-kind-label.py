#!/usr/bin/env python3
"""Post-hook for the Architect. Applies the CLASSIFICATION label an issue's title announces —
`epic` or `bug` — and never removes one.

DERIVED FROM THE TITLE, which the Architect must write anyway. Asking the model to also
remember a `gh` call is the shape that fails — the manifest it was told to leave got written
once across nine epics. A title it cannot avoid producing is a reliable trigger; an
instruction it can skip is not.

⚠️ CLASSIFICATION LABELS ONLY. `epic` and `bug` say what an issue *is*, and a run may derive
one. The routing labels (`@claude`, `@claude/<role>`) say what should happen to it, belong to
the maintainer, and are a record of what has already run — nothing here touches those.

Only ever adds. If the maintainer labelled or titled something, that is the classification and
this run keeps it. A title announcing nothing leaves the labels alone entirely: a plain story
carries no classification label, and that absence is what says so.
"""

from __future__ import annotations

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

# Same precedence as team.kind(): epic wins, so an issue titled both ways resolves one way.
if team.titled_epic(title):
    wanted = team.EPIC_LABEL
elif team.titled_bug(title):
    wanted = team.BUG_LABEL
else:
    print(f"#{ISSUE} announces no classification in its title — leaving its labels alone.")
    raise SystemExit(0)

if any((l.get("name") or "").lower() == wanted for l in data.get("labels", [])):
    print(f"#{ISSUE} is already labelled {wanted}.")
    raise SystemExit(0)

if team.gh("api", f"repos/{team.REPO}/issues/{ISSUE}/labels",
           "-f", f"labels[]={wanted}") is not None:
    print(f"#{ISSUE} -> {wanted}")
else:
    team.warn(f"could not label #{ISSUE} — does the '{wanted}' label exist in this repo?")
