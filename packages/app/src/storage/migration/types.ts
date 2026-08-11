export const DEFAULT_ENTITY_VERSION = 1;

export interface Migration<T = unknown> {
    entityType: string;
    from: number;
    to: number;
    up: (data: T) => T;
    down: (data: T) => T;
}

export interface MigrationFailure {
    entityType: string;
    id?: string;
    fromVersion: number;
    targetVersion: number;
    data: unknown;
    error: string;
}

export type MigrationResult<T> =
    | { ok: true; data: T }
    | { ok: false; failure: MigrationFailure };
