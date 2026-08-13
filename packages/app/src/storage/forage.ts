import { v4 as uuidV4} from "uuid";
import localforage from "@/storage/localforage";
import {registerMigrations} from "@/storage/migration/registry";
import {entityIdOf, entityVersionOf, messageOf, runMigrations} from "@/storage/migration/runner";
import {Migration, MigrationBackup, MigrationFailure} from "@/storage/migration/types";

export const ID_REGEX = /^.*?#(.*)$/;

export interface ForageMigrationConfig<T = unknown> {
    entityType: string;
    version: number;
    migrations: Migration<T>[];
}

export interface MigratableStore {
    migrateStoredRecords(): Promise<void>;
}

export abstract class Forage<T> {
    protected _forage: LocalForage;
    protected _name: string;
    protected _migration?: ForageMigrationConfig<T>;

    constructor(name: string, driver?: string, migration?: ForageMigrationConfig<T>) {
        this._name = name;
        this._forage = localforage.createInstance(!driver ? { name } : { name, driver });
        this._migration = migration;

        if (migration) registerMigrations(migration.entityType, migration.migrations);
    }

    async get(id: string): Promise<T|null> {
        const item = await this._forage.getItem<T>(this.buildKey(id));

        if (item === null) return null;

        return this.isCurrentVersion(item) ? item : null;
    }

    async list(): Promise<T[]> {
        const items: T[] = [];
        await this._forage.iterate((val: T) => {
            items.push(val);
        });

        return items.filter((item) => this.isCurrentVersion(item));
    }

    async index(): Promise<Record<string, T>> {
        const items: Record<string, T> = {};
        await this._forage.iterate((val: T, key: string) => {
            items[this.extractId(key)] = val;
        });
        return items;
    }

    async save(id: string, item: T): Promise<T> {
        return await this._forage.setItem(this.buildKey(id), item);
    }

    async delete(id: string): Promise<void>{
        return await this._forage.removeItem(this.buildKey(id));
    }

    async generateId(): Promise<string> {
        return `${uuidV4()}`;
    }

    protected buildKey(id: string) {
        return `${this._name}#${id}`;
    }

    protected extractId(key: string): string {
        return key.replace(`${this._name}#`, "");
    }

    async migrateStoredRecords(): Promise<void> {
        const migration = this._migration;

        if (!migration) return;

        const stale: {key: string, item: T}[] = [];
        await this._forage.iterate((item: T, key: string) => {
            if (entityVersionOf(item) !== migration.version) stale.push({key, item});
        });

        for (const {key, item} of stale) {
            try {
                await this.migrateStoredRecord(key, item, migration);
            } catch (error) {
                await this.recordMigrationFailure(this.extractId(key), {
                    entityType: migration.entityType,
                    id: entityIdOf(item),
                    fromVersion: entityVersionOf(item),
                    targetVersion: migration.version,
                    data: item,
                    error: messageOf(error),
                    reason: "migration-error",
                });
            }
        }
    }

    private isCurrentVersion(item: T): boolean {
        const migration = this._migration;

        return !migration || entityVersionOf(item) === migration.version;
    }

    private async migrateStoredRecord(key: string, item: T, migration: ForageMigrationConfig<T>): Promise<void> {
        const fromVersion = entityVersionOf(item);
        const storedId = this.extractId(key);
        const result = runMigrations<T>(migration.entityType, item as T & {version?: number}, migration.version);

        if (!result.ok) {
            await this.recordMigrationFailure(storedId, result.failure);
            return;
        }

        await this.recordMigrationBackup(storedId, {
            entityType: migration.entityType,
            id: entityIdOf(item),
            fromVersion,
            toVersion: migration.version,
            migratedAt: new Date().toISOString(),
            data: item,
        });

        await this._forage.setItem(key, result.data);
        await this.clearMigrationFailure(migration.entityType, storedId);
    }

    private async clearMigrationFailure(entityType: string, storedId: string): Promise<void> {
        const {default: migrationFailuresStorage} = await import("@/storage/migration/failures");
        await migrationFailuresStorage.delete(`${entityType}:${storedId}`);
    }

    private async recordMigrationBackup(storedId: string, backup: MigrationBackup): Promise<void> {
        const {default: migrationBackupsStorage} = await import("@/storage/migration/backups");
        await migrationBackupsStorage.save(`${backup.entityType}:${storedId}`, backup);
    }

    private async recordMigrationFailure(storedId: string, failure: MigrationFailure): Promise<void> {
        const {default: migrationFailuresStorage} = await import("@/storage/migration/failures");
        await migrationFailuresStorage.save(`${failure.entityType}:${storedId}`, failure);
    }

    async purge() {
        (await this._forage.keys()).map(key => {
            this._forage.removeItem(key);
        });
    }
}