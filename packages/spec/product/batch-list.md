# Batch list

**Purpose.** Every batch the brewer has started, so they can pick one up mid-brew or look back
at a finished one.

## Behaviours

**BATCH-LIST-01** — Deleting a batch first asks the brewer to confirm. The confirmation names
the batch being deleted, says the action cannot be undone, and offers both cancelling and
confirming. The batch is only removed once the brewer confirms.

> *Why:* a batch is a brew day's record and there is no undo, so the name is what stops the
> wrong one being thrown away — a confirmation that does not say which batch it is asking
> about does not actually protect anything.

**BATCH-LIST-02** — That confirmation appears centred on screen, at a readable width, over the
list it interrupts.

> *Why:* it is the moment the brewer has to read carefully before answering, and a prompt that
> renders as a small box wedged into a corner reads as part of the page rather than as a
> question being asked.

## Known gaps

_None._

## Out of scope

- What the list shows about each batch, how it is ordered, and how it is filtered — those are
  behaviours of this screen, but no story has specified them yet.
- Deleting from anywhere other than this list.
