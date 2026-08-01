import Brewable from "@/model/brewable";
import {Ref, TrackerEntry, key} from "@/model/tracker";
import {setIn} from "@/utils/func";

/**
 * Merges `patch` into the entry at `ref`'s key, immutably (mirrors `utils/func.ts`'s
 * `setIn` — shallow-clones on write).
 *
 * ⚠️ `resource` is merged **one level deeper** than the rest. It's a bag of
 * per-field actuals written a field at a time (each schedule column patches its
 * own key), so a plain spread would let recording a boil time silently wipe a
 * weight recorded a moment earlier.
 */
export function putEntry(tracker: Record<string, TrackerEntry>, ref: Ref, patch: TrackerEntry): Record<string, TrackerEntry> {
    const k = key(ref);
    const previous = tracker[k];
    const merged: TrackerEntry = {...previous, ...patch};

    if (patch.resource || previous?.resource) {
        merged.resource = {...previous?.resource, ...patch.resource};
    }

    if (patch.water || previous?.water) {
        merged.water = {...previous?.water, ...patch.water};
    }

    return setIn(tracker, k, merged);
}

/** drops every entry whose key isn't in `liveKeys` — the eager-prune callers run when a batch's brewable/phases change out from under stale tracker keys */
export function pruneTracker(tracker: Record<string, TrackerEntry>, liveKeys: Set<string>): Record<string, TrackerEntry> {
    const entries = Object.entries(tracker).filter(([k]) => liveKeys.has(k));
    return entries.length === Object.keys(tracker).length ? tracker : Object.fromEntries(entries);
}

/**
 * Every ref-key the current brewable produces: an `assignment` entry per
 * assignment (all schedule rows derive from these — see `deriveSchedule`), an
 * `equipment` entry per phase's equipment, a `milestone` entry per reading
 * configured on a phase, and a `phase` entry per phase (its completion — see
 * `actions/batchProgress.ts`). They all come off the **brewable**, which is the
 * plan's single source of truth — there's no second phase list to reconcile.
 *
 * Ids are assumed already present: phase and milestone ids are minted at
 * creation (`defaultBrewable`/`kbBrewableToBrewable`/the add-rows), assignment
 * and equipment ids by `ensureBrewableIds`, which runs before this in
 * `updateBatch`.
 */
export function liveTrackerKeys(brewable: Brewable): Set<string> {
    const keys = new Set<string>();

    brewable.assignments.forEach(assignment => {
        if (assignment.id) keys.add(key({on: "assignment", id: assignment.id}));
    });

    brewable.schedule.phases.forEach(phase => {
        keys.add(key({on: "phase", id: phase.id}));
        phase.equipment.forEach(item => {
            if (item.id) keys.add(key({on: "equipment", id: item.id}));
        });
        phase.milestones.forEach(milestone => {
            keys.add(key({on: "milestone", id: milestone.id}));
        });
    });

    return keys;
}
