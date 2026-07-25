# packages/kb

Package-specific guidance. See the repo-root `CLAUDE.md` for universal rules (commands, dependency graph, the _Legend_ of field labels, contributing). Italic cross-references name a section that may live in another package's `CLAUDE.md` — most app subsystems are in `packages/app/CLAUDE.md`.

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
