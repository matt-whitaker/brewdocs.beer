#!/usr/bin/env bash
# Runs on every merged PR. Opens the STORY's PR the first time a task PR lands on a story
# branch, so the story is reviewable as it accumulates rather than arriving whole.
#
# ⚠️ IT RUNS HERE, NOT IN AN AUTHORING RUN, and that is forced rather than chosen. Under
# sub-branching an author commits to its own task branch, so the story branch stays empty
# until a task PR merges into it — and GitHub will not open a PR with no commits between
# base and head. The first task merge is the earliest moment the story's PR can exist.
#
# `BASE` is the merged PR's base ref. A task PR's base is the story branch; a story PR's
# base is the default branch. So a story branch base means "a task just landed".
set -euo pipefail

: "${REPO:?REPO is required}"

default=$(gh repo view "$REPO" --json defaultBranchRef --jq '.defaultBranchRef.name')

if [ -z "${BASE:-}" ] || [ "$BASE" = "$default" ]; then
    echo "Merged into ${BASE:-?} — not a story branch, nothing to open."
    exit 0
fi

# ⚠️ A story branch is named `<story#>-<summary>`. The number it starts with is the story,
# which is the same derivation delegate.sh uses — the two must not disagree about which
# issue a branch belongs to.
STORY=$(printf '%s' "$BASE" | grep -oE '^[0-9]+' || true)
if [ -z "$STORY" ]; then
    echo "::warning::base $BASE does not start with an issue number — cannot resolve its story."
    exit 0
fi

existing=$(gh pr list --repo "$REPO" --head "$BASE" --state open --json number --jq '.[0].number // empty')
if [ -n "$existing" ]; then
    echo "PR #$existing already open for $BASE."
    exit 0
fi

if [ "$(gh api "repos/$REPO/compare/$default...$BASE" --jq '.ahead_by' 2>/dev/null || echo 0)" -eq 0 ]; then
    echo "$BASE is not ahead of $default — nothing to open a PR for."
    exit 0
fi

title=$(gh issue view "$STORY" --repo "$REPO" --json title --jq '.title')
tasks=$(gh api "repos/$REPO/issues/$STORY/sub_issues" \
    --jq '.[] | "\(.number)\t\(.state)\t\(.title)"' 2>/dev/null | grep -E '^[0-9]+	' || true)

body_file=$(mktemp)
{
    printf 'Story PR for `%s`.\n\n' "$BASE"
    printf '⚠️ **This PR stays open until the story is complete.** Each task lands here by its\n'
    printf 'own PR into this branch, so it grows as the story does — code, tests and docs\n'
    printf 'together — rather than arriving as several. One task merging is not a signal to\n'
    printf 'merge this.\n\n'
    printf 'Closes #%s\n' "$STORY"

    if [ -n "$tasks" ]; then
        printf '\n### Tasks\n\n'
        printf '%s\n' "$tasks" | while IFS=$'\t' read -r n st t; do
            mark=$([ "$st" = "closed" ] && printf 'x' || printf ' ')
            printf -- '- [%s] #%s — %s\n' "$mark" "$n" "$t"
        done
        # ⚠️ Each task is closed by its OWN PR merging into this branch, so this list needs
        # no closing keywords — and must not carry them. Repeating them here would make the
        # story's merge re-close tasks that are already done, and would close any that were
        # abandoned rather than finished.
        printf '\nEach is closed by its own PR merging into this branch.\n'
    fi
} > "$body_file"

if gh pr create --repo "$REPO" --base "$default" --head "$BASE" --title "$title" --body-file "$body_file" >/dev/null 2>&1; then
    echo "opened the story PR for $BASE"
else
    echo "::warning::could not open the story PR for $BASE — open it by hand."
fi
rm -f "$body_file"
