import Batch from "@/model/batch";
import batchesStorage from "@/storage/batches";
import CollectionState from "@/state/collectionState";
import useCollectionState, {FilterFn} from "@/hooks/useCollectionState";

export const useBatches = (filter?: FilterFn<Batch>) => useCollectionState<Batch>(batchesState, null, filter);

export class BatchesState extends CollectionState<Batch> {
    async load() {
        const batches = await batchesStorage.list();
        this._subject.next(batches);
        return batches;
    }
}

const batchesState = new BatchesState(null);
export default batchesState;