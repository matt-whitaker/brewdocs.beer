# Brew timer

**Purpose.** One place during a brew day to log what just happened — a reading taken, an
ingredient added, or a piece of equipment used — without first deciding which kind of thing
it is.

## Behaviours

**BREW-TIMER-01** — A single quick-action control opens one panel offering three tabs, always
in this order: Ingredients, Reading, Equipment. Only one tab's content is visible at a time;
switching tabs replaces what is shown rather than adding to it.

> *Why:* a brewer mid-pour does not want to pick between several controls before they have even
> decided what they are recording — one entry point removes that decision from the
> muscle-memory path.

**BREW-TIMER-02** — The Reading tab lets the brewer pick what kind of reading they are taking,
optionally narrow it with a related detail, and enter the value, then submit it as a recorded
reading. This is unchanged from how a reading was recorded before this panel existed — only
where it is reached from has changed.

**BREW-TIMER-03** — The Ingredients tab lets the brewer pick which kind of ingredient they are
adding and optionally record a value for it (such as a weight or a time), then submit it.

**BREW-TIMER-04** — The Equipment tab lets the brewer check off a piece of equipment with no
value to enter — just a confirmation that it happened.

**BREW-TIMER-05** — When there is no equipment left to check off, the Equipment tab reads as
unavailable rather than accepting a tap that does nothing.

> *Why:* a control that quietly no-ops looks broken — a brewer who taps it and sees no result
> has no way to tell "there is nothing left" from "it did not work."

**BREW-TIMER-06** — The counter and timeline carry a Global/Phase toggle. Global (the default)
shows the whole brew session's elapsed time; Phase shows elapsed time within the batch's
current phase only. Choosing one or the other changes only what is displayed — the timer keeps
running, or stays paused, exactly as it was.

**BREW-TIMER-07** — Phase's elapsed count excludes any time the timer was paused since the
active phase began, so it reflects only the time actually spent on that phase.

**BREW-TIMER-08** — Phase's timeline shows only the active phase's own milestones, plus its own
completion marker once it has been completed, each positioned relative to the phase's start.
Global's timeline shows one start marker and one complete marker per phase that has begun — not
each phase's individual readings or hop additions — each positioned relative to the whole
session's start. A phase that hasn't started yet shows neither marker.

> *Why:* every phase's individual readings and hop additions plotted across the whole session
> would crowd the timeline past being readable — the phase boundaries are what's useful to see
> at that scale, not every entry within them.

**BREW-TIMER-09** — Logging a reading or a hop addition while Phase is the active scope places
its marker on the timeline at its elapsed time within the phase — logged 30 seconds after the
phase started, the marker reads `0:30` — rather than at a session-wide time. This marker belongs
to Phase's own timeline; Global shows only the phase-level start and complete markers described
in BREW-TIMER-08, never an individual reading's or hop addition's marker. No other ingredient
kind, and no equipment check-off, places a marker in Phase's timeline.

**BREW-TIMER-10** — Switching to Global, or resuming the timer while already on Global, always
shows the session's true elapsed time on the very next tick — never a number carried over from
what Phase was showing a moment before.

**BREW-TIMER-11** — Checking off any ingredient or piece of equipment — through Quick Actions or
the schedule grid's own row checkbox — records the real time it happened, in both Global and
Phase, whether or not anything on screen shows that time yet.

> *Why:* a hop addition's marker (BREW-TIMER-09) is only possible because the moment it happened
> was captured — the same recording holds for every other kind so a marker for one of them is a
> display change later, not a data change.

**BREW-TIMER-12** — The Reading tab also offers an optional label field, entered after the
value. Submitting with a label uses it as the recorded reading's name; submitting without one
keeps the reading kind's default label, unchanged from BREW-TIMER-02.

## Known gaps

- Which specific item a reading, an ingredient addition, or an equipment check-off actually
  resolves to (for example, "the current phase" or "the next incomplete thing") is not yet
  decided by the panel itself — #603.
- Correcting a phase-relative marker (BREW-TIMER-09) is only possible to the day, not the
  minute: the reading's existing raw-date editor has no time-of-day field, so the only
  available edit moves the entry to a different calendar day rather than nudging its label —
  #691.

## Out of scope

- Which specific readings, ingredients, or equipment are offered in each tab, and how that list
  is determined — a matter of whatever screen hosts this panel, not the panel itself.
- Anything about saving, persisting, or otherwise wiring recorded values to a batch.
- A countdown or target-duration display for Phase mode — its counter counts up like Global's;
  no phase has a stored planned length for it to count down against.
- A separate, persisted per-phase timer log — Phase is a display over the same session log
  Global reads, not a second record.
- Timeline markers for grain, yeast, additive and equipment check-offs — only a hop addition
  places one (BREW-TIMER-09). This is deliberate, not an oversight yet to be built: it matches
  the codebase's existing precedent that only hops are reliably chronological — grain goes into
  the mash all at once and an additive isn't consistently boil-timed, so a marker is right for
  hops and arbitrary for the rest (#663).
- Pausing the timer when a phase is completed — a behaviour of confirming completion, specified
  alongside it on the batch schedule (BATCH-SCHEDULE-14) rather than here.
