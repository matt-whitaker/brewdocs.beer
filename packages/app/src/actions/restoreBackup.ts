import {BackupContents, BackupStoreKey} from "@/model/backup";
import queryClient from "@/queryClient";
import {batchQueryKey, batchesQueryKey} from "@/state/batches";
import {migrationFailuresQueryKey} from "@/state/migrationFailures";
import {recipeQueryKey, recipesQueryKey} from "@/state/recipes";
import batchesStorage from "@/storage/batches";
import {EntityStore} from "@/storage/forage";
import recipesStorage from "@/storage/recipes";

type RestorableStore = {
    key: BackupStoreKey;
    storage: EntityStore;
    queryKeys: string[][];
};

const keyPrefixOf = ([prefix]: [string, string]) => [prefix];

const RESTORABLE_STORES: RestorableStore[] = [
    {
        key: "batches",
        storage: batchesStorage,
        queryKeys: [batchesQueryKey(), keyPrefixOf(batchQueryKey(""))],
    },
    {
        key: "recipes",
        storage: recipesStorage,
        queryKeys: [recipesQueryKey(), keyPrefixOf(recipeQueryKey(""))],
    },
];

/**
 * Replaces the contents of each store the backup file named, and leaves every store
 * it didn't alone. `migrateStoredRecords` runs per store immediately after its write
 * rather than waiting for the next boot pass, so a restored record the app can't read
 * is contained — and visible at /migrations/failed — while the brewer is still here.
 */
export default async function restoreBackup(contents: BackupContents): Promise<void> {
    for (const {key, storage, queryKeys} of RESTORABLE_STORES) {
        const records = contents[key];

        if (!records) continue;

        await storage.purge();

        for (const record of records) {
            await storage.save(record.id, record);
        }

        await storage.migrateStoredRecords();

        for (const queryKey of queryKeys) {
            await queryClient.invalidateQueries({queryKey});
        }
    }

    await queryClient.invalidateQueries({queryKey: migrationFailuresQueryKey()});
}
