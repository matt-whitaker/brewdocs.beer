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

**BATCH-LIST-03** — Following a link to a batch that no longer exists — a deleted batch, a
stale bookmark, a mistyped id, a link shared after a purge — returns the brewer to this list,
with the page's normal navigation intact, rather than an error screen.

> *Why:* a batch stops existing by ordinary means — it was deleted, or the store was purged —
> so meeting a link to it should read as the app staying usable, not as something broken.

**BATCH-LIST-04** — Each row shows the batch's own name, the recipe it was brewed from, its
author, and its current status.

**BATCH-LIST-05** — Clicking anywhere on a batch's row opens that batch. Clicking its delete
button does not.

**BATCH-LIST-06** — The list is split into four tabs by status — Ready, Brewing, Fermenting,
Complete — with Ready selected by default. Each tab lists only the batches currently in that
status. There is no search box or other filter, and batches are not grouped by recipe.

**BATCH-LIST-07** — There is no way to start a new batch from this screen. A batch is started
from a recipe's own "Brew" action, which creates the batch and opens it directly.

## Known gaps

- The order batches appear in within a tab does not follow the batch's name, when it was
  brewed, or anything else a brewer would recognise — filed as
  [#1144](https://github.com/matt-whitaker/brewdocs.beer/issues/1144).

## Out of scope

- How the list is ordered — see **Known gaps**; no story has specified an intended order yet.
- Deleting from anywhere other than this list.
