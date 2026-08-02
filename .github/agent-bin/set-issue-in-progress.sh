#!/usr/bin/env bash
# Pre-hook for the roles that do the work. Moves the triggering issue to
# In Progress on the project board, so the board reflects reality the moment a
# role starts rather than only when its PR merges.
#
# Scripted rather than prompted for the same reason the label stamp is: a board
# that updates only when a model remembers is a board nobody trusts.
#
# ⚠️ This is one of the two places PROJECTS_TOKEN may appear. Step env is
# per-step, so the model step that runs after this one cannot read it.
set -euo pipefail

: "${REPO:?REPO is required}"

if [ -z "${ISSUE:-}" ]; then
    echo "Not triggered on an issue — nothing to move."
    exit 0
fi

if [ -z "${PROJECTS_TOKEN:-}" ]; then
    echo "::warning::PROJECTS_TOKEN is not set — cannot move #$ISSUE to In Progress."
    exit 0
fi

# don't resurrect finished work: a role re-run on a closed issue leaves the board alone
if [ "$(gh issue view "$ISSUE" --repo "$REPO" --json state --jq '.state')" != "OPEN" ]; then
    echo "#$ISSUE is closed — leaving its board status alone."
    exit 0
fi

export GH_TOKEN="$PROJECTS_TOKEN"

# ⚠️ `--owner "@me"`, never the literal login: gh otherwise probes user-vs-org,
# which needs read:org and fails with a bare "unknown owner type".
if ! gh project view "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --jq '.id' >/dev/null 2>&1; then
    echo "::warning::PROJECTS_TOKEN cannot reach project $PROJECT_NUMBER — needs 'read:org' as well as 'project'."
    exit 0
fi

project_id=$(gh project view "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --jq '.id')
status_field=$(gh project field-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json \
    --jq '.fields[] | select(.name == "Status")')
field_id=$(echo "$status_field" | jq -r '.id')
option_id=$(echo "$status_field" | jq -r '(.options // [])[] | select(.name == "In Progress") | .id')

if [ -z "$option_id" ] || [ "$option_id" = "null" ]; then
    echo "::warning::Project $PROJECT_NUMBER has no Status option named 'In Progress' — skipping."
    exit 0
fi

items=$(gh project item-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --limit 500)
item=$(echo "$items" | jq -r --argjson n "$ISSUE" \
    'first(.items[] | select(.content.type == "Issue" and .content.number == $n)) // empty')

if [ -z "$item" ]; then
    echo "::warning::Issue #$ISSUE is not on project $PROJECT_NUMBER — skipping."
    exit 0
fi

if [ "$(echo "$item" | jq -r '.status // empty')" = "In Progress" ]; then
    echo "#$ISSUE is already In Progress."
    exit 0
fi

item_id=$(echo "$item" | jq -r '.id')
gh project item-edit --id "$item_id" --project-id "$project_id" \
    --field-id "$field_id" --single-select-option-id "$option_id"
echo "#$ISSUE -> In Progress"
