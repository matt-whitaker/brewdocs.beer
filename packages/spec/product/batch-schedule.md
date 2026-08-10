# Batch schedule

**Purpose.** The phase-by-phase plan for a batch — the grains, hops, yeasts, additives and
equipment a brewer works through during a brew day, and where they check items off as they
go.

## Behaviours

~~**BATCH-SCHEDULE-01**~~ — *retired, superseded by BATCH-SCHEDULE-10.*

~~**BATCH-SCHEDULE-02**~~ — *retired, superseded by BATCH-SCHEDULE-06.*

~~**BATCH-SCHEDULE-03**~~ — *retired, superseded by BATCH-SCHEDULE-07, itself now BATCH-SCHEDULE-11.*

**BATCH-SCHEDULE-04** — Ingredients, or equipment, with nothing left to check off in the batch's
current phase are not offered as a quick action, and say so rather than only appearing inert.

**BATCH-SCHEDULE-05** — A quick-action checkoff is indistinguishable from checking the same
item off the schedule directly: the item shows there, checked, immediately, with no separate
record of how it was checked off.

**BATCH-SCHEDULE-06** — Using the quick action for equipment checks off **the equipment item the
brewer names**, from those not yet completed in the batch's current phase.

> *Why:* an ingredient addition has a boil time, so "the next one" is a real answer a brewer
> would recognise. Equipment has no such order — a mash tun does not come before a thermometer —
> so choosing one for them would be an arbitrary pick presented as a resolution, and a brewer
> who checked off the wrong kettle would have no way to see why.

~~**BATCH-SCHEDULE-07**~~ — *retired, superseded by BATCH-SCHEDULE-11.*

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


**BATCH-SCHEDULE-10** — Using the quick action for ingredients checks off **the item the brewer
names**, from those not yet completed in the batch's current phase. If they also enter a value,
that value is recorded against the same item.

> *Why:* only hops are reliably chronological. Grain goes into the mash all at once, so it has no
> next; an additive may or may not carry a boil time. A resolver would be right for one kind and
> an arbitrary pick dressed as a resolution for the other two — the same reason equipment is named
> (BATCH-SCHEDULE-06). Ingredients and equipment now behave alike, which is one rule for a brewer
> to hold instead of three.

**BATCH-SCHEDULE-11** — The items are offered in the order the phase lists them
(BATCH-SCHEDULE-08), with the first not-yet-completed one already selected, and an item that has
been checked off is not offered again.

> *Why:* naming the item must not cost the brewer the speed that made the quick action worth
> having. Working down a boil stays one confirm per addition, because the next one is already
> selected — the brewer only has to intervene when they want something out of order, which is
> exactly when they should.

**BATCH-SCHEDULE-12** — Confirming a phase complete moves the schedule on to the phase that
follows it, rather than leaving the brewer on the one they just finished.

> *Why:* the next thing a brewer needs after finishing a phase is almost always the next
> phase's items, not another look at what they just checked off — advancing for them saves a
> tap they would otherwise make themselves, every time.

**BATCH-SCHEDULE-13** — Completing the last phase leaves the schedule showing that phase: there
is no phase after it to move on to.

## Known gaps

_None._

## Out of scope

- The quick-action entry point itself — how it is opened, and how a kind or equipment is
  picked — is a behaviour of the BrewTimer, specified alongside it rather than here.
- Correcting the time an item was checked off — future work, not yet specified.
- Everything else this screen shows or lets a brewer do with the schedule grid directly — real
  behaviours of this screen, but not yet specified by any story.
