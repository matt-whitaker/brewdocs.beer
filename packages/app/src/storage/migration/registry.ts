import {Migration} from "@/storage/migration/types";

const registry = new Map<string, Migration<unknown>[]>();

export function registerMigrations(entityType: string, migrations: Migration<unknown>[]): void {
    registry.set(entityType, [...(registry.get(entityType) ?? []), ...migrations]);
}

export function migrationsFor(entityType: string): Migration<unknown>[] {
    return registry.get(entityType) ?? [];
}
