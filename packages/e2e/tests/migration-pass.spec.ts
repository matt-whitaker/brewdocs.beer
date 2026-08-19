import {expect, Page, test} from "@playwright/test";

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

async function primeBatchesStore(page: Page) {
    await page.goto("/batches");
    await expect(page.getByRole("tab", {name: "Ready"})).toHaveAttribute("aria-selected", "true");
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

async function readBatchRecord(page: Page, id: string) {
    return page.evaluate((key) => new Promise((resolve, reject) => {
        const request = indexedDB.open("batches");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction("keyvaluepairs", "readonly");
            const getRequest = tx.objectStore("keyvaluepairs").get(key);
            getRequest.onsuccess = () => { db.close(); resolve(getRequest.result); };
            getRequest.onerror = () => reject(getRequest.error);
        };
    }), `batches#${id}`);
}

test("a batch not at the current version is excluded from the list and its detail route redirects, and both hold across a reload", async ({page}) => {
    await primeBatchesStore(page);
    await seedBatches(page, [
        {id: "e2e-current-01", name: "E2E Current Batch", version: BATCHES_VERSION},
        {id: "e2e-stale-01", name: "E2E Stale Batch", version: BATCHES_VERSION + 1},
    ]);

    for (let i = 0; i < 2; i++) {
        await page.reload();
        await expect(page.getByRole("listitem").filter({hasText: "E2E Current Batch"})).toBeVisible();
        await expect(page.getByRole("listitem").filter({hasText: "E2E Stale Batch"})).toHaveCount(0);

        await page.goto("/batch/e2e-stale-01");
        await expect(page).toHaveURL(/\/batches$/);
        await expect(page.getByRole("tab", {name: "Ready"})).toBeVisible();
    }
});

test("a batch already at the current version is unaffected by the pass, across reloads", async ({page}) => {
    await primeBatchesStore(page);
    await seedBatches(page, [{id: "e2e-noop-01", name: "E2E Unaffected Batch", version: BATCHES_VERSION}]);

    const original = await readBatchRecord(page, "e2e-noop-01");

    for (let i = 0; i < 2; i++) {
        await page.reload();
        await expect(page.getByRole("listitem").filter({hasText: "E2E Unaffected Batch"})).toBeVisible();
        expect(await readBatchRecord(page, "e2e-noop-01")).toEqual(original);
    }
});

test("a stale batch's set-aside failure record doesn't duplicate across reloads", async ({page}) => {
    await primeBatchesStore(page);
    await seedBatches(page, [{id: "e2e-stale-nodupe", name: "E2E Stale No Dupe", version: BATCHES_VERSION + 1}]);

    await page.reload();
    await page.reload();

    await page.goto("/migrations/failed");
    await expect(page.getByRole("listitem").filter({hasText: "e2e-stale-nodupe"})).toHaveCount(1);
});

test("an ordinary load with nothing stale shows a stable batch list", async ({page}) => {
    await primeBatchesStore(page);
    await seedBatches(page, [
        {id: "e2e-flicker-01", name: "E2E Flicker Batch 1", version: BATCHES_VERSION},
        {id: "e2e-flicker-02", name: "E2E Flicker Batch 2", version: BATCHES_VERSION},
    ]);

    await page.reload();
    await expect(page.getByRole("tabpanel").locator("li")).toHaveCount(2);
    await page.waitForTimeout(500);
    await expect(page.getByRole("tabpanel").locator("li")).toHaveCount(2);
});
