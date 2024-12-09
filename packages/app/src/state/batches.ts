import Batch from "@/model/batch";
import batchesStorage from "@/storage/batches";
import CollectionState from "@/state/collectionState";
import useCollectionState from "@/hooks/useCollectionState";

export const useBatches = () => useCollectionState<Batch>(batchesState);

export class BatchesState extends CollectionState<Batch> {
    load() {
        batchesStorage.list().then(batches => this._subject.next(batches));
    }
}

const batchesState = new BatchesState(null);
export default batchesState;