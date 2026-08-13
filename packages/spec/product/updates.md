# Updates

**Purpose.** Where a brewer, or whoever is helping them, can see and act on a record the app
could not bring up to its current data shape — whether an update was attempted and failed, or
none has run for it yet — reached only by direct URL, never linked to from anywhere else in the
app.

## Behaviours

**MIGRATION-FAILURES-01** — Visiting the page lists every record the app could not bring up to
its current data shape, whether an update was attempted and failed or none has run for it yet,
showing enough to identify each one (what kind of record it is, and its id when it has one).

**MIGRATION-FAILURES-02** — Each listed record's original, unmigrated data can be inspected, in
full and read-only.

**MIGRATION-FAILURES-03** — Discarding a record removes it from the list for good; it does not
come back.

**MIGRATION-FAILURES-04** — Where a retry action is offered for a record, retrying re-attempts
updating it to the current data shape: success removes it from the list, failure leaves it
listed.

**MIGRATION-FAILURES-05** — A record whose data can't be shown doesn't prevent the rest of the
list from being seen.

> *Why:* one unrenderable record shouldn't make every other listed record invisible too.

**UPDATES-01** — Each listed record states the version it's stuck at, and which of two reasons
applies: no update path exists for it yet, or an update was attempted and failed.

> *Why:* "something went wrong" isn't actionable. Knowing which of the two applies is what tells
> a brewer whether there's anything to do about it yet.

**UPDATES-02** — Each listed record offers at least one action; a record with none states that
plainly rather than showing nothing.

## Known gaps

_None._

## Out of scope

- Editing a record's raw, unmigrated data in place — a future follow-up, not this story.
- Historical/rollback backups — a separate research spike, #715.
