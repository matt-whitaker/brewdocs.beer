import Batch from "@/model/batch";
import _updateShopping from "@/actions/_updateShopping";
import batchesStorage from "@/storage/batches";
import {isEqual} from "lodash";

export default async function updateBatch(id: string, batch: Batch) {
    const current = await batchesStorage.get<Batch>(id);

    if (
        !isEqual(batch.hops, current?.hops) ||
        !isEqual(batch.grains, current?.grains) ||
        !isEqual(batch.yeast, current?.yeast)
    ) {
        console.log("THIS SHOULD HAVE HAPPENED");
        _updateShopping(batch);
    }

    batchesStorage.save(id, batch);
}