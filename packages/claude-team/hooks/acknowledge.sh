#!/usr/bin/env bash
# Pre-hook, first thing in every run. Reacts 👀 so the maintainer knows the trigger landed
# before any model has thought about it.
#
# ⚠️ Scripted, not prompted. An acknowledgement a model can forget is worse than none — the
# silence reads identically to "nothing happened", which is the state it exists to rule out.
#
# Reacts to the comment when one triggered the run, otherwise to the issue itself, so the
# 👀 appears where the maintainer is looking.
set -euo pipefail

: "${REPO:?REPO is required}"

if [ -n "${COMMENT_ID:-}" ]; then
    target="repos/$REPO/issues/comments/$COMMENT_ID/reactions"
    what="comment $COMMENT_ID"
elif [ -n "${NUMBER:-}" ]; then
    target="repos/$REPO/issues/$NUMBER/reactions"
    what="#$NUMBER"
else
    echo "No comment or issue to acknowledge."
    exit 0
fi

if gh api "$target" -f content=eyes >/dev/null 2>&1; then
    echo "👀 -> $what"
else
    echo "::warning::could not react to $what"
fi
