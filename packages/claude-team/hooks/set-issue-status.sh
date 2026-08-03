#!/usr/bin/env bash
# Sets an issue's Status on the project board.
#
# Parameterised on STATUS so one hook serves every caller — an author starting work, and an
# issue arriving on the board. Two hooks running the same GraphQL against the same field
# would drift the moment one is fixed and the other isn't.
#
# ⚠️ PROJECT_OWNER, PROJECT_NUMBER and STATUS are INPUTS. Per the boundary rule, the
# mechanism is package-side and the values belong to the consuming repo.
#
# ⚠️ This is one of the two places PROJECTS_TOKEN may appear. Step env is per-step, so a
# model step in the same job cannot read it.
set -euo pipefail

: "${REPO:?REPO is required}"
: "${STATUS:?STATUS is required}"

if [ -z "${ISSUE:-}" ]; then
    echo "Not triggered on an issue — nothing to move."
    exit 0
fi

if [ -z "${PROJECTS_TOKEN:-}" ]; then
    echo "::warning::PROJECTS_TOKEN is not set — cannot set #$ISSUE to $STATUS."
    exit 0
fi

# don't resurrect finished work: a re-run on a closed issue leaves the board alone
if [ "$(gh issue view "$ISSUE" --repo "$REPO" --json state --jq '.state')" != "OPEN" ]; then
    echo "#$ISSUE is closed — leaving its board status alone."
    exit 0
fi

export GH_TOKEN="$PROJECTS_TOKEN"

# ⚠️ `--owner "@me"`, never the literal login: gh otherwise probes user-vs-org, which needs
# read:org and fails with a bare "unknown owner type".
if ! gh project view "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --jq '.id' >/dev/null 2>&1; then
    echo "::warning::PROJECTS_TOKEN cannot reach project $PROJECT_NUMBER — needs 'read:org' as well as 'project'."
    exit 0
fi

project_id=$(gh project view "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --jq '.id')
status_field=$(gh project field-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json \
    --jq '.fields[] | select(.name == "Status")')
field_id=$(echo "$status_field" | jq -r '.id')
option_id=$(echo "$status_field" | jq -r --arg s "$STATUS" '(.options // [])[] | select(.name == $s) | .id')

if [ -z "$option_id" ] || [ "$option_id" = "null" ]; then
    echo "::warning::Project $PROJECT_NUMBER has no Status option named '$STATUS' — skipping."
    exit 0
fi

items=$(gh project item-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --limit 500)
item=$(echo "$items" | jq -r --argjson n "$ISSUE" \
    'first(.items[] | select(.content.type == "Issue" and .content.number == $n)) // empty')

if [ -z "$item" ]; then
    echo "::warning::Issue #$ISSUE is not on project $PROJECT_NUMBER — skipping."
    exit 0
fi

if [ "$(echo "$item" | jq -r '.status // empty')" = "$STATUS" ]; then
    echo "#$ISSUE is already $STATUS."
    exit 0
fi

item_id=$(echo "$item" | jq -r '.id')
gh project item-edit --id "$item_id" --project-id "$project_id" \
    --field-id "$field_id" --single-select-option-id "$option_id"
echo "#$ISSUE -> $STATUS"
