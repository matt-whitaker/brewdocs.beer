import {expect, Page, test} from "@playwright/test";

/**
 * `batches`' own migrations array is empty, so the dev-only fixture stores
 * (`packages/app/src/storage/migration/fixture.ts`) are what exercises the
 * migration framework end to end. All three join `pass.ts`'s dev-only
 * `migratedStores` on every page load, so any navigation primes their
 * IndexedDB databases the same way `migrations-failed.spec.ts`'s
 * `primeMigrationFailuresStore` primes "migration-failures".
 */
type Fixture = {
    id: string;
    label?: string;
    name?: string;
    notes?: string | string[];
    version?: number;
};

const FIXTURE_DB = "migration-fixture";
const FIXTURE_THROWS_DB = "migration-fixture-throws";
const FIXTURE_ORPHAN_DB = "migration-fixture-orphan";
const MIGRATION_FAILURES_DB = "migration-failures";
const MIGRATION_BACKUPS_DB = "migration-backups";

async function primeFixtureStores(page: Page) {
    await page.goto("/migrations/failed");
    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();
}

async function seedFixtureRecord(page: Page, dbName: string, record: Fixture) {
    await page.evaluate(({dbName, record}) => new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("keyvaluepairs", "readwrite");
            tx.objectStore("keyvaluepairs").put(record, `${dbName}#${record.id}`);
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => reject(tx.error);
        };
    }), {dbName, record});
}

async function readIndexedDbValue(page: Page, dbName: string, key: string) {
    return page.evaluate(({dbName, key}) => new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("keyvaluepairs", "readonly");
            const getRequest = tx.objectStore("keyvaluepairs").get(key);
            getRequest.onsuccess = () => { db.close(); resolve(getRequest.result); };
            getRequest.onerror = () => reject(getRequest.error);
        };
    }), {dbName, key});
}

async function countIndexedDbKeysWithPrefix(page: Page, dbName: string, prefix: string) {
    return page.evaluate(({dbName, prefix}) => new Promise<number>((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("keyvaluepairs", "readonly");
            const getAllKeysRequest = tx.objectStore("keyvaluepairs").getAllKeys();
            getAllKeysRequest.onsuccess = () => {
                db.close();
                resolve((getAllKeysRequest.result as string[]).filter((key) => key.startsWith(prefix)).length);
            };
            getAllKeysRequest.onerror = () => reject(getAllKeysRequest.error);
        };
    }), {dbName, prefix});
}

test("a v1 migration-fixture record reaches the v3 schema after one reload, and is unchanged after a second", async ({page}) => {
    await primeFixtureStores(page);
    await seedFixtureRecord(page, FIXTURE_DB, {id: "e2e-fixture-happy-01", label: "Old Label", notes: "one, two"});

    await page.reload();
    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();

    const migrated = await readIndexedDbValue(page, FIXTURE_DB, `${FIXTURE_DB}#e2e-fixture-happy-01`);
    expect(migrated).toEqual({id: "e2e-fixture-happy-01", name: "Old Label", notes: ["one", "two"], version: 3});

    await page.reload();
    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();
    expect(await readIndexedDbValue(page, FIXTURE_DB, `${FIXTURE_DB}#e2e-fixture-happy-01`)).toEqual(migrated);
});

// implementor's testingNotes: recordMigrationBackup overwrites rather than
// accumulates, keyed on `${entityType}:${storedId}` — a wrong key shape
// would grow storage unbounded with no lint/typecheck/build signal
test("a migrated record's pre-migration backup is written once, and a second migration overwrites rather than accumulates", async ({page}) => {
    await primeFixtureStores(page);
    await seedFixtureRecord(page, FIXTURE_DB, {id: "e2e-fixture-backup-01", label: "First Label", notes: "a, b"});
    await page.reload();
    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();

    const firstBackup = await readIndexedDbValue(page, MIGRATION_BACKUPS_DB, `${MIGRATION_BACKUPS_DB}#${FIXTURE_DB}:e2e-fixture-backup-01`);
    expect(firstBackup).toMatchObject({entityType: FIXTURE_DB, fromVersion: 1, toVersion: 3, data: {id: "e2e-fixture-backup-01", label: "First Label", notes: "a, b"}});
    expect(await countIndexedDbKeysWithPrefix(page, MIGRATION_BACKUPS_DB, `${MIGRATION_BACKUPS_DB}#${FIXTURE_DB}:`)).toBe(1);

    await seedFixtureRecord(page, FIXTURE_DB, {id: "e2e-fixture-backup-01", label: "Second Label", notes: "c, d"});
    await page.reload();
    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();

    const secondBackup = await readIndexedDbValue(page, MIGRATION_BACKUPS_DB, `${MIGRATION_BACKUPS_DB}#${FIXTURE_DB}:e2e-fixture-backup-01`);
    expect(secondBackup).toMatchObject({entityType: FIXTURE_DB, fromVersion: 1, toVersion: 3, data: {id: "e2e-fixture-backup-01", label: "Second Label", notes: "c, d"}});
    expect(await countIndexedDbKeysWithPrefix(page, MIGRATION_BACKUPS_DB, `${MIGRATION_BACKUPS_DB}#${FIXTURE_DB}:`)).toBe(1);
});

test("a migration-fixture-throws record is set aside, not lost, and is visible on /migrations/failed", async ({page}) => {
    await primeFixtureStores(page);
    const seeded = {id: "e2e-fixture-throws-01", name: "Throws Fixture", notes: "n", version: 1};
    await seedFixtureRecord(page, FIXTURE_THROWS_DB, seeded);

    await page.reload();
    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();

    expect(await readIndexedDbValue(page, FIXTURE_THROWS_DB, `${FIXTURE_THROWS_DB}#e2e-fixture-throws-01`)).toEqual(seeded);

    const failure = await readIndexedDbValue(page, MIGRATION_FAILURES_DB, `${MIGRATION_FAILURES_DB}#${FIXTURE_THROWS_DB}:e2e-fixture-throws-01`);
    expect(failure).toMatchObject({
        entityType: FIXTURE_THROWS_DB,
        id: "e2e-fixture-throws-01",
        fromVersion: 1,
        targetVersion: 2,
        reason: "migration-error",
        error: "fixture: deliberate migration failure",
    });

    await page.goto("/migrations/failed");
    const row = page.getByRole("listitem").filter({hasText: "e2e-fixture-throws-01"});
    await expect(row).toBeVisible();
    await expect(row.getByText(`${FIXTURE_THROWS_DB} · e2e-fixture-throws-01`)).toBeVisible();
    await expect(row.getByText("Stuck at version 1 — the app expects version 2.")).toBeVisible();
    await expect(row.getByText("An update was attempted and failed.")).toBeVisible();
    await expect(row.getByText("fixture: deliberate migration failure")).toBeVisible();
    await expect(row.getByRole("button", {name: "Retry"})).toBeDisabled();
});

test("a migration-fixture-orphan v1 record fails cleanly and is visible on /migrations/failed, while a v2 record in the same store migrates", async ({page}) => {
    await primeFixtureStores(page);
    await seedFixtureRecord(page, FIXTURE_ORPHAN_DB, {id: "e2e-fixture-orphan-01", label: "Orphan V1", notes: "x", version: 1});
    await seedFixtureRecord(page, FIXTURE_ORPHAN_DB, {id: "e2e-fixture-orphan-control", name: "Orphan V2 Control", notes: "y, z", version: 2});

    await page.reload();
    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();

    const migratedControl = await readIndexedDbValue(page, FIXTURE_ORPHAN_DB, `${FIXTURE_ORPHAN_DB}#e2e-fixture-orphan-control`);
    expect(migratedControl).toEqual({id: "e2e-fixture-orphan-control", name: "Orphan V2 Control", notes: ["y", "z"], version: 3});

    const failure = await readIndexedDbValue(page, MIGRATION_FAILURES_DB, `${MIGRATION_FAILURES_DB}#${FIXTURE_ORPHAN_DB}:e2e-fixture-orphan-01`);
    expect(failure).toMatchObject({
        entityType: FIXTURE_ORPHAN_DB,
        id: "e2e-fixture-orphan-01",
        fromVersion: 1,
        targetVersion: 3,
        reason: "no-migration-path",
    });

    await page.goto("/migrations/failed");
    const row = page.getByRole("listitem").filter({hasText: "e2e-fixture-orphan-01"});
    await expect(row).toBeVisible();
    await expect(row.getByText("Stuck at version 1 — the app expects version 3.")).toBeVisible();
    await expect(row.getByText("No update path exists for this record yet.")).toBeVisible();
    await expect(row.getByRole("button", {name: "Retry"})).toBeDisabled();
    await expect(page.getByRole("listitem").filter({hasText: "e2e-fixture-orphan-control"})).toHaveCount(0);
});

test("a migration-fixture-orphan record's migration-failures entry doesn't duplicate across two reloads", async ({page}) => {
    await primeFixtureStores(page);
    await seedFixtureRecord(page, FIXTURE_ORPHAN_DB, {id: "e2e-fixture-orphan-nodupe", label: "Orphan No Dupe", notes: "x", version: 1});

    await page.reload();
    await page.reload();
    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();

    expect(await countIndexedDbKeysWithPrefix(page, MIGRATION_FAILURES_DB, `${MIGRATION_FAILURES_DB}#${FIXTURE_ORPHAN_DB}:`)).toBe(1);
});

test("fixture stores are not wiped by /?purge=true", async ({page}) => {
    await primeFixtureStores(page);
    await seedFixtureRecord(page, FIXTURE_DB, {id: "e2e-fixture-purge-01", label: "Survives Purge", notes: "p"});
    await page.reload();
    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();

    await page.goto("/?purge=true");
    await expect(page).toHaveURL(/\/$/);

    const survived = await readIndexedDbValue(page, FIXTURE_DB, `${FIXTURE_DB}#e2e-fixture-purge-01`);
    expect(survived).toMatchObject({id: "e2e-fixture-purge-01"});
});
