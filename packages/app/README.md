# @brewdocs.beer/app

The BrewDocs PWA — brew-day companion + knowledge base. Deployed to [app.brewdocs.beer](https://app.brewdocs.beer).

## Entry points

- [`src/main.tsx`](src/main.tsx) — app bootstrap
- [`src/routes/`](src/routes/) — file-based routes (TanStack Router)
- [`src/screen/`](src/screen/) — screens · [`src/component/`](src/component/) — components
- [`src/model/`](src/model/) · [`src/state/`](src/state/) · [`src/actions/`](src/actions/) — the data layer

## Commands

- `nx dev app` — dev server
- `nx build app` — typecheck + build
- `nx test app` — lint (the verification gate)

## Stack

- [React](https://react.dev/) · [TanStack](https://tanstack.com/) Router + Query
- [Tailwind CSS](https://tailwindcss.com/) / [Daisy UI](https://daisyui.com/)
- [Vite](https://vite.dev/) + `vite-plugin-pwa`

See the [`app` section of CLAUDE.md](/CLAUDE.md#packagesapp) for detail.
