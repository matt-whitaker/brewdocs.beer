import Batch from "@/model/batch";
import batchService from "@/service/batch";
import State from "@/state/state";

export class BatchState extends State<Batch> {
    load(batchId: string) {
        batchService.get(batchId)
            .then(batch => {
                this._subject?.next(batch);
            });
    }

    update(batch: Batch) {
        this._subject?.next(batch);
    }
}

const batchState = new BatchState();
export default batchState;