#!/usr/bin/env bash
# Post-hook for the authoring job. Keeps ONE rolling work-log comment on the epic, so the
# maintainer can see the state of the whole epic in one place and decide what to assign
# next — without opening every story.
#
# ⚠️ FULLY DERIVED. Nothing here is written by a model. Which issue ran, which roles ran,
# what is still open and what comes next are all readable from GitHub, so none of it can be
# skipped or misreported. This repo's recurring failure is the opposite shape: sub-issue
# filing asked the deciding role to leave a machine-readable manifest, and across nine epics
# it wrote one exactly once.
#
# ⚠️ ONE COMMENT, REWRITTEN — not one comment per run. An epic with ten tasks and three
# roles each would otherwise accumulate thirty comments, which is the same "dutiful list
# nobody reads" failure the handoff rules already warn about. The status table is rebuilt
# from live state every time, so it is never stale; only the Recent lines accumulate, and
# they are capped.
set -euo pipefail

: "${REPO:?REPO is required}"

MARKER='<!-- claude-team:worklog -->'
KEEP=12

if [ -z "${ISSUE:-}" ]; then
    echo "Not triggered on an issue — no epic to log against."
    exit 0
fi

# ⚠️ `gh api` prints its ERROR BODY TO STDOUT, so a 404 lands in the variable and `--jq`
# never runs. `repos/…/parent` 404s for anything unparented — which is most issues — so an
# unguarded capture returns `{"message":"No parent issue found",…}` and every caller then
# treats that blob as an issue number. Filter to digits and let anything else read as
# absent, which is what a 404 actually means here.
parent_of() {
    local v
    v=$(gh api "repos/$REPO/issues/$1/parent" --jq '.number' 2>/dev/null || true)
    case "$v" in ''|*[!0-9]*) ;; *) printf '%s' "$v" ;; esac
}
title_of() { gh issue view "$1" --repo "$REPO" --json title --jq '.title' 2>/dev/null || true; }
# same trap: keep only well-formed `<number>\t<state>\t<title>` rows.
kids_of() {
    gh api "repos/$REPO/issues/$1/sub_issues" \
        --jq '.[] | "\(.number)\t\(.state)\t\(.title)"' 2>/dev/null \
        | grep -E '^[0-9]+	' || true
}

role_of() {
    gh issue view "$1" --repo "$REPO" --json body --jq '.body // ""' 2>/dev/null \
        | grep -oiE 'role: *`?[a-z]+`?' | head -1 | sed -E 's/.*[Rr]ole: *`?([a-z]+)`?.*/\1/' || true
}

# ── locate the epic ────────────────────────────────────────────────────────────────────
# A task's parent is its story and the story's parent is the epic; a story's parent is the
# epic directly. Walk up at most two levels and stop at whatever has no parent.
STORY=""; EPIC=""
p1=$(parent_of "$ISSUE")
if [ -z "$p1" ]; then
    echo "#$ISSUE has no parent — an epic itself, or unparented work. Nothing to log."
    exit 0
fi
p2=$(parent_of "$p1")
if [ -n "$p2" ]; then
    STORY="$p1"; EPIC="$p2"
else
    STORY="$ISSUE"; EPIC="$p1"
fi

echo "logging #$ISSUE (story #$STORY) against epic #$EPIC"

# ── what comes next ────────────────────────────────────────────────────────────────────
# The next open task of the story just worked; failing that, the next open story of the
# epic. Named with its Role stamp so the maintainer can act on it without opening it.
next_line="_Nothing open — the epic looks complete._"
next=$(kids_of "$STORY" | awk -F'\t' '$2=="open" && $1!='"$ISSUE"' {print $1"\t"$3; exit}')
kind="task"; scope="task of story #$STORY"
if [ -z "$next" ]; then
    next=$(kids_of "$EPIC" | awk -F'\t' '$2=="open" && $1!='"$STORY"' {print $1"\t"$3; exit}')
    kind="story"; scope="story of epic #$EPIC"
fi
if [ -n "$next" ]; then
    n=$(printf '%s' "$next" | cut -f1)
    t=$(printf '%s' "$next" | cut -f2)
    note=""
    # ⚠️ Only a TASK carries a `Role:` stamp — it is what routes an author to it. A story
    # is shaped by the Architect and has no stamp by design, so demanding one there would
    # be a standing false alarm on every epic.
    if [ "$kind" = "task" ]; then
        r=$(role_of "$n")
        if [ -n "$r" ]; then
            note=$(printf ', stamped `Role: %s`' "$r")
        else
            note=', **no `Role:` stamp** — the Architect should add one'
        fi
    else
        note=' — label it `@claude` and the Architect will shape it'
    fi
    next_line=$(printf '**#%s — %s**  \n%s%s' "$n" "$t" "next open $scope" "$note")
fi

# ── the status table ───────────────────────────────────────────────────────────────────
table=$(
    printf '| story | state | tasks |\n|---|---|---|\n'
    kids_of "$EPIC" | while IFS=$'\t' read -r sn ss st; do
        kids=$(kids_of "$sn")
        if [ -z "$kids" ]; then
            counts="—"
        else
            total=$(printf '%s\n' "$kids" | wc -l | tr -d ' ')
            done_n=$(printf '%s\n' "$kids" | awk -F'\t' '$2=="closed"' | wc -l | tr -d ' ')
            open_ns=$(printf '%s\n' "$kids" | awk -F'\t' '$2=="open" {printf "#%s ", $1}')
            counts="${done_n}/${total}${open_ns:+ · open: ${open_ns}}"
        fi
        mark=$([ "$ss" = "closed" ] && printf '✅' || printf '⬜')
        printf '| #%s %s | %s %s | %s |\n' "$sn" "$st" "$mark" "$ss" "$counts"
    done
)

# ── carry the previous Recent lines forward ────────────────────────────────────────────
comment_id=$(gh api "repos/$REPO/issues/$EPIC/comments" --paginate \
    --jq "[.[] | select((.body // \"\") | contains(\"$MARKER\")) | .id] | last // empty" 2>/dev/null || true)

previous=""
if [ -n "$comment_id" ]; then
    previous=$(gh api "repos/$REPO/issues/comments/$comment_id" --jq '.body // ""' 2>/dev/null \
        | sed -n '/^### Recent/,$p' | grep '^- ' || true)
fi

entry=$(printf -- '- `%s` **#%s** %s — %s%s' \
    "$(date -u '+%Y-%m-%d %H:%M')" "$ISSUE" "$(title_of "$ISSUE")" \
    "${ROLES:-（unknown）}" \
    "${PR:+ · PR #$PR}")

recent=$(printf '%s\n%s\n' "$entry" "$previous" | grep '^- ' | head -"$KEEP")

# ── write it ───────────────────────────────────────────────────────────────────────────
body_file=$(mktemp)
{
    printf '%s\n' "$MARKER"
    printf '## Work log\n\n'
    printf 'Rebuilt automatically after every authoring run. Status is read live from the\n'
    printf 'issues, so it is current as of the newest entry below.\n\n'
    printf '### Next up\n\n%s\n\n' "$next_line"
    printf '### Stories\n\n%s\n\n' "$table"
    printf '### Recent\n\n%s\n' "$recent"
} > "$body_file"

if [ -n "$comment_id" ]; then
    if gh api --method PATCH "repos/$REPO/issues/comments/$comment_id" \
        -f body="$(cat "$body_file")" >/dev/null 2>&1; then
        echo "updated the work log on epic #$EPIC"
    else
        echo "::warning::could not update the work log comment on epic #$EPIC"
    fi
else
    if gh issue comment "$EPIC" --repo "$REPO" --body-file "$body_file" >/dev/null 2>&1; then
        echo "opened the work log on epic #$EPIC"
    else
        echo "::warning::could not comment the work log on epic #$EPIC"
    fi
fi
rm -f "$body_file"
