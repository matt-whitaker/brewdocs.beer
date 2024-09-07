import {Forage} from "@/storage/forage";
import Batch from "@/model/batch";

export class BatchesStorage extends Forage<Batch> {
    constructor() {
        super("batches");
    }
}

const batchesStorage = new BatchesStorage();
export default batchesStorage;