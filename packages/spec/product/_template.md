# <Area>

<!--
Copy this file to product/<area>.md and delete these comments.

The filename sets the id prefix, uppercased: batch-schedule.md -> BATCH-SCHEDULE-<nn>.
Name the file for what a brewer navigates to, not for the code that renders it.

Read packages/spec/CLAUDE.md before writing. The two rules that decide whether this
document is worth anything: observable behaviour only, and ids are never renumbered
or reused.
-->

**Purpose.** <What this area is for, in a sentence a brewer would recognise. Not what it
contains — what it is *for*.>

## Behaviours

<!--
State what someone can DO and what they then SEE. If a sentence cannot be checked by a
person holding the app, it is not a behaviour and does not belong here.

Test: would this still be true after a rewrite that changed no behaviour? If a refactor
would falsify it, it belongs in a CLAUDE.md instead.

Numbers run in order of being ADDED, not in reading order — a new behaviour takes the
next unused number wherever it sits on the page.
-->

**<AREA>-01** — <Doing X results in Y.>

**<AREA>-02** — <Doing X results in Y.>

> *Why:* <Only where the behaviour would otherwise look arbitrary and someone might
> "simplify" it away. Most behaviours need no note; one on every entry means none get read.>

<!--
A retired behaviour stays in place, struck through, naming what replaced it. Never delete
it and never free its number — a test citing a reused id keeps passing while proving a
different promise, which reads as coverage and is worse than no test.

~~**<AREA>-03**~~ — *retired, superseded by <AREA>-11.*
-->

## Known gaps

<!--
Behaviour observed to be wrong or missing. Record it here rather than writing it up as a
promise — specifying a defect as intended is how a bug becomes a requirement.

Every entry names its issue. If there is no issue, file one.
-->

- <What is wrong, and what should happen instead.> — #<issue>

## Out of scope

<!--
What this area deliberately does not do, so the same ground is not specified twice and
nobody proposes it as missing.
-->

- <Deliberately absent behaviour, and briefly why.>
