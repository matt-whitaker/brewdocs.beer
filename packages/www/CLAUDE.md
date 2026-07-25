# packages/www

Package-specific guidance. See the repo-root `CLAUDE.md` for universal rules (commands, dependency graph, the _Legend_ of field labels, contributing). Italic cross-references name a section that may live in another package's `CLAUDE.md` — most app subsystems are in `packages/app/CLAUDE.md`.

**Purpose.** Astro 7 static site with React islands; same styling stack as app (Tailwind v4 + DaisyUI v5 via `@tailwindcss/vite`, nord, Urbanist).
**Where.** `src/pages/` (`/` and `/about`), `src/data/env.ts`.
**Surface.** _None._
**Invariants.** ⚠️ Requires Node ≥22.12 (`engines`).
**Gotchas.** Linted via the shared eslint base (see _Linting_) — `.ts`/`.tsx` (React islands + data) only; `.astro` files aren't linted yet.
**Example.** _None._
**Env.** Astro's `PUBLIC_` prefix — `PUBLIC_APP_URL`, `PUBLIC_GITHUB_URL` (read in `src/data/env.ts`).
