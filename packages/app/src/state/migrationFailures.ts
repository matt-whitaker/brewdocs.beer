import {useSuspenseQuery} from "@tanstack/react-query";
import Batch from "@/model/batch";
import queryClient from "@/queryClient";
import {batchesQueryKey} from "@/state/batches";
import batchesStorage, {BATCHES_ENTITY_TYPE} from "@/storage/batches";
import {Forage} from "@/storage/forage";
import migrationFailuresStorage from "@/storage/migration/failures";
import {runMigrations} from "@/storage/migration/runner";
import {MigrationFailure} from "@/storage/migration/types";

const retryStores: Record<string, Forage<Batch>> = {
    [BATCHES_ENTITY_TYPE]: batchesStorage
};

export const migrationFailuresQueryKey = () => ["migration-failures"];
export const loadMigrationFailures = async () => migrationFailuresStorage.index();

export const useMigrationFailures = (): Record<string, MigrationFailure> => {
    const {data} = useSuspenseQuery({queryKey: migrationFailuresQueryKey(), queryFn: loadMigrationFailures});

    if (!data) {
        throw new Error("Unable to load migration failures");
    }

    return data;
};

export const isRetryable = ({entityType, id}: MigrationFailure) => !!id && !!retryStores[entityType];

export const discardMigrationFailure = async (id: string) => {
    await migrationFailuresStorage.delete(id);
    await queryClient.invalidateQueries({queryKey: migrationFailuresQueryKey()});
};

export const retryMigrationFailure = async (id: string, failure: MigrationFailure): Promise<boolean> => {
    const store = retryStores[failure.entityType];

    if (!store || !failure.id) return false;

    const result = runMigrations<Batch>(failure.entityType, failure.data as Batch, failure.targetVersion);

    if (!result.ok) return false;

    await store.save(failure.id, result.data);
    await migrationFailuresStorage.delete(id);
    await queryClient.invalidateQueries({queryKey: batchesQueryKey()});
    await queryClient.invalidateQueries({queryKey: migrationFailuresQueryKey()});

    return true;
};
