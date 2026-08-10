#!/usr/bin/env python3
"""Runs on a merged task PR. Labels the story's next task so it starts.

A story's tasks are linear and their order is already derived, so triggering each one by hand
is a click carrying no decision. The maintainer's decision is the MERGE; this makes the merge
the trigger.

⚠️ THE CHAIN CANNOT RUN AWAY, and that is a property of where it is hooked rather than a guard
bolted on. It advances only when a PR merges, and nothing here merges anything — so there is
exactly one human gate per task, the same one that already existed.

⚠️ THIS NEEDS A PAT, and the reason is the whole difficulty. GitHub refuses to start a workflow
run from an event created with `GITHUB_TOKEN`, and `delegate`'s own `if:` excludes
`github-actions[bot]` besides. Labelling with the default token would be WORSE than doing
nothing: the label would sit on the issue having triggered nothing, and firing it would then
need a remove-and-re-add. So an absent token skips loudly rather than labelling uselessly.

⚠️ NOT THE CHAINING THAT WAS REVERTED. That was `needs:` between jobs — followers queued behind
every run and a skipped follower reports as cancelled, so the history filled with them. This is
a fresh run from a `labeled` event: no job graph, nothing queued, nothing to cancel.

⚠️ ORDER IT AFTER `close-merged-work.py`. That hook closes the task this PR just finished, and
until it has, that task is still open — so it would be picked as its own successor and relabelled
forever.
"""

import os

import team

BASE = os.environ.get("BASE", "")
LABEL = os.environ.get("TRIGGER_LABEL", "@claude")
TOKEN = os.environ.get("TRIGGER_TOKEN", "")

if not team.REPO:
    team.fail("REPO is required")

# A task PR's base is its story's branch, `<story#>-<summary>`. A story PR's base is the default
# branch, which has no leading number — so a merging story resolves to nothing and this no-ops,
# which is right: a story merging is the end of the chain, not a link in it.
STORY = team.story_from_branch(BASE)
if not STORY:
    print(f"base {BASE or '(none)'} names no story — nothing to chain.")
    raise SystemExit(0)

rows = team.ordered_tasks(STORY)
if not rows:
    print(f"#{STORY} has no tasks — nothing to chain.")
    raise SystemExit(0)

nxt = team.next_open_task(rows)
if not nxt:
    print(f"every task on #{STORY} is closed — the story is ready to review.")
    raise SystemExit(0)

number = nxt["number"]

# ⚠️ Re-applying a label GitHub already has fires NO `labeled` event, so a second run would
# silently trigger nothing. Say so rather than reporting a chain that did not happen.
labels = {(l.get("name") or "") for l in team.issue(number, "labels").get("labels", [])}
if LABEL in labels:
    print(f"#{number} already carries {LABEL} — leaving it; re-applying would trigger nothing.")
    raise SystemExit(0)

if not TOKEN:
    team.warn(
        f"TRIGGER_TOKEN is not set, so #{number} was NOT triggered — trigger it by hand. "
        f"A label applied with GITHUB_TOKEN starts no run (GitHub will not start a workflow from "
        f"an event it created), so this hook does nothing at all without a PAT that can write "
        f"labels. Set one and the chain runs; leave it and every task is triggered by hand, "
        f"exactly as before."
    )
    raise SystemExit(0)

# the PAT only for the write that has to look like a person; everything above read with the
# default token
os.environ["GH_TOKEN"] = TOKEN

if team.gh("issue", "edit", str(number), "--repo", team.REPO, "--add-label", LABEL) is None:
    team.warn(
        f"could not add {LABEL} to #{number} — trigger it by hand. Does TRIGGER_TOKEN carry "
        f"`repo` scope, and does the label exist?"
    )
    raise SystemExit(0)

print(f"#{STORY} -> triggered #{number} ({nxt['role']}) with {LABEL}")
