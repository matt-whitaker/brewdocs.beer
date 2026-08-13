export const DEFAULT_ENTITY_VERSION = 1;

export interface Migration<T = unknown> {
    entityType: string;
    from: number;
    to: number;
    up: (data: T) => T;
    down: (data: T) => T;
}

export type MigrationFailureReason = "no-migration-path" | "migration-error";

export interface MigrationFailure {
    entityType: string;
    id?: string;
    fromVersion: number;
    targetVersion: number;
    data: unknown;
    error: string;
    reason: MigrationFailureReason;
}

export interface MigrationBackup {
    entityType: string;
    id?: string;
    fromVersion: number;
    toVersion: number;
    migratedAt: string;
    data: unknown;
}

export type MigrationResult<T> =
    | { ok: true; data: T }
    | { ok: false; failure: MigrationFailure };
