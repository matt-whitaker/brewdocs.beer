import {expect, Page, test} from "@playwright/test";

/**
 * Nothing in the app can produce a migration failure today (`batches`' own
 * migrations array is empty), so every case here seeds a record straight into
 * the `migration-failures` IndexedDB database — `migrationFailuresStorage` is
 * a `Forage` built with `localforage.createInstance({name: "migration-failures"})`,
 * which makes that name a separate IndexedDB database (default store
 * "keyvaluepairs"), keyed `migration-failures#${entityType}:${id}`.
 */
type SeedFailure = {
    entityType: string;
    id?: string;
    fromVersion: number;
    targetVersion: number;
    data: unknown;
    error: string;
};

// The db/store only exist once localforage has initialized them, which
// happens the first time the page's own query runs.
async function primeMigrationFailuresStore(page: Page) {
    await page.goto("/migrations/failed");
    await expect(page.getByText("No records have been set aside.")).toBeVisible();
}

async function seedMigrationFailures(page: Page, failures: SeedFailure[]) {
    await page.evaluate((seeded) => new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("migration-failures");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("keyvaluepairs", "readwrite");
            for (const failure of seeded) {
                const storageId = failure.id ?? crypto.randomUUID();
                tx.objectStore("keyvaluepairs").put(failure, `migration-failures#${failure.entityType}:${storageId}`);
            }
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => reject(tx.error);
        };
    }), failures);
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

test("lists every seeded failed record with its identity, versions, error and raw data", async ({page}) => {
    await primeMigrationFailuresStore(page);
    await seedMigrationFailures(page, [
        {
            entityType: "batches",
            id: "e2e-batch-01",
            fromVersion: 1,
            targetVersion: 3,
            data: {id: "e2e-batch-01", name: "Anchor Steam Clone", version: 1},
            error: "No migration bridges version 1 to 3"
        },
        {
            entityType: "recipes",
            fromVersion: 1,
            targetVersion: 2,
            data: {name: "Untitled Recipe", version: 1},
            error: "Cannot read properties of undefined (reading 'brewable')"
        }
    ]);
    await page.reload();

    const batchRow = page.getByRole("listitem").filter({hasText: "e2e-batch-01"});
    await expect(batchRow).toBeVisible();
    await expect(batchRow.getByText("batches · e2e-batch-01")).toBeVisible();
    await expect(batchRow.getByText("Version 1 → 3")).toBeVisible();
    await expect(batchRow.getByText("No migration bridges version 1 to 3")).toBeVisible();
    await expect(batchRow.getByText(/"name": "Anchor Steam Clone"/)).toBeVisible();

    const recipeRow = page.getByRole("listitem").filter({hasText: "Cannot read properties of undefined"});
    await expect(recipeRow).toBeVisible();
    await expect(recipeRow.getByText("recipes", {exact: true})).toBeVisible();
    await expect(recipeRow.getByText("Version 1 → 2")).toBeVisible();
    await expect(recipeRow.getByText(/"name": "Untitled Recipe"/)).toBeVisible();
});

test("discarding a record removes it for good", async ({page}) => {
    await primeMigrationFailuresStore(page);
    await seedMigrationFailures(page, [{
        entityType: "batches",
        id: "e2e-discard-01",
        fromVersion: 1,
        targetVersion: 3,
        data: {id: "e2e-discard-01", version: 1},
        error: "No migration bridges version 1 to 3"
    }]);
    await page.reload();

    const row = page.getByRole("listitem").filter({hasText: "e2e-discard-01"});
    await expect(row).toBeVisible();
    await row.getByRole("button", {name: "Discard"}).click();
    await expect(row).toHaveCount(0);

    // discard is fire-and-forget — only a reload proves the write actually
    // landed rather than just updating the on-screen list
    await page.reload();
    await expect(page.getByText("e2e-discard-01")).toHaveCount(0);
    await expect(page.getByText("No records have been set aside.")).toBeVisible();
});

test("retrying a record that now migrates successfully removes it and saves the recovered data", async ({page}) => {
    await primeMigrationFailuresStore(page);
    // batches' own migration chain is empty, so a record whose stored version
    // already equals the target migrates trivially — runMigrations returns ok
    // as soon as fromVersion === targetVersion
    await seedMigrationFailures(page, [{
        entityType: "batches",
        id: "e2e-retry-success",
        fromVersion: 1,
        targetVersion: 1,
        data: {id: "e2e-retry-success", name: "Recovered Batch", version: 1},
        error: "No migration bridges version 1 to 1"
    }]);
    await page.reload();

    const row = page.getByRole("listitem").filter({hasText: "e2e-retry-success"});
    await expect(row).toBeVisible();
    await row.getByRole("button", {name: "Retry"}).click();
    await expect(row).toHaveCount(0);

    const recovered = await readIndexedDbValue(page, "batches", "batches#e2e-retry-success");
    expect(recovered).toMatchObject({id: "e2e-retry-success", name: "Recovered Batch", version: 1});
});

test("retrying a record that still can't be migrated leaves it listed", async ({page}) => {
    await primeMigrationFailuresStore(page);
    await seedMigrationFailures(page, [{
        entityType: "batches",
        id: "e2e-retry-failure",
        fromVersion: 1,
        targetVersion: 3,
        data: {id: "e2e-retry-failure", version: 1},
        error: "No migration bridges version 1 to 3"
    }]);
    await page.reload();

    const row = page.getByRole("listitem").filter({hasText: "e2e-retry-failure"});
    await row.getByRole("button", {name: "Retry"}).click();

    await expect(row).toBeVisible();
    await expect(row.getByText("Retry failed")).toBeVisible();
});

test("retry is unavailable for a record with no id or an entity type that isn't wired", async ({page}) => {
    await primeMigrationFailuresStore(page);
    await seedMigrationFailures(page, [{
        entityType: "recipes",
        fromVersion: 1,
        targetVersion: 2,
        data: {name: "No Retry Recipe", version: 1},
        error: "Cannot read properties of undefined (reading 'brewable')"
    }]);
    await page.reload();

    const row = page.getByRole("listitem").filter({hasText: "No Retry Recipe"});
    await expect(row.getByRole("button", {name: "Retry"})).toBeDisabled();
});

test("a record whose data can't be rendered is contained, and the rest of the list still shows", async ({page}) => {
    await primeMigrationFailuresStore(page);
    await page.evaluate(() => new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("migration-failures");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const circular: Record<string, unknown> = {name: "Circular Batch"};
            circular.self = circular;
            const tx = db.transaction("keyvaluepairs", "readwrite");
            tx.objectStore("keyvaluepairs").put({
                entityType: "batches",
                id: "e2e-circular",
                fromVersion: 1,
                targetVersion: 2,
                data: circular,
                error: "some migration error"
            }, "migration-failures#batches:e2e-circular");
            tx.objectStore("keyvaluepairs").put({
                entityType: "batches",
                id: "e2e-sibling",
                fromVersion: 1,
                targetVersion: 2,
                data: {id: "e2e-sibling", version: 1},
                error: "some other migration error"
            }, "migration-failures#batches:e2e-sibling");
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => reject(tx.error);
        };
    }));
    await page.reload();

    await expect(page.getByRole("heading", {name: "Failed migrations"})).toBeVisible();
    await expect(page.getByText("This failed record can’t be displayed.")).toBeVisible();
    await expect(page.getByText("batches:e2e-circular")).toBeVisible();
    await expect(page.getByText("batches · e2e-sibling")).toBeVisible();

    // the contained record's own Discard still works, even from the fallback
    const fallbackRow = page.getByRole("listitem").filter({hasText: "batches:e2e-circular"});
    await fallbackRow.getByRole("button", {name: "Discard"}).click();
    await expect(page.getByText("batches:e2e-circular")).toHaveCount(0);
    await expect(page.getByText("batches · e2e-sibling")).toBeVisible();
});
