Branch names are issue-first: `<issue#>-<kebab-summary>`, e.g. `42-derived-schedule`.

Use the headings from `.github/ISSUE_TEMPLATE/claude-task.yml`: Summary / Where the code
lives / What to change / Patterns to follow / Out of scope / Acceptance criteria.

Don't ask an author to run builds beyond the gate — the **Verify** workflow runs it on the
PR, and `npm ci` plus the package builds would eat most of a turn budget.
