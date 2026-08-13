import {migrationsFor} from "@/storage/migration/registry";
import {DEFAULT_ENTITY_VERSION, Migration, MigrationFailureReason, MigrationResult} from "@/storage/migration/types";

type Versioned<T> = T & { version?: number };

type MigrationDirection = "up" | "down";

export const entityIdOf = (record: unknown): string | undefined => {
    const id = (record as { id?: unknown } | null)?.id;
    return typeof id === "string" ? id : undefined;
};

export const entityVersionOf = (record: unknown): number =>
    (record as { version?: number } | null)?.version ?? DEFAULT_ENTITY_VERSION;

export const messageOf = (error: unknown): string => error instanceof Error ? error.message : String(error);

const stepOf = <T>(migrations: Migration<Versioned<T>>[], currentVersion: number, direction: MigrationDirection): Migration<Versioned<T>> | undefined =>
    direction === "up"
        ? migrations.find(({from, to}) => from === currentVersion && to > currentVersion)
        : migrations.find(({from, to}) => to === currentVersion && from < currentVersion);

function walkMigrations<T>(entityType: string, record: Versioned<T>, targetVersion: number, direction: MigrationDirection): MigrationResult<Versioned<T>> {
    const migrations = migrationsFor(entityType) as Migration<Versioned<T>>[];
    const fromVersion = record.version ?? DEFAULT_ENTITY_VERSION;

    const failed = (reason: MigrationFailureReason, error: unknown): MigrationResult<Versioned<T>> => ({
        ok: false,
        failure: {entityType, id: entityIdOf(record), fromVersion, targetVersion, data: record, error: messageOf(error), reason},
    });

    let currentVersion = fromVersion;
    let data = record;

    while (currentVersion !== targetVersion) {
        const migration = stepOf(migrations, currentVersion, direction);

        if (!migration) return failed("no-migration-path", new Error(`No migration bridges version ${currentVersion} to ${targetVersion} for "${entityType}"`));

        const nextVersion = direction === "up" ? migration.to : migration.from;

        try {
            data = {...(direction === "up" ? migration.up(data) : migration.down(data)), version: nextVersion};
        } catch (error) {
            return failed("migration-error", error);
        }

        currentVersion = nextVersion;
    }

    return {ok: true, data};
}

export const runMigrations = <T>(entityType: string, record: Versioned<T>, targetVersion: number): MigrationResult<Versioned<T>> =>
    walkMigrations(entityType, record, targetVersion, "up");

export const runMigrationsDown = <T>(entityType: string, record: Versioned<T>, targetVersion: number): MigrationResult<Versioned<T>> =>
    walkMigrations(entityType, record, targetVersion, "down");
