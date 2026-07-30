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

    // Shopping is the last persisted derivation: it carries user-owned state
    // (cost/purchased) that a rebuild has to re-attach, so it can't just be a
    // live view. Schedule, equipment and gravity all derive live off the
    // brewable on the screen instead — nothing batch-owned left to rebuild for
    // them. Gating on brewable-changed keeps an untouched brewable (a
    // name/brewDate edit) from re-deriving for nothing; the rebuild still
    // reuses its previous items by reference when nothing it owns changed.
    if (!isEqual(batch.brewable, current?.brewable)) {
        _updateShopping(batch);
    }

    // eager-prune: drop tracker entries whose ref no longer exists in the
    // current brewable, so a removed ingredient/equipment/phase's checkoff
    // doesn't linger, and re-adding one (a fresh id) starts unchecked.
    batch.tracker = pruneTracker(batch.tracker, liveTrackerKeys(batch.brewable));

    await saveBatch(id, batch);
}