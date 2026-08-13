import {expect, Page, test} from "@playwright/test";

/**
 * Nothing in the app can produce a *migration-error* failure today (`batches`'
 * own migrations array is empty, so no migration ever runs to throw) — every
 * test proving that reason seeds directly into the `migration-failures`
 * IndexedDB database. `migrationFailuresStorage` is a `Forage` built with
 * `localforage.createInstance({name: "migration-failures"})`, which makes
 * that name a separate IndexedDB database (default store "keyvaluepairs"),
 * keyed `migration-failures#${entityType}:${id}`.
 *
 * A `no-migration-path` failure, though, is exactly what a stale batch
 * produces on its own via the page-load pass (#809/#824) — every test
 * proving that reason instead seeds the source `batches` store and lets the
 * pass record the failure itself (mirrors migration-pass.spec.ts's
 * `seedBatches`).
 */
type SeedFailure = {
    entityType: string;
    id?: string;
    fromVersion: number;
    targetVersion: number;
    data: unknown;
    error: string;
    reason: "no-migration-path" | "migration-error";
};

type SeedBatch = {
    id: string;
    name: string;
    version: number;
};

const BATCHES_VERSION = 1;

// The db/store only exist once localforage has initialized them, which
// happens the first time the page's own query runs.
async function primeMigrationFailuresStore(page: Page) {
    await page.goto("/migrations/failed");
    await expect(page.getByText("No records are waiting to be updated.")).toBeVisible();
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

// mirrors migration-pass.spec.ts's batchRecord/seedBatches — a stale batch
// seeded straight into the source store, so the page-load pass is what
// produces its migration-failures entry (with a real `reason`), not the test
function batchRecord({id, name, version}: SeedBatch) {
    return {
        id,
        name,
        version,
        brewDate: "",
        recipeId: "",
        brewable: {schedule: {phases: []}, assignments: []},
        batchSize: {value: "5gal", unit: "gal"},
        efficiency: {value: "75%", unit: "%"},
        boilTime: {value: "60min", unit: "min"},
        actuals: {
            og: {value: "0.00°P", unit: "°P"},
            fg: {value: "0.00°P", unit: "°P"},
            abv: {value: "0.0%", unit: "%"},
            ibu: "0",
            srm: "0",
        },
        shopping: [],
        tracker: {},
    };
}

async function seedBatches(page: Page, batches: SeedBatch[]) {
    await page.evaluate((seeded) => new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("batches");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("keyvaluepairs", "readwrite");
            for (const batch of seeded) {
                tx.objectStore("keyvaluepairs").put(batch, `batches#${batch.id}`);
            }
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => reject(tx.error);
        };
    }), batches.map(batchRecord));
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

// an id-less batch as it would exist if a record predates whatever gave every
// other record an id — the app itself never writes one without an id, but
// nothing here depends on it having come from the app
function idlessBatchRecord({name, version}: {name: string, version: number}) {
    return {
        name,
        version,
        brewDate: "",
        recipeId: "",
        brewable: {schedule: {phases: []}, assignments: []},
        batchSize: {value: "5gal", unit: "gal"},
        efficiency: {value: "75%", unit: "%"},
        boilTime: {value: "60min", unit: "min"},
        actuals: {
            og: {value: "0.00°P", unit: "°P"},
            fg: {value: "0.00°P", unit: "°P"},
            abv: {value: "0.0%", unit: "%"},
            ibu: "0",
            srm: "0",
        },
        shopping: [],
        tracker: {},
    };
}

async function seedIdlessBatch(page: Page, storageKey: string, batch: {name: string, version: number}) {
    await page.evaluate(({storageKey, record}) => new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("batches");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("keyvaluepairs", "readwrite");
            tx.objectStore("keyvaluepairs").put(record, storageKey);
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => reject(tx.error);
        };
    }), {storageKey, record: idlessBatchRecord(batch)});
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
            error: "No migration bridges version 1 to 3",
            reason: "migration-error"
        },
        {
            entityType: "recipes",
            fromVersion: 1,
            targetVersion: 2,
            data: {name: "Untitled Recipe", version: 1},
            error: "Cannot read properties of undefined (reading 'brewable')",
            reason: "migration-error"
        }
    ]);
    await page.reload();

    const batchRow = page.getByRole("listitem").filter({hasText: "e2e-batch-01"});
    await expect(batchRow).toBeVisible();
    await expect(batchRow.getByText("batches · e2e-batch-01")).toBeVisible();
    await expect(batchRow.getByText("Stuck at version 1 — the app expects version 3.")).toBeVisible();
    await expect(batchRow.getByText("No migration bridges version 1 to 3")).toBeVisible();
    await expect(batchRow.getByText(/"name": "Anchor Steam Clone"/)).toBeVisible();

    const recipeRow = page.getByRole("listitem").filter({hasText: "Cannot read properties of undefined"});
    await expect(recipeRow).toBeVisible();
    await expect(recipeRow.getByText("recipes", {exact: true})).toBeVisible();
    await expect(recipeRow.getByText("Stuck at version 1 — the app expects version 2.")).toBeVisible();
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
        error: "No migration bridges version 1 to 3",
        reason: "migration-error"
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
    await expect(page.getByText("No records are waiting to be updated.")).toBeVisible();
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
        error: "No migration bridges version 1 to 1",
        reason: "migration-error"
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
        error: "No migration bridges version 1 to 3",
        reason: "migration-error"
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
        error: "Cannot read properties of undefined (reading 'brewable')",
        reason: "migration-error"
    }]);
    await page.reload();

    const row = page.getByRole("listitem").filter({hasText: "No Retry Recipe"});
    await expect(row.getByRole("button", {name: "Retry"})).toBeDisabled();
});

// MIGRATION-FAILURES-01: an id-less record has nothing to key its stored
// failure on but its own storage slot — before #884's fix, each page-load
// pass minted a fresh uuid instead of overwriting that slot, so the same
// broken record piled up one indistinguishable "batches" row per reload
// instead of staying at one
test("an id-less stale batch's migration-failures entry doesn't duplicate across two migration passes", async ({page}) => {
    await primeMigrationFailuresStore(page);
    await seedIdlessBatch(page, "batches#e2e-idless-nodupe", {name: "E2E Idless No Dupe", version: BATCHES_VERSION + 1});

    await page.reload();
    await page.reload();

    // MigrationGate wraps the whole router, so a route rendering at all
    // proves the page-load pass (and its store writes) already settled
    await page.goto("/migrations/failed");
    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();

    expect(await countIndexedDbKeysWithPrefix(page, "migration-failures", "migration-failures#batches:")).toBe(1);
    // an id-less record's title is the bare entity type ("batches", no id to
    // disambiguate) — an exact heading match, not a substring filter, since
    // the sidebar nav also links to "Batches"
    await expect(page.getByRole("heading", {name: "batches", exact: true})).toHaveCount(1);
});

// regression guard for the implementor's own testingNotes: every other test
// in this file seeds the migration-failures key by hand, so none of them
// would notice a future regression in Forage's extractId/buildKey that
// shifted the key format for a record that DOES carry its own id
test("an id-carrying stale batch's migration-failures entry lands at the expected key when written by the real migration pass", async ({page}) => {
    await primeMigrationFailuresStore(page);
    await seedBatches(page, [{id: "e2e-keyformat-01", name: "E2E Key Format Batch", version: BATCHES_VERSION + 1}]);

    await page.goto("/migrations/failed");
    await expect(page.getByRole("listitem").filter({hasText: "e2e-keyformat-01"})).toBeVisible();

    const failure = await readIndexedDbValue(page, "migration-failures", "migration-failures#batches:e2e-keyformat-01");
    expect(failure).toMatchObject({entityType: "batches", id: "e2e-keyformat-01", reason: "no-migration-path"});
});

// UPDATES-01, MIGRATION-FAILURES-01: a record excluded from its own list for
// lacking a bridging migration is listed here too, paired with a thrown-
// migration record in the same multi-record list
test("a batch with no update path is excluded from /batches and listed here alongside a thrown-migration record", async ({page}) => {
    await primeMigrationFailuresStore(page);
    await seedBatches(page, [{id: "e2e-no-path-01", name: "E2E No Path Batch", version: BATCHES_VERSION + 1}]);
    await seedMigrationFailures(page, [{
        entityType: "batches",
        id: "e2e-thrown-01",
        fromVersion: 1,
        targetVersion: 3,
        data: {id: "e2e-thrown-01", name: "Thrown Migration Batch", version: 1},
        error: "No migration bridges version 1 to 3",
        reason: "migration-error"
    }]);
    await page.reload();

    await page.goto("/batches");
    await expect(page.getByRole("listitem").filter({hasText: "E2E No Path Batch"})).toHaveCount(0);

    await page.goto("/migrations/failed");

    const noPathRow = page.getByRole("listitem").filter({hasText: "e2e-no-path-01"});
    await expect(noPathRow).toBeVisible();
    await expect(noPathRow.getByText(`Stuck at version ${BATCHES_VERSION + 1} — the app expects version ${BATCHES_VERSION}.`)).toBeVisible();
    await expect(noPathRow.getByText("No update path exists for this record yet.")).toBeVisible();

    const thrownRow = page.getByRole("listitem").filter({hasText: "e2e-thrown-01"});
    await expect(thrownRow).toBeVisible();
    await expect(thrownRow.getByText("An update was attempted and failed.")).toBeVisible();
});

// UPDATES-02: retry is unavailable for a no-migration-path record, and the
// reason is visible as page text, not merely the disabled button's title
test("retry is disabled for a no-migration-path record and its reason is stated as visible text", async ({page}) => {
    await primeMigrationFailuresStore(page);
    await seedBatches(page, [{id: "e2e-no-path-02", name: "E2E No Path Retry", version: BATCHES_VERSION + 1}]);
    await page.reload();

    const row = page.getByRole("listitem").filter({hasText: "e2e-no-path-02"});
    await expect(row.getByRole("button", {name: "Retry"})).toBeDisabled();
    await expect(row.getByText("Retry isn't available until an update path exists. Discarding it is the only action.")).toBeVisible();
});

// MIGRATION-FAILURES-03: discarding a record removes it for good, across a
// reload. This is currently FAILING against the real app — see the finding
// filed on #813. Discard only deletes the migration-failures entry; the
// underlying stale batch is untouched, so the next reload's page-load pass
// (#809) re-scans it and re-records the same failure. Left red on purpose
// rather than weakened, per this suite's own rule.
test("discarding a no-migration-path record removes it for good, across a reload", async ({page}) => {
    await primeMigrationFailuresStore(page);
    await seedBatches(page, [{id: "e2e-no-path-discard", name: "E2E No Path Discard", version: BATCHES_VERSION + 1}]);
    await page.reload();

    const row = page.getByRole("listitem").filter({hasText: "e2e-no-path-discard"});
    await expect(row).toBeVisible();
    await row.getByRole("button", {name: "Discard"}).click();
    await expect(row).toHaveCount(0);

    await page.reload();
    // the page-load pass runs inside MigrationGate's own suspense boundary,
    // ahead of this route's content — waiting for the heading is what makes
    // the absence check meaningful instead of racing the pass
    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();
    await expect(page.getByText("e2e-no-path-discard")).toHaveCount(0);
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
                error: "some migration error",
                reason: "migration-error"
            }, "migration-failures#batches:e2e-circular");
            tx.objectStore("keyvaluepairs").put({
                entityType: "batches",
                id: "e2e-sibling",
                fromVersion: 1,
                targetVersion: 2,
                data: {id: "e2e-sibling", version: 1},
                error: "some other migration error",
                reason: "migration-error"
            }, "migration-failures#batches:e2e-sibling");
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => reject(tx.error);
        };
    }));
    await page.reload();

    await expect(page.getByRole("heading", {name: "Updates"})).toBeVisible();
    await expect(page.getByText("This failed record can’t be displayed.")).toBeVisible();
    await expect(page.getByText("batches:e2e-circular")).toBeVisible();
    await expect(page.getByText("batches · e2e-sibling")).toBeVisible();

    // the contained record's own Discard still works, even from the fallback
    const fallbackRow = page.getByRole("listitem").filter({hasText: "batches:e2e-circular"});
    await fallbackRow.getByRole("button", {name: "Discard"}).click();
    await expect(page.getByText("batches:e2e-circular")).toHaveCount(0);
    await expect(page.getByText("batches · e2e-sibling")).toBeVisible();
});
