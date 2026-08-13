import {Migration} from "@/storage/migration/types";

const registry = new Map<string, Migration<unknown>[]>();

export function registerMigrations<T>(entityType: string, migrations: Migration<T>[]): void {
    registry.set(entityType, [...(registry.get(entityType) ?? []), ...migrations as unknown as Migration<unknown>[]]);
}

export function migrationsFor(entityType: string): Migration<unknown>[] {
    return registry.get(entityType) ?? [];
}
