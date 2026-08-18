import batchesStorage from "@/storage/batches";
import {MigratableStore} from "@/storage/forage";

export const migratedStores: MigratableStore[] = [batchesStorage];

const withDevFixtureStores = async (stores: MigratableStore[]): Promise<MigratableStore[]> => {
    if (!import.meta.env.DEV && !import.meta.env.VITE_E2E) return stores;

    const {fixtureStorage, fixtureThrowsStorage, fixtureOrphanStorage} = await import("@/storage/migration/fixture");

    return [...stores, fixtureStorage, fixtureThrowsStorage, fixtureOrphanStorage];
};

export async function runMigrationPass(): Promise<void> {
    const stores = await withDevFixtureStores(migratedStores);

    await Promise.all(stores.map(async (store) => {
        try {
            await store.migrateStoredRecords();
        } catch {
            return;
        }
    }));
}
