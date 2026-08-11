import { v4 as uuidV4} from "uuid";
import localforage from "@/storage/localforage";
import {registerMigrations} from "@/storage/migration/registry";
import {entityIdOf, runMigrations} from "@/storage/migration/runner";
import {DEFAULT_ENTITY_VERSION, Migration, MigrationBackup, MigrationFailure, MigrationResult} from "@/storage/migration/types";

export const ID_REGEX = /^.*?#(.*)$/;

export interface ForageMigrationConfig {
    entityType: string;
    version: number;
    migrations: Migration<unknown>[];
}

export abstract class Forage<T> {
    protected _forage: LocalForage;
    protected _name: string;
    protected _migration?: ForageMigrationConfig;

    constructor(name: string, driver?: string, migration?: ForageMigrationConfig) {
        this._name = name;
        this._forage = localforage.createInstance(!driver ? { name } : { name, driver });
        this._migration = migration;

        if (migration) registerMigrations(migration.entityType, migration.migrations);
    }

    async get(id: string): Promise<T|null> {
        const item = await this._forage.getItem<T>(this.buildKey(id));
        const migration = this._migration;

        if (item === null || !migration) return item;

        const result = await this.migrate(item, migration);

        if (result.ok) return result.data;

        await this.recordMigrationFailure(result.failure);
        return null;
    }

    async list(): Promise<T[]> {
        const items: T[] = [];
        await this._forage.iterate((val: T) => {
            items.push(val);
        });

        const migration = this._migration;
        if (!migration) return items;

        const results = await Promise.all(items.map((item) => this.migrate(item, migration)));
        const failures = results.flatMap((result) => result.ok ? [] : [result.failure]);

        await Promise.all(failures.map((failure) => this.recordMigrationFailure(failure)));

        return results.flatMap((result) => result.ok ? [result.data] : []);
    }

    async index(): Promise<Record<string, T>> {
        const items: Record<string, T> = {};
        await this._forage.iterate((val: T, key: string) => {
            items[key.replace(`${this._name}#`, "")] = val;
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

    private async migrate(item: T, migration: ForageMigrationConfig): Promise<MigrationResult<T & {version?: number}>> {
        const record = item as T & {version?: number};
        const fromVersion = record.version ?? DEFAULT_ENTITY_VERSION;

        if (fromVersion !== migration.version) {
            await this.recordMigrationBackup({
                entityType: migration.entityType,
                id: entityIdOf(item),
                fromVersion,
                toVersion: migration.version,
                migratedAt: new Date().toISOString(),
                data: item,
            });
        }

        return runMigrations<T>(migration.entityType, record, migration.version);
    }

    private async recordMigrationBackup(backup: MigrationBackup): Promise<void> {
        const {default: migrationBackupsStorage} = await import("@/storage/migration/backups");
        await migrationBackupsStorage.save(`${backup.entityType}:${backup.id ?? uuidV4()}`, backup);
    }

    private async recordMigrationFailure(failure: MigrationFailure): Promise<void> {
        const {default: migrationFailuresStorage} = await import("@/storage/migration/failures");
        await migrationFailuresStorage.save(`${failure.entityType}:${failure.id ?? uuidV4()}`, failure);
    }

    async purge() {
        (await this._forage.keys()).map(key => {
            this._forage.removeItem(key);
        });
    }

    // private extractId(key: string): string | null {
    //     const match = key.match(ID_REGEX);
    //
    //     if (!match) return null;
    //
    //     const [, id] = match;
    //     return id;
    // }
}