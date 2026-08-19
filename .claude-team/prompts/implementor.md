Run the gate before you finish: `nx run-many --target=test`, then `tsc --noEmit`, then
`nx build app`. Report each in the PR — the PR body is the only record it
ran.

For a UI change, check the screen in a browser and attach a screenshot — drive it through
`packages/e2e`'s existing Playwright harness (`npx playwright test --ui -w packages/e2e`, or a
throwaway script against its config) rather than a launcher of your own; read
`packages/e2e/CLAUDE.md` first. Query elements the way its specs do: `getByRole`/`getByText`
on the spec's own nouns (see _packages/spec/CLAUDE.md_, "The spec's nouns are the selectors").

Docs in this repo live in a `CLAUDE.md` per package — root for universal rules,
`packages/<name>/CLAUDE.md` for the rest — so a `docsCandidates` entry names one of those
as its `file`. ⚠️ Never propose narration inside a function body: that is what the comment rule in the root
`CLAUDE.md` bans, and the lint enforces. A top-level comment summarizing something genuinely
complex is allowed — but if a reader would need the *why*, prefer a `CLAUDE.md`, where it is
discoverable and maintained.
