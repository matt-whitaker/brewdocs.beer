/**
 * Generic version-migration framework, shared by every package that stores
 * versioned data (kb resources, app batches, …). Environment-agnostic — no
 * Node/Vite/DOM APIs — since it's consumed by Vite tooling, the kb build
 * script, and the browser app alike.
 */

export interface VersionedData {
    version?: number;
}

/** data with no `version` field predates versioning entirely and is treated as v0 */
export function resolveVersion(data: VersionedData | null | undefined): number {
    return data?.version ?? 0;
}

export interface Migration<T = unknown> {
    /** the schema/domain this migration applies to, e.g. "kb.grains" or "app.batch" */
    namespace: string;
    /** version this migration upgrades from */
    from: number;
    /** version this migration upgrades to; must be exactly `from + 1` */
    to: number;
    /** transforms data at `from` (untyped — it predates the shape at `to`) into the shape at `to` */
    up: (data: any) => T;
}

export type MigrationPlan = Record<string, Migration[]>;

/** groups migrations by namespace and sorts each group by `from`, so `migrate` can walk it without re-sorting */
export function buildMigrationPlan(migrations: Migration[]): MigrationPlan {
    const plan: MigrationPlan = {};

    for (const migration of migrations) {
        if (migration.to !== migration.from + 1) {
            throw new Error(
                `Migration "${migration.namespace}" must step exactly one version (got ${migration.from} -> ${migration.to})`
            );
        }
        (plan[migration.namespace] ??= []).push(migration);
    }

    for (const namespace of Object.keys(plan)) {
        const steps = plan[namespace].sort((a, b) => a.from - b.from);
        steps.forEach((migration, i) => {
            if (migration.from !== i) {
                throw new Error(`Migration plan for "${namespace}" has a gap or duplicate at version ${i}`);
            }
        });
    }

    return plan;
}

/** applies every migration registered for `namespace`, starting at `data`'s current version */
export function migrate<T extends VersionedData>(plan: MigrationPlan, namespace: string, data: T): T {
    const steps = plan[namespace] ?? [];
    let result: unknown = data;

    for (const migration of steps.slice(resolveVersion(data))) {
        result = migration.up(result);
    }

    return result as T;
}

/** the JSON-serializable subset of a plan — drops `up`, which can't cross a script-tag boundary */
export interface MigrationStep {
    namespace: string;
    from: number;
    to: number;
}

/** id of the `<script>` tag the Vite migration plugin injects into index.html (see app/vite.config.ts) */
export const MIGRATION_PLAN_ELEMENT_ID = "brewdocs-migration-plan";

export function serializeMigrationPlan(plan: MigrationPlan): MigrationStep[] {
    return Object.values(plan)
        .flat()
        .map(({namespace, from, to}) => ({namespace, from, to}));
}
