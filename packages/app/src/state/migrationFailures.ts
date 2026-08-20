import {useSuspenseQuery} from "@tanstack/react-query";
import {Entity} from "@brewdocs.beer/core";
import queryClient from "@/queryClient";
import {batchesQueryKey} from "@/state/batches";
import {recipesQueryKey} from "@/state/recipes";
import batchesStorage, {BATCHES_ENTITY_TYPE} from "@/storage/batches";
import {EntityStore} from "@/storage/forage";
import migrationFailuresStorage from "@/storage/migration/failures";
import {runMigrations} from "@/storage/migration/runner";
import {MigrationFailure} from "@/storage/migration/types";
import recipesStorage, {RECIPES_ENTITY_TYPE} from "@/storage/recipes";

type MigratedStore = {
    storage: EntityStore;
    queryKey: () => string[];
};

const migratedStores: Record<string, MigratedStore> = {
    [BATCHES_ENTITY_TYPE]: {storage: batchesStorage, queryKey: batchesQueryKey},
    [RECIPES_ENTITY_TYPE]: {storage: recipesStorage, queryKey: recipesQueryKey}
};

const migratedStoreOf = ({entityType, id}: MigrationFailure): MigratedStore | undefined =>
    id ? migratedStores[entityType] : undefined;

export const migrationFailuresQueryKey = () => ["migration-failures"];
export const loadMigrationFailures = async () => migrationFailuresStorage.index();

export const useMigrationFailures = (): Record<string, MigrationFailure> => {
    const {data} = useSuspenseQuery({queryKey: migrationFailuresQueryKey(), queryFn: loadMigrationFailures});

    if (!data) {
        throw new Error("Unable to load migration failures");
    }

    return data;
};

export const isRetryable = (failure: MigrationFailure) =>
    !!migratedStoreOf(failure) && failure.reason !== "no-migration-path";

export const discardMigrationFailure = async (id: string) => {
    const failure = await migrationFailuresStorage.get(id);
    const store = failure ? migratedStoreOf(failure) : undefined;

    if (store && failure?.id) {
        await store.storage.delete(failure.id);
        await queryClient.invalidateQueries({queryKey: store.queryKey()});
    }

    await migrationFailuresStorage.delete(id);
    await queryClient.invalidateQueries({queryKey: migrationFailuresQueryKey()});
};

export const retryMigrationFailure = async (id: string, failure: MigrationFailure): Promise<boolean> => {
    const store = migratedStoreOf(failure);

    if (!store || !failure.id) return false;

    const result = runMigrations<Entity>(failure.entityType, failure.data as Entity, failure.targetVersion);

    if (!result.ok) return false;

    await store.storage.save(failure.id, result.data);
    await migrationFailuresStorage.delete(id);
    await queryClient.invalidateQueries({queryKey: store.queryKey()});
    await queryClient.invalidateQueries({queryKey: migrationFailuresQueryKey()});

    return true;
};
