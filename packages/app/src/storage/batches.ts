import Batch from "@/model/batch";
import {Forage} from "@/storage/forage";
import {LF_INDEXEDDB} from "@/storage/localforage";

export const BATCHES_ENTITY_TYPE = "batches";
export const BATCHES_VERSION = 1;

export class BatchesStorage extends Forage<Batch> {
    constructor() {
        super(BATCHES_ENTITY_TYPE, LF_INDEXEDDB, {
            entityType: BATCHES_ENTITY_TYPE,
            version: BATCHES_VERSION,
            migrations: [],
        });
    }
}

const batchesStorage = new BatchesStorage();
export default batchesStorage;