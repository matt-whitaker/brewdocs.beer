# BrewDocs

BrewDocs is a homebrewing application and info handbook for planning and recording brew days.

## Packages

| Package | Role |
|---                                      |--- |
| [`app`](/packages/app)                  | App|
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

### Claude Team

A GitHub + [Claude Code](https://claude.com/claude-code) workforce drives a majority of the work, with human oversight supported by frequent check-in phases for course correction and review. I've been having great success with it so far.

The engine lives in [`matt-whitaker/claude-team`](https://github.com/matt-whitaker/claude-team). This repo holds only the consumer side: a [stub workflow](.github/workflows/claude.yml) pinning a version of it (`v4.3` today), and the role overlays in [`.claude-team/prompts/`](/.claude-team/prompts). Prompts, hooks and the job graph are fetched from that repo at the pinned version when a run starts. This repo is the canary — it adopts a new version before the other consumers do.

Applying the `@claude` label to an issue is the front door; a script reads the issue and picks which of the eight roles takes it.

### Instructions

| Where | What |
|--- |--- |
| [`CLAUDE.md`](/CLAUDE.md) | Repo-wide guidance. Each package carries its own, loaded on demand. |
| [`.claude/rules/`](/.claude/rules) | Modules installed by claude-team: how a session conducts itself, and how the backlog works. Replaced wholesale on upgrade, never edited here. |
| [`.claude/skills/`](/.claude/skills) | Named procedures a session can invoke — filing a finding, diagnosing a run, driving a story. |
