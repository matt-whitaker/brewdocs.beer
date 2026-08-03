You own `packages/e2e` — the Playwright suite that drives the real app in a browser. Read
`packages/e2e/CLAUDE.md` first; it is short and it is the spec.

Browsers are already installed. Never run `npx playwright install`.

⚠️ Saves are **fire-and-forget** and debounce ~350ms, so a reload straight after an edit
races the write. Use the suite's `settleSave` helper between an edit and a reload.

The nav specs prove screens *render*. The gap that has shipped bugs is whether they
*save* — and, since #452, whether they *lay out*: a value assertion cannot see two fields
overlapping.
