import {Forage} from "@/storage/forage";
import Batch from "@/model/batch";
import {LF_INDEXEDDB} from "@/storage/localforage";

export class BatchesStorage extends Forage<Batch> {
    constructor() {
        super("batches", LF_INDEXEDDB);
    }
}

const batchesStorage = new BatchesStorage();
export default batchesStorage;