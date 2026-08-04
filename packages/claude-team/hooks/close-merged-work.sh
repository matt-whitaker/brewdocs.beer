#!/usr/bin/env bash
set -euo pipefail

issues=$(gh pr view "$PR" --repo "$REPO" --json closingIssuesReferences \
  --jq '.closingIssuesReferences[].number')

# ⚠️ GitHub only acts on closing keywords when a PR targets the DEFAULT
# branch. A task's PR targets its STORY's branch, so its "Closes #<task>" is
# inert and closingIssuesReferences comes back empty — the intent is in the
# body, GitHub just never linked it. Parse it ourselves. This is the only
# thing that closes a task.
if [ -z "$issues" ]; then
  issues=$(gh pr view "$PR" --repo "$REPO" --json body --jq \
    '[.body // "" | scan("(?i)(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\s+#([0-9]+)")[]] | unique | .[]')
  if [ -n "$issues" ]; then
    echo "No linked issues (non-default base); parsed from the body:" $issues
  fi
fi

if [ -z "$issues" ]; then
  echo "PR #$PR closes no issue — nothing to do."
  exit 0
fi

# ⚠️ NO SUB-ISSUE EXPANSION. This used to close a closed issue's open children, because a
# story's tasks had no PRs of their own and the story's merge was the only thing that could
# close them. Every task now closes via its own PR merging into the story branch, so a task
# still open when its story merges is a real signal — abandoned, or its PR never landed —
# and swallowing it would hide exactly the case worth seeing.

for issue in $issues; do
  if [ "$(gh issue view "$issue" --repo "$REPO" --json state --jq '.state')" = "OPEN" ]; then
    gh issue close "$issue" --repo "$REPO" --comment "Completed by #${PR}."
    echo "Issue #$issue -> closed"
  fi
done

if [ -z "${PROJECTS_TOKEN:-}" ]; then
  echo "::warning::PROJECTS_TOKEN is not set — issues closed, but not moved on the board. Add a classic PAT with the 'project' AND 'read:org' scopes (fine-grained tokens cannot reach user-owned Projects v2)."
  exit 0
fi

export GH_TOKEN="$PROJECTS_TOKEN"

# ⚠️ Preflight, so a token problem warns instead of failing a merged PR.
# `gh project` needs **read:org on top of project**, even for a user-owned
# project — that is a second gate, separate from the owner-type probe that
# `--owner "@me"` handles, and its raw error ("missing required scopes
# [read:org read:discussion]") never mentions which secret is at fault.
if ! gh project view "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --jq '.id' >/dev/null 2>&1; then
  echo "::warning::PROJECTS_TOKEN cannot reach project $PROJECT_NUMBER — issues were closed, but the board was not updated. \`gh project\` requires the 'read:org' scope in addition to 'project', even for a user-owned project."
  exit 0
fi

project_id=$(gh project view "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --jq '.id')
status_field=$(gh project field-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json \
  --jq '.fields[] | select(.name == "Status")')
field_id=$(echo "$status_field" | jq -r '.id')
done_id=$(echo "$status_field" | jq -r '(.options // [])[] | select(.name == "Done") | .id')

if [ -z "$done_id" ] || [ "$done_id" = "null" ]; then
  echo "::warning::Project $PROJECT_NUMBER has no Status option named 'Done' — skipping the board update."
  exit 0
fi

items=$(gh project item-list "$PROJECT_NUMBER" --owner "$PROJECT_OWNER" --format json --limit 500)

for issue in $issues; do
  item_id=$(echo "$items" | jq -r --argjson n "$issue" \
    'first(.items[] | select(.content.type == "Issue" and .content.number == $n) | .id) // empty')
  if [ -z "$item_id" ]; then
    echo "::warning::Issue #$issue is not on project $PROJECT_NUMBER — skipping."
    continue
  fi
  gh project item-edit --id "$item_id" --project-id "$project_id" \
    --field-id "$field_id" --single-select-option-id "$done_id"
  echo "Issue #$issue -> Done"
done
