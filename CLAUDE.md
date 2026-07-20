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

- **Data**: one JSON file per item under `data/{grains,hops,yeasts,recipes}/`. `bin/build-json.js` combines each directory into `dist/<resource>.json` as a `{version, data: [...]}` envelope. **Item `id`s are derived from filenames**, not the `id` field inside the JSON (e.g. the recipe file `achor-steam-beer-clone.json` — filename typo — yields id `achor-steam-beer-clone` even though the JSON says `anchor-...`). Batches reference recipes by this id, so renaming data files is a breaking change.
- **Models** (`src/models.ts`): `KbRecipe`, `KbGrain`, `KbHop`, `KbYeast`, `KbScalar`. KB interfaces use primitives only (no enums), nesting allowed, no normalization. `KbScalar` is `{value, unit}` where **unit strings must exactly match `Units` enum values** in core (`"oz"`, `"min"`, `"°F"`, `"%"`, `"°P"`…). A wrong unit in data doesn't error — it silently corrupts edit behavior in the app (the unit-preserving input formatter falls back to the stored unit).
- **`importResource(resource)`** (`src/importResource.ts`): fetches `/kb/<resource>.json` over HTTP via core's fetchClient (same-origin, relative). Return type is inferred from the literal resource string via a `ResourceTypeMap`. kb is deliberately a dumb transport adapter — persistence/caching is the app's job.

## packages/design

React primitives re-exported from `src/index.ts`: `ScreenH1–H5`/`ScreenP` (typography), `InputText`, `InputDate`, `InputSelect`. (`input-checkbox`, `input-unit` exist but aren't exported yet.) `InputText` blurs on Enter when an `onBlur` handler is present — that's how "press Enter to commit" works app-wide. `src/stories/` is untouched Storybook scaffolding, excluded from consumer builds.

## packages/app

Vite SPA + PWA (`vite-plugin-pwa`, autoUpdate service worker). React 18 **without StrictMode** (mutations are fire-and-forget and must not double-fire).

### Routing
TanStack Router, file-based under `src/routes/` — `routeTree.gen.ts` is generated by the router Vite plugin; never hand-edit it. Routes: `/`, `/batches`, `/batch/$batchId`, `/recipes`, `/recipe/$recipeId`, `/knowledge`, `/disclaimer`. Path params via `Route.useParams()`. Router `defaultErrorComponent` (in `main.tsx`) renders thrown errors from suspense fetchers.

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

### Editing pattern

`hooks/useJsonEdit.ts` is the workhorse for batch editing: local draft state + dot-path updates (`update("hops[0].boil.value", v)`), 350ms-debounced saves, and `updateScalar` which re-formats input on blur using the **previous scalar's unit as the default** when the user types a bare number. Paths support both dot and bracket segments (custom lodash-style `get`/`set` in `utils/func.ts` — the repo uses these hand-rolled utils, not lodash; don't add lodash). Its resync effect deep-compares before accepting store emissions, so a re-emitted identical batch doesn't disturb an in-progress draft.

`component/panel-switcher/` is a fully React-controlled tablist/tabpanel (button tabs, not DaisyUI's radio+sibling-CSS pattern) that mounts **only the active panel**. Routes declare panels as direct children: `<PanelSwitcher name="batch" defaultTab="Planning"><PanelSwitcherContent title="...">...` — `PanelSwitcherContent` never renders; `PanelSwitcher` reads its props via `React.Children` (so panels must be direct children — no wrapping fragments; a panel without children renders as a disabled tab). Tab switches run inside a `useTransition` (`usePanelSwitcher`, called internally). Two invariants: the tablist sits **outside** the Suspense boundary (tabs stay visible while content loads), and the boundary itself lives inside `PanelSwitcher` and must stay mounted across switches — a transition only holds the previous panel for an *already-mounted* boundary; per-panel `<Suspense>` wrappers would flash their fallback on every switch. Panel unmount-on-switch is safe because edits persist through immediate/debounced saves (debounce timers survive unmount) and UI state persists: collapse open/closed state to `session` (sessionStorage), the active tab to `query` (URL query string — so it survives an inline refresh but resets on navigation to a different batch/recipe).

### Styling (Tailwind v4 + DaisyUI v5, nord theme)
CSS-first config in `src/styles.css` (no tailwind.config file, no PostCSS): `@plugin "daisyui"`, `@theme` block with custom SRM `beer-*` colors, `xs` breakpoint, and the `@source` for design (see above). Gotchas learned the hard way:

- DaisyUI theme variables live in the `base` cascade layer, which beats `@theme` (the `theme` layer). Overriding a daisyui token (e.g. `--radius-selector`) requires a plain **unlayered** `:root {}` rule — see the bottom of `styles.css`.
- Some DaisyUI behaviors are compound selectors keyed to **literal class names** (e.g. `.collapse`'s arrow rotation requires the literal class `collapse-arrow`). Applying such classes only via responsive variants (`max-lg:collapse-arrow`) silently breaks the behavior — apply the literal class and gate the *visual* with a plain utility instead.
- Tailwind utilities override DaisyUI component styles (cascade layers), so `checked:bg-primary` etc. on components is the intended customization mechanism.
- A `tabIndex` on a `.collapse` element force-opens it via `:focus-within` in v5 — don't add one.

### Env
`VITE_WWW_URL`, `VITE_DEV_TOOLS` (enables router/query devtools), `VITE_FEATURES_SEARCH_EVERYWHERE` — read only in `src/utils/env.ts`.

### kb serving during dev/build
`npm run link-kb` (auto via `predev`/`prebuild`) symlinks `public/kb → ../../kb/dist`. Vite dereferences the symlink at build, so `dist/kb/*.json` are real files. The PWA precache glob includes `json` — that inclusion is what keeps the knowledge base available offline; don't drop it.

## packages/www

Astro 7 static site with React islands, same styling stack as app (Tailwind v4 + DaisyUI v5 via `@tailwindcss/vite`, nord, Urbanist). Env vars use Astro's `PUBLIC_` prefix (`PUBLIC_APP_URL`, `PUBLIC_GITHUB_URL`), read in `src/data/env.ts`. Pages: `/` and `/about`. Requires Node ≥22.12 (`engines`).

## Deployment

GitHub Actions, path-filtered on push to `develop`/`mainline`, all delegating to the reusable `matt-whitaker/aws-static-site` workflow (S3 + CloudFront):

- `build-test-deploy.app-prod.yaml` — app dist → app S3 bucket (app.brewdocs.beer)
- `build-test-deploy.app-kb-prod.yaml` — **kb dist deploys independently** to a dedicated kb S3 bucket behind the app's CloudFront distribution (invalidates `/kb`). This is why `importResource` fetches the relative path `/kb/*` — same origin in prod, symlink in dev, and kb data updates ship without an app rebuild.
- `build-test-deploy.www-prod.yaml` — www dist → www bucket (brewdocs.beer)
