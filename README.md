# BrewDocs

BrewDocs is an offline homebrewing application and info handbook.

## Packages

| Package | Role |
|---|---|
| `core` | Shared, environment-agnostic types + helpers: `Entity`/`Units`/`Currencies`, React prop/event helpers, `createFetchClient`, the migration framework. |
| `kb` | Knowledge base: raw JSON data → built resource files → HTTP transport adapter (`importResource`) + `Kb*` model types. |
| `design` | React UI primitives (typography, inputs) that emit Tailwind/DaisyUI class strings. |
| `app` | The PWA itself: Vite + React + TanStack Router/Query. Deployed to app.brewdocs.beer. |
| `www` | Astro marketing/info site at brewdocs.beer. |

## Stack

### Application (app.brewdocs.beer)
- [React](https://react.dev/)
- [Tanstack](https://tanstack.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Daisy UI](https://daisyui.com/)
- [Vite](https://vite.dev/)

### Marketing (brewdocs.beer)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Daisy UI](https://daisyui.com/)
- [Astro](https://astro.build/)

## Claude Code

[Claude Code](https://claude.com/claude-code) enabled with [`@claude` integration](.github/workflows/claude.yaml)

See [Claude.md](/CLAUDE.md)
