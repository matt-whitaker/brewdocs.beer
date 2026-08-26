# Batch shopping

**Purpose.** The shopping list for a batch's brew day — every ingredient the recipe calls
for, plus anything the brewer wants to add themselves, checked off and priced as it's bought.

## Behaviours

**BATCH-SHOPPING-01** — Opening a batch's Shopping tab shows one row per ingredient the
batch's recipe calls for. Where the recipe records an amount for that ingredient (a grain or
hop's weight), the row shows it alongside the name, so the brewer knows how much to buy.

**BATCH-SHOPPING-02** — Rows are grouped under headings for the ingredient categories — Hops,
Grains, Yeasts, Additives, and Misc for hand-added items that don't match one of the other four
— each heading appears only once a row belongs under it, and each group can be collapsed and
expanded on its own.

**BATCH-SHOPPING-03** — Rows can be sorted by type (grouped under the category headings —
BATCH-SHOPPING-02), by name (one alphabetical list, no group headings), or by purchased state
(a "To buy" group and a "Purchased" group).

**BATCH-SHOPPING-04** — Each row can be checked off as purchased and given a cost; both survive
leaving the batch and returning to it, and a full reload.

**BATCH-SHOPPING-05** — Changing an unrelated ingredient elsewhere in the batch — a grain's
weight in Planning, say — does not reset another row's checked-off state or cost.

> *Why:* the list is rebuilt from the recipe on every such change, so a row keeping its
> purchased state and cost across that rebuild is not automatic — it depends on the rebuilt row
> still matching the one it replaces.

~~**BATCH-SHOPPING-06**~~ — *retired, superseded by BATCH-SHOPPING-10 through
BATCH-SHOPPING-12.*

**BATCH-SHOPPING-07** — A hand-added item sorts and groups alongside recipe-derived items the
same way (BATCH-SHOPPING-02, BATCH-SHOPPING-03), and can be checked off and given a cost the
same way as a derived row (BATCH-SHOPPING-04).

**BATCH-SHOPPING-08** — A hand-added item is not lost when the brewer edits an unrelated
ingredient elsewhere in the batch — the same guarantee a derived row has (BATCH-SHOPPING-05),
even though a hand-added item has no recipe assignment for the rebuild to match it against.

**BATCH-SHOPPING-09** — Only a hand-added item shows a control to remove it from the list; a
recipe-derived row shows no remove control.

> *Why:* removing an ingredient the recipe calls for is Planning's job, not Shopping's — and a
> removed derived row would simply reappear the next time anything in the batch changes, since
> the list is rebuilt from the recipe.

**BATCH-SHOPPING-10** — A brewer can add their own item to the Shopping list by naming it; no
category choice is offered.

**BATCH-SHOPPING-11** — A hand-added item whose typed name doesn't match the name of anything
already on the list joins its own "Misc" group, alongside Hops, Grains, Yeasts and Additives.

**BATCH-SHOPPING-12** — A hand-added item whose typed name matches — ignoring case and any
leading or trailing spaces — the name of an item already showing on the list under Hops,
Grains, Yeasts or Additives joins that group instead of Misc. This applies whether the matched
item is recipe-derived or was itself hand-added earlier.

## Known gaps

_None._

## Out of scope

- Editing a hand-added item's name or category after it's created.
- Removing or editing a recipe-derived row — that's Planning, specified alongside the rest of
  Planning's ingredient behaviour, not here.
- Everything about the Planning, Brewing (schedule) and Summary tabs — each is its own area,
  specified separately.
