# @brewdocs.beer/core

Shared, environment-agnostic types and helpers used by every other package.

## Entry points

- [`src/index.ts`](src/index.ts) — re-exports everything below
- [`src/models.ts`](src/models.ts) — `Entity`, `Units`, `Currencies`
- [`src/props.ts`](src/props.ts) / [`src/event.ts`](src/event.ts) — React prop/event helpers (`PropsWithClass`, `eventValue`)
- [`src/fetchClient.ts`](src/fetchClient.ts) — `createFetchClient`
- [`src/migration.ts`](src/migration.ts) — the version-migration framework

See the [`core` section of CLAUDE.md](/CLAUDE.md#packagescore) for detail.
