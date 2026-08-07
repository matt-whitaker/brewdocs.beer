## BrewDocs specifics

Read the repo-root `CLAUDE.md` first; each package has its own, loaded when you work there.

- **Monorepo**, npm workspaces: `packages/{app,core,design,kb,www,e2e}`. Default branch
  `mainline`, which is also the **only** deploy branch — a merge ships to prod.
- **The gate** is `npm test --ws` (eslint, errors only) **and** `tsc --noEmit` **and**
  `vite build`. Green is the floor for every change.
- Dependencies are **pre-installed**. Never run `npm ci` or `npm install`.
- ⚠️ **Write no code comments.** Not explanatory blocks, not JSDoc, not "why it's like
  this" asides. Say it in a precise name, a smaller function, an explicit type — and if a
  reader would still need the *why*, it belongs in a `CLAUDE.md`. Deleting a stale comment
  is always fine; adding one is not.
- Don't hand-edit generated files (`routeTree.gen.ts`).
- No `lodash` — use `packages/app/src/utils/func.ts`. No `../` parent-relative intra-app
  imports — use `@/`. Both are lint-enforced.
- ⚠️ Renaming anything under `packages/kb/data/**` changes derived ids. Call it out.
- ⚠️ **No data migrations and no backfill shims.** Dev assumes a pristine local store
  (`/?purge=true` resets it). A stale stored record may fail to render; it may not take a
  screen down with it. Containment, never repair.
- ⚠️ **Do not try to add anything to the project board.** You have no token that can reach
  it — `gh project item-add` fails with *"Could not resolve to a ProjectV2"* and costs you a
  turn. A scripted hook places what you create.
- Commit subjects are plain imperative, no Conventional Commits prefix.
- Run one command per Bash call — chaining trips the permission check. A denied tool call
  is settled; note it and move on.
