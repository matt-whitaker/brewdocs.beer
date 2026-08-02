#!/usr/bin/env bash
set -euo pipefail

manifest=$(gh api "repos/$REPO/issues/$ISSUE/comments" --paginate \
  --jq '[.[] | select(.body | contains("owner-manifest")) | .body] | last // empty')

if [ -z "$manifest" ]; then
  echo "No owner-manifest on #$ISSUE — nothing to file."
  exit 0
fi

# one line on purpose: a python heredoc indented inside this YAML block would
# arrive with its leading spaces intact and die on IndentationError
payload=$(printf '%s' "$manifest" | python3 -c 'import sys,re; m=re.search(r"owner-manifest\s*(\{.*?\})\s*-->", sys.stdin.read(), re.S); print(m.group(1) if m else "")')

if [ -z "$payload" ]; then
  echo "::warning::#$ISSUE has an owner-manifest marker whose JSON could not be parsed — leaving it alone."
  exit 0
fi

epic=$(printf '%s' "$payload" | jq -r '.epic')
children=$(printf '%s' "$payload" | jq -r '(.children // [])[]')

if [ -z "$children" ]; then
  echo "Manifest on #$ISSUE lists no children — nothing to file."
  exit 0
fi

milestone=$(gh issue view "$epic" --repo "$REPO" --json milestone --jq '.milestone.title // empty')
existing=" $(gh api "repos/$REPO/issues/$epic/sub_issues" --jq '[.[].number] | join(" ")' 2>/dev/null || true) "

for child in $children; do
  if [ "${existing#* $child }" != "$existing" ]; then
    echo "#$child already a sub-issue of #$epic"
  else
    # ⚠️ this API wants the child's integer REST id, not its issue number
    cid=$(gh api "repos/$REPO/issues/$child" --jq .id)
    if gh api --method POST "repos/$REPO/issues/$epic/sub_issues" -F sub_issue_id="$cid" >/dev/null 2>&1; then
      echo "#$child -> sub-issue of #$epic"
    else
      echo "::warning::could not parent #$child to #$epic"
    fi
  fi

  if [ -n "$milestone" ]; then
    if gh issue edit "$child" --repo "$REPO" --milestone "$milestone" >/dev/null 2>&1; then
      echo "#$child -> milestone $milestone"
    else
      echo "::warning::could not set milestone '$milestone' on #$child"
    fi
  fi
done
