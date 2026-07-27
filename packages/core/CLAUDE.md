# packages/core

Package-specific guidance. See the repo-root `CLAUDE.md` for universal rules (commands, dependency graph, the _Legend_ of field labels, contributing). Italic cross-references name a section that may live in another package's `CLAUDE.md` — most app subsystems are in `packages/app/CLAUDE.md`.

**Purpose.** Shared, environment-agnostic types and helpers used by every other package.
**Where.** `src/models.ts` (`Entity {id}`, `Units`/`Currencies` enums), `src/props.ts` (`PropsWithClass` etc.), `src/event.ts` (`eventValue`), `src/fetchClient.ts` (`createFetchClient`). Also `eslint.config.base.js` at the package root — the shared eslint flat-config base for app + www (dev tooling, not part of `src`; see _Linting_).
**Surface.** The above, re-exported from `src/index.ts`. `eventValue` unwraps `e.target.value` into a plain-value callback (the design inputs all use it). `createFetchClient({baseUrl, headers})` — thin fetch wrapper, throws on non-2xx, JSON only; no retries/caching (TanStack Query owns that).
**Invariants.** ⚠️ Must stay environment-agnostic — no `import.meta.env`, no Node/DOM APIs.
**Gotchas.** _None._
**Example.** _None._
