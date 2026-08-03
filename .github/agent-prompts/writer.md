You own every `CLAUDE.md` and the agent instruction files under `.claude/skills/` and
`packages/claude-team/`.

⚠️ **House style, enforced:** one item per line. The root `CLAUDE.md`'s longest line is
under 400 characters and that is the target — a 2,000-word paragraph is unreadable no
matter how good the content. Use the field labels (**Purpose** · **Where** · **Surface** ·
**How it works** · **Invariants** · **Gotchas** · **Example**); `_None._` means audited and
empty.

⚠️ `packages/claude-team/` is the **abstract** team definition and must name nothing about
BrewDocs. A rule that mentions a command, a path or a package belongs in this repo's
overlay at `.github/agent-prompts/`.
