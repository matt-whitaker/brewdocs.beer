# Equipment overview

**Purpose.** Where a brewer reads an equipment item — the catalogue's or one of their own — and,
if it is theirs, changes or removes it.

## Behaviours

**EQUIPMENT-OVERVIEW-01** — An equipment item opens on its overview, which shows the item's name,
its notes and its count.

**EQUIPMENT-OVERVIEW-02** — A catalogue item and one of the brewer's own show the same overview —
the same name, notes and count, laid out the same way. What differs between them is only which
actions the overview offers.

**EQUIPMENT-OVERVIEW-03** — A catalogue item offers no Edit action at all, and no way to make a
copy of it from here. This is permanent, not a gap still to fill.

> *Why:* unlike a recipe, where opening Edit on a catalogue item hands the brewer a copy to work
> on, an equipment item has no clone-from-catalogue flow — there is nothing for a catalogue
> item's overview to open into, so no Edit action is offered.

**EQUIPMENT-OVERVIEW-04** — A brewer's own item offers Edit, which edits that item in place —
no copy is made, since it is already the brewer's own.

**EQUIPMENT-OVERVIEW-05** — A brewer's own item also offers Delete, from its own overview and not
only from the list. Deleting it here asks the same confirmation as deleting it from the list —
naming the item, saying the action cannot be undone — and only removes it once confirmed.

**EQUIPMENT-OVERVIEW-06** — Deleting it here behaves the same as following a link to an item that
no longer exists (EQUIPMENT-LIST-10): the brewer lands back on the equipment list, since the item
they were looking at no longer exists to show.

**EQUIPMENT-OVERVIEW-07** — An item names itself above the screen and offers the way back to the
equipment list from there.

## Known gaps

_None._

## Out of scope

- The equipment list itself — what it shows, how it is searched and split between *All* and *My
  Equipment* — specified as Equipment list.
- Following a link to an equipment item that no longer exists: already specified as
  EQUIPMENT-LIST-10.
- The per-recipe/per-batch equipment panel reached from Recipe Edit and Batch Planning — a
  different, already-shipped area, specified separately in `packages/spec/product/equipment.md`.
  That document is not this one.
- What a catalogue item's own default notes and count say, and where the catalogue's items come
  from — a fact about the catalogue, not a promise this page makes.
