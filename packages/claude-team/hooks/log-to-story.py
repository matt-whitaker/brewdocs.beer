#!/usr/bin/env python3
"""Keeps ONE rolling comment on a story listing its tasks in the order they should be
triggered, with what is done, what is ready, and what is waiting on something earlier.

Every task is triggered by hand, so "which one next" is a question the maintainer asks
constantly. log-to-epic answers it only for a story that sits under an epic; a standalone
story had no board at all.

NOTHING HERE IS WRITTEN BY A MODEL. Order is derived from two things the Architect must
produce for other reasons:

  phase   from the `Role:` stamp — the writer precedes the authors, which precede the tester
  number  within a phase, because it creates tasks in the order it intends them to run

A third stamp naming an order would be a third line it could skip. These two cannot be
skipped without breaking routing itself.
"""

import os

import team

STORY = os.environ.get("STORY", "")
MARKER = "<!-- claude-team:storylog -->"

if not team.REPO:
    team.fail("REPO is required")

if not STORY:
    print("No story in scope — nothing to order.")
    raise SystemExit(0)

if not team.sub_issues(STORY):
    print(f"#{STORY} has no tasks — nothing to order.")
    raise SystemExit(0)


# ⚠️ SHARED WITH trigger-next-task.py via team.ordered_tasks/next_open_task. This used to
# compute the order here; a second hook now acts on the answer, and two derivations of "which
# task is next" would mean a status comment and an automatic trigger disagreeing.
rows = team.ordered_tasks(STORY)
nxt = team.next_open_task(rows)

lines = [MARKER, "## Tasks, in trigger order", ""]
if nxt:
    lines += [
        f"**Trigger next — #{nxt['number']}**  ",
        f"{nxt['title']}  ",
        f"`Role: {nxt['role']}`",
        "",
    ]
else:
    lines += ["_Every task is closed — the story is ready to review._", ""]

lines += ["| | task | role | state |", "|---|---|---|---|"]
for row in rows:
    if row["state"] == "closed":
        mark = "✅ done"
    elif nxt and row["number"] == nxt["number"]:
        mark = "⬜ **ready**"
    else:
        mark = "⏸ waiting"
    lines.append(f"| {row['phase']} | #{row['number']} {row['title']} | `{row['role']}` | {mark} |")

lines += [
    "",
    "Order is derived — authors, then tests, then docs; by issue number within each.",
    "Rewritten automatically whenever a task changes state.",
]

if team.upsert_comment(STORY, MARKER, "\n".join(lines) + "\n" + team.run_footer()):
    print(f"updated the task order on story #{STORY}")
else:
    team.warn(f"could not update the task order on #{STORY}")
