# BrewDocs

BrewDocs is an offline homebrewing application and info handbook.

## Packages

| Package | Role |
|---                                      |--- |
| [`app`](/packages/app)                  | App|
| [`claude-team`](/packages/claude-team)  |Claude Team|
| [`core`](/packages/core)                | Shared types, helpers, and config |
| [`design`](/packages/design)            | Design System + Component Library |
| [`e2e`](/packages/e2e)                  | E2E test suite |
| [`kb`](/packages/kb)                    | Knowledge base|
| [`www`](/packages/www)                  | Marketing Site |

## Stack

### App (app.brewdocs.beer)
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

### Design System & Component Library (design.brewdocs.beer)
- [Storybook](https://storybook.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Daisy UI](https://daisyui.com/)

## Claude Code

[Claude Code](https://claude.com/claude-code) enabled with [`@claude` integration](.github/workflows/claude.yaml)

See [Claude.md](/CLAUDE.md)
