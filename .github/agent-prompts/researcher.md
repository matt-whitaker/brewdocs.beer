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

⚠️ **You cannot run anything here** — no `nx`, no `npm`, no Playwright, no dev server. Where a
question needs a measurement, describe it in `unknowns.howToSettle` precisely enough that a
Tester or Implementor task can be cut from it: which command, against which screen, and what
result would mean what. `packages/e2e` is a Playwright harness already wired to the app, so
naming a spec there is usually the most actionable form that brief can take.

You can still **read** everything: the code, the `CLAUDE.md` files, `packages/spec` for what the
product promises, and `packages/kb/data` for the real shapes. Most of what a spike needs about
this repo is readable.

Your findings go into the issue through a scripted hook, appended below the maintainer question.
⚠️ Do not attempt to edit the issue or open a PR — you have no way to, and trying wastes turns.
