import Batch from "@/model/batch";
import batchService from "@/service/batch";
import State from "@/state/state";

export class BatchesState extends State<Batch[]> {
    load() {
        batchService.list()
            .then(batches => {
                this._subject.next(batches);
            });
    }

    update(batches: Batch[]) {
        this._subject.next(batches);
    }
}

const batchesState = new BatchesState();
export default batchesState;