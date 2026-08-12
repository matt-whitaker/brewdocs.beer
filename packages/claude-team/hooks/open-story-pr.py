#!/usr/bin/env python3
"""Runs on every merged PR. Opens the STORY's PR the first time a task PR lands on a story
branch, so the story is reviewable as it accumulates rather than arriving whole.

IT RUNS HERE, NOT IN AN AUTHORING RUN, and that is forced rather than chosen. Under
sub-branching an author commits to its own task branch, so the story branch stays empty until
a task PR merges into it — and GitHub will not open a PR with no commits between base and
head. The first task merge is the earliest moment the story's PR can exist.

BASE is the merged PR's base ref. A task PR's base is the story branch; a story PR's base is
the default branch. So a story branch base means "a task just landed".
"""

import os

import team

BASE = os.environ.get("BASE", "")

if not team.REPO:
    team.fail("REPO is required")

repo = team.gh_json("repo", "view", team.REPO, "--json", "defaultBranchRef") or {}
default = (repo.get("defaultBranchRef") or {}).get("name") or ""

if not BASE or BASE == default:
    print(f"Merged into {BASE or '?'} — not a story branch, nothing to open.")
    raise SystemExit(0)

# A story branch is `<story#>-<summary>`. The number it starts with is the story — the same
# derivation delegate uses, so the two cannot disagree about which issue a branch belongs to.
story = team.story_from_branch(BASE)
if not story:
    team.warn(f"base {BASE} does not start with an issue number — cannot resolve its story.")
    raise SystemExit(0)

existing = team.gh_json(
    "pr", "list", "--repo", team.REPO, "--head", BASE, "--state", "open", "--json", "number"
)
if existing:
    print(f"PR #{existing[0]['number']} already open for {BASE}.")
    raise SystemExit(0)

compare = team.gh_json("api", f"repos/{team.REPO}/compare/{default}...{BASE}") or {}
if not compare.get("ahead_by"):
    print(f"{BASE} is not ahead of {default} — nothing to open a PR for.")
    raise SystemExit(0)

title = team.issue(story, "title").get("title") or f"Story #{story}"
tasks = team.sub_issues(story)

lines = [
    f"Story PR for `{BASE}`.",
    "",
    "⚠️ **This PR stays open until the story is complete.** Each task lands here by its",
    "own PR into this branch, so it grows as the story does — code, tests and docs",
    "together — rather than arriving as several. One task merging is not a signal to",
    "merge this.",
    "",
    f"Closes #{story}",
]
if tasks:
    lines += ["", "### Tasks", ""]
    for task in tasks:
        mark = "x" if task.get("state") == "closed" else " "
        lines.append(f"- [{mark}] #{task['number']} — {task.get('title', '')}")
    # Each task is closed by its OWN PR merging into this branch, so this list needs no
    # closing keywords — and must not carry them. Repeating them here would make the story's
    # merge re-close tasks already done, and close any that were abandoned rather than
    # finished.
    lines += ["", "Each is closed by its own PR merging into this branch."]

if team.gh(
    "pr", "create", "--repo", team.REPO, "--base", default, "--head", BASE,
    "--title", title, "--body", "\n".join(lines) + "\n",
) is not None:
    print(f"opened the story PR for {BASE}")
else:
    # ⚠️ FAILS THE STEP, and that is the whole lesson of this hook's history. It warned instead,
    # for as long as it existed, while `pull-requests: read` made the create 403 every single
    # time — so it never once worked, the job stayed green, and the docs went on describing it as
    # the mechanism. A story branch then sat unmerged with nobody looking, and its work was lost
    # (#735/#815).
    #
    # ⚠️ Reaching this line means a PR genuinely should exist: every benign case — merged into the
    # default branch, an unresolvable story, a PR already open, a branch not ahead — returned
    # earlier. So there is no legitimate reason to be here and quiet.
    team.fail(f"could not open the story PR for {BASE} — open it by hand.")
