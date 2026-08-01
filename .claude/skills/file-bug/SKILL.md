---
name: file-bug
description: Research a bug the maintainer describes, verify what is actually wrong, and file one GitHub issue ready for an Implementor.
# these all create issues, write code or open PRs — the maintainer decides when
disable-model-invocation: true
---

Research a bug the maintainer describes, **verify what's actually wrong**, and file **one**
GitHub issue (unlabeled) that an Implementor can pick up and fix without further research.

The bug: $ARGUMENTS

Bugs skip the Manager and Researcher entirely — there is no epic, no decomposition and no
integration branch. You do the grounding here, and the issue you file is the whole handoff.

Do NOT fix the bug. The deliverable is the issue.

## 1. Reproduce it before you file anything

This is the rule the rest of the command rests on. A plausible cause is not a cause, and the
cost of filing the wrong one is an Implementor confidently fixing something that was never
broken.

- Start the app and drive the failing path (`npm run dev -w packages/app`), or write a
  throwaway spec under `packages/e2e/tests/__probe.spec.ts` and run it. Capture `pageerror`
  and `console` — the real cause is usually in there and not on screen.
- **Measure anything the maintainer describes in adjectives.** "Massive lag" was 2312ms, and
  knowing the number is what identified it (a `Math.round` compared against a `Math.floor`).
- **Test the fix hypothesis** where it's cheap: change the one line, re-measure, change it
  back. A before/after table in the issue turns a theory into a finding.
- Read data straight from the source when the UI is ambiguous — `gh api`, or IndexedDB via
  `page.evaluate`. What's stored settles arguments the screen can't.

⚠️ **If you cannot reproduce the maintainer's symptom, say so and stop short of guessing.**
Report what you did find, ask what they saw, and file only what you can stand behind. Filing
a confidently-wrong cause is worse than filing nothing: it sends someone into the wrong file
with a mandate.

⚠️ **Beware of reproducing your own environment instead of the bug.** A stale dev server, a
stale `packages/kb/dist`, or a warm IndexedDB will each produce convincing failures that
have nothing to do with the code. If a result surprises you, re-run against a fresh server
(`CI=true`) and a fresh context before believing it.

## 2. Find the root cause, not the symptom

The symptom is where the maintainer noticed it; the cause is often a package away. Keep
pulling until you can state the mechanism in one sentence — *"elapsed floors while marker
offsets round, and `place()` compares them"* — rather than *"markers appear late"*.

Then check how far it reaches. Two things worth establishing every time:

- **Is it wider than reported?** The same helper often feeds other callers. If it is, say so
  — one fix covers both, and the Implementor should know not to fix only the reported path.
- **Is it narrower than reported?** If the symptom the maintainer described isn't actually
  specific to where they saw it, say that plainly too.

## 3. Separate what you verified from what you inferred

State which is which, in the issue. An Implementor reading a confident claim will not
re-check it, so an inferred mechanism presented as fact is how a wrong fix gets built. "I
verified the secret is in the env and the model still couldn't use it; the allowlist prefix
is my read of why" is a more useful sentence than either half alone.

## 4. Check whether existing tests would have caught it

Look for coverage of the failing path, then say what you found in the issue:

- If a spec exists and passes anyway, **say that it isn't a regression guard** — otherwise a
  green suite reads as proof the fix worked. (A test using `settleSave` will pass regardless
  of a timing bug.)
- If nothing covers it, ask for coverage in the acceptance criteria, and name the file it
  belongs in.

## 5. Write the issue for someone with no context

Use the headings from `.github/ISSUE_TEMPLATE/claude-task.yml`: **Summary** / **Where the
code lives** / **What to change** / **Patterns to follow** / **Out of scope** /
**Acceptance criteria** / **CLAUDE.md Updates**.

- **Summary** — the mechanism, then the evidence: the measurement, the log excerpt, the
  stored value. Paste the real output; a table beats a paragraph.
- **Where the code lives** — exact paths with line numbers, every one confirmed to exist. A
  path you didn't open costs the Implementor turns rediscovering the repo.
- **What to change** — the outcome, not a patch. Where there's a judgement call (spacing,
  which of two fixes), say so and ask them to state what they chose in the PR.

## 6. Rule things out explicitly

Half of a good bug report is fencing. Two kinds:

- **Repo policies that would otherwise block or derail them.** The big one: this repo has
  **no migration framework and no backfill shims** — if the bug involves stale stored data,
  say the fix is graceful degradation and that repairing stored objects is out of scope, or
  they'll stall on the contradiction. Also carry the standing items: don't hand-edit
  `routeTree.gen.ts`, don't add lodash or `../` parent-relative imports, don't rename under
  `packages/kb/data/**`, and ⚠️ **write no code comments** (put the *why* in the PR or a
  `CLAUDE.md`).
- **Adjacent things you deliberately didn't ask for** — the tempting nearby refactor, the
  related-but-separate design question. Name them so they don't get swept in.

## 7. Acceptance criteria an Implementor can finish against

- The observable outcome, phrased so it can be checked — not "fix the lag" but "the marker
  appears within one tick, consistently; report before/after timings".
- Test coverage where step 4 found a gap, in the file it belongs in.
- A screenshot for anything visual, and say what to screenshot — a case that actually shows
  the difference.
- The gate: `npm test --ws` (eslint), `tsc --noEmit`, `vite build`; run `npm run build` once
  before opening the PR; **don't** run `npm ci`/`install` — deps are pre-installed.
- **Base branch: `mainline`.** Bugs don't belong to an epic.

## 8. File it, then clean up after yourself

- `gh issue create --title … --body-file …` — **unlabeled**. A role label is the
  maintainer's routing call, and (since labels became a record of what has run) it would
  also be a lie.
- Add it to the BrewDocs project: `gh project item-add 4 --owner "@me" --url <issue-url>`.
- ⚠️ **Delete any probe spec and revert any file you touched while investigating** —
  `packages/e2e/playwright.config.ts` especially, if you flipped the browser channel. Leave
  the tree clean and confirm it with `git status`.

## 9. Report back

The issue link, the root cause in one sentence, anything you deliberately left out of scope,
and — importantly — anything you could **not** determine. If the reported symptom and the
bug you found aren't the same thing, lead with that.

## Boundaries

- **Don't fix the bug.** File the issue. If the fix turns out to be one obvious line, say so
  in the issue and let the maintainer decide whether it's worth an Implementor run.
- **One issue per bug.** If you find a second, unrelated defect while investigating (it
  happens), file it separately and say plainly that it is *not* the reported problem.
- **Don't file speculation.** Everything in the issue is something you saw, or is labelled as
  inference.
- Never apply a role label, and never open a PR from this command.
