import {expect, Page, test} from "@playwright/test";

/**
 * `batches`' own migrations array is empty (packages/app/src/storage/batches.ts,
 * BATCHES_VERSION = 1) — by this story's explicit scope, so nothing has a real
 * `down` to run. A *successful* computed-down revert therefore isn't exercisable
 * against genuine registered migrations here (mirrors migration-pass.spec.ts's
 * own note for the forward direction). What these specs can and do prove on
 * that side is kind-selection (computed is chosen when the stored record has
 * drifted past the backup's toVersion) and safe containment when the reverse
 * walk finds no path — never a genuinely successful computed restore.
 */
type SeedBackup = {
    entityType: string;
    id: string;
    fromVersion: number;
    toVersion: number;
    migratedAt: string;
    data: unknown;
};

type SeedBatch = {
    id: string;
    name: string;
    version: number;
};

const BATCHES_VERSION = 1;

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

// the db/store only exist once localforage has initialized them, which
// happens the first time the page's own query runs — mirrors
// migrations-failed.spec.ts's primeMigrationFailuresStore
async function primeMigrationBackupsStore(page: Page) {
    await page.goto("/migrations/backups");
    await expect(page.getByText("No updated records are available to revert.")).toBeVisible();
}

async function seedMigrationBackups(page: Page, backups: SeedBackup[]) {
    await page.evaluate((seeded) => new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("migration-backups");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("keyvaluepairs", "readwrite");
            for (const backup of seeded) {
                tx.objectStore("keyvaluepairs").put(backup, `migration-backups#${backup.entityType}:${backup.id}`);
            }
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => reject(tx.error);
        };
    }), backups);
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

// REVERTS-01, REVERTS-05: every listed record identifies itself and states
// plainly, before any click, whether its revert is exact, computed, or
// unavailable — and why, when unavailable
test("lists every seeded backup with its identity and version step, and states each one's revert kind or reason before any click", async ({page}) => {
    await primeMigrationBackupsStore(page);
    await seedBatches(page, [
        {id: "e2e-exact-01", name: "E2E Exact Candidate", version: 2},
        {id: "e2e-computed-01", name: "E2E Computed Candidate", version: 5},
    ]);
    await seedMigrationBackups(page, [
        {
            entityType: "batches",
            id: "e2e-exact-01",
            fromVersion: 1,
            toVersion: 2,
            migratedAt: "2024-05-01T12:00:00.000Z",
            data: batchRecord({id: "e2e-exact-01", name: "E2E Exact Candidate Pre-Update", version: 1}),
        },
        {
            entityType: "batches",
            id: "e2e-computed-01",
            fromVersion: 4,
            toVersion: 3,
            migratedAt: "2024-05-02T12:00:00.000Z",
            data: batchRecord({id: "e2e-computed-01", name: "E2E Computed Candidate Pre-Update", version: 4}),
        },
        {
            entityType: "recipes",
            id: "e2e-notwired-01",
            fromVersion: 1,
            toVersion: 2,
            migratedAt: "2024-05-03T12:00:00.000Z",
            data: {name: "E2E Not Wired Recipe", version: 1},
        },
        {
            entityType: "batches",
            id: "e2e-gone-01",
            fromVersion: 1,
            toVersion: 2,
            migratedAt: "2024-05-04T12:00:00.000Z",
            data: batchRecord({id: "e2e-gone-01", name: "E2E Gone Candidate Pre-Update", version: 1}),
        },
    ]);
    await page.reload();

    // the stored batch is still at the backup's toVersion — exact
    const exactRow = page.getByRole("listitem").filter({hasText: "e2e-exact-01"});
    await expect(exactRow).toBeVisible();
    await expect(exactRow.getByText("batches · e2e-exact-01")).toBeVisible();
    await expect(exactRow.getByText("Updated from version 1 to version 2 on 2024-05-01.")).toBeVisible();
    await expect(exactRow.getByText("Exact revert — restores this record byte-for-byte as it was before the update.")).toBeVisible();
    await expect(exactRow.getByRole("button", {name: "Revert"})).toBeEnabled();

    // the stored batch has drifted past the backup's toVersion — computed
    const computedRow = page.getByRole("listitem").filter({hasText: "e2e-computed-01"});
    await expect(computedRow).toBeVisible();
    await expect(computedRow.getByText("Updated from version 4 to version 3 on 2024-05-02.")).toBeVisible();
    await expect(computedRow.getByText("Computed revert — reverses the update's logic, which can lose data the update added.")).toBeVisible();
    await expect(computedRow.getByRole("button", {name: "Revert"})).toBeEnabled();

    // entity type isn't wired for revert at all
    const notWiredRow = page.getByRole("listitem").filter({hasText: "e2e-notwired-01"});
    await expect(notWiredRow).toBeVisible();
    await expect(notWiredRow.getByText("recipes · e2e-notwired-01")).toBeVisible();
    await expect(notWiredRow.getByText("Revert isn't available for this kind of record.")).toBeVisible();
    await expect(notWiredRow.getByRole("button", {name: "Revert"})).toBeDisabled();

    // the entity type is wired, but no matching batch is stored any more
    const goneRow = page.getByRole("listitem").filter({hasText: "e2e-gone-01"});
    await expect(goneRow).toBeVisible();
    await expect(goneRow.getByText("Revert isn't available — this record is no longer stored.")).toBeVisible();
    await expect(goneRow.getByRole("button", {name: "Revert"})).toBeDisabled();
});

// REVERTS-02, REVERTS-03: reverting a record whose retained snapshot is still
// at the record's current version restores it exactly, deletes the backup,
// and both hold across a reload
test("reverting an exact-eligible backup restores the record byte-for-byte, deletes the backup, and both hold across a reload", async ({page}) => {
    await primeMigrationBackupsStore(page);
    await seedBatches(page, [{id: "e2e-revert-exact", name: "E2E Post-Update Name", version: BATCHES_VERSION}]);
    const preUpdateData = batchRecord({id: "e2e-revert-exact", name: "E2E Pre-Update Name", version: BATCHES_VERSION});
    await seedMigrationBackups(page, [{
        entityType: "batches",
        id: "e2e-revert-exact",
        fromVersion: 0,
        toVersion: BATCHES_VERSION,
        migratedAt: "2024-05-01T12:00:00.000Z",
        data: preUpdateData,
    }]);
    await page.reload();

    const row = page.getByRole("listitem").filter({hasText: "e2e-revert-exact"});
    await expect(row.getByText("Exact revert — restores this record byte-for-byte as it was before the update.")).toBeVisible();
    await row.getByRole("button", {name: "Revert"}).click();
    await expect(row).toHaveCount(0);

    // reload proves the writes actually landed, not just the query cache
    await page.reload();
    await expect(page.getByRole("listitem").filter({hasText: "e2e-revert-exact"})).toHaveCount(0);

    const restored = await readIndexedDbValue(page, "batches", "batches#e2e-revert-exact");
    expect(restored).toEqual(preUpdateData);

    const backup = await readIndexedDbValue(page, "migration-backups", "migration-backups#batches:e2e-revert-exact");
    expect(backup).toBeUndefined();

    await page.goto("/batches");
    await expect(page.getByRole("listitem").filter({hasText: "E2E Pre-Update Name"})).toBeVisible();
    await expect(page.getByRole("listitem").filter({hasText: "E2E Post-Update Name"})).toHaveCount(0);
});

// REVERTS-04: a backup whose stored record has moved past its toVersion
// selects the computed path; with no reverse migration registered today the
// walk fails, and the revert is rejected without touching either record —
// across a reload
test("reverting a computed-eligible backup with no reverse migration path leaves the record and backup untouched, across a reload", async ({page}) => {
    await primeMigrationBackupsStore(page);
    await seedBatches(page, [{id: "e2e-revert-computed", name: "E2E Drifted Batch", version: BATCHES_VERSION}]);
    const backupData = batchRecord({id: "e2e-revert-computed", name: "E2E Drifted Batch Pre-Update", version: 0});
    await seedMigrationBackups(page, [{
        entityType: "batches",
        id: "e2e-revert-computed",
        fromVersion: 0,
        toVersion: 7,
        migratedAt: "2024-05-01T12:00:00.000Z",
        data: backupData,
    }]);
    await page.reload();

    const row = page.getByRole("listitem").filter({hasText: "e2e-revert-computed"});
    await expect(row.getByText("Computed revert — reverses the update's logic, which can lose data the update added.")).toBeVisible();
    await row.getByRole("button", {name: "Revert"}).click();
    await expect(row.getByText(/Revert failed/)).toBeVisible();
    await expect(row).toBeVisible();

    await page.reload();
    await expect(page.getByRole("listitem").filter({hasText: "e2e-revert-computed"})).toBeVisible();

    const untouchedBatch = await readIndexedDbValue(page, "batches", "batches#e2e-revert-computed");
    expect(untouchedBatch).toMatchObject({id: "e2e-revert-computed", name: "E2E Drifted Batch", version: BATCHES_VERSION});

    const untouchedBackup = await readIndexedDbValue(page, "migration-backups", "migration-backups#batches:e2e-revert-computed");
    expect(untouchedBackup).toMatchObject({entityType: "batches", id: "e2e-revert-computed", toVersion: 7});
});
