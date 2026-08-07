# Batch schedule

**Purpose.** The phase-by-phase plan for a batch — the grains, hops, yeasts, additives and
equipment a brewer works through during a brew day, and where they check items off as they
go.

## Behaviours

**BATCH-SCHEDULE-01** — Using the quick action for an ingredient kind (grain, hop, yeast or
additive) checks off the **first** not-yet-completed item of that kind in the batch's current
phase, in the order that phase lists them (BATCH-SCHEDULE-08). If the brewer also enters a
value, that value is recorded against the same item.

> *Why:* "first" has to mean the same thing on the screen as it does in the action, or the
> brewer taps once and watches a row they did not choose get ticked, with nothing to explain it.
> They had two different orders once, and the row that ticked was the second one shown.

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

**BATCH-SCHEDULE-08** — Within a phase, the schedule lists each kind in the order the brewer
works through it: additions carrying a boil time come first by longest boil, so a 60-minute
addition is listed above a 15-minute one. Anything with no boil time — grains, yeasts — stays in
the order the brewer arranged while planning.

> *Why:* the boil is a countdown, so longest-boil-first *is* chronological, and a brew-day
> screen read top to bottom should be the order things actually happen. Where there is no such
> order the brewer's own arrangement is the best answer available, and re-sorting it — by name,
> say — would overrule a decision they made deliberately while planning.

**BATCH-SCHEDULE-09** — Planning lists ingredients in the order the brewer put them in, and
nothing re-orders them there. Changing an addition's boil time moves it on the brew-day schedule
and leaves it where it is in Planning.

> *Why:* the two screens answer different questions. Planning is where the brewer arranges the
> recipe, and re-sorting under their hands while they type would fight them. The brew day is
> where the plan is read back as a sequence, and that is the only place an order should be
> imposed on it.


## Known gaps

_None._

## Out of scope

- The quick-action entry point itself — how it is opened, and how a kind or equipment is
  picked — is a behaviour of the BrewTimer, specified alongside it rather than here.
- Correcting the time an item was checked off — future work, not yet specified.
- Everything else this screen shows or lets a brewer do with the schedule grid directly — real
  behaviours of this screen, but not yet specified by any story.
