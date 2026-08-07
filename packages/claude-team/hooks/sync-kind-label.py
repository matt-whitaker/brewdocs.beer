#!/usr/bin/env python3
"""Post-hook for the Architect. Applies the CLASSIFICATION label an issue's kind calls for —
`epic`, `bug` or `story` — and never removes one.

DERIVED FROM THE TITLE, which the Architect must write anyway. Asking the model to also
remember a `gh` call is the shape that fails — the manifest it was told to leave got written
once across nine epics. A title it cannot avoid producing is a reliable trigger; an
instruction it can skip is not.

⚠️ CLASSIFICATION LABELS ONLY. `epic` and `bug` say what an issue *is*, and a run may derive
one. The routing labels (`@claude`, `@claude/<role>`) say what should happen to it, belong to
the maintainer, and are a record of what has already run — nothing here touches those.

⚠️ ASKS team.kind(), NOT THE TITLE. It used to read the title alone, which worked while only
`epic` and `bug` announced themselves — a story has no title prefix to match, so it would
never have been labelled. kind() reads label-or-title with the precedence already defined
once, so an issue already labelled `bug` cannot also be handed `story` as a fallback.

Only ever adds. If the maintainer labelled or titled something, that is the classification and
this run keeps it.
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
# ⚠️ Every issue has a title, so its absence means the READ failed, not that the issue is
# plain. kind() defaults to "story" either way, and writing on that would label an epic
# `story` for the duration of a rate limit — do nothing instead.
if not data.get("title"):
    team.warn(f"could not read #{ISSUE} — leaving its labels alone rather than guessing.")
    raise SystemExit(0)

wanted = team.KIND_LABELS[team.kind(ISSUE, data)]

if any((l.get("name") or "").lower() == wanted for l in data.get("labels", [])):
    print(f"#{ISSUE} is already labelled {wanted}.")
    raise SystemExit(0)

if team.gh("api", f"repos/{team.REPO}/issues/{ISSUE}/labels",
           "-f", f"labels[]={wanted}") is not None:
    print(f"#{ISSUE} -> {wanted}")
else:
    team.warn(f"could not label #{ISSUE} — does the '{wanted}' label exist in this repo?")
