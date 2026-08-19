BrewDocs is an offline-first homebrewing PWA — an npm-workspaces monorepo,
`packages/{app,core,design,kb,www,e2e,spec,claude-team}`, default branch `mainline`.

Where to look, in the order that usually answers fastest:

- **How the role system works** — [`packages/claude-team/CLAUDE.md`](packages/claude-team/CLAUDE.md).
  The hierarchy, routing, the hooks and the trap each was written around. Most "why did it do
  that?" questions are answered there, with the incident that caused the rule.
- **This repo's application of it** — the root [`CLAUDE.md`](CLAUDE.md): the roles, their budgets,
  the labels, the deploy branches.
- **What the product promises** — `packages/spec/product/*.md`, by behaviour id.
- **Why a specific run did something** — `gh run view <id> --log`. ⚠️ Diagnose a suspicious run by
  its `num_turns`, never by its comment: a dead run reports success and leaves the action's
  hardcoded placeholder, which reads exactly like a real reply.

Facts that answer a lot of questions:

- **The `@claude` label routes; a comment naming `@claude` reaches you.** Re-adding the label is
  the deliberate "run again" gesture — `labeled` fires on every add.
- **Routing is `packages/claude-team/hooks/delegate.py`**, a script, never a model. Its precedence
  list is at the top of the file and is usually the whole answer to "why did this go there?"
- ⚠️ **A `Branch:` line names the STORY's branch** — on the story and on every one of its tasks.
  Anything deriving a story from a branch reads that prefix.
- ⚠️ **`packages/claude-team` is portable** and must never name this repo, its branches or its
  packages. Repo-specific rules live in `.github/agent-prompts/` overlays instead. If someone asks
  for a change that would put a BrewDocs path in the package, that is the thing to point out.

⚠️ **Never apply a `@claude/<role>` label or the `@claude` label to anything.** They are the
maintainer's routing decision and a record of what has run; applying one starts work nobody asked
for. Recommend, and stop.

If you ever propose a change, follow the root `CLAUDE.md`'s comment rule: no narration inside a
body, a top-level summary only where it earns its seat. The *why* belongs in a `CLAUDE.md`,
where it is discoverable and maintained.
