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
    # ⚠️ "No PR" is not automatically "nothing happened". The host action creates its own
    # branch for an issue trigger and tells the model to stay on it, contradicting our
    # prompt — and when the model obeys it, a run's work lands somewhere nobody looks. It
    # happened on a 44-turn run that reported success (#530). Silence there cost days.
    #
    # So before accepting "nothing to finish", check whether this run actually produced
    # commits. If it did, say so loudly and leave the recovery command on the issue.
    stranded = ""
    default = (
        team.gh_json("repo", "view", team.REPO, "--json", "defaultBranchRef") or {}
    ).get("defaultBranchRef", {}).get("name") or ""
    if branch and branch != "HEAD":
        if default:
            ahead = subprocess.run(
                ["git", "rev-list", "--count", f"origin/{default}..HEAD"],
                capture_output=True, text=True, check=False,
            ).stdout.strip()
            if ahead.isdigit() and int(ahead) > 0:
                stranded = f"{ahead} commit(s) on `{branch}`"

    if not stranded:
        print("This run opened no PR — nothing to finish.")
        raise SystemExit(0)

    # ⚠️ OPEN THE PR, do not describe how to. This used to warn and leave a recovery
    # command, which is better than the silence it replaced but still left real work
    # sitting where nobody looks until someone read the comment.
    #
    # ⚠️ A PR, never a push. In the case that prompted this the branches had diverged, so
    # a push would have failed or needed force. A PR is non-destructive, reviewable, and
    # the shape the process wants anyway — work reaches a story branch through one.
    #
    # Base: the story branch the issue names, when it exists and is not what we are on;
    # otherwise the default branch. The host action generates its own branch name from
    # the issue title, which can never match a name the Architect already chose, so this
    # is the case prevention cannot reach.
    base = ""
    if ISSUE:
        named = team.branch_line(team.issue_body(ISSUE))
        if named and named != branch and team.gh(
            "api", f"repos/{team.REPO}/branches/{named}"
        ) is not None:
            base = named
    if not base:
        base = default

    title = (team.issue(ISSUE, "title").get("title") if ISSUE else "") or f"Work from {branch}"
    body = (
        f"Opened automatically: this run left {stranded} with no PR of its own.\n\n"
        f"The host action generates its own branch name, which cannot match a branch the "
        f"Architect already named — see #530. The work is sound; only its PR was missing.\n"
        + (f"\nCloses #{ISSUE}\n" if ISSUE else "")
    )

    if team.gh(
        "pr", "create", "--repo", team.REPO, "--base", base, "--head", branch,
        "--title", title, "--body", body,
    ) is None:
        team.warn(
            f"This run produced {stranded} and I could not open a PR for it. "
            f"Recover with: git push origin origin/{branch}:refs/heads/<the-branch-you-wanted>"
        )
        raise SystemExit(0)

    found = team.gh_json(
        "pr", "list", "--repo", team.REPO, "--head", branch, "--state", "open", "--json", "number"
    )
    if not found:
        team.warn(f"Opened a PR from {branch} but could not read it back to finish it.")
        raise SystemExit(0)
    pr = str(found[0]["number"])
    print(f"opened PR #{pr} from {branch} into {base} — it had {stranded} and none of its own")

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
