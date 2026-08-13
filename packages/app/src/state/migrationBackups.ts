import {useSuspenseQuery} from "@tanstack/react-query";
import Batch from "@/model/batch";
import queryClient from "@/queryClient";
import {batchesQueryKey} from "@/state/batches";
import batchesStorage, {BATCHES_ENTITY_TYPE} from "@/storage/batches";
import {Forage} from "@/storage/forage";
import migrationBackupsStorage from "@/storage/migration/backups";
import {entityVersionOf, runMigrationsDown} from "@/storage/migration/runner";
import {MigrationBackup, MigrationResult} from "@/storage/migration/types";

type MigratedStore = {
    storage: Forage<Batch>;
    queryKey: () => string[];
};

export type RevertKind = "exact" | "computed";

const migratedStores: Record<string, MigratedStore> = {
    [BATCHES_ENTITY_TYPE]: {storage: batchesStorage, queryKey: batchesQueryKey}
};

const migratedStoreOf = ({entityType, id}: MigrationBackup): MigratedStore | undefined =>
    id ? migratedStores[entityType] : undefined;

const storedRecordOf = async (store: MigratedStore, id: string): Promise<Batch | undefined> =>
    (await store.storage.index())[id];

const revertKindOf = (backup: MigrationBackup, stored: Batch): RevertKind =>
    entityVersionOf(stored) === backup.toVersion ? "exact" : "computed";

export const migrationBackupsQueryKey = () => ["migration-backups"];
export const loadMigrationBackups = async () => migrationBackupsStorage.index();

export const useMigrationBackups = (): Record<string, MigrationBackup> => {
    const {data} = useSuspenseQuery({queryKey: migrationBackupsQueryKey(), queryFn: loadMigrationBackups});

    if (!data) {
        throw new Error("Unable to load migration backups");
    }

    return data;
};

export const isRevertable = (backup: MigrationBackup) => !!migratedStoreOf(backup);

export const revertKindFor = async (backup: MigrationBackup): Promise<RevertKind | undefined> => {
    const store = migratedStoreOf(backup);
    const stored = store && backup.id ? await storedRecordOf(store, backup.id) : undefined;

    return stored ? revertKindOf(backup, stored) : undefined;
};

export const revertKindsQueryKey = () => ["migration-backup-revert-kinds"];

export const loadRevertKinds = async (): Promise<Record<string, RevertKind | undefined>> => {
    const backups = await migrationBackupsStorage.index();
    const kinds = await Promise.all(Object.entries(backups)
        .map(async ([key, backup]) => [key, await revertKindFor(backup)] as const));

    return Object.fromEntries(kinds);
};

export const useRevertKinds = (): Record<string, RevertKind | undefined> => {
    const {data} = useSuspenseQuery({queryKey: revertKindsQueryKey(), queryFn: loadRevertKinds});

    if (!data) {
        throw new Error("Unable to load migration backup revert kinds");
    }

    return data;
};

export const revertMigrationBackup = async (key: string, backup: MigrationBackup): Promise<boolean> => {
    const store = migratedStoreOf(backup);

    if (!store || !backup.id) return false;

    const stored = await storedRecordOf(store, backup.id);

    if (!stored) return false;

    const result: MigrationResult<Batch> = revertKindOf(backup, stored) === "exact"
        ? {ok: true, data: backup.data as Batch}
        : runMigrationsDown<Batch>(backup.entityType, stored, backup.fromVersion);

    if (!result.ok) return false;

    await store.storage.save(backup.id, result.data);
    await migrationBackupsStorage.delete(key);
    await queryClient.invalidateQueries({queryKey: store.queryKey()});
    await queryClient.invalidateQueries({queryKey: migrationBackupsQueryKey()});
    await queryClient.invalidateQueries({queryKey: revertKindsQueryKey()});

    return true;
};
