import Batch from "@/model/batch";
import _updateShopping from "@/actions/_updateShopping";
import batchesStorage from "@/storage/batches";
import {isEqual} from "@/utils/func";
import {saveBatch} from "@/state/batches";
import _updateSchedule from "@/actions/_updateSchedule";

const shoppingTriggers: (keyof Batch)[] = ["hops", "grains", "yeasts"];
const scheduleTriggers: (keyof Batch)[] = ["hops", "grains", "yeasts"];

export default async function updateBatch(id: string, batch: Batch) {
    const current = await batchesStorage.get(id);

    if (shoppingTriggers.some(t => !isEqual(batch[t], current?.[t]))) {
        _updateShopping(batch);
    }
    if (scheduleTriggers.some(t => !isEqual(batch[t], current?.[t]))) {
        _updateSchedule(batch);
    }

    await saveBatch(id, batch);
}