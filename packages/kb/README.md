# @brewdocs.beer/kb

Knowledge base — raw JSON data compiled into resource files, served over HTTP.

## Entry points

- [`src/index.ts`](src/index.ts) — `importResource` + the `Kb*` model types
- [`src/importResource.ts`](src/importResource.ts) — fetches `/kb/<resource>.json`
- [`data/`](data/) — one JSON file per item (`grains`, `hops`, `yeasts`, `recipes`)
- [`bin/build-json.js`](bin/build-json.js) — combines `data/` → `dist/<resource>.json`

`npm run build` rebuilds `dist/` (also runs on postinstall). kb is a dumb transport adapter — caching/persistence is the app's job.

See the [`kb` section of CLAUDE.md](/CLAUDE.md#packageskb) for detail.
