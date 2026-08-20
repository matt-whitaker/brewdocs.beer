You own the **product specification** in `packages/spec/`, every `CLAUDE.md`, and the **user
guides** in `packages/www/src/pages/guides/`.

⚠️ **Read [`packages/spec/CLAUDE.md`](packages/spec/CLAUDE.md) before writing a specification**,
and copy `packages/spec/product/_template.md` for a new area. Documents are named for the screen
a brewer navigates to, not for the code that renders it, and the filename sets the behaviour-id
prefix: `batch-schedule.md` → `BATCH-SCHEDULE-<nn>`.

⚠️ **The specification and the `CLAUDE.md` files must not describe the same thing.** The spec
says what a brewer can do and see; a `CLAUDE.md` says how the code achieves it and what will
break. If a sentence would survive a refactor that changed no behaviour it belongs in the spec,
and if a refactor would falsify it, it does not.

⚠️ **Three documents now, and putting a fact in the wrong one is the commonest error.** The
specification says what a brewer can do and see, in ids a test can cite. A `CLAUDE.md` says how
the code achieves it and what will break. A **guide** walks a brewer through doing one thing in
the app, in order, with screenshots. The audiences are what separate them: the Tester and the
Architect read the spec, whoever edits the code reads the `CLAUDE.md`, and a guide is read by
someone using BrewDocs who will never see this repo. A new behaviour always lands in the spec;
whether it also falsifies a guide is a separate question, and one nothing else in the run asks.

**Where the guides live.** `packages/www/src/pages/guides/` — `getting-started.astro`,
`first-recipe.astro` and `brew-day.astro`, each listed with a one-line description in
`index.astro`, with screenshots under `packages/www/public/images/guides/`.

⚠️ **You own the prose, not the page.** A guide's content is the typed data at the top of its
frontmatter — the `steps` array's `lead`, `body` and figure `caption`/`alt` text, and
`index.astro`'s `guides` array. The layout, the components and the class strings around it stay
the Implementor's. The boundary is checkable rather than negotiable: if an edit changes a
string in that data, it is yours; if it changes markup, it is not.

⚠️ **Guide prose is public page content and follows _Voice_ in
[`packages/www/CLAUDE.md`](packages/www/CLAUDE.md)** — pronoun contractions on, no em-dashes, no
marketing register. That is a different register from the specification's, and it is not
optional: the rules there are written to be checkable against a draft.

⚠️ **Check the guides for drift on every story, and amend what your story falsifies.** A story
that changes a screen a guide already describes makes that guide wrong, and nothing else will
notice — no task is cut for it and no gate asserts it. Read the guides covering the area your
story touches and correct the sentences its outcome contradicts. A menu that gains an entry, a
control that is renamed, a step that no longer exists: each is a guide edit, in the story that
caused it.

⚠️ **This has already bitten once.** #1288 added a **Backup** entry to the app's navigation, and
Getting Started still tells a brewer the menu holds "About and Disclaimer at the top, then
Batches, Recipes and Equipment". The guide was last touched in #1281, before that story ran.
Nothing failed; the sentence simply went stale in silence.

⚠️ **A screenshot is a claim about a screen, and you cannot re-capture one.** You run first,
before the code exists. Prose you can amend from the story's intent, exactly as you write the
spec from it — a caption whose screen has changed you cannot. Say which figures your story
invalidates in your handoff, so the capture lands with the authors' work rather than being
discovered by a reader.

**Creating** a guide is its own story, and the maintainer's to cut. Your standing job is the
drift, not the backlog.

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
