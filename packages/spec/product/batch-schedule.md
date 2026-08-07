# Batch schedule

**Purpose.** The phase-by-phase plan for a batch — the grains, hops, yeasts, additives and
equipment a brewer works through during a brew day, and where they check items off as they
go.

## Behaviours

**BATCH-SCHEDULE-01** — Using the quick action for an ingredient kind (grain, hop, yeast or
additive) checks off the earliest not-yet-completed item of that kind in the batch's current
phase. If the brewer also enters a value, that value is recorded against the same item.

~~**BATCH-SCHEDULE-02**~~ — *retired, superseded by BATCH-SCHEDULE-06.*

~~**BATCH-SCHEDULE-03**~~ — *retired, superseded by BATCH-SCHEDULE-07.*

**BATCH-SCHEDULE-04** — A kind, or equipment, with nothing left to check off in the batch's
current phase is not offered as a quick action, and says so rather than only appearing inert.

**BATCH-SCHEDULE-05** — A quick-action checkoff is indistinguishable from checking the same
item off the schedule directly: the item shows there, checked, immediately, with no separate
record of how it was checked off.

**BATCH-SCHEDULE-06** — Using the quick action for equipment checks off **the equipment item the
brewer names**, from those not yet completed in the batch's current phase.

> *Why:* an ingredient addition has a boil time, so "the next one" is a real answer a brewer
> would recognise. Equipment has no such order — a mash tun does not come before a thermometer —
> so choosing one for them would be an arbitrary pick presented as a resolution, and a brewer
> who checked off the wrong kettle would have no way to see why.

**BATCH-SCHEDULE-07** — Repeating a quick action for the same ingredient kind advances to the
next not-yet-completed item. It never re-checks an item already checked off, and never reaches
into a later phase while the current phase still has one left.

> *Why:* a brewer working through several hops in one phase repeats the same quick action for
> each addition — if it re-offered the one just checked, or jumped ahead of a phase not yet
> started, the timer would stop being a faster way to do what the grid already does and become
> a way to get the schedule wrong.


## Known gaps

_None._

## Out of scope

- The quick-action entry point itself — how it is opened, and how a kind or equipment is
  picked — is a behaviour of the BrewTimer, specified alongside it rather than here.
- Correcting the time an item was checked off — future work, not yet specified.
- Everything else this screen shows or lets a brewer do with the schedule grid directly — real
  behaviours of this screen, but not yet specified by any story.
