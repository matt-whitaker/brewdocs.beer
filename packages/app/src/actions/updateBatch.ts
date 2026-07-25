import _projectBatchBrewable from "@/actions/_projectBatchBrewable";
import _updateSchedule from "@/actions/_updateSchedule";
import _updateShopping from "@/actions/_updateShopping";
import Batch from "@/model/batch";
import {saveBatch} from "@/state/batches";
import batchesStorage from "@/storage/batches";
import {isEqual} from "@/utils/func";

const shoppingTriggers: (keyof Batch)[] = ["hops", "grains", "yeasts"];
const scheduleTriggers: (keyof Batch)[] = ["hops", "grains", "yeasts", "additives", "hydrometer"];

export default async function updateBatch(id: string, batch: Batch) {
    const current = await batchesStorage.get(id);

    _projectBatchBrewable(batch);

    if (shoppingTriggers.some(t => !isEqual(batch[t], current?.[t]))) {
        _updateShopping(batch);
    }
    if (scheduleTriggers.some(t => !isEqual(batch[t], current?.[t]))) {
        _updateSchedule(batch);
    }

    await saveBatch(id, batch);
}