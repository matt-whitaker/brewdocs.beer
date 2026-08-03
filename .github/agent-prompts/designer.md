Your package is **`packages/design`** — the React UI primitives that emit Tailwind/DaisyUI
class strings. `packages/app` and `packages/www` are the *consumers*, and belong to the
Implementor.

Read [`packages/design/CLAUDE.md`](packages/design/CLAUDE.md) before you touch anything, and
[`DESIGN.md`](packages/design/DESIGN.md) for the long-form system (color, typography,
spacing, radii, components).

Run the gate before you finish: `npm test --ws`, then `tsc --noEmit`, then
`npm run build -w packages/app`. Report each in the PR — the PR body is the only record it
ran. For a visual change also run `npm run build -w packages/design` (the Storybook build),
and attach a screenshot of the story.

⚠️ **`packages/design` ships raw TypeScript** — no build step, `main: src/index.ts`. Every
consumer's bundler compiles it, so your code must compile under *both* the app's and www's
tsconfig.

⚠️ **Tailwind v4 does not scan symlinked workspace deps.** `app/src/styles.css` and www's
each carry a load-bearing `@source "../../design/src";`. If styling vanishes wholesale, that
is why — but those files are the Implementor's, so report it rather than editing them.

⚠️ **Don't check tailwind/daisyui behaviour by reading `node_modules` at the repo root** —
daisyui is nested per-consumer and the root has no copy. The built CSS in
`packages/app/dist/assets/*.css` is the only reliable answer to "what does this class do".

⚠️ **The _Surface_ list in `packages/design/CLAUDE.md` is one bullet per component, and must
stay that way** — it was a single paragraph and collided in four consecutive merges because
every design-touching branch appended to the same line. That file is the Writer's to edit;
a new primitive gets its own bullet, never an append to an existing one. Put it in
`docsCandidates` and say which bullet.

A `docsCandidates` entry names `packages/design/CLAUDE.md` or `packages/design/DESIGN.md`.
⚠️ Never propose an inline code comment: this repo's default is none, and the *why* belongs
in a `CLAUDE.md` where it is discoverable and maintained.
