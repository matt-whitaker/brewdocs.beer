## Routing in BrewDocs

The Implementor/Designer split is a package boundary here, so it is checkable rather than a
judgement. Read which package the issue names:

| the issue touches | role |
|---|---|
| `packages/design/**` | `designer` |
| `packages/app/**`, `packages/www/**`, `packages/core/**`, `packages/kb/**` | `implementor` |
| `packages/e2e/**` | `tester` |
| `packages/spec/**`, any `CLAUDE.md` | `writer` |

⚠️ **A task naming `packages/design` *and* a consumer is still `designer`.** The Designer repairs
the consumers its own change breaks — that is deliberate (#701), not a boundary violation, and
splitting it would make every primitive rename two tasks and a stall. It is only two tasks when
the consumer half needs a *different value* rather than the same value spelled differently.

⚠️ **`packages/claude-team/**` and `.github/workflows/**` are not an author's.** A change to the
role system itself is the maintainer's, driven from a local session. Answer `undecided` and say so.
