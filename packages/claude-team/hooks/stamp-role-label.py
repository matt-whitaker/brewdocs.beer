#!/usr/bin/env python3
"""Pre-hook for every role. Stamps `@claude/<role>` on the issue or PR that triggered the
run, so the labels read as "these agents have been here".

Deterministic on purpose: this used to be an instruction in each prompt, which cost a model
turn and could simply be skipped. A label the maintainer clears as a check-off is worth
nothing if a run can forget to apply it.
"""

import os

import team

ROLE = os.environ.get("ROLE") or team.fail("ROLE is required")
NUMBER = os.environ.get("NUMBER", "")

if not team.REPO:
    team.fail("REPO is required")

if not NUMBER:
    print("No issue or PR number on this event — nothing to stamp.")
    raise SystemExit(0)

# the /labels endpoint serves pull requests too; a repeat add is a no-op
if team.gh("api", f"repos/{team.REPO}/issues/{NUMBER}/labels",
           "-f", f"labels[]=@claude/{ROLE}") is not None:
    print(f"#{NUMBER} -> @claude/{ROLE}")
else:
    team.warn(f"could not stamp @claude/{ROLE} on #{NUMBER} — does the label exist in this repo?")
