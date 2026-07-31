# packages/kb

Package-specific guidance. See the repo-root `CLAUDE.md` for universal rules (commands, dependency graph, the _Legend_ of field labels, contributing). Italic cross-references name a section that may live in another package's `CLAUDE.md` — most app subsystems are in `packages/app/CLAUDE.md`.

**Purpose.** Knowledge base: raw JSON per item → one built resource file per type → dumb HTTP transport adapter. Persistence/caching is the app's job, not kb's.
**Where.** `data/{grains,hops,yeasts,recipes}/*.json` (one file per item), `bin/build-json.js` (builder), `dist/<resource>.json` (built), `src/models.ts` (`Kb*` types + their `__type` discriminators), `src/brewable.ts` (`KbBrewable`/`KbBrewablePhase`/`KbAssignment` — primitives-only supertypes of the app's `Brewable`/`BrewablePhase`/`Assignment`), `src/importResource.ts`.
**Surface.** `importResource(resource)` — fetches `/kb/<resource>.json` via core's fetchClient (same-origin, relative); return type inferred from the literal resource string via `ResourceTypeMap`. `Kb*` model types (`KbRecipe`, `KbGrain`, `KbHop`, `KbYeast`, `KbScalar`) — primitives only (no enums), nesting allowed, no normalization. Every one carries a **`__type` discriminator** (`"kbRecipe"`, `"kbRecipeTemplate"`, `"kbGrain"`…) so consumers disambiguate on a declared tag rather than sniffing for an incidental field. `KbRecipe.brewable: KbBrewable` carries the recipe's own schedule + assignments straight from data — the app narrows it into its own `Brewable` shape via `kbBrewableToBrewable` rather than deriving one at runtime (see _Model boundary_ in `packages/app`).
**How it works.** `build-json.js` combines each directory into `dist/<resource>.json` as a `{version, data: [...]}` envelope.
**Invariants.**
- ⚠️ `KbScalar` unit strings **must exactly match `Units` enum values** in core (`"oz"`, `"min"`, `"°F"`, `"%"`, `"°P"`…).
- ⚠️ `__type` is **stamped by the builder from the directory name** (`ENTITY_TYPES` in `bin/build-json.js`), exactly like `id` — never hand-author it in a data file. **Adding a `data/<resource>/` directory means adding an `ENTITY_TYPES` entry**, or its items build with `__type: undefined` (the builder logs, it doesn't fail).
- ⚠️ `KbRecipe.__type` is deliberately the **union `"kbRecipe" | "recipe"`**, not the single literal the other models get — the app's `Recipe extends KbRecipe`, so the base has to admit its subtype's tag. See _Model boundary_ in `packages/app` for what that costs at the narrowing site.
- ⚠️ Item `id`s are derived from **filenames** — renaming a data file changes its id and is a **breaking change** (batches reference recipes by this id).
**Gotchas.** A wrong unit in data doesn't error — it silently corrupts edit behavior in the app (the unit-preserving formatter falls back to the stored unit).
**Example.** The builder does `data.id = basename(file)` and `data.__type = ENTITY_TYPES[dir]`, overwriting whatever the JSON declares (so an in-file `id`/`__type` is dead weight): `data/recipes/anchor-steam-beer-clone.json` → `{id: "anchor-steam-beer-clone", __type: "kbRecipe"}`, regardless of its JSON.
**Commands.** `npm run build -w packages/kb` (also runs on postinstall).
