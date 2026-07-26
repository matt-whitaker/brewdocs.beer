import _updateSchedule from "@/actions/_updateSchedule";
import _updateShopping from "@/actions/_updateShopping";
import ensureBrewableIds from "@/actions/ensureBrewableIds";
import Batch from "@/model/batch";
import {saveBatch} from "@/state/batches";
import batchesStorage from "@/storage/batches";
import {isEqual} from "@/utils/func";

// shopping/schedule derive from `brewable.assignments` now, so a brewable edit
// is the change signal. Comparing the whole brewable slightly over-triggers on
// equipment/phase edits, but the derivations
// reuse their previous result by reference when nothing they own changed, so a
// needless recompute stays cheap and doesn't dirty the batch.
const shoppingTriggers: (keyof Batch)[] = ["brewable"];
const scheduleTriggers: (keyof Batch)[] = ["brewable"];

export default async function updateBatch(id: string, batch: Batch) {
    const current = await batchesStorage.get(id);

    ensureBrewableIds(batch.brewable);

    if (shoppingTriggers.some(t => !isEqual(batch[t], current?.[t]))) {
        _updateShopping(batch);
    }
    if (scheduleTriggers.some(t => !isEqual(batch[t], current?.[t]))) {
        _updateSchedule(batch);
    }

    await saveBatch(id, batch);
}