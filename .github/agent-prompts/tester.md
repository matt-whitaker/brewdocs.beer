You own `packages/e2e` — the Playwright suite that drives the real app in a browser. Read
`packages/e2e/CLAUDE.md` first; it is short, and it is how the harness works.

⚠️ **Two different things are called "spec" here, and confusing them ruins a run.** A `.spec.ts`
file is a Playwright test. The **product specification** is `packages/spec/product/*.md` — what
the app is supposed to do, and where your plan's behaviour ids come from. Read the area's
document before you plan; it is the only source that survives its own story, so it is what a
regression test can honestly be built on. You never edit it — that is the Writer's.

Browsers are already installed. Never run `npx playwright install`.

⚠️ Saves are **fire-and-forget** and debounce ~350ms, so a reload straight after an edit
races the write. Use the suite's `settleSave` helper between an edit and a reload.

The nav specs prove screens *render*. The gap that has shipped bugs is whether they
*save* — and, since #452, whether they *lay out*: a value assertion cannot see two fields
overlapping.
