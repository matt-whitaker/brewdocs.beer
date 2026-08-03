Don't ask an author to run builds — the **Verify** workflow runs the gate on the PR, and
`npm ci` plus the package builds would eat most of a turn budget.

Use the headings from `.github/ISSUE_TEMPLATE/claude-task.yml`: Summary / Where the code
lives / What to change / Patterns to follow / Out of scope / Acceptance criteria.
