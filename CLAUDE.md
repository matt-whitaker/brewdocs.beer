# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

BrewDocs is an offline-first homebrewing PWA (brew-day companion + knowledge base), currently a proof-of-concept. npm-workspaces monorepo, all packages named `@brewdocs.beer/<name>`:

| Package | Role |
|---|---|
| `packages/core` | Shared types (Entity, Units, Currencies), React prop/event helpers, `createFetchClient` |
| `packages/kb` | Knowledge base: raw JSON data → built resource files → HTTP adapter (`importResource`) + `Kb*` model types |
| `packages/design` | React UI primitives (typography, inputs) that emit Tailwind/DaisyUI class strings |
| `packages/app` | The PWA itself: Vite + React + TanStack Router/Query, deployed to app.brewdocs.beer |
| `packages/www` | Astro marketing/info site at brewdocs.beer |

Default/main branch is `mainline`.

## Commands

Run from the repo root with `-w`:

```bash
npm run dev -w packages/app       # app dev server (auto-symlinks kb dist via predev)
npm run build -w packages/app     # tsc --noEmit && vite build → dist/
npm run preview -w packages/app   # serve the production build (needed to test PWA/service worker)
npm run build -w packages/kb      # rebuild kb dist JSON from data/ (also runs on postinstall)
npm run dev -w packages/www       # astro dev
npm run storybook -w packages/design
```

- **Node ≥22 required** (CI uses 22). On this machine, non-interactive shells resolve `node` to an ancient nvm default (v10) — if commands fail with syntax errors in node_modules, prefix with `PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"`.
- **No test framework exists anywhere** (CI's Test job is a placeholder echo). Verification = typecheck + build + manual browser checks.
- **No linting in `app`** (deliberately removed). `core`/`design` carry eslint configs but they're not part of any enforced flow.
- Typecheck app only: `cd packages/app && ../../node_modules/.bin/tsc --noEmit`.

## How the packages depend on each other

```
core ← design ← app        core ← kb ← app        core ← design ← www
```

**Workspace packages ship raw TypeScript source** (`main: src/index.ts`, no build). Consumers' bundlers compile them, which means:

- Code in `core`/`design`/`kb` must compile under every consumer's tsconfig, and `core` must stay environment-agnostic (no `import.meta.env`, no Node APIs) — it's consumed by Vite (app), Astro (www), and plain-Node scripts (kb build).
- Tailwind v4 does not auto-scan symlinked workspace deps: `app/src/styles.css` has a load-bearing `@source "../../design/src";`. Without it, all design-package styling silently disappears.
- `design` declares no tailwind/daisyui of its own (removed — it never used them; nothing there imports either). Its components' class strings must be valid **DaisyUI v5 / Tailwind v4**, because app and www are what compile them, via `@source "../../design/src"` + `@plugin "daisyui"` in their own stylesheets.
- **Don't read `node_modules/<pkg>` at the repo root to check tailwind/daisyui behavior.** daisyui is nested per-consumer (app and www, both v5), so there is no root copy; root `tailwindcss` is **3.4.19**, an auto-installed peer of www's `@tailwindcss/typography` (whose peer range starts at `>=3.0.0`) that nothing compiles with. The built CSS in `packages/app/dist/assets/*.css` is the only reliable answer to "what does this class actually do".

## packages/core

`src/models.ts` (Entity `{id}`, `Units`/`Currencies` enums), `src/props.ts` (`PropsWithClass` etc.), `src/event.ts` (`eventValue` — unwraps `e.target.value` into a plain-value callback; the design inputs all use it), `src/fetchClient.ts` (`createFetchClient({baseUrl, headers})` — thin fetch wrapper, throws on non-2xx, JSON responses; no retries/caching since TanStack Query owns that layer).

## packages/kb

- **Data**: one JSON file per item under `data/{grains,hops,yeasts,recipes}/`. `bin/build-json.js` combines each directory into `dist/<resource>.json` as a `{version, data: [...]}` envelope. **Item `id`s are derived from filenames** — the builder does `data.id = basename(file)`, overwriting whatever `id` the JSON declares (so the in-file `id` field is dead weight; e.g. `anchor-steam-beer-clone.json` yields id `anchor-steam-beer-clone` no matter what its JSON says). Batches reference recipes by this filename-id, so renaming a data file is a breaking change.
- **Models** (`src/models.ts`): `KbRecipe`, `KbGrain`, `KbHop`, `KbYeast`, `KbScalar`. KB interfaces use primitives only (no enums), nesting allowed, no normalization. `KbScalar` is `{value, unit}` where **unit strings must exactly match `Units` enum values** in core (`"oz"`, `"min"`, `"°F"`, `"%"`, `"°P"`…). A wrong unit in data doesn't error — it silently corrupts edit behavior in the app (the unit-preserving input formatter falls back to the stored unit).
- **`importResource(resource)`** (`src/importResource.ts`): fetches `/kb/<resource>.json` over HTTP via core's fetchClient (same-origin, relative). Return type is inferred from the literal resource string via a `ResourceTypeMap`. kb is deliberately a dumb transport adapter — persistence/caching is the app's job.

## packages/design

React primitives re-exported from `src/index.ts`: `ScreenH1–H5`/`ScreenP` (typography), `InputText`, `InputDate`, `InputSelect`. (`input-checkbox`, `input-unit` exist but aren't exported yet.) `InputText` blurs on Enter when an `onBlur` handler is present — that's how "press Enter to commit" works app-wide. `src/stories/` is untouched Storybook scaffolding, excluded from consumer builds.

## packages/app

Vite SPA + PWA (`vite-plugin-pwa`, autoUpdate service worker). React 18 **without StrictMode** (mutations are fire-and-forget and must not double-fire).

### Routing
TanStack Router, file-based under `src/routes/` — `routeTree.gen.ts` is generated by the router Vite plugin; never hand-edit it. Routes: `/`, `/batches`, `/batch/$batchId`, `/recipes`, `/recipe/$recipeId`, `/knowledge`, `/disclaimer`. Path params via `Route.useParams()`. Router `defaultErrorComponent` (in `main.tsx`) renders thrown errors from suspense fetchers.

**Param route filenames contain `$`** (`batch.$batchId.tsx`, `recipe.$recipeId.tsx`), which the shell expands. Quoting the whole argument isn't enough — under the `@claude` action's permission layer that's rejected outright as "shell expansion syntax in paths". Single-quote just the dollar:

```bash
git rm packages/app/src/routes/recipe.'$'recipeId.tsx
```

To rename one: write the new file, then `git rm` the old with that escape. Retrying the same command with different outer quoting will not work — this cost a bot run five wasted turns.

### State: TanStack Query, suspense-first

- All reads go through `useSuspenseQuery` wrapper hooks in `src/state/` (`useBatches`, `useBatch`, `useRecipes`, `useRecipe`, `useKbGrains/Hops/Yeasts`, `useSession`). Hooks return non-null data and throw on failure; screens are wrapped in `<Suspense>` at the route level.

- `queryClient.ts` sets `staleTime: Infinity` — **nothing refetches on its own**. Every write goes through an action/save function that explicitly calls `queryClient.invalidateQueries(...)` (`saveBatch`, `saveSession`, actions in `src/actions/`). If data seems stale after a mutation, a missing invalidation is the first suspect.
- All four kb resources are prefetched at boot (`main.tsx`).

### Offline-first kb data flow
```
useKbX() → IndexedDB (storage/kb.ts) hit? return it
         → miss + navigator.onLine false? throw (rendered by router error component)
         → miss + online: importResource() over HTTP → hydrate IndexedDB → return
```
The local kb cache has **no versioning** — if the stored shape changes, users (and you, testing) get stale data until purged. `/?purge=true` on any URL wipes batches + session + kb stores and redirects home (`component/db-cleanup`).

### Storage (`src/storage/`)

localforage wrappers extending `Forage<T>` (`forage.ts`; keys are `` `${name}#${id}` ``): `batches` (IndexedDB), `kb` (IndexedDB, one entry per resource), `session` (sessionStorage driver — collapse/toggle memory, cleared on tab close), `query` (custom driver, see below — UI state that should live in the URL).

`queryStorageDriver.ts` is a **custom localforage driver whose backing store is the URL query string** (mirrors the `localforage-sessionstoragewrapper` structure: a synchronous `Storage`-shaped shim over `URLSearchParams` + `history.replaceState`, using localforage's serializer so values keep their JSON types, and the same `name/` key-prefix so it ignores foreign params). Registered in `localforage.ts` as `LF_QUERYSTORAGE`. Consequence of URL-backed storage: state **survives an inline refresh but resets on navigation** (the query string is dropped) — which is exactly why the panel switcher uses it for the active tab. Values must be small (they sit in the address bar) and JSON-serializable.

### Model boundary: Kb* vs app models (important)
Two model families with a deliberate transform boundary (`src/transform/`):

- **Kb models** (`KbGrain`, `KbHop`, `KbYeast`, `KbRecipe`) are catalog/reference shapes — richer data (origin, notes, alpha as number). They flow through kb hooks, caches, dropdown lists, and the knowledge screens **untransformed**. Never map them to app models at download/cache time.
- **App models** (`src/model/`: `Batch`, `Grain`, `Hop`, `Yeast`, `Scalar`…) are batch-instance shapes. The transform happens only at the moment of use: picking a catalog item in a Planning dropdown (`kbHopToHop` etc. — fills instance defaults like `weight: "0.0oz"`), or instantiating a recipe into a batch (`createBatch` → `kbRecipeXToX` mappers, which preserve the recipe's real values via `kbScalarToScalar`).
- `model/recipe.ts` is intentionally unused — reserved for a future user-created-recipes feature. KB-sourced recipes flow as `KbRecipe` everywhere.
- `Scalar` convention: `{value: "9.0lb", unit: "lb"}` — the display string embeds the unit; `unit` is the parsing/fallback hint.

### Derived batch data (`src/actions/`)

Several batch fields are **projections of the ingredients**, not edited directly — the shopping list and the brew schedule are both flat, tagged views over `grains`/`hops`/`yeasts`/`additives`/`mash`/`boil`/`hydrometer`. The `_updateX(batch)` actions rebuild them in place (`Object.assign(batch, …)`):

- `_updateShopping` → `batch.shopping` — one row per ingredient, weights aggregated, tagged by source type.
- `_updateSchedule` → `batch.schedule` — one row per ingredient-per-step, tagged `[phase, kind]` (see BatchSchedule below).
- `_updateRecipe(recipe, batch)` / `_updateChecklists(recipe, batch)` seed ingredient fields / checklists from a `KbRecipe`, so they take the recipe alongside the batch.

Two conventions make rebuilds safe:

- **Reuse-by-reference.** Each rebuild matches new derived items against the previous list by a stable key and preserves the *user-owned* fields across recalculation (shopping `cost`/`purchased`; schedule `completed`/`actual`). When nothing the action owns changed, it returns the **previous object by reference** — so the `isEqual` diff below stays cheap and an untouched list doesn't look dirty on every save.
- **Trigger diffing.** `updateBatch` (the save path for edits) re-runs a derivation only when one of its trigger fields actually changed (`shoppingTriggers`, `scheduleTriggers`) — editing the batch name doesn't rebuild the schedule. `createBatch` instead runs the whole pipeline once, in order: `_updateRecipe` → `_updateShopping` → `_updateSchedule` → `_updateChecklists`.

Derived fields are **not migrated** — POC, breaking changes expected: a batch stored before a derived field existed throws until re-derived or purged (`/?purge=true`). Note the standalone Checklists screen was removed and its equipment-checkoff role moved onto BatchSchedule phases (below) — but the batch tab is **still labelled `Checklists` while rendering `<Shopping>`** (`routes/batch.$batchId.tsx`), a known misnomer. (`model/recipe.ts` + `model/checklist-definition.ts` remain in the tree, unused, reserved for the future user-created-recipes feature.)

### BatchSchedule screen: configurable phases

The BatchSchedule tab is driven by two batch fields:

- **`batch.phases: Phase[]`** — *configuration*: each phase is one sub-tab, rendered with the `compact` PanelSwitcher variant. A phase's `tags` is an **intersection filter** over schedule items (`["boil"]` = the whole boil; `["boil","hops"]` = only its hop additions; `[]` = everything). Phases also carry `equipment: ChecklistItem[]` — the kit to ready before the step, checked off in place (config *and* state on one object, which is fine because phases are per-batch). Seeded by `defaultBatch` (`data/defaultBatch.ts`), whose default four phases pull their equipment from the `data/equipment.ts` catalog by `EquipmentUses`.
- **`batch.schedule: ScheduleItem[]`** — derived (see above), each tagged `[phase, kind]`; within a tab, items group by `kind` under collapsible headers.

Key `ScheduleItem` traits (full commentary in `model/batch.ts`):

- **`path` write-through.** A row edits the *ingredient's* value (`hops[2].boil`, `yeasts[0].temp`) through a dot-path, never a copy — so no second value can diverge or be clobbered on the next rebuild. Paths land on either a `Scalar` or a plain string (dates); `index.tsx`'s `valueAt` reads both.
- **planned vs. actual.** `amount` is the derived plan; `actual` is user-owned and set only when what went in differed — brew-day weights are captured *without* rewriting what the shopping list aggregates.
- **`extra: ScheduleDetail[]`** — secondary fields (e.g. the pitch date, `batch.pitchedDate`) shown in a nested DataGrid behind the row's expander. A `ScheduleDetail` points into the batch but carries no checkoff/plan of its own — it's a field, not a step.

Phase **names are the identity** (React key, tab title, query-param value), so renaming one orphans its stored collapse/active-tab state. The screen is just `index.tsx` + `item-row.tsx` + `equipment.tsx` now — the old per-step screens were deleted in this rework.

### Editing pattern

`hooks/useJsonEdit.ts` is the workhorse for batch editing: local draft state + dot-path updates (`update("hops[0].boil.value", v)`), 350ms-debounced saves, and `updateScalar` which re-formats input on blur using the **previous scalar's unit as the default** when the user types a bare number. Paths support both dot and bracket segments (custom lodash-style `get`/`set` in `utils/func.ts` — the repo uses these hand-rolled utils, not lodash; don't add lodash). Its resync effect deep-compares before accepting store emissions, so a re-emitted identical batch doesn't disturb an in-progress draft.

`component/panel-switcher/` is a fully React-controlled tablist/tabpanel (button tabs, not DaisyUI's radio+sibling-CSS pattern) that mounts **only the active panel**. Routes declare panels as direct children: `<PanelSwitcher name="batch" defaultTab="Planning"><PanelSwitcherContent title="...">...` — `PanelSwitcherContent` never renders; `PanelSwitcher` reads its props via `React.Children` (so panels must be direct children — no wrapping fragments; a panel without children renders as a disabled tab). A **`.map()` array child is fine** (`Children.toArray` flattens it — this is how the BatchSchedule screen builds one panel per phase); a **wrapping Fragment is not** (it collapses to a single child and the tabs vanish). A `compact` prop gives tighter tabs (`tabs-sm`, in-flow rather than mobile-full-bleed) for a sub-nav nested inside another switcher's panel — used by the BatchSchedule screen (one sub-tab per phase) and the Planning screen (`Ingredients`/`Equipment` sub-nav below the recipe/batch header). Tab switches run inside a `useTransition` (`usePanelSwitcher`, called internally). Two invariants: the tablist sits **outside** the Suspense boundary (tabs stay visible while content loads), and the boundary itself lives inside `PanelSwitcher` and must stay mounted across switches — a transition only holds the previous panel for an *already-mounted* boundary; per-panel `<Suspense>` wrappers would flash their fallback on every switch. Panel unmount-on-switch is safe because edits persist through immediate/debounced saves (debounce timers survive unmount) and UI state persists: collapse open/closed state to `session` (sessionStorage), the active tab to `query` (URL query string — so it survives an inline refresh but resets on navigation to a different batch/recipe).

### Styling (Tailwind v4 + DaisyUI v5, nord theme)
CSS-first config in `src/styles.css` (no tailwind.config file, no PostCSS): `@plugin "daisyui"`, `@theme` block with custom SRM `beer-*` colors, `xs` breakpoint, and the `@source` for design (see above). Gotchas learned the hard way:

- DaisyUI theme variables live in the `base` cascade layer, which beats `@theme` (the `theme` layer). Overriding a daisyui token (e.g. `--radius-selector`) requires a plain **unlayered** `:root {}` rule — see the bottom of `styles.css`.
- Some DaisyUI behaviors are compound selectors keyed to **literal class names** (e.g. `.collapse`'s arrow rotation requires the literal class `collapse-arrow`). Applying such classes only via responsive variants (`max-lg:collapse-arrow`) silently breaks the behavior — apply the literal class and gate the *visual* with a plain utility instead.
- Tailwind utilities override DaisyUI component styles (cascade layers), so `checked:bg-primary` etc. on components is the intended customization mechanism.
- A `tabIndex` on a `.collapse` element force-opens it via `:focus-within` in v5 — don't add one.

### Env
`VITE_WWW_URL`, `VITE_DEV_TOOLS` (enables router/query devtools), `VITE_FEATURES_SEARCH_EVERYWHERE` — read only in `src/utils/env.ts`.

### kb serving during dev/build
`npm run link-kb` symlinks `public/kb → ../../kb/dist`, and it runs **only via `predev`** (dev). It is **deliberately not wired to `build`**: the pre-hook script is named `devprebuild`, *not* `prebuild`, on purpose — so `link-kb` does **not** fire before `vite build`, keeping the kb symlink/JSON out of the app's `dist` and therefore out of the app S3 bucket. kb ships independently to its own bucket (`app-kb-prod`, served at `/kb/*` via CloudFront), so the app must not carry its own copy. **Don't "fix" `devprebuild` to `prebuild`** — that reintroduces kb into the app publish.

Consequences:
- A **clean build** (CI / fresh checkout, no `public/kb`) produces a `dist` with **no `dist/kb`**. So in prod the service worker does *not* precache kb — offline kb comes entirely from the IndexedDB hydration flow (see *Offline-first kb data flow* above), not the PWA precache.
- **Local-vs-prod gotcha:** once you've run the dev server, the leftover `public/kb` symlink makes a *local* `npm run build` dereference it and include+precache `dist/kb/*.json`. A local `build`/`preview` therefore shows kb precached even though the deployed app doesn't — don't infer prod offline behavior from a local build. (`rm public/kb` to reproduce the clean/CI result.)
- The precache `globPatterns` still lists `json`; harmless to keep, but it is *not* the kb-offline mechanism.

## packages/www

Astro 7 static site with React islands, same styling stack as app (Tailwind v4 + DaisyUI v5 via `@tailwindcss/vite`, nord, Urbanist). Env vars use Astro's `PUBLIC_` prefix (`PUBLIC_APP_URL`, `PUBLIC_GITHUB_URL`), read in `src/data/env.ts`. Pages: `/` and `/about`. Requires Node ≥22.12 (`engines`).

## Deployment

GitHub Actions, path-filtered on push to `mainline` (the sole deploy branch), all delegating to the reusable `matt-whitaker/aws-static-site` workflow (S3 + CloudFront):

- `build-test-deploy.app-prod.yaml` — app dist → app S3 bucket (app.brewdocs.beer)
- `build-test-deploy.app-kb-prod.yaml` — **kb dist deploys independently** to a dedicated kb S3 bucket behind the app's CloudFront distribution (invalidates `/kb`). This is why `importResource` fetches the relative path `/kb/*` — same origin in prod, symlink in dev, and kb data updates ship without an app rebuild.
- `build-test-deploy.www-prod.yaml` — www dist → www bucket (brewdocs.beer)

## Contributing

Guidance for human contributors **and** for the `@claude` GitHub integration (`.github/workflows/claude.yaml`).

### Branches

- `mainline` is the default branch, the target for **all** PRs, and the **only** deploy branch — a push/merge to it ships to prod (see Deployment). There is no separate staging branch, so the open PR is the staging buffer. (`develop` is retired.)
- Branch off `mainline`, and **name branches issue-first**: `<issue#>-<kebab-summary>`, e.g. `42-derived-schedule`. Work usually has an issue because the `@claude` bot is triggered from issues; fall back to bare kebab-case (`derived-shopping`) for un-ticketed work.

### Commits, PRs & merging

- **Commit messages**: plain imperative subject ("Add schedule phases") — no Conventional Commits prefix. (Conventional is the upgrade path if changelog/semver automation is ever added; not worth it without a release flow.)
- **PR title**: same imperative style as the commit.
- **PR description** — a light template, with *Verification* load-bearing because there's no test suite (the PR body is the only record the gate ran):
  - **Summary** — what changed and why, with `Closes #<issue>` when there's a ticket (GitHub then cross-links the two and closes the issue on merge).
  - **Verification** — `tsc --noEmit` ✓, `vite build` ✓, and which screens/flows were checked in the browser.
  - **Screenshots** — for any UI change.
- **Merge method: squash only** — one commit per feature on the deploy branch.
- **The maintainer merges.** Contributors and the `@claude` bot open PRs; they don't merge them. No auto-merge.
- Protect `mainline` to require the **Verify** check green before merge (`.github/workflows/verify.yaml` — `npm ci` + app/www builds on every PR, no deploy). It's the real gate: the `build-test-deploy.*` workflows run only *post*-merge on push, so they can't block a PR.

### Definition of done

- **There is no test framework** (CI's Test job is a placeholder echo). The verification gate is `tsc --noEmit` **and** `vite build` clean, plus manual browser checks for any UI change — see Commands. A green typecheck + build is the floor for every change.
- Don't hand-edit generated files (`routeTree.gen.ts`) and don't add `lodash` (the repo deliberately uses hand-rolled `utils/func.ts`).
- Renaming files under `packages/kb/data/**` changes derived ids and is a breaking change (see packages/kb) — call it out explicitly in the PR.
- Prefer surfacing follow-ups over silently expanding scope; note orphaned/dead code you leave behind rather than deleting adjacent things unasked.

### The `@claude` integration

- Defined in `.github/workflows/claude.yaml`. Two ways in: an `@claude` mention in an issue/PR comment, an inline review comment, or a submitted PR review — **or** applying the **`claude` label to an issue**. Runs `anthropics/claude-code-action` on `sonnet` with `--max-turns 30` and write access to contents/PRs/issues (plus `actions: read`, so it can read a failed **Verify** run).
- **Keep the task checklist coarse — 3–5 outcome-level items.** ("Add the version field to the models", not one line per file.) Group related edits under a single item rather than expanding into a granular plan, and update the PR comment only at those milestones. The action narrates every checklist item back to the PR, so each item costs a turn: a 10-item list spends most of the budget before any code is written. This is the single biggest consumer of the turn budget.
- **It does not run the build gate itself.** `npm ci` plus both package builds ate most of the turn budget before any code got written, so the prompt tells it to leave verification to the **Verify** workflow on the PR and only run a build when asked to fix one Verify already failed.
- **It writes back to the issue.** For label-triggered work it posts a short summary comment with the PR link, on top of the progress comment `track_progress` already maintains — so the issue carries the record even though the detail lives in the PR.
- **Verify on a bot-opened PR waits for approval.** A PR opened by a workflow using `GITHUB_TOKEN` creates `pull_request` runs that require a maintainer to click *Approve and run* — the check isn't broken, it's held. Since the maintainer merges anyway this is one extra click in the same pass; swapping `GH_TOKEN` for a PAT/App token would remove it, at the cost of letting bot-authored code into CI unattended.
- **Issues are label-triggered, not mention-triggered.** `issues: [opened]` is deliberately *not* subscribed: a job-level `if:` can't stop a workflow run from being created, so subscribing to `opened` would grey-out a skipped run for every new issue. Subscribing to `[labeled]` instead means creating an issue produces no run at all, and only the `claude` label gets past the `if:`. `label_trigger` tells the action to treat the label as the trigger — without it, it looks for an `@claude` mention and finds none.
- The action's default is to push a branch and hand back a *pre-filled PR link*. A `prompt` overrides that so it opens the PR itself; `track_progress: true` keeps `@claude` mention handling alive alongside that prompt, and `GH_TOKEN` is passed through so the allow-listed `gh pr create` can authenticate.
- Keep tasks addressed to it scoped to finish within that turn budget; large refactors should be broken up.
- **House rules**: never push to a deploy branch — open a PR instead. It may open PRs, push to feature branches, and comment, but may **not** merge its own PR (the maintainer merges), edit `.github/workflows/**` or secrets, or run destructive git. It must pass the verification gate (typecheck + build) before proposing a PR. Proceed on clearly-scoped tasks; ask when a change is ambiguous, irreversible, or outward-facing.
