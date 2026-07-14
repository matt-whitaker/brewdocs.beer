import {Forage} from "@/storage/forage";
import {LF_QUERYSTORAGE} from "@/storage/localforage";

export type QueryValue = string|number|boolean;

export class QueryStorage extends Forage<QueryValue> {
    constructor() {
        super("query", LF_QUERYSTORAGE);
    }
}

const queryStorage = new QueryStorage();
export default queryStorage;