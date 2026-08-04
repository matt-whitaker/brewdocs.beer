#!/usr/bin/env bash
# Keeps ONE rolling comment on a story listing its tasks in the order they should be
# triggered, with what is done, what is ready, and what is waiting on something earlier.
#
# Every task is triggered by hand, so "which one next" is a question the maintainer asks
# constantly. log-to-epic.sh answers it only for a story that sits under an epic; a
# standalone story had no board at all.
#
# ⚠️ NOTHING HERE IS WRITTEN BY A MODEL. Order is derived from two things the Architect must
# produce for other reasons:
#
#   phase   from the `Role:` stamp — an author precedes the tester, which precedes the
#           writer. That is the cadence it already cuts to.
#   number  within a phase, because it creates tasks in the order it intends them to run.
#
# A third stamp naming an order would be a third line it could skip, which is the
# owner-manifest failure. These two cannot be skipped without breaking routing itself.
set -euo pipefail

: "${REPO:?REPO is required}"

MARKER='<!-- claude-team:storylog -->'

if [ -z "${STORY:-}" ]; then
    echo "No story in scope — nothing to order."
    exit 0
fi

kids=$(gh api "repos/$REPO/issues/$STORY/sub_issues" \
    --jq '.[] | "\(.number)\t\(.state)\t\(.title)"' 2>/dev/null | grep -E '^[0-9]+	' || true)

if [ -z "$kids" ]; then
    echo "#$STORY has no tasks — nothing to order."
    exit 0
fi

role_of() {
    gh issue view "$1" --repo "$REPO" --json body --jq '.body // ""' 2>/dev/null \
        | grep -oiE 'role: *`?[a-z]+`?' | head -1 \
        | sed -E 's/.*[Rr]ole: *`?([a-z]+)`?.*/\1/' || true
}

# phase: authors first, then tests, then docs. An unstamped task sorts with the authors —
# routing defaults it to an author too, so the two stay consistent.
phase_of() {
    case "$1" in
        tester) printf '2' ;;
        writer) printf '3' ;;
        *)      printf '1' ;;
    esac
}

ordered=$(
    printf '%s\n' "$kids" | while IFS=$'\t' read -r n st t; do
        r=$(role_of "$n")
        printf '%s\t%s\t%s\t%s\t%s\n' "$(phase_of "$r")" "$n" "$st" "${r:-—}" "$t"
    done | sort -t$'\t' -k1,1n -k2,2n
)

# ⚠️ Ready/waiting falls out of the same order rather than being tracked separately: a task
# is ready when everything before it is closed. So the first open task IS the one to trigger.
next=$(printf '%s\n' "$ordered" | awk -F'\t' '$3=="open" {print; exit}')

body_file=$(mktemp)
{
    printf '%s\n' "$MARKER"
    printf '## Tasks, in trigger order\n\n'
    if [ -n "$next" ]; then
        printf '**Trigger next — #%s**  \n%s  \n`Role: %s`\n\n' \
            "$(printf '%s' "$next" | cut -f2)" \
            "$(printf '%s' "$next" | cut -f5)" \
            "$(printf '%s' "$next" | cut -f4)"
    else
        printf '_Every task is closed — the story is ready to review._\n\n'
    fi

    # ⚠️ Stateless on purpose. A `seen_open` flag would be set inside the pipeline's
    # subshell and reset on every iteration, so every open row would read "ready". The
    # first open task is already known — compare against it instead of tracking state.
    next_n=$(printf '%s' "$next" | cut -f2)
    printf '| | task | role | state |\n|---|---|---|---|\n'
    printf '%s\n' "$ordered" | while IFS=$'\t' read -r ph n st r t; do
        if [ "$st" = "closed" ]; then
            mark='✅ done'
        elif [ "$n" = "$next_n" ]; then
            mark='⬜ **ready**'
        else
            mark='⏸ waiting'
        fi
        printf '| %s | #%s %s | `%s` | %s |\n' "$ph" "$n" "$t" "$r" "$mark"
    done

    printf '\nOrder is derived — authors, then tests, then docs; by issue number within each.\n'
    printf 'Rewritten automatically whenever a task changes state.\n'
} > "$body_file"

existing=$(gh api "repos/$REPO/issues/$STORY/comments" --paginate \
    --jq "[.[] | select((.body // \"\") | contains(\"$MARKER\")) | .id] | last // empty" 2>/dev/null || true)

if [ -n "$existing" ]; then
    if gh api --method PATCH "repos/$REPO/issues/comments/$existing" \
        -f body="$(cat "$body_file")" >/dev/null 2>&1; then
        echo "updated the task order on story #$STORY"
    else
        echo "::warning::could not update the task order on #$STORY"
    fi
elif gh issue comment "$STORY" --repo "$REPO" --body-file "$body_file" >/dev/null 2>&1; then
    echo "posted the task order on story #$STORY"
else
    echo "::warning::could not post the task order on #$STORY"
fi
rm -f "$body_file"
