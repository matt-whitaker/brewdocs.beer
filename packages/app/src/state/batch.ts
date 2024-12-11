import EntityState from "@/state/entityState";
import Batch from "@/model/batch";
import batchesStorage from "@/storage/batches";
import useEntityState from "@/hooks/useEntityState";

export const useBatch = (id: string|null = null) => useEntityState<Batch>(batchState, id);
export class BatchState extends EntityState<Batch> {
    async load(id: string) {
        const batch = await batchesStorage.get(id);
        this._subject.next(batch);
        return batch;
    }

    update(id: string, batch: Batch) {
        batchesStorage.save(id, batch).then(() => this.load(batch.id));
    }
}

const batchState = new BatchState(null);
export default batchState;