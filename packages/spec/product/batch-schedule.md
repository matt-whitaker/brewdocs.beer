# Batch schedule

**Purpose.** The brew-day companion: the phases of a batch in progress, and the running timer a
brewer checks to see how long they've been at a step.

## Behaviours

**BATCH-SCHEDULE-01** — The brew timer has a scope control with two positions, Global and
Phase, and the brewer can switch between them at any time.

**BATCH-SCHEDULE-02** — In Global scope, the timer shows time elapsed since the brew session
was first started, including any time spent paused.

**BATCH-SCHEDULE-03** — In Phase scope, the timer shows time elapsed since the current phase
began, excluding any time spent paused within that phase.

**BATCH-SCHEDULE-04** — Phase scope always tracks the phase the brewer has not yet completed,
never whichever phase they happen to be looking at.

> *Why:* looking ahead to a later phase's tab is a normal thing to do mid-brew, and if Phase
> scope followed the viewed tab instead of the phase actually in progress, the timer would
> quietly report time for a phase that isn't running — exactly when a brewer trusting it to
> show how long they've been on the current step would be misled.

**BATCH-SCHEDULE-05** — In Phase scope, the timeline below the timer shows only the markers
logged during the current phase, positioned relative to that phase's own start rather than the
session's start.

## Known gaps

_None._

## Out of scope

- The rest of the Batch Schedule screen — this document currently covers only the brew timer's
  Global/Phase scope behaviour.
- A history of time spent in each completed phase — the timer shows only the current reading
  for whichever scope is selected, not a per-phase record.
