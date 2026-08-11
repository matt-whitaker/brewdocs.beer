#!/usr/bin/env python3
"""Decides which role handles an event, from issue state. Emits `roles`, `story`, `defaulted`
and `reason` to $GITHUB_OUTPUT; every role job gates on `roles`.

THIS IS A SCRIPT ON PURPOSE. Routing was going to be a model step emitting JSON, and that is
the pattern this repo has been bitten by most — a model asked to produce data a consumer
depends on. Putting it in front of every role makes a bad decision here cost the whole run.
Almost none of this needs judgement: it is all readable state. The one call that does —
Implementor vs Designer — is answered by the Architect at task-creation time and written into
the task as a `Role:` line, which rule 4 reads.

Precedence:
  1. a @claude/<role> handle in the comment wins outright
  1b. a bare @claude in a COMMENT -> the root role, which answers rather than routes
  2. a PR            -> resolve its story, default to implementor
  3. no Branch line  -> researcher for a spike, otherwise architect, told what it is
  4. a Branch line   -> the role stamped on the task

There is no rule keyed on sub-issues. One existed and read "sub-issues that are stories -> an
epic"; #528 removed it, because a story has sub-issues too — they are its tasks. Rule 3 now
asks team.kind(), which wants a durable marker and does not infer.
"""

import os
import re

import team

NUMBER = os.environ.get("NUMBER", "")
COMMENT_BODY = os.environ.get("COMMENT_BODY", "")
IS_PR = os.environ.get("IS_PR", "false") == "true"

if not team.REPO:
    team.fail("REPO is required")

ROLES = STORY = STORY_BRANCH = REASON = KIND = REMEDY = ""
DEFAULTED = False


def report_guess() -> None:
    """Say, where the maintainer looks, that this run routed on a guess.

    ⚠️ `DEFAULTED` was emitted to `$GITHUB_OUTPUT` and declared as a job output for a long time
    with NOTHING READING IT — so "default rather than stall, but say so" said so only in a log
    nobody opens. A required channel with no consumer is the shape that shipped dead three times
    here already (#797).

    ⚠️ UPSERTED, not appended. A re-run that guesses the same way twice is one fact, not two —
    unlike the decisions log, where each round is a separate record worth keeping.

    ⚠️ Carries the REMEDY, not just the guess. A warning the reader cannot act on is noise, and
    the whole point is that the stamp or the branch name is a one-line fix.
    """
    if not (DEFAULTED and NUMBER):
        return
    team.upsert_comment(
        NUMBER,
        "<!-- claude-team:routing-guess -->",
        "<!-- claude-team:routing-guess -->\n"
        f"🔔 **I guessed the role for this one.** Routed to `{ROLES}` because {REASON}.\n\n"
        f"{REMEDY}\n\n"
        "Until then this keeps guessing the same way, which is recoverable but not right."
        + team.run_footer(),
    )


def emit() -> None:
    report_guess()
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as handle:
            handle.write(
                f"roles={ROLES}\nstory={STORY}\nstory_branch={STORY_BRANCH}\nkind={KIND}\n"
                f"defaulted={str(DEFAULTED).lower()}\nreason={REASON}\n"
            )
    print(
        f"roles={ROLES} story={STORY or 'none'} branch={STORY_BRANCH or 'none'} "
        f"kind={KIND or 'n/a'} defaulted={str(DEFAULTED).lower()} — {REASON}"
    )


def unroutable(reason: str) -> None:
    """Unroutable is a comment, not a skip. A silent no-op is indistinguishable from the
    workflow being broken, which is the failure this repo keeps rediscovering."""
    global REASON
    REASON = reason
    team.warn(reason)
    if NUMBER:
        team.gh(
            "issue", "comment", NUMBER, "--repo", team.REPO,
            "--body",
            f"🔔 I could not work out which role should handle this — {reason}. "
            "Name one explicitly with `@claude/<role>`." + team.run_footer(),
        )
    emit()
    raise SystemExit(0)


def resolve_pr_story() -> str:
    """The story a PR belongs to. Every role triggered on a PR gets this, including one named
    by an explicit handle — rule 1 short-circuits the routing *decision*, not the context.

    THE HEAD BRANCH NAMES THE STORY; the closing reference does not. A story branch is
    `<story#>-<summary>`, minted by the Architect; closing refs are whatever the authors
    wrote, and a task's `Closes #<task>` lands in there too. Measured across four real story
    PRs, closingIssuesReferences[0] gave a TASK or an unrelated story in two of them, while
    the branch name was right in all four.
    """
    head = (team.gh_json("pr", "view", NUMBER, "--repo", team.REPO, "--json", "headRefName") or {})
    story = team.story_from_branch(head.get("headRefName") or "")
    if story:
        return story

    # a hand-cut branch with no issue prefix: fall back to what the PR claims to close
    linked = (team.gh_json("pr", "view", NUMBER, "--repo", team.REPO, "--json", "closingIssuesReferences") or {})
    refs = linked.get("closingIssuesReferences") or []
    if refs:
        return str(refs[0]["number"])

    # closingIssuesReferences only populates when the PR targets the default branch — GitHub
    # ignores closing keywords otherwise. Fall back to the body for anything else.
    body = (team.gh_json("pr", "view", NUMBER, "--repo", team.REPO, "--json", "body") or {}).get("body") or ""
    found = re.search(r"(?i)(?:clos|fix|resolv)[a-z]*\s+#(\d+)", body)
    return found.group(1) if found else ""


# ---- 1. an explicit handle wins, with no further inspection
for role in ("architect", "researcher", "implementor", "tester", "writer", "designer", "security"):
    if f"@claude/{role}" in COMMENT_BODY:
        ROLES = role
        REASON = f"handle @claude/{role} in the comment"
        # A handle names the role outright, but it should not cost the role its context.
        # ⚠️ Resolve the story HERE rather than falling through to rule 4 — the
        # short-circuit is the point of a handle, and rule 4 would re-judge the role
        # against issue state and could pick a different one.
        if NUMBER:
            if IS_PR:
                STORY = resolve_pr_story()
                REASON += f"; PR #{NUMBER} belongs to story #{STORY or 'unknown'}"
            else:
                # The Branch line names the STORY's branch on a story and on its tasks
                # alike, so its leading number is the story — the same read rule 4 does.
                # Without this a handle on an issue emitted no story at all while the
                # label path on the very same issue resolved one, and the role paid turns
                # rediscovering what the router already had.
                #
                # No fallback to the issue's own number: an issue with no Branch line is
                # not part of a story, and claiming it is its own would be worse than
                # empty, which every prompt already handles.
                STORY_BRANCH = team.branch_line(team.issue_body(NUMBER))
                STORY = team.story_from_branch(STORY_BRANCH)
                if STORY:
                    REASON += f"; #{NUMBER} belongs to story #{STORY}"
        emit()
        raise SystemExit(0)

# ---- 1b. a bare `@claude` in a COMMENT is a conversation, not a route
#
# ⚠️ COMMENT ONLY. The `@claude` **label** still routes exactly as it always has — that is the
# front door and nothing here touches it. The split is worth stating plainly because it is the
# whole ergonomics of the change: **the label does the work, a comment talks about it.**
#
# Reaching here means rule 1 found no `@claude/<role>` handle, so the trigger named `@claude`
# and nothing more. Previously that fell through to rules 2-4 and started whichever role the
# state implied — so typing "@claude what happened here?" ran an Implementor. Nothing is lost by
# ending it: `@claude/<role>` still names a role outright, and re-adding the label is the
# documented "run again" gesture.
#
# ⚠️ An unknown handle lands here too (`@claude/nonsense` matches no role), and that is the right
# home for it — the root role can say there is no such role, where rule 3 would have silently
# shaped the issue as a story instead.
if COMMENT_BODY and "@claude" in COMMENT_BODY:
    ROLES = "claude"
    REASON = "@claude named in a comment with no role handle — answering rather than routing"
    # the same context a handle gets: being conversational is no reason to arrive uninformed
    if NUMBER:
        if IS_PR:
            STORY = resolve_pr_story()
        else:
            STORY_BRANCH = team.branch_line(team.issue_body(NUMBER))
            STORY = team.story_from_branch(STORY_BRANCH)
    emit()
    raise SystemExit(0)

# ---- 2. triggered on a PR: resolve its story, default to implementor
if IS_PR:
    if not NUMBER:
        unroutable("a PR trigger with no number")
    STORY = resolve_pr_story()
    ROLES = "implementor"
    if STORY:
        REASON = f"PR #{NUMBER} follow-up on story #{STORY}; defaulting to implementor"
    else:
        DEFAULTED = True
        REASON = f"PR #{NUMBER} resolves to no story; defaulting to implementor"
        REMEDY = (
            "**To fix it:** name the head branch `<story#>-<summary>` so the story can be read "
            "off it, or add `Closes #<issue>` to the PR body. The branch name is the primary "
            "route — a closing reference is only the fallback."
        )
    emit()
    raise SystemExit(0)

if not NUMBER:
    unroutable("no issue or PR number on this event")

body = team.issue_body(NUMBER)
branch = team.branch_line(body)
kids = len(team.sub_issues(NUMBER))
parent = team.parent(NUMBER)

# ---- 3. nothing shaped yet -> architect, told what it is looking at
#
# An unprocessed issue is a STORY. An epic or a bug has to say so, by its label or its title —
# see team.kind. This used to infer an epic from having sub-issues, which was wrong: a story
# has those too, and the inference only held because a shaped story also had a branch.
#
# A bug is still a story in shape — one branch, one PR — but it is shaped differently: its body
# is a report someone already grounded, and the Architect is told to preserve it rather than
# rewrite it into a story.
if not branch:
    KIND = team.kind(NUMBER)
    article = "an epic" if KIND == "epic" else f"a {KIND}"
    # ⚠️ A SPIKE IS THE ONE UNSHAPED ISSUE THE ARCHITECT MUST NOT TAKE. Its answer is not known
    # yet, so there is nothing to decompose — handed one, the Architect cuts implementation tasks
    # for a solution nobody has chosen. The Researcher answers it first; the maintainer then
    # decides, and only then is there a story to shape.
    if KIND == "spike":
        ROLES = "researcher"
        REASON = f"#{NUMBER} is a spike — researching it before anything is shaped"
    else:
        ROLES = "architect"
        REASON = f"#{NUMBER} has no branch — shaping it as {article}"
        if kids:
            REASON += f" (it already has {kids} sub-issue(s))"
    emit()
    raise SystemExit(0)

# ---- 4. a task or a story with a branch: use the stamped role
#
# THE BRANCH LINE ALWAYS NAMES THE STORY'S BRANCH, on a story and on its tasks alike, so the
# number it starts with is the story — self for a story, the parent's for a task. That holds
# under sub-branching too: a task's own branch is `<task#>-…`, cut off the story branch and
# merged back into it, but the line still records the story's.
#
# Do NOT "fix" this by walking the issue tree. Deriving a task as "an issue whose parent has
# a parent" assumes every story sits under an epic, and they do not — a parentless story
# resolves each of its tasks to itself. Tried, measured, reverted.
STORY = team.story_from_branch(branch) or (parent or NUMBER)

# The branch STRING, not just the number it starts with. The authoring jobs pass it to the host
# action as `base_branch`, which is what makes the action cut a task's branch off its story's
# branch instead of the default one. Emitting it here costs nothing — the line is already read.
STORY_BRANCH = branch

stamped = team.role_stamp(body)
if stamped in ("implementor", "tester", "writer", "designer"):
    ROLES = stamped
    REASON = f"#{NUMBER} is stamped Role: {stamped}"
else:
    # A missing stamp is a failure moved one step upstream: rule 4 depends on the Architect
    # having written it. Default rather than stall — an author on the wrong kind of task is
    # recoverable, nothing running is not — but say so.
    ROLES = "implementor"
    DEFAULTED = True
    REMEDY = (
        f"**To fix it:** trigger one of #{NUMBER}'s tasks instead — a story is worked through "
        "them, not directly."
        if kids
        else "**To fix it:** add `**Role: implementor|designer|tester|writer**` on its own line "
             "in the body. The Architect normally writes it; an issue filed by hand will not "
             "have one."
    )
    REASON = (
        f"#{NUMBER} is a story with {kids} task(s) and no Role: stamp; defaulting to "
        "implementor — you probably meant to trigger one of its tasks"
        if kids
        else f"#{NUMBER} carries no Role: stamp; defaulting to implementor"
    )
emit()
