import EntityState from "@/state/entityState";
import Batch from "@/model/batch";
import batchesStorage from "@/storage/batches";
import useEntityState from "@/hooks/useEntityState";


export const useBatch = (id: string|null = null) => useEntityState<Batch>(batchState, id);
export class BatchState extends EntityState<Batch> {
    load(id: string) {
        batchesStorage.get(id).then(batches => this._subject.next(batches));
    }

    update(id: string, batch: Batch) {
        const prev = batchesStorage.get(id);
        batchesStorage.save(id, batch).then(() => this.load(batch.id));
    }
}

const batchState = new BatchState(null);
export default batchState;