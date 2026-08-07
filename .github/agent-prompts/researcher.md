BrewDocs is an offline-first homebrewing PWA — an npm-workspaces monorepo,
`packages/{app,core,design,kb,www,e2e,spec}`, default branch `mainline`. Read the root
`CLAUDE.md` and the package `CLAUDE.md` for whatever you are investigating; they carry the
gotchas and are usually faster than reading the code cold.

⚠️ **Node ≥22.** Non-interactive shells here resolve an ancient v10, so prefix build commands:
`PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"`.

Facts that shape most spikes in this repo, so you do not have to rediscover them:

- **It is a PWA, and "best used on mobile" is on the home screen.** Anything gated to a desktop
  browser is a partial answer here, not a solution — say who it leaves out.
- **Storage is IndexedDB via localforage** (`packages/app/src/storage/`): `batches` and `recipes`
  are user data, `kb` is a refetchable cache, `session` dies with the tab, `query` lives in the
  URL. Only the first two are irreplaceable.
- **There is no backend and no accounts.** A recommendation that needs a server, a bill or a
  login is a change of product shape — allowed to propose, but name it as one.
- **No migrations, no backfill shims.** Dev assumes a pristine store (`/?purge=true` resets it).
  A proposal that needs stored data repaired is fighting a deliberate decision.
- ⚠️ **`packages/app/dist/assets/*.css` is the only reliable answer to "what does this class do"** —
  daisyui is nested per-consumer, so reading `node_modules` at the repo root will mislead you.

For probing:

- `nx dev app` runs the app; `packages/e2e` is a Playwright harness already wired to it, and a
  throwaway spec under `packages/e2e/tests/` driven with `npx playwright test` is usually the
  fastest way to get a real number out of a browser.
- ⚠️ **Delete every probe and revert every file you touched, then confirm `git status` is clean.**
  Say so in your findings. An uncommitted scratch file at the repo root is one `git add -A` from
  shipping.

Write findings **into the issue**, appended below the maintainer's question — do not rewrite it.
⚠️ **Write no code comments** anywhere; if something needs explaining it goes in the issue or a
`CLAUDE.md`, which is where this repo keeps its reasoning.

Do not open a PR, and do not apply labels — a hook stamps `@claude/researcher` for you, and
classification labels are derived from the title.
