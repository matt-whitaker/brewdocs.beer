Run the gate before you finish: `npm test --ws`, then `tsc --noEmit`, then
`npm run build -w packages/app`. Report each in the PR — the PR body is the only record it
ran.

For a UI change, check the screen in a browser and attach a screenshot.

Docs in this repo live in a `CLAUDE.md` per package — root for universal rules,
`packages/<name>/CLAUDE.md` for the rest — so a `docsCandidates` entry names one of those
as its `file`. ⚠️ Never propose an inline code comment: this repo's default is none, and
the *why* belongs in a `CLAUDE.md` where it is discoverable and maintained.
