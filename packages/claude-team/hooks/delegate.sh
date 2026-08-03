#!/usr/bin/env bash
# Decides which role handles an event, from issue state. Emits `roles`, `story`, `defaulted`
# and `reason` to $GITHUB_OUTPUT; every role job gates on `roles`.
#
# ⚠️ THIS IS A SHELL SCRIPT ON PURPOSE. Routing was going to be a model step emitting JSON,
# and that is the pattern this repo has been bitten by most — a model asked to produce data
# that a consumer depends on. Putting it in front of *every* role makes it the one place a
# bad decision costs the whole run. Almost none of this needs judgement: it is all readable
# state. The one call that does — Implementor vs Designer — is answered by the Architect at
# task-creation time and written into the task as a `Role:` line, which rule 4 reads.
#
# Precedence:
#   1. a @claude/<role> handle in the comment wins outright
#   2. a PR         -> resolve its story, default to implementor
#   3. no Branch line and no sub-issues -> architect
#   4. sub-issues that are stories      -> architect (an epic)
#   5. a Branch line and a parent       -> the role stamped on the task
set -euo pipefail

: "${REPO:?REPO is required}"

ROLES=""; STORY=""; DEFAULTED=false; REASON=""

emit() {
    if [ -n "${GITHUB_OUTPUT:-}" ]; then
        {
            echo "roles=$ROLES"
            echo "story=$STORY"
            echo "defaulted=$DEFAULTED"
            echo "reason=$REASON"
        } >> "$GITHUB_OUTPUT"
    fi
    echo "roles=$ROLES story=${STORY:-none} defaulted=$DEFAULTED — $REASON"
}

# ⚠️ Unroutable is a comment, not a skip. A silent no-op is indistinguishable from the
# workflow being broken, which is the failure this repo keeps rediscovering.
unroutable() {
    REASON="$1"
    echo "::warning::$REASON"
    if [ -n "${NUMBER:-}" ]; then
        gh issue comment "$NUMBER" --repo "$REPO" \
            --body "🔔 I could not work out which role should handle this — $REASON. Name one explicitly with \`@claude/<role>\`." >/dev/null 2>&1 || true
    fi
    emit
    exit 0
}

# ---- 1. an explicit handle wins, with no further inspection
for r in architect implementor tester writer designer; do
    case "${COMMENT_BODY:-}" in
        *"@claude/$r"*) ROLES="$r"; REASON="handle @claude/$r in the comment"; emit; exit 0 ;;
    esac
done

# ---- 2. triggered on a PR: resolve its story, default to implementor
if [ "${IS_PR:-false}" = "true" ]; then
    [ -n "${NUMBER:-}" ] || unroutable "a PR trigger with no number"
    STORY=$(gh pr view "$NUMBER" --repo "$REPO" --json closingIssuesReferences \
        --jq '.closingIssuesReferences[0].number // empty' 2>/dev/null || true)
    # ⚠️ closingIssuesReferences only populates when the PR targets the default branch —
    # GitHub ignores closing keywords otherwise. Fall back to the body for anything else.
    if [ -z "$STORY" ]; then
        STORY=$(gh pr view "$NUMBER" --repo "$REPO" --json body --jq '.body // ""' 2>/dev/null \
            | grep -oiE '(clos|fix|resolv)[a-z]* +#[0-9]+' | head -1 | grep -oE '[0-9]+' || true)
    fi
    ROLES="implementor"
    if [ -z "$STORY" ]; then
        DEFAULTED=true
        REASON="PR #$NUMBER resolves to no story; defaulting to implementor"
    else
        REASON="PR #$NUMBER follow-up on story #$STORY; defaulting to implementor"
    fi
    emit; exit 0
fi

[ -n "${NUMBER:-}" ] || unroutable "no issue or PR number on this event"

body=$(gh issue view "$NUMBER" --repo "$REPO" --json body --jq '.body // ""')
branch=$(printf '%s' "$body" | grep -oiE 'branch: *`[^`]+`' | head -1 | sed -E 's/.*`([^`]+)`.*/\1/' || true)
kids=$(gh api "repos/$REPO/issues/$NUMBER/sub_issues" --jq 'length' 2>/dev/null || echo 0)
parent=$(gh api "repos/$REPO/issues/$NUMBER/parent" --jq '.number' 2>/dev/null || true)

# ---- 3 & 4. nothing shaped yet, or an epic holding stories -> architect
if [ -z "$branch" ] && [ "$kids" -eq 0 ]; then
    ROLES="architect"; REASON="#$NUMBER has no branch and no sub-issues — needs shaping"
    emit; exit 0
fi

if [ -z "$branch" ] && [ "$kids" -gt 0 ]; then
    ROLES="architect"; REASON="#$NUMBER has $kids sub-issues and no branch — an epic"
    emit; exit 0
fi

# ---- 5. a task or a story with a branch: use the stamped role
if [ -n "$branch" ]; then
    # ⚠️ The story is not simply the parent. A task's parent IS its story, but a story's
    # parent is its epic. A branch is named `<story#>-<summary>`, so the number it starts
    # with is the story — self for a story, the parent for a task.
    STORY=$(printf '%s' "$branch" | grep -oE '^[0-9]+' || true)
    [ -n "$STORY" ] || STORY="${parent:-$NUMBER}"

    stamped=$(printf '%s' "$body" | grep -oiE 'role: *`?[a-z]+`?' | head -1 \
        | sed -E 's/.*[Rr]ole: *`?([a-z]+)`?.*/\1/' || true)
    case "$stamped" in
        implementor|tester|writer|designer)
            ROLES="$stamped"; REASON="#$NUMBER is stamped Role: $stamped" ;;
        *)
            # ⚠️ A missing stamp is #425's failure moved one step upstream: rule 5 depends on
            # the Architect having written it. Default rather than stall — an author on the
            # wrong kind of task is recoverable, nothing running is not — but say so.
            ROLES="implementor"; DEFAULTED=true
            if [ "$kids" -gt 0 ]; then
                REASON="#$NUMBER is a story with $kids task(s) and no Role: stamp; defaulting to implementor — you probably meant to trigger one of its tasks"
            else
                REASON="#$NUMBER carries no Role: stamp; defaulting to implementor"
            fi ;;
    esac
    emit; exit 0
fi

unroutable "#$NUMBER matched no routing rule"
