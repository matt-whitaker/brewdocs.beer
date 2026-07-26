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
