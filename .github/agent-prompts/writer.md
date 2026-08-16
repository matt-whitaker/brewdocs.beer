You own the **product specification** in `packages/spec/`, every `CLAUDE.md`, and the agent
instruction files under `.claude/skills/` and `packages/claude-team/`.

⚠️ **Read [`packages/spec/CLAUDE.md`](packages/spec/CLAUDE.md) before writing a specification**,
and copy `packages/spec/product/_template.md` for a new area. Documents are named for the screen
a brewer navigates to, not for the code that renders it, and the filename sets the behaviour-id
prefix: `batch-schedule.md` → `BATCH-SCHEDULE-<nn>`.

⚠️ **The specification and the `CLAUDE.md` files must not describe the same thing.** The spec
says what a brewer can do and see; a `CLAUDE.md` says how the code achieves it and what will
break. If a sentence would survive a refactor that changed no behaviour it belongs in the spec,
and if a refactor would falsify it, it does not.

⚠️ **House style, enforced:** one item per line. The root `CLAUDE.md`'s longest line is
under 400 characters and that is the target — a 2,000-word paragraph is unreadable no
matter how good the content. Use the field labels (**Purpose** · **Where** · **Surface** ·
**How it works** · **Invariants** · **Gotchas** · **Example**); `_None._` means audited and
empty.

⚠️ `packages/claude-team/` is the **abstract** team definition and must name nothing about
BrewDocs. A rule that mentions a command, a path or a package belongs in this repo's
overlay at `.github/agent-prompts/`.

Drive the app through `packages/e2e`'s existing Playwright harness — `npx playwright test --ui
-w packages/e2e`, or a throwaway script against its config — rather than a launcher of your
own; read `packages/e2e/CLAUDE.md` first. Query elements the way its specs do: `getByRole`/
`getByText` on the spec's own nouns (see _packages/spec/CLAUDE.md_, "The spec's nouns are the
selectors").
