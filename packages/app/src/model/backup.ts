import {Entity} from "@brewdocs.beer/core";
import Batch from "@/model/batch";
import Recipe from "@/model/recipe";

export const BACKUP_FILENAME = "backup.json";
export const BACKUP_MEDIA_TYPE = "application/json";

export const BACKUP_STORE_KEYS = ["batches", "recipes"] as const;

export type BackupStoreKey = typeof BACKUP_STORE_KEYS[number];

/**
 * What a backup file was actually read to hold — one entry per store the file
 * mentioned. A store the file omits is absent here rather than empty, which is
 * what keeps a recipes-only file from wiping a brewer's batches.
 */
export type BackupContents = Partial<Record<BackupStoreKey, Entity[]>>;

export const UNREADABLE_BACKUP = "That file isn't a backup this app can read.";

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

const isEntityArray = (value: unknown): value is Entity[] =>
    Array.isArray(value) && value.every((record) => typeof (record as Entity | null)?.id === "string");

/**
 * Reads a backup file's text into the stores it names, throwing before anything is
 * written if it can't. Restore purges each store it is about to rewrite, so a file
 * that turns out to be unreadable halfway through would leave a brewer with less
 * than they started with — every check therefore happens here, up front.
 *
 * Record shapes are deliberately *not* checked beyond carrying an id: a record this
 * version of the app can't read is the migration framework's business, and lands at
 * /migrations/failed rather than voiding the whole file.
 */
export function readBackup(text: string): BackupContents {
    let parsed: unknown;

    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error(UNREADABLE_BACKUP);
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(UNREADABLE_BACKUP);

    const contents: BackupContents = {};

    for (const storeKey of BACKUP_STORE_KEYS) {
        const records = (parsed as Record<string, unknown>)[storeKey];

        if (records === undefined) continue;
        if (!isEntityArray(records)) throw new Error(UNREADABLE_BACKUP);

        contents[storeKey] = records;
    }

    if (!BACKUP_STORE_KEYS.some((storeKey) => contents[storeKey])) throw new Error(UNREADABLE_BACKUP);

    return contents;
}
