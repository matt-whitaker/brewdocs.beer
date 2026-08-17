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

**BATCH-SCHEDULE-21** — A **Prep** tab sits at the start of the phase tab strip, where a brewer
records the batch's **Brewed on** date and its **Packaging** (Keg or Bottle). Both persist across
reloads, independently of any phase.

**BATCH-SCHEDULE-22** — Checking off an equipment or ingredient item directly on a phase's
schedule grid marks it checked immediately — indistinguishable from using the quick action
(BATCH-SCHEDULE-05) — and it stays checked after a reload.

**BATCH-SCHEDULE-23** — Typing a value straight into a planned ingredient's field on the schedule
grid (its weight, or another actual field, such as a hop's boil time) records it as that
ingredient's actual without changing the plan: the planned value keeps showing alongside it,
the same as an actual entered via the quick action (BATCH-SCHEDULE-10).

**BATCH-SCHEDULE-24** — Expanding a yeast row's details reveals a **Yeast Pitched** date the
brewer can set, which persists across reloads the same as everything else recorded on the
schedule.

**BATCH-SCHEDULE-25** — Every phase's schedule grid offers Gravity, Volume and Temperature
readings: a brewer can add one, name it, set its value, and expand it to set its date — each
survives a reload.

**BATCH-SCHEDULE-26** — Removing a reading deletes it outright: it does not come back after a
reload.

**BATCH-SCHEDULE-27** — Water Chemistry readings are offered only on a Mash phase; no other
phase's schedule grid offers them.

**BATCH-SCHEDULE-28** — Pressure and Keg date readings are offered only on a Carbonation phase.

**BATCH-SCHEDULE-29** — A Bottle date reading is offered only on a Conditioning phase.

> *Why (BATCH-SCHEDULE-27–29):* each of these only means something once the batch is actually in
> the state it describes — water chemistry is a mash-in concern, a keg date and its pressure
> belong to the batch once it's in a keg, a bottle date once it's in bottles. Offering them on
> every phase would let a brewer log one against a phase that hasn't happened yet.

**BATCH-SCHEDULE-30** — A phase with no equipment or ingredients assigned to it shows an empty
schedule grid, and its own tab in the Brewing strip is disabled: a brewer can't switch to it by
hand. It can still become the batch's current phase — reached by completing the phase before it —
and, once current, it can still be completed itself even though there is nothing on it to check
off.

## Known gaps

- The Prep tab's **Brewed on** date field has no accessible name, unlike **Packaging** right next
  to it — [#1126](https://github.com/matt-whitaker/brewdocs.beer/issues/1126).

## Out of scope

- The quick-action entry point itself — how it is opened, and how a kind or equipment is
  picked — is a behaviour of the BrewTimer, specified alongside it rather than here.
- Correcting the time an item was checked off — future work, not yet specified.
- What the Summary tab does with the values recorded here (deriving O.G./F.G./ABV/IBU from
  readings, for instance) — that derivation belongs to Summary's own spec, not this one.
