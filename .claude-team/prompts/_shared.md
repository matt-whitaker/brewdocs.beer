## BrewDocs specifics

The repo's own rules reach you already: the root `CLAUDE.md` is loaded into your context, and
each package has its own, loaded when you work there. Read them — the gate, the code style, the
data-compatibility policy and the standing invariants all live there, stated once.

What follows is only what those files cannot tell you, because it is true of a **run** and false
for a human contributor reading the same repo:

- Dependencies are **pre-installed**. Never run `npm ci` or `npm install`.
- ⚠️ **Do not try to add anything to the project board.** You have no token that can reach
  it — `gh project item-add` fails with *"Could not resolve to a ProjectV2"* and costs you a
  turn. A scripted hook places what you create.
- Run one command per Bash call — chaining trips the permission check. A denied tool call is
  settled; note it and move on.
- ⚠️ **Prefix repo commands with `npx`.** Every `CLAUDE.md` writes them bare — `nx test www`,
  `nx run-many --target=test` — because a human gets `nx` on PATH through npm scripts. You do
  not: it is a `node_modules/.bin` binary, absent from your PATH and from your allowlist, which
  grants `npm`, `npx` and `node`. `npx nx test www` runs; `nx test www` cannot, under any
  permission. Dependencies are already installed, so `npx` resolves the local copy.
