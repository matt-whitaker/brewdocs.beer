#!/usr/bin/env python3
"""Post-hook for the authoring job. Puts the author's JSON handoff on the STORY'S ISSUE, as
one marked comment per task, so a later role can read it.

The schema was never the broken half. `--json-schema` forces the author to emit both keys,
so `[]` stays distinguishable from "forgot". What failed is that `structured_output` is a
STEP output: it dies with the job, and the Tester and Writer now run as their own tasks.
Only the transport lives here; the guarantee is unchanged.

The issue, not the story's PR: under sub-branching the story branch is empty until the first
task PR merges into it, so its PR does not exist while the first author is running.

Deterministic at both ends, which is what separates this from asking a model to leave a
machine-readable block behind — the schema forces production, this forces delivery.
"""

import os

import team

HANDOFF = os.environ.get("HANDOFF", "")
ISSUE = os.environ.get("ISSUE", "")
STORY = os.environ.get("STORY", "")
ROLES = os.environ.get("ROLES", "").strip()

if not team.REPO:
    team.fail("REPO is required")

if not HANDOFF:
    print("No handoff to post — no author ran, or its step failed.")
    raise SystemExit(0)

if not ISSUE:
    print("Not triggered on an issue — nowhere to attribute a handoff.")
    raise SystemExit(0)

target = STORY or ISSUE

# One comment per TASK, not per story. A story has several authoring tasks and each has its
# own handoff; keying the marker on the story would let the last one overwrite the rest.
marker = f"<!-- claude-team:handoff:{ISSUE} -->"
body = (
    f"{marker}\n"
    f"### Handoff — #{ISSUE}{f' ({ROLES})' if ROLES else ''}\n\n"
    "Machine-written, schema-enforced. `testingNotes` are for the Tester,\n"
    "`docsCandidates` for the Writer. An empty array is a real answer — it means the\n"
    "author considered it and found nothing, which is not the same as a missing key.\n\n"
    f"```json\n{HANDOFF}\n```\n"
)

if team.upsert_comment(target, marker, body + team.run_footer()):
    print(f"posted the handoff for #{ISSUE} on story #{target}")
else:
    team.warn(f"could not post the handoff on #{target}")
