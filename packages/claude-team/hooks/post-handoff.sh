#!/usr/bin/env bash
# Post-hook for the authoring job. Puts the author's JSON handoff somewhere a later role can
# read it — the story's PR, as one marked comment per task.
#
# ⚠️ THE SCHEMA WAS NEVER THE BROKEN HALF. `--json-schema` forces the author to emit both
# keys, so `[]` stays distinguishable from "forgot". What failed is that `structured_output`
# is a STEP output: it dies with the job, and the Tester and Writer now run as their own
# tasks. Only the transport moves here; the guarantee is unchanged.
#
# ⚠️ Deterministic at both ends, which is what separates this from the owner-manifest
# failure. There, a model was asked to leave a machine-readable block and wrote one across
# nine epics exactly once. Here the schema forces production and this hook forces delivery —
# no step is a model instruction.
set -euo pipefail

: "${REPO:?REPO is required}"

if [ -z "${HANDOFF:-}" ]; then
    echo "No handoff to post — no author ran, or its step failed."
    exit 0
fi

if [ -z "${ISSUE:-}" ]; then
    echo "Not triggered on an issue — nowhere to attribute a handoff."
    exit 0
fi

# The PR is the story's, found by the branch its issue names — same derivation as
# open-story-pr.sh, so the two cannot disagree about which PR a task belongs to.
body=$(gh issue view "$ISSUE" --repo "$REPO" --json body --jq '.body // ""')
branch=$(printf '%s' "$body" | grep -oiE 'branch: *`[^`]+`' | head -1 | sed -E 's/.*`([^`]+)`.*/\1/' || true)

if [ -z "$branch" ]; then
    echo "#$ISSUE names no branch — nothing to attach a handoff to."
    exit 0
fi

pr=$(gh pr list --repo "$REPO" --head "$branch" --state open --json number --jq '.[0].number // empty')
if [ -z "$pr" ]; then
    echo "::warning::no open PR for $branch — handoff for #$ISSUE not posted."
    exit 0
fi

# ⚠️ One comment per TASK, not per story. A story has several authoring tasks and each has
# its own handoff; keying the marker on the story would make the last one overwrite the rest.
MARKER="<!-- claude-team:handoff:$ISSUE -->"

body_file=$(mktemp)
{
    printf '%s\n' "$MARKER"
    printf '### Handoff — #%s%s\n\n' "$ISSUE" "${ROLES:+ (${ROLES})}"
    printf 'Machine-written, schema-enforced. `testingNotes` are for the Tester,\n'
    printf '`docsCandidates` for the Writer. An empty array is a real answer — it means the\n'
    printf 'author considered it and found nothing, which is not the same as a missing key.\n\n'
    printf '```json\n%s\n```\n' "$HANDOFF"
} > "$body_file"

# update in place on a re-run rather than stacking another copy
existing=$(gh api "repos/$REPO/issues/$pr/comments" --paginate \
    --jq "[.[] | select((.body // \"\") | contains(\"$MARKER\")) | .id] | last // empty" 2>/dev/null || true)

if [ -n "$existing" ]; then
    if gh api --method PATCH "repos/$REPO/issues/comments/$existing" \
        -f body="$(cat "$body_file")" >/dev/null 2>&1; then
        echo "updated the handoff for #$ISSUE on PR #$pr"
    else
        echo "::warning::could not update the handoff comment on PR #$pr"
    fi
elif gh issue comment "$pr" --repo "$REPO" --body-file "$body_file" >/dev/null 2>&1; then
    echo "posted the handoff for #$ISSUE on PR #$pr"
else
    echo "::warning::could not post the handoff on PR #$pr"
fi
rm -f "$body_file"
