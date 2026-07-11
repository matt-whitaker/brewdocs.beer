import Batch from "@/model/batch";
import _updateShopping from "@/actions/_updateShopping";
import batchesStorage from "@/storage/batches";
import {isEqual} from "@/utils/func";
import {saveBatch} from "@/state/batches";

export default async function updateBatch(id: string, batch: Batch) {
    const current = await batchesStorage.get(id);

    if (
        !isEqual(batch.hops, current?.hops) ||
        !isEqual(batch.grains, current?.grains) ||
        !isEqual(batch.yeast, current?.yeast)
    ) {
        _updateShopping(batch);
    }

    await saveBatch(id, batch)
}