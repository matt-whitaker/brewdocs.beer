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

## Known gaps

- Which specific item a reading, an ingredient addition, or an equipment check-off actually
  resolves to (for example, "the current phase" or "the next incomplete thing") is not yet
  decided by the panel itself — #603.

## Out of scope

- Which specific readings, ingredients, or equipment are offered in each tab, and how that list
  is determined — a matter of whatever screen hosts this panel, not the panel itself.
- Anything about saving, persisting, or otherwise wiring recorded values to a batch.
