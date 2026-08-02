#!/usr/bin/env bash
# Post-hook for the Implementor. Opens the epic's integration PR the first time
# it finds one missing, so the feature is reviewable as it accumulates instead of
# arriving whole at the end.
#
# Reads the epic branch and number out of the sub-issue's Base branch line, which
# the Researcher writes in a fixed form:
#
#   **Base branch: `250-volume-milestone`** — the integration branch for epic #250.
set -euo pipefail

: "${REPO:?REPO is required}"

if [ -z "${ISSUE:-}" ]; then
    echo "Not triggered on an issue — no epic to integrate."
    exit 0
fi

body=$(gh issue view "$ISSUE" --repo "$REPO" --json body --jq '.body // ""')
branch=$(printf '%s' "$body" | grep -oiE 'base branch: *`[^`]+`' | head -1 | sed -E 's/.*`([^`]+)`.*/\1/')
epic=$(printf '%s' "$body" | grep -oiE 'epic #[0-9]+' | head -1 | grep -oE '[0-9]+')

if [ -z "$branch" ]; then
    echo "#$ISSUE names no base branch — not an epic sub-issue."
    exit 0
fi

if [ "$branch" = "mainline" ]; then
    echo "#$ISSUE targets mainline directly — no integration PR."
    exit 0
fi

existing=$(gh pr list --repo "$REPO" --head "$branch" --base mainline --state open --json number --jq '.[0].number // empty')
if [ -n "$existing" ]; then
    echo "Integration PR #$existing already open for $branch."
    exit 0
fi

if ! git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    echo "::warning::branch $branch does not exist on origin — the Manager may not have cut it."
    exit 0
fi

# ⚠️ The Manager cuts the branch empty, so on the first sub-issue it is identical
# to mainline and GitHub refuses the PR with "No commits between". A single empty
# marker commit is the only thing any role may push straight to an epic branch.
git fetch origin "$branch" --quiet
if [ "$(git rev-list --count "origin/mainline..origin/$branch")" -eq 0 ]; then
    echo "$branch has no commits of its own — pushing a marker commit."
    git push --quiet origin "origin/$branch:refs/heads/$branch" 2>/dev/null || true
    tmp="integration-marker-$$"
    git checkout -q -B "$tmp" "origin/$branch"
    git commit -q --allow-empty -m "Start epic${epic:+ #$epic}"
    git push -q origin "$tmp:$branch"
    git checkout -q -
    git branch -q -D "$tmp"
fi

title="Epic${epic:+ #$epic}: $branch"
if [ -n "$epic" ]; then
    title=$(gh issue view "$epic" --repo "$REPO" --json title --jq '.title' 2>/dev/null || echo "$title")
fi

body_file=$(mktemp)
{
    printf 'Integration PR for the `%s` epic branch.\n\n' "$branch"
    printf 'It collects this epic'"'"'s sub-issue PRs and stays open until the feature is done,\n'
    printf 'so the work is reviewable as it accumulates rather than arriving whole at the end.\n'
    [ -n "$epic" ] && printf '\nCloses #%s\n' "$epic"
    printf '\n⚠️ Opened automatically by the first sub-issue run that found it missing.\n'
} > "$body_file"

if gh pr create --repo "$REPO" --base mainline --head "$branch" --title "$title" --body-file "$body_file" >/dev/null 2>&1; then
    echo "opened the integration PR for $branch"
else
    echo "::warning::could not open the integration PR for $branch — open it by hand."
fi
rm -f "$body_file"
