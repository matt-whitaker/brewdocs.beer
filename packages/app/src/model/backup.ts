import Batch from "@/model/batch";
import Recipe from "@/model/recipe";

export const BACKUP_FILENAME = "backup.json";
export const BACKUP_MEDIA_TYPE = "application/json";

/**
 * The shape of an exported backup file. `appVersion`/`exportedAt` are informational
 * — what a brewer is shown when a file looks unreadable — never a program-checked
 * gate: every record already carries its own `Entity.version`.
 */
export interface Backup {
    appVersion: string;
    exportedAt: string;
    batches: Batch[];
    recipes: Recipe[];
}

export function backupFile(backup: Backup): File {
    return new File([JSON.stringify(backup)], BACKUP_FILENAME, {type: BACKUP_MEDIA_TYPE});
}
