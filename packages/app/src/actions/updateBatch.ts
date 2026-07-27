import _updateSchedule from "@/actions/_updateSchedule";
import _updateShopping from "@/actions/_updateShopping";
import ensureBrewableIds from "@/actions/ensureBrewableIds";
import {liveTrackerKeys, pruneTracker} from "@/actions/tracker";
import Batch from "@/model/batch";
import {saveBatch} from "@/state/batches";
import batchesStorage from "@/storage/batches";
import {isEqual} from "@/utils/func";

export default async function updateBatch(id: string, patch: Partial<Batch>) {
    const current = await batchesStorage.get(id);

    // Merge the caller's slice onto the freshest stored batch, so a screen that
    // owns one field (BatchPlanning's brewable/brewDate) doesn't have to hand
    // back a whole reconstructed batch — and a stale sibling field can't clobber
    // one saved since. A full-batch caller (BatchSchedule/Shopping drafts) still
    // works: every key is present, so the merge is a straight replace.
    const batch = { ...current, ...patch } as Batch;

    ensureBrewableIds(batch.brewable);

    // shopping and schedule both derive from `brewable.assignments`; equipment
    // and gravity are live-derived off the brewable directly (no batch-owned
    // copy left to rebuild), so shopping's cost/purchased is the only
    // persisted-derived-with-state a recompute needs to protect. Gating both
    // rebuilds on the same brewable-changed check keeps an untouched brewable
    // (a name/brewDate edit) from re-deriving either for nothing — each still
    // reuses its previous result by reference when nothing it owns changed.
    if (!isEqual(batch.brewable, current?.brewable)) {
        _updateShopping(batch);
        _updateSchedule(batch);
    }

    // eager-prune: drop tracker entries whose ref no longer exists in the
    // current brewable, so a removed ingredient/equipment/phase's checkoff
    // doesn't linger, and re-adding one (a fresh id) starts unchecked.
    batch.tracker = pruneTracker(batch.tracker, liveTrackerKeys(batch.brewable));

    await saveBatch(id, batch);
}