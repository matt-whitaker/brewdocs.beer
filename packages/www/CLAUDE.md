# packages/www

Package-specific guidance. See the repo-root `CLAUDE.md` for universal rules (commands, dependency graph, the _Legend_ of field labels, contributing). Italic cross-references name a section that may live in another package's `CLAUDE.md` — most app subsystems are in `packages/app/CLAUDE.md`.

**Purpose.** Astro 7 static site with React islands; same styling stack as app (Tailwind v4 + DaisyUI v5 via `@tailwindcss/vite`, nord, Urbanist).
**Where.** `src/pages/` — `/`, `/about`, `/claude`, `/for-developers`, `/guides` and three guide pages under it — plus `src/data/env.ts`.
**Surface.** _None._
**Invariants.** ⚠️ Requires Node ≥22.12 (`engines`).
**Gotchas.** Linted via the shared eslint base (see _Linting_) — `.ts`/`.tsx` (React islands + data) only; `.astro` files aren't linted yet.
**Example.** _None._
**Env.** Astro's `PUBLIC_` prefix — `PUBLIC_APP_URL`, `PUBLIC_GITHUB_URL` (read in `src/data/env.ts`).

## Voice

Applies to **public page content** — the prose in `src/pages/**`, guides included. Not this file, and not code.

**Who reads it.** Someone hiring-adjacent or technically minded: they found the site through a job search, or they got curious about the app and happen to be an engineer. They are reading the prose as evidence of how its author thinks. Three consequences, and they decide every rule below: precision is an asset, **stiffness is not**; a limitation stated plainly buys credibility, and overselling spends it; and a paragraph that survives a skeptical skim is worth three that don't.

⚠️ **The failure mode this exists to stop** is the register of this repo's own `CLAUDE.md` files leaking onto the site — contraction-free, aside-nested, mechanism-first, written for someone auditing a system. It reads as laborious rather than rigorous, and it is what the pages did before this section existed.

**Rules.** Each is checkable against a draft, which is the point — an adjective like "approachable" is not.

- **Contractions on.** "You can't tab to it", not "you cannot switch to it by hand".
- **Behaviour before mechanism.** Say what the reader sees, then why it works that way — and only if the why earns its place.
- **One idea per sentence, and never an aside inside an aside.** If a sentence needs two clauses to hold it together, it is two sentences.
- **No em-dashes.** Not `—`, and not `--` or `–` standing in for one. Split at the dash into two sentences; use a colon when what follows explains what came before; use commas or parentheses for a genuine aside. This is a house rule *and* a tell — unbroken em-dash asides are among the surest signs of machine-written prose, and this reader spots them.
- **Specifics instead of adjectives.** "Works offline, stores everything in the browser" beats "powerful and modern".
- **Name the limits.** It is a proof of concept, data lives only in that browser, and saying so is a feature of the writing. Never imply more than ships.
- **Technical detail only where it carries a decision.** Name the tool when it explains a choice; a stack list for its own sake reads as padding.
- **No marketing register and no invented warmth.** No "seamless", "delightful", "effortlessly", no exclamation marks, no "we've all been there".

**Constructions to avoid outright** — these are the tells of machine-written prose, and this reader spots them:

- "It isn't just X, it's Y."
- Throat-clearing openers: "One thing that surprises people:", "It's worth noting that".
- A list of three where two carry the meaning.
- A closing paragraph that restates the section that just ended.

**Before and after**, from text that actually shipped:

| shipped | wanted |
|---|---|
| "One thing that surprises people: a phase you gave nothing to shows an empty grid, and its tab is disabled so you cannot switch to it by hand… there is simply nothing on it to check off." | "A phase you didn't give anything to shows up empty, and you can't tab to it. There's nothing on it to check off. It still completes when the phase before it does." |
| "how the roles are split, how work moves from epic to story to task, and why it is shaped that way" | "how the roles split up, how work moves from epic to story to task, and why it's shaped that way" |

**The check.** Read it aloud. Run out of breath and the sentence is too long. Then skim it as the reader would: one concrete thing per paragraph, or cut the paragraph.
