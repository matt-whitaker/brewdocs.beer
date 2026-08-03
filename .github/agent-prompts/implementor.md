Run the gate before you finish: `npm test --ws`, then `tsc --noEmit`, then
`npm run build -w packages/app`. Report each in the PR — the PR body is the only record it
ran.

For a UI change, check the screen in a browser and attach a screenshot.

Docs candidates go in a fenced `json` block at the end of your handoff:

```json
{"docsCandidates": [{"file": "packages/app/CLAUDE.md", "note": "…", "why": "…"}]}
```

`why` is the field that decides it — a note without a real cost behind it usually isn't one.
Omit the block entirely when nothing cost you time.
