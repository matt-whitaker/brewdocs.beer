# packages/spec

Package-specific guidance. See [`README.md`](README.md) for what this package is, and the
repo-root `CLAUDE.md` for universal rules.

**Purpose.** The product specification — what BrewDocs should do, in a brewer's terms. The
durable answer to "what is this supposed to do?", which a story cannot be: a story is
diff-shaped and becomes history the moment it merges.
**Where.** `product/*.md`, one document per area of the app, plus `product/_template.md`.
**Invariants.** Observable behaviour only. Ids are never renumbered or reused. Written from
intent, never from a diff.
**Gotchas.** Not an npm workspace — `npm test -ws` never sees it, and neither CI workflow runs
for a spec-only change (both `paths` lists carry `'!packages/spec/**'`).

## Why this package exists

The Tester is required to derive every test from **expected** behaviour, never from the
implementation — a test written by reading the code passes by construction and cannot fail for
the only reason worth catching. That rule was given three sources: the story's outcome, the
authors' `testingNotes`, and the acceptance criteria.

⚠️ **All three are story-scoped.** Once a story merges, the only surviving description of what
the product should do is the product. So the rule quietly inverted itself for everything except
the story in front of you — a regression suite, which is most of a suite, had nowhere honest to
come from. This package is that source.

## What a document looks like

Copy [`product/_template.md`](product/_template.md). One file per area a brewer navigates —
named for the screen, not the code that renders it.

- **Purpose** — what the area is for, in a sentence a brewer would recognise.
- **Behaviours** — the promises the product makes, each with an id.
- **Known gaps** — behaviour observed to be wrong or missing, with its issue.
- **Out of scope** — what this area deliberately does not do, so nobody specifies it twice.

### Writing a behaviour

State what someone can **do** and what they then **see**. If a sentence cannot be checked by a
person holding the app, it is not a behaviour.

> **BATCH-SCHEDULE-04** — Checking off an ingredient keeps it checked after leaving the batch
> and returning to it.

⚠️ **Add a *why* only where the behaviour would otherwise look arbitrary** and someone might
"simplify" it away. The reload in that example is the whole point — a save that throws in a
fire-and-forget call leaves the UI looking correct — and a behaviour that does not say so
invites a test that never reloads.

## The two rules

⚠️ **Observable behaviour only.** What a brewer can see and do. No file, component, hook, state
shape or storage detail — the moment a document explains *how*, it is a second `CLAUDE.md`
covering the same ground as the real one, and two descriptions of one mechanism drift. They
have already drifted twice in this repo where nobody was even trying to keep two copies.

The dividing question: **would this sentence still be true after a rewrite that changed no
behaviour?** If yes it belongs here. If a refactor would falsify it, it belongs in a `CLAUDE.md`.

⚠️ **Ids are never renumbered and never reused.** The id is what a test, an issue or a
conversation points at. Renumbering silently retargets every one of those references: a test
citing `BATCH-SCHEDULE-04` keeps passing while now proving a different promise, which is worse
than the test not existing, because it reads as coverage.

- The prefix is the filename, uppercased: `batch-schedule.md` → `BATCH-SCHEDULE-<nn>`. Nothing
  to look up, and nothing to keep in sync.
- Numbers run in order of being added, not in reading order. A new behaviour takes the next
  unused number wherever it belongs on the page.
- A retired behaviour stays, struck through, with what replaced it:
  `~~**BATCH-SCHEDULE-03**~~ — *retired, superseded by BATCH-SCHEDULE-11.*`

## Where a behaviour comes from

⚠️ **From intent, never from a diff.** A specification written by reading an implementation can
only restate what the code already does — so it cannot be used to decide whether the code is
right, which is the single thing a specification is for. Worse, a Tester deriving tests from
that document is deriving from the implementation at one remove, and the rule it was given
looks satisfied.

Legitimate sources: a story's stated outcome and acceptance criteria, an epic's goal, and the
maintainer describing what they want.

⚠️ **When specifying what already exists, work from the running app, not the source.** Reading
the implementation enshrines today's behaviour as intended, bugs and all. Drive the screens,
describe what happens, and put anything that looks wrong under **Known gaps** with an issue —
never write a defect up as a promise.

## Who writes it, who reads it

| role | relationship |
|---|---|
| Writer | owns it. Writes a story's behaviours from its intent, **before** the code exists. |
| Tester | first source when planning. Cites the ids it intends to prove. |
| Architect | reads it when shaping a story that touches an existing area. |
| Implementor / Designer | read it for context; never edit it. |

⚠️ **The Writer runs FIRST in a story**, ahead of the authors — the ordering follows from
"written from intent". A Writer that ran last would have the finished diff in front of it, which
is the one source it must not use.
