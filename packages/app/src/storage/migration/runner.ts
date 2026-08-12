import {migrationsFor} from "@/storage/migration/registry";
import {DEFAULT_ENTITY_VERSION, Migration, MigrationFailureReason, MigrationResult} from "@/storage/migration/types";

type Versioned<T> = T & { version?: number };

export const entityIdOf = (record: unknown): string | undefined => {
    const id = (record as { id?: unknown } | null)?.id;
    return typeof id === "string" ? id : undefined;
};

export const entityVersionOf = (record: unknown): number =>
    (record as { version?: number } | null)?.version ?? DEFAULT_ENTITY_VERSION;

export const messageOf = (error: unknown): string => error instanceof Error ? error.message : String(error);

export function runMigrations<T>(entityType: string, record: Versioned<T>, targetVersion: number): MigrationResult<Versioned<T>> {
    const migrations = migrationsFor(entityType) as Migration<Versioned<T>>[];
    const fromVersion = record.version ?? DEFAULT_ENTITY_VERSION;

    const failed = (reason: MigrationFailureReason, error: unknown): MigrationResult<Versioned<T>> => ({
        ok: false,
        failure: {entityType, id: entityIdOf(record), fromVersion, targetVersion, data: record, error: messageOf(error), reason},
    });

    let currentVersion = fromVersion;
    let data = record;

    while (currentVersion !== targetVersion) {
        const migration = migrations.find(({from, to}) => from === currentVersion && to > currentVersion);

        if (!migration) return failed("no-migration-path", new Error(`No migration bridges version ${currentVersion} to ${targetVersion} for "${entityType}"`));

        try {
            data = {...migration.up(data), version: migration.to};
        } catch (error) {
            return failed("migration-error", error);
        }

        currentVersion = migration.to;
    }

    return {ok: true, data};
}
