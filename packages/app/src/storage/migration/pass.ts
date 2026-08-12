import batchesStorage from "@/storage/batches";
import {Forage} from "@/storage/forage";

export const migratedStores: Forage<unknown>[] = [batchesStorage];

export async function runMigrationPass(): Promise<void> {
    await Promise.all(migratedStores.map(async (store) => {
        try {
            await store.migrateStoredRecords();
        } catch {
            return;
        }
    }));
}
