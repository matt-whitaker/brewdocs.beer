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
and leaves it where it is in Planning. Every ingredient assignment carries a configurable weight,
set there the same way regardless of kind — an additive's weight is set independently of whether
that addition also carries a boil time.

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

**BATCH-SCHEDULE-15** — The Brewing schedule offers an additive's weight as a plan/actual field
the same way it already does for a grain's or hop's weight: the planned weight is shown, and if
the brewer enters a value against it, that value is recorded against the same item
(BATCH-SCHEDULE-10).

> *Why:* an addition's boil time and its weight answer different questions — one is when, the
> other is how much — so recording what actually went in must not depend on whether that
> addition also carries a boil time (BATCH-SCHEDULE-08).

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

**BATCH-SCHEDULE-14** — Confirming a phase complete, while the timer is running, stops it: the
Play/Pause control reads Play again and the counter stops advancing. The phase that follows
(BATCH-SCHEDULE-12) does not start timing on its own — the brewer has to press Play themselves
before it resumes. If the timer was already paused, or the session had not been started at all,
completing the phase changes nothing about the timer: it stays exactly as it was.

> *Why:* moving on to the next phase (BATCH-SCHEDULE-12) is not the same as starting work on it
> — a timer left running would keep counting into a phase the brewer has not actually begun.

**BATCH-SCHEDULE-16** — On every phase tab, an empty Gravity, Volume or Temperature reading's
value field — an existing reading row's value cell, and the "add reading" row's value field
alike — shows a greyed-out example value as a placeholder. The example disappears the moment
the brewer types, and is never itself recorded as a value.

**BATCH-SCHEDULE-17** — A **Notes** tab sits alongside the phase tabs, where a brewer can record
the batch's SRM (colour) and free-text notes about it.

**BATCH-SCHEDULE-18** — The SRM field shows `0` until the brewer records a real value for that
batch — it never starts blank.

> *Why:* a blank field reads as "go find this out"; a batch that simply hasn't had its colour
> measured yet is the ordinary case, not a gap that needs chasing.

**BATCH-SCHEDULE-19** — A colour swatch appears next to the SRM field once the brewer has entered
a real, parseable value. Clearing the field, or leaving it holding something that isn't a number,
removes the swatch again.

**BATCH-SCHEDULE-20** — SRM and notes entered on this tab persist across reloads, the same as
everything else recorded on a batch.

## Known gaps

_None._

## Out of scope

- The quick-action entry point itself — how it is opened, and how a kind or equipment is
  picked — is a behaviour of the BrewTimer, specified alongside it rather than here.
- Correcting the time an item was checked off — future work, not yet specified.
- Everything else this screen shows or lets a brewer do with the schedule grid directly — real
  behaviours of this screen, but not yet specified by any story.
