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
 * Every ref-key the current brewable's derivations produce: an `assignment`
 * entry per assignment (mash/boil/ferment rows all derive from these — see
 * `_updateSchedule`), an `equipment` entry per phase's equipment, and a
 * post-gravity `milestone` entry per mash/boil phase (`screen/batch-schedule/gravity.tsx`
 * — ferment gets no reading in v1). Ids are assumed already minted
 * (`ensureBrewableIds` runs before this in `updateBatch`).
 */
export function liveTrackerKeys(brewable: Brewable): Set<string> {
    const keys = new Set<string>();

    brewable.assignments.forEach(assignment => {
        if (assignment.id) keys.add(key({on: "assignment", id: assignment.id}));
    });

    brewable.schedule.phases.forEach(phase => {
        if (phase.id && (phase.type === "mash" || phase.type === "boil")) {
            keys.add(key({on: "milestone", phaseId: phase.id, when: "post", kind: "gravity"}));
        }
        phase.equipment.forEach(item => {
            if (item.id) keys.add(key({on: "equipment", id: item.id}));
        });
    });

    return keys;
}
