# Reverts

**Purpose.** Where a brewer, or whoever is helping them, can find and revert a record that was
already brought up to date but produced a result they don't want, back to its previous version —
reached only by direct URL, never linked to from anywhere else in the app. A record that migrated
successfully never appears on Updates; this is where it's found instead.

## Behaviours

**REVERTS-01** — Visiting here lists every record that was already brought up to date, showing
enough to identify each one (what kind of record it is, and its id when it has one).

**REVERTS-02** — Each listed record can be reverted back to its previous version.

**REVERTS-03** — Reverting a record whose one retained pre-update snapshot is still available
restores it exactly — byte-for-byte what was stored before the update ran.

**REVERTS-04** — Reverting a record with no usable snapshot instead computes its previous version
by reversing the update's logic — this can lose data the update added along the way.

> *Why:* a computed reversal only undoes the shape change; anything the update filled in or
> derived along the way isn't necessarily recoverable by running that logic backwards.

**REVERTS-05** — Each listed record states plainly, before the brewer commits to reverting it,
whether that revert will be exact or computed.

> *Why:* an exact restore and a computed approximation are different guarantees — a brewer
> choosing to revert should know which one they're getting before they commit, not after.

## Known gaps

_None._

## Out of scope

- Reverting more than one step back, or browsing a record's full version history — a separate
  research spike, #715.
- Reverting a record that failed to migrate, or has no update recorded yet — that's `updates.md`'s
  domain (retry), not this page's.
- Editing a record's data as part of reverting it — a revert restores or computes a previous
  version; it isn't an editor.
