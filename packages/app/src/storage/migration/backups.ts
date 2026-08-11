import {Forage} from "@/storage/forage";
import {LF_INDEXEDDB} from "@/storage/localforage";
import {MigrationBackup} from "@/storage/migration/types";

export class MigrationBackupsStorage extends Forage<MigrationBackup> {
    constructor() {
        super("migration-backups", LF_INDEXEDDB);
    }
}

const migrationBackupsStorage = new MigrationBackupsStorage();
export default migrationBackupsStorage;
