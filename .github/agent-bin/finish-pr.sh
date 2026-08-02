#!/usr/bin/env bash
# Post-hook for every role that opens a PR. Does the two things a prompt kept
# being asked to remember:
#
#   1. labels the PR with the role that opened it
#   2. makes sure the body carries `Closes #<issue>`
#
# (2) is the one that silently loses work: close-merged-work.sh finds what a PR
# finished by parsing that keyword, so a missing line means the issue never
# closes and never reaches Done, with nothing to signal it.
set -euo pipefail

: "${ROLE:?ROLE is required}"
: "${REPO:?REPO is required}"

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

pr=""
if [ -n "$branch" ] && [ "$branch" != "HEAD" ]; then
    pr=$(gh pr list --repo "$REPO" --head "$branch" --state open --json number --jq '.[0].number // empty')
fi

# the model may have moved off the branch it pushed; fall back to the issue
if [ -z "$pr" ] && [ -n "${ISSUE:-}" ]; then
    pr=$(gh pr list --repo "$REPO" --state open --json number,body \
        --jq "[.[] | select(.body // \"\" | test(\"(?i)(clos|fix|resolv)[a-z]* +#$ISSUE\\\\b\"))][0].number // empty")
fi

if [ -z "$pr" ]; then
    echo "This run opened no PR — nothing to finish."
    exit 0
fi

# Published so the Tester and Writer can chain off this run and be pointed at the PR it
# produced. Left unwritten on the early exit above, so an Implementor run that opened no
# PR yields an empty output and starts neither. Guarded for use outside Actions.
if [ -n "${GITHUB_OUTPUT:-}" ]; then
    echo "pr=$pr" >> "$GITHUB_OUTPUT"
fi

if gh pr edit "$pr" --repo "$REPO" --add-label "@claude/$ROLE" >/dev/null 2>&1; then
    echo "PR #$pr -> @claude/$ROLE"
else
    echo "::warning::could not label PR #$pr — does @claude/$ROLE exist in this repo?"
fi

if [ -z "${ISSUE:-}" ]; then
    echo "No triggering issue — nothing to close."
    exit 0
fi

body=$(gh pr view "$pr" --repo "$REPO" --json body --jq '.body // ""')

if printf '%s' "$body" | grep -qiE "(clos|fix|resolv)[a-z]* +#$ISSUE\b"; then
    echo "PR #$pr already closes #$ISSUE."
    exit 0
fi

printf '%s\n\nCloses #%s\n' "$body" "$ISSUE" | gh pr edit "$pr" --repo "$REPO" --body-file -
echo "PR #$pr -> added 'Closes #$ISSUE'"
