#!/usr/bin/env bash
# Post-hook for the Researcher. Parents the epic's sub-issues to it and copies the
# epic's milestone down.
#
# Children are DISCOVERED, not declared. This used to read a machine-readable manifest
# the model left in a comment; across nine epics the model wrote one exactly once, so the
# hook silently filed nothing. The anchor now is the reference the Researcher must already
# put in every child's body:
#
#   a story says   Part of epic #412.
#   a task says    **Branch: `412-brewtimer`**   (its story's branch)
#
# A manifest is still honoured when one exists, unioned with what was discovered, so
# epics decomposed under the old contract keep working.
set -euo pipefail

: "${REPO:?REPO is required}"
: "${ISSUE:?ISSUE is required}"

manifest_children=""
manifest=$(gh api "repos/$REPO/issues/$ISSUE/comments" --paginate \
    --jq '[.[] | select(.body | contains("owner-manifest")) | .body] | last // empty')

if [ -n "$manifest" ]; then
    # one line on purpose: a python heredoc indented inside a YAML block would arrive
    # with its leading spaces intact and die on IndentationError
    manifest_children=$(printf '%s' "$manifest" | python3 -c 'import sys,re,json; m=re.search(r"owner-manifest\s*(\{.*?\})\s*-->", sys.stdin.read(), re.S); print("\n".join(str(c) for c in (json.loads(m.group(1)).get("children") or [])) if m else "")' 2>/dev/null || true)
    if [ -n "$manifest_children" ]; then
        echo "manifest on #$ISSUE lists: $(printf '%s' "$manifest_children" | tr '\n' ' ')"
    else
        echo "::warning::#$ISSUE has an owner-manifest marker with no usable children — ignoring it."
    fi
fi

# ⚠️ The REST list endpoint, never the search API. Issue search is asynchronously indexed
# and these issues are seconds old when this hook runs, so a search would intermittently
# return nothing at all. This list is direct and has no such lag.
#
# Three markers, all required:
#
#   1. the author is a Bot — the Researcher creates sub-issues through the action
#   2. a reference to this parent, as `epic #<N>` or `story #<N>`
#   3. a number above the parent's
#
# ⚠️ The body markers alone are not enough in a repo that documents its own conventions:
# a meta-issue quoting the convention verbatim satisfied every text rule and was adopted as
# a child of the issue it was describing. No prose heuristic survives documentation that
# quotes the prose — the author check is what makes this sound, since a human-written issue
# is type User and a Researcher-created one is type Bot.
#
# ⚠️ The consequence is that a sub-issue the maintainer writes BY HAND is never
# auto-parented. That is the intended trade: this hook exists to clean up after the model.
#
# The trailing (non-digit|end) stops `epic #412` from matching `epic #4123`.
#
# `.number > epic` is both a correctness filter and the pagination bound: a child is
# always created after its epic, so it always has a higher number. Without paginating,
# one page of 100 only reached back a few weeks and an older epic re-run found nothing.
#
# EPIC is passed through the environment and read with jq's `env` so this filter can stay
# single-quoted — a double-quoted shell string would treat the backtick before the branch
# name as command substitution. It also keeps everything inside gh's built-in jq, so the
# script needs no standalone jq on PATH.
discovered=$(EPIC="$ISSUE" gh api --paginate \
    "repos/$REPO/issues?state=all&sort=created&direction=desc&per_page=100" \
    --jq '[ .[]
            | select(.pull_request == null)
            | select(.number > (env.EPIC | tonumber))
            | select(.user.type == "Bot")
            | select((.body // "") | test("(?i)(epic|story) +#" + env.EPIC + "([^0-9]|$)"))
            | .number ] | .[]' 2>/dev/null || true)

if [ -n "$discovered" ]; then
    echo "discovered for #$ISSUE: $(printf '%s' "$discovered" | tr '\n' ' ')"
else
    echo "no issue body references epic/story #$ISSUE"
fi

children=$(printf '%s\n%s\n' "$manifest_children" "$discovered" | grep -E '^[0-9]+$' | sort -un || true)

if [ -z "$children" ]; then
    echo "Nothing to file for #$ISSUE."
    exit 0
fi

milestone=$(gh issue view "$ISSUE" --repo "$REPO" --json milestone --jq '.milestone.title // empty')
existing=" $(gh api "repos/$REPO/issues/$ISSUE/sub_issues" --jq '[.[].number] | join(" ")' 2>/dev/null || true) "

for child in $children; do
    if [ "${existing#* $child }" != "$existing" ]; then
        echo "#$child already a sub-issue of #$ISSUE"
    else
        # ⚠️ this API wants the child's integer REST id, not its issue number
        cid=$(gh api "repos/$REPO/issues/$child" --jq .id)
        if gh api --method POST "repos/$REPO/issues/$ISSUE/sub_issues" -F sub_issue_id="$cid" >/dev/null 2>&1; then
            echo "#$child -> sub-issue of #$ISSUE"
        else
            echo "::warning::could not parent #$child to #$ISSUE"
        fi
    fi

    if [ -n "$milestone" ]; then
        if gh issue edit "$child" --repo "$REPO" --milestone "$milestone" >/dev/null 2>&1; then
            echo "#$child -> milestone $milestone"
        else
            echo "::warning::could not set milestone '$milestone' on #$child"
        fi
    fi
done
