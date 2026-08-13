# Data migration

**Purpose.** Keeping a brewer's stored data current with what the app now expects, without the
brewer having to do anything about it.

## Behaviours

**DATA-MIGRATION-01** — Opening the app while any stored record needs to be brought up to date
keeps the app on its ordinary loading state until that finishes. Once it's done, the app appears
with those records already current — nothing that's already on screen is later added to, removed,
or replaced because of this.

> *Why:* a list that appears short and then grows a moment later reads as a batch having gone
> missing and come back, not as ordinary housekeeping — a slightly longer wait once is the better
> trade against a brewer wondering whether their data is still there.

**DATA-MIGRATION-02** — Opening the app when nothing needs to be brought up to date looks exactly
like any other load: no extra wait beyond the ordinary loading state, nothing flickers or repeats,
and every record is simply there, as it was left.

> *Why:* this is the ordinary case, forever, for a brewer who never sees the app change shape
> underneath them — keeping data current only needs to be noticeable on the rare load that
> actually has work to do.

## Known gaps

_None._

## Out of scope

- What happens to a record that can't be brought up to date — see `migration-failures.md`.
- Restoring a record from an earlier version — see `reverts.md`.
