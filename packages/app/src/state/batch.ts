import Batch from "@/model/batch";
import batchService from "@/service/batch";
import State from "@/state/state";

export class BatchState extends State<Batch> {
    load(batchId: string) {
        console.log("called");
        batchService.get(batchId)
            .then(batch => {
                this._subject?.next(batch);
            });
    }

    update(batch: Batch) {
        console.log("BatchState updating with", batch);
        this._subject?.next(batch);
    }
}

const batchState = new BatchState();
export default batchState;