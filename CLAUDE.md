# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repo. **These instructions override default behavior.**

## Overview

- **What.** BrewDocs — offline-first homebrewing PWA (brew-day companion + knowledge base). **Proof-of-concept**; breaking changes are expected and there is no data migration in place yet.
- **Layout.** npm-workspaces monorepo; packages named `@brewdocs.beer/<name>`.
- **Default branch.** `mainline` — also the target for all PRs and the **sole** deploy branch.
- **Node.** ≥22. ⚠️ Non-interactive shells on this machine resolve `node` to an ancient v10 — if a command fails with syntax errors inside `node_modules`, prefix it: `PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"`.
- **Verify (the gate).** `npm test -ws` (eslint — app + www + design) + `tsc --noEmit` + `vite build`. No unit-test framework, no runtime tests — see _Linting_ and _Definition of done_.

| Package | Role |
|---|---|
| `core` | Shared, environment-agnostic types + helpers: `Entity`/`Units`/`Currencies`, React prop/event helpers, `createFetchClient`, the migration framework. |
| `kb` | Knowledge base: raw JSON data → built resource files → HTTP transport adapter (`importResource`) + `Kb*` model types. |
| `design` | React UI primitives (typography, inputs) that emit Tailwind/DaisyUI class strings. |
| `app` | The PWA itself: Vite + React + TanStack Router/Query. Deployed to app.brewdocs.beer. |
| `www` | Astro marketing/info site at brewdocs.beer. |

## Legend

Field labels used throughout. **Omitting** a field means it doesn't apply; **`_None._`** means it applies but is currently empty (audited — nothing to report). ⚠️ marks the easily-broken.

**Purpose** · **Where** · **Surface** (public API) · **How it works** · **Invariants** · **Gotchas** · **Example** · **Commands** / **Env**

Cross-references name the target section in _italics_. Paths are repo-relative and clickable.

## Commands

Run from the repo root with `-w`:

```bash
npm run dev -w packages/app       # app dev server (auto-symlinks kb dist via predev)
npm run build -w packages/app     # tsc --noEmit && vite build → dist/
npm run preview -w packages/app   # serve the production build (needed to test PWA/service worker)
npm test -w packages/app          # eslint — the verification gate (see Linting)
npm run build -w packages/kb      # rebuild kb dist JSON from data/ (also runs on postinstall)
npm run dev -w packages/www       # astro dev
npm test -w packages/design       # eslint — the verification gate (see Linting)
npm run dev -w packages/design    # storybook dev -p 6006
npm run build -w packages/design  # storybook build -o dist → the static site the deploy workflow publishes
```

Root `build:design`/`dev:design`/`test:design` delegate to `-w packages/design`, matching the `*:app`/`*:www` pattern (used by `.github/workflows/build-test-deploy.design-prod.yaml`).

- Typecheck app only: `cd packages/app && ../../node_modules/.bin/tsc --noEmit`.
- Lint app only: `npm run lint -w packages/app` (⚠️ see _Linting_ — must resolve the app's nested eslint 9, not the root's).

## Package dependencies

```
core ← design ← app        core ← kb ← app        core ← design ← www
```

**Workspace packages ship raw TypeScript source** (`main: src/index.ts`, no build) — consumers' bundlers compile them. Consequences:

- Code in `core`/`design`/`kb` must compile under **every** consumer's tsconfig, and `core` must stay environment-agnostic (no `import.meta.env`, no Node/DOM APIs) — it's consumed by Vite (app), Astro (www), and plain-Node scripts (kb build, Vite migration plugin).
- ⚠️ Tailwind v4 does not auto-scan symlinked workspace deps: `app/src/styles.css` (and www's) carry a load-bearing `@source "../../design/src";`. Without it, all design-package styling silently disappears.
- ⚠️ **Don't read `node_modules/<pkg>` at the repo root to check tailwind/daisyui behavior.** daisyui is nested per-consumer (app + www, both v5); root has no copy. Root `tailwindcss` is **3.4.19**, an inert auto-installed peer of www's `@tailwindcss/typography`. The built CSS in `packages/app/dist/assets/*.css` is the only reliable answer to "what does this class do".

---

# Packages

## packages/core

**Purpose.** Shared, environment-agnostic types and helpers used by every other package.
**Where.** `src/models.ts` (`Entity {id}`, `Units`/`Currencies` enums), `src/props.ts` (`PropsWithClass` etc.), `src/event.ts` (`eventValue`), `src/fetchClient.ts` (`createFetchClient`), `src/migration.ts` (see _Batch versioning & migrations_). Also `eslint.config.base.js` at the package root — the shared eslint flat-config base for app + www (dev tooling, not part of `src`; see _Linting_).
**Surface.** The above, re-exported from `src/index.ts`. `eventValue` unwraps `e.target.value` into a plain-value callback (the design inputs all use it). `createFetchClient({baseUrl, headers})` — thin fetch wrapper, throws on non-2xx, JSON only; no retries/caching (TanStack Query owns that).
**Invariants.** ⚠️ Must stay environment-agnostic — no `import.meta.env`, no Node/DOM APIs.
**Gotchas.** _None._
**Example.** _None._

## packages/kb

**Purpose.** Knowledge base: raw JSON per item → one built resource file per type → dumb HTTP transport adapter. Persistence/caching is the app's job, not kb's.
**Where.** `data/{grains,hops,yeasts,recipes}/*.json` (one file per item), `bin/build-json.js` (builder), `dist/<resource>.json` (built), `src/models.ts` (`Kb*` types), `src/importResource.ts`, `migrations/` (see _Batch versioning & migrations_).
**Surface.** `importResource(resource)` — fetches `/kb/<resource>.json` via core's fetchClient (same-origin, relative); return type inferred from the literal resource string via `ResourceTypeMap`. `Kb*` model types (`KbRecipe`, `KbGrain`, `KbHop`, `KbYeast`, `KbScalar`) — primitives only (no enums), nesting allowed, no normalization.
**How it works.** `build-json.js` combines each directory into `dist/<resource>.json` as a `{version, data: [...]}` envelope.
**Invariants.**
- ⚠️ `KbScalar` unit strings **must exactly match `Units` enum values** in core (`"oz"`, `"min"`, `"°F"`, `"%"`, `"°P"`…).
- ⚠️ Item `id`s are derived from **filenames** — renaming a data file changes its id and is a **breaking change** (batches reference recipes by this id).
**Gotchas.** A wrong unit in data doesn't error — it silently corrupts edit behavior in the app (the unit-preserving formatter falls back to the stored unit).
**Example.** The builder does `data.id = basename(file)`, overwriting whatever `id` the JSON declares (so the in-file `id` is dead weight): `anchor-steam-beer-clone.json` → id `anchor-steam-beer-clone`, regardless of its JSON.
**Commands.** `npm run build -w packages/kb` (also runs on postinstall).

## packages/design

**Purpose.** React UI primitives that emit Tailwind/DaisyUI class strings, previewed and published as a static Storybook site. App and www still compile the class strings for their own bundles — design's own tailwind/daisyui deps exist only to render Storybook.
**Where.** `src/index.ts` (re-exports), `src/components/*` (co-located `*.stories.tsx`), `src/design.css` (the minimal Tailwind v4 + DaisyUI v5 `nord` entry Storybook loads — **not** the token source of truth, see `DESIGN.md`), `.storybook/main.ts` + `.storybook/preview.tsx`, `tsconfig.json`, `eslint.config.js`. See [`DESIGN.md`](packages/design/DESIGN.md) for the long-form design system doc (color, typography, spacing, radii, components).
**Surface.** `ScreenH1–H5`/`ScreenP` (typography), `InputText`, `InputDate`, `InputSelect`, svg icons (`Hamburger`, `Plus`, `Pencil`, `Chevron`, `Cancel`, `Trash`, `UpDown`, `Minus`, `LockClosed`). `InputText` blurs on Enter when an `onBlur` handler is present — that's how "press Enter to commit" works app-wide.
**Invariants.** ⚠️ Class strings must be valid **DaisyUI v5 / Tailwind v4** — app and www are what compile them for the real app (via `@source "../../design/src"` + `@plugin "daisyui"`); Storybook compiles them too now, but only for its own preview. design now has a `@/*` → `./src/*` alias like app (`tsconfig.json`) — cross-component imports must go through it, since the shared eslint base bans `../` inside `src/**` (see _Linting_).
**Gotchas.** `.storybook/main.ts` wires the Tailwind v4 Vite plugin in explicitly via `viteFinal` — Storybook's bundled Vite instance doesn't auto-discover a project `vite.config.ts` (design has none), so without it `design.css`'s `@import`/`@plugin`/`@theme` directives would ship uncompiled. The same `viteFinal` also carries the `@/` alias's `resolve.alias` entry (mirroring `app/vite.config.ts`) — `tsconfig.json`'s `paths` only satisfies the type-checker, not Storybook's bundler. `input-checkbox` and `input-unit` (dead, non-compiling stubs, never exported) were deleted — reintroducing either needs a real implementation, not the old stub.
**Example.** _None._
**Commands.** `npm run dev -w packages/design` (`dev:design` from root) — Storybook on `:6006`. `npm run build -w packages/design` (`build:design`) — static Storybook to `dist/`, what `build-test-deploy.design-prod.yaml` uploads.

## packages/app

**Purpose.** The PWA — Vite SPA + PWA (`vite-plugin-pwa`, autoUpdate service worker), React 18.
**Where.** `src/{routes,screen,component,state,actions,storage,model,transform,hooks,utils,data}/`, `migrations/`, `vite.config.ts`, `eslint.config.js`.
**Invariants.** ⚠️ React 18 **without StrictMode** — mutations are fire-and-forget and must not double-fire.
**Gotchas.** _None._
**Example.** _None._
**Env.** `VITE_WWW_URL`, `VITE_DEV_TOOLS` (enables router/query devtools), `VITE_FEATURES_SEARCH_EVERYWHERE` — read only in `src/utils/env.ts`.

> App is large; each subsystem below follows the same template.

### Routing
**Purpose.** File-based routing (TanStack Router) with a generated route tree.
**Where.** `src/routes/*` — routes `/`, `/batches`, `/batch/$batchId`, `/recipes`, `/recipe/$recipeId`, `/recipe/$recipeId_/edit` (delisted, nothing links to it), `/knowledge`, `/disclaimer`. `routeTree.gen.ts` (generated); `main.tsx` (`defaultErrorComponent` renders thrown suspense-fetch errors).
**Invariants.** ⚠️ Never hand-edit `routeTree.gen.ts` (the router Vite plugin regenerates it). Read path params via `Route.useParams()`.
**Gotchas.** ⚠️ Param filenames contain `$` (`batch.$batchId.tsx`) → the shell expands it, and under the `@claude` permission layer that's rejected as "shell expansion syntax in paths". Quote just the dollar: `git rm packages/app/src/routes/recipe.'$'recipeId.tsx`. Retrying with different outer quoting will not work.
**Example.** Rename a param route → write the new file, then `git rm` the old with the `'$'` escape above.

### Breadcrumbs (the page "title")
**Purpose.** A route-owned breadcrumb trail rendered once at the top of every page — it **is** the page title, so screens don't render a redundant heading.
**Where.** `component/breadcrumbs/` — `context.tsx` (context + `useBreadcrumbs`/`useBreadcrumbTrail` hooks + the `dynamicCrumb` factory), `index.tsx` (the `Breadcrumbs` component **and** `BreadcrumbProvider` — the Provider lives here, not in `context.tsx`, so that file stays Fast-Refresh-clean). Mounted in `routes/__root.tsx`: `<BreadcrumbProvider>` wraps the shell, `<Breadcrumbs/>` sits above `<Outlet/>`.
**Surface.** `useBreadcrumbs(crumbs: Crumb[])` — registers a group while the caller is mounted. A `Crumb` is either static (`{label, to?, params?}`) or dynamic (built via `dynamicCrumb(hook, args, transform, rest?)`). `to`/`params` make a crumb a `<Link>`.
**How it works.** Each route calls `useBreadcrumbs` with its own trail; groups accumulate in a `Map` and `useBreadcrumbTrail` flattens them **reverse of registration** (effects fire child-first, so reversing yields parent→child). A **dynamic** crumb defers its data hook into a `<Suspense>`-wrapped label *inside* `Breadcrumbs` — never in the route, so the route itself can't suspend on a name lookup. Pass the hook **by reference + args** (`dynamicCrumb(useRecipeResource, ["user", id], r => r.name)`), not a `() => useX()` thunk (rules-of-hooks).
**Invariants.**
- ⚠️ Pass a **stable** `crumbs` array — a module `const` for a static trail, `useMemo` keyed on the route params for a dynamic one. It drives an effect; a fresh array each render thrashes.
- ⚠️ The container's `shrink-0` and `overflow-y-hidden` classes are **both load-bearing** (see Gotchas) — don't drop them.
**Gotchas.** ⚠️ `DrawerContent` is a fixed-height (`h-full`) flex column whose children overflow it, so **without `shrink-0`** flexbox squeezes the breadcrumb box *below its content height*, and the squeeze varies with the active panel's height → the tab bar wobbles ~1px on tab switches. **`overflow-y-hidden`** cancels the stray vertical scrollbar daisyui's `.breadcrumbs { overflow-x:auto }` otherwise induces on mobile. `/` (home) and `/disclaimer` are **intentionally exempt** — they register no crumbs (home is the hero landing; disclaimer keeps its own `<h1>`).
**Example.** `recipe.$recipeId_.edit.tsx`: `useMemo<Crumb[]>(() => [{label:"Recipes", to:"/recipes"}, dynamicCrumb(useRecipeResource, ["user", recipeId], r => r.name, {to:"/recipe/$recipeId", params:{recipeId}}), {label:"Edit"}], [recipeId])`.

### State (TanStack Query, suspense-first)
**Purpose.** All reads go through suspense wrapper hooks; nothing refetches on its own.
**Where.** `src/state/*` — `useBatches`/`useBatch`; **local editable recipes** `useRecipes`/`useRecipe`/`saveRecipe` (`recipes.ts`, backed by the `recipes` store); **read-only KB catalog** `useKbRecipes`/`useKbRecipe` (`kbRecipes.ts`) + `useKbGrains/Hops/Yeasts`; `useSession`, `query-params`. `queryClient.ts`. ⚠️ The two recipe families are distinct: `useRecipe` reads a user-owned `Recipe` from IndexedDB, `useKbRecipe` reads a catalog `KbRecipe` — don't cross them.
**How it works.** Wrapper hooks use `useSuspenseQuery`, return non-null data, throw on failure; screens wrap them in `<Suspense>` at the route level. All four kb resources are prefetched at boot (`main.tsx`).
**Invariants.** ⚠️ `queryClient` sets `staleTime: Infinity` — every write must explicitly `queryClient.invalidateQueries(...)` (`saveBatch`, `saveSession`, actions in `src/actions/`).
**Gotchas.** Stale data after a mutation ⇒ a missing invalidation is the first suspect.
**Example.** _None._

### Offline-first kb data flow
**Purpose.** Serve kb data from a local IndexedDB cache, hydrating from HTTP on first miss.
**Where.** `src/storage/kb.ts`, the `useKbX` hooks.
**How it works.**
```
useKbX() → IndexedDB hit? return it
         → miss + offline?  throw (rendered by the router error component)
         → miss + online:   importResource() over HTTP → hydrate IndexedDB → return
```
**Invariants.** _None._
**Gotchas.** ⚠️ The local kb cache has **no versioning** — a changed stored shape yields stale data until purged. `/?purge=true` on any URL wipes batches + session + kb stores and redirects home (`component/db-cleanup`).
**Example.** _None._

### Storage (`src/storage/`)
**Purpose.** localforage wrappers for the app's persisted state.
**Where.** `forage.ts` (`Forage<T>` base; keys are `` `${name}#${id}` ``), `batches` (IndexedDB), `recipes` (IndexedDB, store name `"recipes"` — user-owned recipes, distinct from the `kb` cache's `"recipes"` resource entry), `kb` (IndexedDB, one entry per resource), `session` (sessionStorage — collapse/toggle memory, cleared on tab close), `query` + `queryStorageDriver.ts`, `localforage.ts` (driver registration).
**How it works.** `queryStorageDriver.ts` is a **custom localforage driver backed by the URL query string** — a synchronous `Storage`-shaped shim over `URLSearchParams` + `history.replaceState`, using localforage's serializer (values keep JSON types) and a `name/` key-prefix (ignores foreign params). Registered as `LF_QUERYSTORAGE`.
**Invariants.** ⚠️ Query-driver values must be small (they sit in the address bar) and JSON-serializable.
**Gotchas.** URL-backed state **survives an inline refresh but resets on navigation** (the query string is dropped) — which is exactly why the panel switcher stores the active tab there.
**Example.** _None._

### Model boundary: Kb* vs app models
**Purpose.** Two model families with a deliberate transform boundary — catalog shapes vs. batch-instance shapes.
**Where.** `src/model/` (app models: `Batch`, `Grain`, `Hop`, `Yeast`, `Scalar`…), `src/transform/` (the mappers), `kbScalarToScalar` in `utils/formatting.ts`.
**How it works.** **Kb models** (`KbGrain`/`KbHop`/`KbYeast`/`KbRecipe`) are richer catalog/reference shapes; they flow through kb hooks, caches, dropdowns, and knowledge screens **untransformed**. The transform to app models happens **only at the moment of use** — picking a catalog item in a BatchPlanning dropdown (`kbHopToHop` etc., fills instance defaults like `weight: "0.0oz"`), or instantiating a **KB** recipe into a batch (`createBatch(kbRecipe, …)` → `kbRecipe*To*` mappers, preserving the recipe's real values via `kbScalarToScalar`).
**Invariants.** ⚠️ Never map Kb → app models at download/cache time. `Scalar` convention: `{value: "9.0lb", unit: "lb"}` — the display string embeds the unit; `unit` is the parsing/fallback hint.
**Gotchas.** `model/recipe.ts` is now the live editable app model for user-owned recipes — `Recipe extends Entity`, built on app `Scalar`/models (the editable complement to `KbRecipe`), versioned via `RECIPE_MODEL_VERSION` and persisted through `storage/recipes.ts` + `state/recipes.ts`. KB-sourced recipes still flow as `KbRecipe` everywhere via `state/kbRecipes.ts`, untransformed. `model/checklist-definition.ts` is now orphaned (only `model/recipe.ts` imported it, and that import was dropped in the rewrite).
**Example.** _None._

### Derived batch data (`src/actions/`)
**Purpose.** Several batch fields are **projections of the ingredients**, not edited directly — flat, tagged views rebuilt by `_updateX(batch)` actions (`Object.assign(batch, …)`).
**Where.** `_updateShopping` → `batch.shopping`; `_updateSchedule` → `batch.schedule` (see _BatchSchedule_); `_updateRecipe(recipe, batch)` seeds ingredient fields from a `KbRecipe`. `updateBatch` (edit save path), `createBatch` (instantiation).
**How it works.** Two conventions make rebuilds safe:
- **Reuse-by-reference** — each rebuild matches new items against the previous list by a stable key and preserves *user-owned* fields (shopping `cost`/`purchased`; schedule `completed`/`actual`). When nothing it owns changed, it returns the **previous object by reference** so the `isEqual` diff stays cheap.
- **Trigger diffing** — `updateBatch` re-runs a derivation only when a trigger field changed (`shoppingTriggers`, `scheduleTriggers`); editing the batch name doesn't rebuild the schedule. `createBatch` instead runs the whole pipeline once: `_updateRecipe` → `_updateShopping` → `_updateSchedule`.
**Invariants.** _None._
**Gotchas.** ⚠️ Derived fields are **not yet migrated** (see _Batch versioning & migrations_): a batch stored before a derived field existed throws until re-derived or purged (`/?purge=true`). The standalone Checklists screen + its `_updateChecklists` derivation were **removed**; equipment checkoff moved onto BatchSchedule phases, and the batch's second tab is now `Shopping`. (`model/recipe.ts` is now the live user-recipe model — see _Model boundary_; `model/checklist-definition.ts` is orphaned dead code — its sibling `component/checklist/` (the unused `ChecklistAdd`) was deleted as dead code.)
**Example.** _None._

### Batch versioning & migrations
**Purpose.** A version-migration framework — present and wired, but **not yet applied on load** (stub migrations).
**Where.** `core/src/migration.ts` (engine), `packages/{kb,app}/migrations/*` (per-package steps), `app/src/utils/migrationPlan.ts` (`getMigrationPlan`), `vite.config.ts` (`migrationPlanPlugin`), `model/batch.ts` (`version` field + `BATCH_MODEL_VERSION`).
**How it works.** `core/migration.ts` is the generic engine: `Migration<T>` (`{namespace, from, to, up}`), `resolveVersion` (missing `version` ⇒ v0), `buildMigrationPlan` (enforces single-step `to === from+1`, no gaps), `migrate` (walks the plan). `migrationPlanPlugin` combines kb + app migrations at build and injects the serialized plan into `index.html` as `<script id={MIGRATION_PLAN_ELEMENT_ID}>`; `getMigrationPlan()` reads it back.
**Invariants.** ⚠️ Bump `BATCH_MODEL_VERSION` when a stored batch would no longer parse/derive correctly, **and** add the matching `up` migration.
**Gotchas.** `getMigrationPlan()` has no caller yet, so stored batches still throw-until-purged. (This is also why `vite.config.ts` imports `../core/src/migration` / `../kb/migrations` / `./migrations` relatively — the eslint import rules are `src`-scoped to permit it.)
**Example.** `app/migrations/batch.ts` — the `app.batch` v0→v1 step, a stub that only stamps `version: 1`.

### BatchSchedule screen: configurable phases
**Purpose.** A schedule screen driven by two batch fields — `phases` (config) and `schedule` (derived).
**Where.** `screen/batch-schedule/` — `index.tsx` + `item-row.tsx` + `equipment.tsx` (the old per-step screens were deleted). Model commentary in `model/batch.ts`.
**How it works.**
- **`batch.phases: Phase[]`** — config: one sub-tab each (the `compact` _PanelSwitcher_). `tags` is an **intersection filter** over schedule items (`["boil"]` = the whole boil; `["boil","hops"]` = only its hop additions; `[]` = everything). Phases carry `equipment: ScheduleItem[]` (tagged `[phase, "equipment"]`) — user-managed from BatchPlanning, checked off in place, `path` unused (`""`). Seeded by `defaultBatch` (`data/defaultBatch.ts`): three phases (Mash, Boil, Ferment — Chill folded into Boil), equipment pulled from `data/equipment.ts` by `EquipmentUses`.
- **`batch.schedule: ScheduleItem[]`** — derived, each tagged `[phase, kind]`; grouped by `kind` under collapsible headers within a tab.
**Invariants.**
- ⚠️ Phase **names are the identity** (React key, tab title, query-param value) — renaming one orphans its stored collapse/active-tab state.
- **`path` write-through** — a row edits the *ingredient's* value (`hops[2].boil`) via a dot-path, never a copy, so nothing can diverge or be clobbered on rebuild. Paths land on a `Scalar` or a plain string (dates); `index.tsx`'s `valueAt` reads both.
**Gotchas.** `amount` is the derived plan; `actual` is user-owned and set only when what went in differed (captures brew-day weights *without* rewriting what the shopping list aggregates). `extra: ScheduleDetail[]` are secondary fields (e.g. pitch date) behind the row's expander — a field, not a step.
**Example.** _None._

### Editing pattern (`hooks/useJsonEdit.ts`)
**Purpose.** The workhorse for batch editing — local draft + dot-path updates + debounced saves.
**Where.** `hooks/useJsonEdit.ts`; dot-path `get`/`set`/`setIn` in `utils/func.ts`.
**How it works.** Local draft state; `update("hops[0].boil.value", v)` dot-path writes; **350 ms-debounced** saves; `updateScalar` re-formats on blur using the **previous scalar's unit** as the default when the user types a bare number. Editors read the draft through a ref so their identity stays stable across edits (memoized rows don't re-render). Paths support dot and bracket segments.
**Invariants.** ⚠️ Uses hand-rolled `utils/func.ts`, **not lodash** — don't add lodash (now lint-enforced). The resync effect deep-compares before accepting store emissions, so a re-emitted identical batch doesn't disturb an in-progress draft.
**Gotchas.** _None._
**Example.** `update("hops[0].boil.value", v)`.

### PanelSwitcher (`component/panel-switcher/`)
**Purpose.** A fully React-controlled tablist/tabpanel (button tabs, not DaisyUI's radio+CSS pattern) that mounts **only the active panel**.
**Where.** `component/panel-switcher/` (`usePanelSwitcher` drives it). Consumers declare panels as direct children: `<PanelSwitcher name="batch" defaultTab="Planning"><PanelSwitcherContent title="…">…` (the batch tabs are Planning / Shopping / Schedule / Summary).
**How it works.** `PanelSwitcherContent` never renders; `PanelSwitcher` reads its props via `React.Children`. Tab switches run inside a `useTransition`. A `compact` prop gives tighter tabs (`tabs-sm`, in-flow not mobile-full-bleed) for a nested sub-nav — used by BatchSchedule (one sub-tab per phase) and BatchPlanning (`Ingredients`/`Equipment`/`Phases`). Unmount-on-switch is safe because edits persist through debounced saves and UI state persists (collapse → `session`, active tab → `query`).
**Invariants.**
- ⚠️ Panels must be **direct children** — a `.map()` array is fine (`Children.toArray` flattens it), but a **wrapping Fragment is not** (it collapses to one child and the tabs vanish). A panel with no children renders as a disabled tab.
- ⚠️ The tablist sits **outside** the Suspense boundary (tabs stay visible while content loads), and the boundary lives **inside** PanelSwitcher and must stay mounted across switches — per-panel `<Suspense>` wrappers would flash their fallback on every switch.
**Gotchas.** _None._
**Example.** BatchSchedule builds one panel per phase from a `.map()` — the array-child case above.

### Styling (Tailwind v4 + DaisyUI v5, nord theme)
**Purpose.** CSS-first config, no tailwind.config file, no PostCSS.
**Where.** `src/styles.css` — `@plugin "daisyui"`, `@theme` block (custom SRM `beer-*` colors, `xs` breakpoint), the `@source` for design, and unlayered `:root` overrides at the bottom.
**Invariants.**
- ⚠️ DaisyUI theme variables live in the `base` cascade layer, which beats `@theme` (the `theme` layer) — overriding a daisyui token (e.g. `--radius-selector`) requires a plain **unlayered** `:root {}` rule.
- ⚠️ Some DaisyUI behaviors are compound selectors keyed to **literal class names** (e.g. `.collapse`'s arrow needs the literal `collapse-arrow`) — applying them only via responsive variants (`max-lg:collapse-arrow`) silently breaks them.
- ⚠️ Don't add a `tabIndex` to a `.collapse` element — it force-opens via `:focus-within` in v5.
**Gotchas.** Tailwind utilities override DaisyUI component styles (cascade layers), so `checked:bg-primary` etc. on components is the intended customization mechanism.
**Example.** The unlayered `--radius-selector` override at the bottom of `styles.css`.

### kb serving during dev/build
**Purpose.** Serve kb data from a symlink in dev, and deliberately keep kb **out** of the app's build output.
**Where.** `npm run link-kb` (symlinks `public/kb → ../../kb/dist`), wired to `predev` only.
**How it works.** `link-kb` runs **only via `predev`** (dev). The pre-`build` hook is named `devprebuild`, *not* `prebuild`, on purpose — so `link-kb` does **not** fire before `vite build`, keeping the kb symlink/JSON out of `dist` and the app S3 bucket. kb ships independently to its own bucket (`app-kb-prod`, served at `/kb/*`), so the app must not carry its own copy.
**Invariants.** ⚠️ **Don't "fix" `devprebuild` to `prebuild`** — that reintroduces kb into the app publish.
**Gotchas.** A clean/CI build (no `public/kb`) produces `dist` with **no `dist/kb`** — so in prod the SW does *not* precache kb; offline kb comes entirely from the IndexedDB hydration flow (_Offline-first kb data flow_). But once you've run the dev server, the leftover `public/kb` symlink makes a **local** `npm run build` include + precache `dist/kb/*.json` — so a local `build`/`preview` misrepresents prod offline behavior (`rm public/kb` to reproduce CI).
**Example.** _None._

### Linting
**Purpose.** eslint 9 flat config, the verification gate (`npm test` = `eslint .`). **Ratchet policy: errors block, warnings inform** — `npm test` exits 0 while warnings remain.
**Where.** Shared base: `packages/core/eslint.config.base.js` (dev tooling, **not** `core/src`). Per-package overlays: `packages/app/eslint.config.js`, `packages/www/eslint.config.js`, `packages/design/eslint.config.js`.
**How it works.** The **base** (shared by app + www + design) holds the common rules: `@stylistic` (double quotes, semicolons, 4-space indent); `import-x/order` (external → `@brewdocs.beer/*` → `@/` → relative, alphabetized) + `import-x/no-relative-packages`; `react-hooks`; `no-restricted-imports` banning `lodash` and `../` parent-relative imports (use `@/`, which app and www alias to `src/*`; design has no `@/` alias — relative imports only). The import bans are **scoped to `src/**`** — root build/config files (`vite.config.ts`, `astro.config.mjs`, `migrations/*`) legitimately use relative cross-package paths. Overlays add only package-specifics: **app** → `react-refresh`, the `utils/func.ts` `any`-escape, the `routeTree.gen.ts` ignore; **www** → ignore the generated `.astro/` dir, allow triple-slash refs in `.d.ts`; **design** → no overlay rules (`.storybook/*` sits outside `src/`, so the `../`-ban doesn't reach its relative `design.css` import). www lints its `.ts`/`.tsx` (React islands + data); `.astro` files aren't linted (would need `eslint-plugin-astro`).
**Invariants.** ⚠️ Only `react-refresh/only-export-components` warnings are left standing (on purpose). New **errors** must be fixed or explicitly ruled.
**Gotchas.** ⚠️ The repo root hoists eslint **8.57.1** (eslintrc-era, chokes on flat config); each package resolves its own nested **9.x**. Run lint via `-w` or from inside the package (`npm run lint -w packages/app`), never the root binary.
**Example.** _None._

## packages/www

**Purpose.** Astro 7 static site with React islands; same styling stack as app (Tailwind v4 + DaisyUI v5 via `@tailwindcss/vite`, nord, Urbanist).
**Where.** `src/pages/` (`/` and `/about`), `src/data/env.ts`.
**Surface.** _None._
**Invariants.** ⚠️ Requires Node ≥22.12 (`engines`).
**Gotchas.** Linted via the shared eslint base (see _Linting_) — `.ts`/`.tsx` (React islands + data) only; `.astro` files aren't linted yet.
**Example.** _None._
**Env.** Astro's `PUBLIC_` prefix — `PUBLIC_APP_URL`, `PUBLIC_GITHUB_URL` (read in `src/data/env.ts`).

---

## Deployment

GitHub Actions, path-filtered on push to `mainline` (the sole deploy branch), all delegating to the reusable `matt-whitaker/aws-static-site` workflow (S3 + CloudFront):

- `build-test-deploy.app-prod.yaml` — app dist → app S3 bucket (app.brewdocs.beer).
- `build-test-deploy.app-kb-prod.yaml` — **kb dist deploys independently** to a dedicated kb bucket behind the app's CloudFront distribution (invalidates `/kb`). This is why `importResource` fetches the relative `/kb/*` — same origin in prod, symlink in dev, and kb data updates ship without an app rebuild.
- `build-test-deploy.www-prod.yaml` — www dist → www bucket (brewdocs.beer).

The **Verify** workflow (`.github/workflows/verify.yaml`) runs `npm ci`, then `npm test` (lint) and `npm run build` across **all workspaces** (`-ws`), on every PR (no deploy) — the real pre-merge gate; the `build-test-deploy.*` workflows run only *post*-merge on push.

## Contributing

Guidance for human contributors **and** for the `@claude` GitHub integration.

### Branches
- `mainline` is the default branch, the target for **all** PRs, and the **only** deploy branch — a push/merge ships to prod. No separate staging branch; the open PR is the staging buffer. (`develop` is retired.)
- Branch off `mainline`, and **name branches issue-first**: `<issue#>-<kebab-summary>` (e.g. `42-derived-schedule`). Fall back to bare kebab-case for un-ticketed work.

### Commits, PRs & merging
- **Commits.** Plain imperative subject ("Add schedule phases") — no Conventional Commits prefix.
- **PR title.** Same imperative style.
- **PR description** — a light template, *Verification* load-bearing (the PR body is the only record the gate ran):
  - **Summary** — what changed and why, with `Closes #<issue>` when there's a ticket.
  - **Verification** — `npm test` (lint) ✓, `tsc --noEmit` ✓, `vite build` ✓, and which screens/flows were checked in the browser.
  - **Screenshots** — for any UI change.
- **Merge.** Squash only. **The maintainer merges** — contributors and the `@claude` bot open PRs, never merge them. No auto-merge.
- Protect `mainline` to require the **Verify** check green before merge.

### Definition of done
- The gate is `npm test` (eslint, errors-only) **and** `tsc --noEmit` **and** `vite build` clean, plus manual browser checks for any UI change. A green lint + typecheck + build is the floor for every change.
- ⚠️ Don't hand-edit generated files (`routeTree.gen.ts`); don't add `lodash` or `../` parent-relative intra-app imports (both lint-enforced — use `@/`).
- ⚠️ Renaming files under `packages/kb/data/**` changes derived ids — a breaking change (see _packages/kb_); call it out in the PR.
- Prefer surfacing follow-ups over silently expanding scope; note orphaned/dead code you leave rather than deleting adjacent things unasked.

### The `@claude` integration
- Defined in `.github/workflows/claude.yaml`. Two ways in: an `@claude` mention (issue/PR comment, inline review comment, or submitted PR review), **or** applying the **`claude` label to an issue**. Runs `anthropics/claude-code-action` on `sonnet` with a **tiered turn budget — 40 for label-triggered feature work, 20 for an `@claude` comment poke** — and write access to contents/PRs/issues (plus `actions: read` for a failed **Verify** run).
- ⚠️ **Keep the task checklist coarse — 3–5 outcome-level items** ("Add the version field to the models", not one line per file). The action narrates every checklist item back to the PR, so each item costs a turn; a 10-item list spends most of the budget before any code is written. This is the single biggest budget consumer.
- **Deps are pre-installed; it builds before opening the PR.** The workflow runs `npm ci` as its own step (zero turns) — the prompt tells it *not* to run `npm ci`/`install`, but to run `npm run build` once before opening the PR. (An earlier config with no `npm ci` step made it chase a phantom TS-version error for eleven turns; that's also why the prompt says a denied tool call is settled — don't re-quote and retry — and hands it the `$`-in-filename escape directly.)
- **It writes back to the issue.** For label-triggered work it posts a short summary comment with the PR link, on top of the `track_progress` comment.
- ⚠️ **Verify on a bot-opened PR waits for approval.** A PR opened with `GITHUB_TOKEN` creates `pull_request` runs that require a maintainer to click *Approve and run* — the check isn't broken, it's held.
- **Issues are label-triggered, not mention-triggered.** `issues: [opened]` is deliberately not subscribed (a job-level `if:` can't stop a run from being *created*, so it'd grey-out a skipped run per new issue). `[labeled]` + `label_trigger: "claude"` means creating an issue produces no run; only the `claude` label fires.
- **House rules.** Never push to a deploy branch — open a PR. May open PRs, push to feature branches, comment; may **not** merge its own PR, edit `.github/workflows/**` or secrets, or run destructive git. Pass the gate before proposing a PR. Proceed on clearly-scoped tasks; ask when a change is ambiguous, irreversible, or outward-facing.
