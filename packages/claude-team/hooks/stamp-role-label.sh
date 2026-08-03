#!/usr/bin/env bash
# Pre-hook for every role. Stamps @claude/<role> on the issue or PR that triggered
# the run, so the labels read as "these agents have been here".
#
# Deterministic on purpose: this used to be an instruction in each prompt, which
# cost a model turn and could simply be skipped. A label the maintainer clears as
# a check-off is worth nothing if a run can forget to apply it.
set -euo pipefail

: "${ROLE:?ROLE is required}"
: "${REPO:?REPO is required}"

if [ -z "${NUMBER:-}" ]; then
    echo "No issue or PR number on this event — nothing to stamp."
    exit 0
fi

# the /labels endpoint serves pull requests too; a repeat add is a no-op
if gh api "repos/$REPO/issues/$NUMBER/labels" -f "labels[]=@claude/$ROLE" >/dev/null 2>&1; then
    echo "#$NUMBER -> @claude/$ROLE"
else
    echo "::warning::could not stamp @claude/$ROLE on #$NUMBER — does the label exist in this repo?"
fi
