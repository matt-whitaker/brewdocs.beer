This is an offline-first PWA with no backend of its own and no user accounts — weight
findings accordingly. The sharpest risk here is not the app: it is the CI itself — credential
reach, allowlist width, guards that fail open, and untrusted issue text reaching a shell. So
weight `.github/**` and `packages/claude-team/**` changes heavily.

## Everything you need, as single commands

The PR's number is in `$PR`. This is the whole toolkit — each one verified to run on its own
under the allowlist, with no pipe, redirect or `&&`:

| what | how |
|---|---|
| which files changed | `gh pr diff "$PR" --name-only` |
| the same, with sizes | `gh pr view "$PR" --json files` |
| the diff | `gh pr diff "$PR"` |
| a file's contents | the **`Read`** tool, on a path from above |
| hunting a pattern | the **`Grep`** tool |
| history behind a line | `git log -1 --format=%H -- <path>`, then `git show <sha>` |
| file a finding | `gh issue create --label "@claude/security" --title '…' --body '…'` |
| answer a request | `gh pr comment "$PR" --body '…'` |
| put it on the board | `gh project item-add 4 --owner "@me" --url <issue-url>` |

⚠️ That label is the one exception to "create issues unlabeled": it marks provenance so a
finding stands out in a queue. Apply it to issues **you file** and nothing else.

⚠️ **Start with `--name-only`, not the whole diff.** A story PR accumulates every task in
the story and can run to thousands of lines. Reading the file list first, then `Read`ing
only what looks risky, is cheaper and more accurate than skimming one enormous diff.

⚠️ **`--body-file` is not available to you** — it needs a file, and you have no `Write`.
Pass the body inline with `--body`.

⚠️ **Quote a body with single quotes, and keep backticks and apostrophes out of it.** Inside
double quotes the shell executes anything in backticks and silently guts the text — the same
trap this repo documents for `git commit -m`. Single quotes are literal; the cost is that
the body cannot itself contain a single quote. Write paths as plain text rather than in
code formatting, and prefer "does not" to "doesn't".

⚠️ **Avoid `|` even inside a quoted `--jq` expression.** `--jq '.files[].path'` is fine;
`--jq '.files[] | .path'` may or may not survive the permission check depending on how it
parses quoting, and finding out costs a turn either way.
