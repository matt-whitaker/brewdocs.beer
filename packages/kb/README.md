# @brewdocs.beer/kb

Knowledge base code — the `Kb*` model types and a dumb HTTP transport adapter. The data itself lives in [brewdocs.beer-kb](https://github.com/matt-whitaker/brewdocs.beer-kb).

## Entry points

- [`src/index.ts`](src/index.ts) — `importResource` + the `Kb*` model types
- [`src/importResource.ts`](src/importResource.ts) — fetches `/kb/<resource>.json`
- [`src/models.ts`](src/models.ts) — the `Kb*` types and their `__type` discriminators
- [`src/brewable.ts`](src/brewable.ts) — primitives-only `Brewable` supertypes

No build step: this package ships raw TypeScript source, like `core`. The `dist/<resource>.json` files it fetches are built and deployed by brewdocs.beer-kb, independently of this repo. kb is a dumb transport adapter — caching/persistence is the app's job.

See [`CLAUDE.md`](CLAUDE.md) for detail.
