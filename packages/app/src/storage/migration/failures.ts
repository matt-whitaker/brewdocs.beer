import {Forage} from "@/storage/forage";
import {LF_INDEXEDDB} from "@/storage/localforage";
import {MigrationFailure} from "@/storage/migration/types";

export class MigrationFailuresStorage extends Forage<MigrationFailure> {
    constructor() {
        super("migration-failures", LF_INDEXEDDB);
    }
}

const migrationFailuresStorage = new MigrationFailuresStorage();
export default migrationFailuresStorage;
