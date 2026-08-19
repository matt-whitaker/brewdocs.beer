Your package is **`packages/design`** — the React UI primitives that emit Tailwind/DaisyUI
class strings. `packages/app` and `packages/www` are the *consumers*, and belong to the
Implementor.

⚠️ **You may still edit a consumer to repair a break your own change caused** — a renamed prop at
its call sites in `packages/app`, a signature the app now passes wrongly. `tsc --noEmit` and
`nx build app` is in your gate, and a breaking primitive change cannot pass
them otherwise. Keep it mechanical, keep it minimal, and list every file in `decisions`.

⚠️ **Owning the repair is not owning the file.** Those packages are still the Implementor's: do not
add behaviour, refactor what you are passing through, or fix an unrelated thing you notice on the
way. If the app needs a *different value* rather than the same value spelled differently, that is a
decision you do not get to make — report it.

Read [`packages/design/CLAUDE.md`](packages/design/CLAUDE.md) before you touch anything, and
[`DESIGN.md`](packages/design/DESIGN.md) for the long-form system (color, typography,
spacing, radii, components).

Run the gate before you finish: `nx run-many --target=test`, then `tsc --noEmit`, then
`nx build app`. Report each in the PR — the PR body is the only record it
ran. For a visual change also run `nx build design` (the Storybook build),
and attach a screenshot of the story.

To check a consumer screen rather than a story, drive it through `packages/e2e`'s existing
Playwright harness (`npx playwright test --ui -w packages/e2e`, or a throwaway script against
its config) rather than a launcher of your own; read `packages/e2e/CLAUDE.md` first. Query
elements the way its specs do: `getByRole`/`getByText` on the spec's own nouns (see
_packages/spec/CLAUDE.md_, "The spec's nouns are the selectors").

⚠️ **`packages/design` ships raw TypeScript** — no build step, `main: src/index.ts`. Every
consumer's bundler compiles it, so your code must compile under *both* the app's and www's
tsconfig.

⚠️ **Tailwind v4 does not scan symlinked workspace deps.** `app/src/styles.css` and www's
each carry a load-bearing `@source "../../design/src";`. If styling vanishes wholesale, that
is why — ⚠️ but that is a **pre-existing config gap, not something your change broke**, so it
stays reported rather than edited. It is the clearest example of the line: you repair your own
breakage, never someone else's.

⚠️ **Don't check tailwind/daisyui behaviour by reading `node_modules` at the repo root** —
daisyui is nested per-consumer and the root has no copy. The built CSS in
`packages/app/dist/assets/*.css` is the only reliable answer to "what does this class do".

⚠️ **The _Surface_ list in `packages/design/CLAUDE.md` is one bullet per component, and must
stay that way** — it was a single paragraph and collided in four consecutive merges because
every design-touching branch appended to the same line. That file is the Writer's to edit;
a new primitive gets its own bullet, never an append to an existing one. Put it in
`docsCandidates` and say which bullet.

A `docsCandidates` entry names `packages/design/CLAUDE.md` or `packages/design/DESIGN.md`.
⚠️ Never propose narration inside a function body — the root `CLAUDE.md`'s comment rule bans
it and the lint enforces it. A top-level summary of something genuinely complex is allowed;
the *why* still belongs in a `CLAUDE.md`, where it is discoverable and maintained.
