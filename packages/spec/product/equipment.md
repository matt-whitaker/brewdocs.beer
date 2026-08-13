# Equipment

**Purpose.** Where a brewer lists the equipment a recipe's or a batch's phases need, and notes
anything worth knowing about each piece — reached identically from Recipe Edit and from Batch
Planning.

## Behaviours

**EQUIPMENT-01** — Each equipment item carries a free-text note alongside its name, where a
brewer can record whatever is worth knowing about that item — a quantity, a volume, or just a
heads-up — as plain text. Nothing about the note is interpreted; it is saved exactly as typed.

> *Why:* equipment has no one consistent unit worth counting — a keg might warrant "x4", a
> vessel a capacity, a thermometer nothing at all. A single free-text field covers all three
> without pretending every item means the same kind of value.

**EQUIPMENT-02** — Picking an equipment item from the catalogue seeds its note with that item's
own default, which the brewer can then edit or clear like any other text on the row.

**EQUIPMENT-03** — Typing a custom name instead of picking one from the catalogue leaves
whatever note is already on that row exactly as it was.

**EQUIPMENT-04** — This panel, and its note field, behaves identically whether reached by editing
a recipe directly or by planning a batch brewed from one.

## Known gaps

_None._

## Out of scope

- Everything else Recipe Edit or Batch Planning let a brewer do — this covers only the equipment
  panel.
- Which items the catalogue offers, and what a given item's own default note says — a fact about
  the catalogue, not a promise this panel makes.
- Checking equipment off during a brew day — that is BatchSchedule's own behaviour, specified in
  `batch-schedule.md`.
