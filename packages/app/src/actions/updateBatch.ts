import _updateShopping from "@/actions/_updateShopping";
import ensureBrewableIds from "@/actions/ensureBrewableIds";
import {liveTrackerKeys, pruneTracker} from "@/actions/tracker";
import Batch from "@/model/batch";
import {saveBatch} from "@/state/batches";
import batchesStorage from "@/storage/batches";
import {isEqual} from "@/utils/func";
import serialize from "@/utils/serialize";

export default function updateBatch(id: string, patch: Partial<Batch>) {
    return serialize(`batch:${id}`, async () => {
        const current = await batchesStorage.get(id);

        const batch = { ...current, ...patch } as Batch;

        ensureBrewableIds(batch.brewable);

        if (!isEqual(batch.brewable, current?.brewable)) {
            _updateShopping(batch);
        }

        batch.tracker = pruneTracker(batch.tracker, liveTrackerKeys(batch.brewable));

        await saveBatch(id, batch);
    });
}
