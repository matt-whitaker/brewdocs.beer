# @brewdocs.beer/spec

The product specification: **what BrewDocs should do**, described in a brewer's terms.

It is the standing answer to "what is this screen supposed to do?" — the one that survives a
story being merged and closed. Read it to understand the product without reading the product.

## What this is not

- **Not a design document.** It describes behaviour that exists or has been agreed, not options
  under consideration.
- **Not an implementation guide.** Nothing here names a file, a component, a hook or a data
  shape. That is what each package's `CLAUDE.md` is for, and the two must not overlap — a
  second description of the code drifts against the first.
- **Not a wish list.** Behaviour arrives here when it is specified, not when it is imagined.

## How to read it

[`product/`](product/) holds one document per area of the app, mirroring what a brewer
navigates rather than how the code is organised. Each opens with what the area is *for*, then
lists its behaviours.

Every behaviour carries a stable id — `BATCH-SCHEDULE-04`. Ids are how a test, an issue or a
conversation points at one specific promise, so **they are never renumbered and never reused**.
A behaviour that is retired stays in place, struck through, rather than leaving its number free
for something else to claim.

Each document ends with **Known gaps**: behaviour observed to be wrong or missing, recorded
rather than quietly specified as if intended.

## Who writes it

The Writer, from a story's stated intent — its outcome and acceptance criteria — **before** the
code exists. Deliberately not from the finished diff: a specification written by reading an
implementation can only say what the code already does, which makes it useless for deciding
whether the code is right.

Humans write here too. A maintainer's description of what they want is exactly the right source.

## Who reads it

- **Brewers and maintainers** — the product's own description of itself.
- **The Tester** — its first source when planning what to prove, and the only one that covers
  behaviour from earlier stories.
- **The Architect** — what already exists, when shaping a story that touches it.
