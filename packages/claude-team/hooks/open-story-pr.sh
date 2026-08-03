#!/usr/bin/env bash
# Post-hook for every authoring role. Opens the story's PR the first time it finds one
# missing, so the story is reviewable as it accumulates rather than arriving whole.
#
# One story, one branch, one PR. An epic has neither — if this is triggered on an epic
# there is no Branch line and it no-ops. A task carries its *story's* Branch line, so a
# task run finds the story's PR already open and does nothing.
#
# The branch comes from the issue body's Branch line, which the Architect writes:
#
#   **Branch: `250-volume-milestone`**
set -euo pipefail

: "${REPO:?REPO is required}"

if [ -z "${ISSUE:-}" ]; then
    echo "Not triggered on an issue — no story to open a PR for."
    exit 0
fi

body=$(gh issue view "$ISSUE" --repo "$REPO" --json body --jq '.body // ""')
branch=$(printf '%s' "$body" | grep -oiE 'branch: *`[^`]+`' | head -1 | sed -E 's/.*`([^`]+)`.*/\1/')

if [ -z "$branch" ]; then
    echo "#$ISSUE names no branch — an epic, or a story the Architect hasn't cut yet."
    exit 0
fi

default=$(gh repo view "$REPO" --json defaultBranchRef --jq '.defaultBranchRef.name')

if [ "$branch" = "$default" ]; then
    echo "#$ISSUE targets $default directly — no story branch."
    exit 0
fi

existing=$(gh pr list --repo "$REPO" --head "$branch" --state open --json number --jq '.[0].number // empty')
if [ -n "$existing" ]; then
    echo "PR #$existing already open for $branch."
    exit 0
fi

if ! git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    echo "::warning::branch $branch does not exist on origin — the Architect may not have cut it."
    exit 0
fi

# nothing to PR yet: the author pushed no commits, so let the next run open it
git fetch origin "$branch" --quiet
if [ "$(git rev-list --count "origin/$default..origin/$branch")" -eq 0 ]; then
    echo "$branch has no commits yet — nothing to open a PR for."
    exit 0
fi

# ⚠️ THE PR CLOSES THE STORY, NOT THE TRIGGERING ISSUE. Writing `Closes #<task>` here is
# what sank the model once already: the first task's PR announced itself finished, CI went
# green, and merging was the obvious move — closing the branch with the story's other tasks
# unstarted. A branch is named `<story#>-<summary>`, so the number it starts with is the
# story: itself when a story triggered the run, its parent when a task did.
STORY=$(printf '%s' "$branch" | grep -oE '^[0-9]+' || true)
[ -n "$STORY" ] || STORY="$ISSUE"

title=$(gh issue view "$STORY" --repo "$REPO" --json title --jq '.title')
tasks=$(gh api "repos/$REPO/issues/$STORY/sub_issues" \
    --jq '.[] | "\(.number)\t\(.title)"' 2>/dev/null || true)

body_file=$(mktemp)
{
    printf 'Story PR for `%s`.\n\n' "$branch"
    printf '⚠️ **This PR stays open until the story is complete.** Every role working the story\n'
    printf 'commits to this branch, so it grows as the story lands — code, tests and docs\n'
    printf 'together — rather than arriving as several PRs. One task looking finished is not a\n'
    printf 'signal to merge.\n\n'
    printf 'Closes #%s\n' "$STORY"

    if [ -n "$tasks" ]; then
        printf '\n### Tasks\n\n'
        printf '%s\n' "$tasks" | while IFS=$'\t' read -r n t; do
            printf -- '- #%s — %s\n' "$n" "$t"
        done
        # ⚠️ The tasks need their own closing keywords. close-merged-work.sh only falls back
        # to parsing the body when `closingIssuesReferences` is EMPTY, and a story PR targets
        # the default branch — so GitHub populates it with the story and the parse never runs.
        # Listing the tasks without keywords would leave every one of them open on merge.
        printf '\nMerging closes them too:'
        printf '%s\n' "$tasks" | cut -f1 | while read -r n; do printf ' closes #%s' "$n"; done
        printf '\n'
    fi
} > "$body_file"

if gh pr create --repo "$REPO" --base "$default" --head "$branch" --title "$title" --body-file "$body_file" >/dev/null 2>&1; then
    echo "opened the story PR for $branch"
else
    echo "::warning::could not open the story PR for $branch — open it by hand."
fi
rm -f "$body_file"
