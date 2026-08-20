# Backup & restore

**Purpose.** Where a brewer takes their batches and recipes out of the app and onto storage they
control — insurance against a cleared browser, a lost or replaced phone, or anything else that
could otherwise erase everything they've brewed and planned.

## Behaviours

**BACKUP-EXPORT-01** — A **Backup** entry in the app's navigation leads to a "Back up now" action.

**BACKUP-EXPORT-02** — Triggering "Back up now" hands the backup file to the device's native
share sheet, letting it be saved to cloud storage, a file manager, or any app the device offers
as a share target.

> *Why:* the share sheet is what lets a brewer choose where the file actually ends up — this app
> deliberately doesn't pick a destination for them.

**BACKUP-EXPORT-03** — Where the device offers no native share sheet, "Back up now" downloads the
file directly instead.

**BACKUP-EXPORT-04** — A backup contains every batch and recipe currently stored in the app.

**BACKUP-EXPORT-05** — "Back up now" is available even before a brewer has brewed or planned
anything; it produces a backup with nothing in it rather than being unavailable.

**BACKUP-RESTORE-01** — The same screen offers a control for picking a previously backed-up file
to restore.

**BACKUP-RESTORE-02** — Restoring a file replaces the brewer's batches and recipes with what the
file contains.

**BACKUP-RESTORE-03** — A file that contains only one kind (only recipes, or only batches)
restores just that kind; whichever kind the file doesn't contain is left exactly as it was before
restoring.

> *Why:* a backup file doubles as a way to hand a single recipe to someone else, not only as a
> whole-collection snapshot — restoring one shouldn't clear out the other.

**BACKUP-RESTORE-04** — A record in the restored file that the app can't yet make sense of shows
up on the page where update problems are listed, the same way any other unreadable stored record
does; it doesn't stop the rest of the file from being restored.

## Known gaps

_None._

## Out of scope

- Where or how the backup file is stored once handed off (cloud provider, device location) — up
  to the brewer and whatever they choose in the share sheet.
- Historical/rollback backups — a separate research spike, #715.
