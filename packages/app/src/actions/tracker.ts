import {Phase} from "@/model/batch";
import Brewable from "@/model/brewable";
import {Ref, TrackerEntry, key} from "@/model/tracker";
import {setIn} from "@/utils/func";

/** merges `patch` into the entry at `ref`'s key, immutably (mirrors `utils/func.ts`'s `setIn` — shallow-clones on write) */
export function putEntry(tracker: Record<string, TrackerEntry>, ref: Ref, patch: TrackerEntry): Record<string, TrackerEntry> {
    const k = key(ref);
    return setIn(tracker, k, {...tracker[k], ...patch});
}

/** drops every entry whose key isn't in `liveKeys` — the eager-prune callers run when a batch's brewable/phases change out from under stale tracker keys */
export function pruneTracker(tracker: Record<string, TrackerEntry>, liveKeys: Set<string>): Record<string, TrackerEntry> {
    const entries = Object.entries(tracker).filter(([k]) => liveKeys.has(k));
    return entries.length === Object.keys(tracker).length ? tracker : Object.fromEntries(entries);
}

/**
 * Every ref-key the current brewable/phases derivations produce: an
 * `assignment` entry per assignment (mash/boil/ferment rows all derive from
 * these — see `deriveSchedule`), an `equipment` entry per phase's equipment,
 * and one `milestone` entry per configured milestone on any batch phase
 * (`batch.phases[].milestones[]`). Ids are assumed already present — brewable
 * ids are minted by `ensureBrewableIds` (which runs before this in
 * `updateBatch`), while milestone ids are minted at add-time in the UI, not
 * by a write-path "ensure" step.
 */
export function liveTrackerKeys(brewable: Brewable, phases: Phase[]): Set<string> {
    const keys = new Set<string>();

    brewable.assignments.forEach(assignment => {
        if (assignment.id) keys.add(key({on: "assignment", id: assignment.id}));
    });

    brewable.schedule.phases.forEach(phase => {
        phase.equipment.forEach(item => {
            if (item.id) keys.add(key({on: "equipment", id: item.id}));
        });
    });

    phases.forEach(phase => {
        phase.milestones.forEach(milestone => {
            keys.add(key({on: "milestone", phaseId: phase.id, id: milestone.id}));
        });
    });

    return keys;
}
