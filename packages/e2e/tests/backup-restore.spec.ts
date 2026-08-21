import {readFileSync} from "node:fs";
import {expect, Page, test} from "@playwright/test";
import {seedBatch} from "./seedBatch";

// BACKUP-EXPORT-02 (packages/spec/product/backup-restore.md) — triggering "Back up now" hands the
// file to the native share sheet — has no test in this file. This suite's Chromium has no Web
// Share API, so `navigator.share` is never reached and the real share path can't be driven; the
// #1310/#1311 fallback below is the closest this suite can honestly get.

const RESTORE_LABEL = "Restore from a backup file";
const RESTORED_MESSAGE = "Restored. Your batches and recipes now match that file.";
const FAILED_MESSAGE = "That backup could not be handed off. Try again.";
const UNREADABLE_MESSAGE = "That file isn't a backup this app can read.";

function minimalBatch(id: string, name: string, version = 1) {
    return {
        id,
        version,
        name,
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
            srm: "0"
        },
        shopping: [],
        tracker: {}
    };
}

function minimalRecipe(id: string, name: string) {
    return {
        id,
        version: 1,
        __type: "recipe",
        name,
        brewer: "",
        description: "",
        type: "",
        batchSize: {value: "5gal", unit: "gal"},
        efficiency: {value: "75%", unit: "%"},
        boilTime: {value: "60min", unit: "min"},
        targets: {
            og: {value: "0.00°P", unit: "°P"},
            fg: {value: "0.00°P", unit: "°P"},
            abv: {value: "0.0%", unit: "%"},
            ibu: "0",
            srm: "0"
        },
        brewable: {schedule: {phases: []}, assignments: []}
    };
}

function backupJson(contents: {batches?: unknown[], recipes?: unknown[]}) {
    return {appVersion: "0.0.0", exportedAt: new Date(0).toISOString(), ...contents};
}

async function restoreFile(page: Page, contents: {batches?: unknown[], recipes?: unknown[]}) {
    await page.getByLabel(RESTORE_LABEL).setInputFiles({
        name: "backup.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(backupJson(contents)))
    });
}

async function backUpNowAndReadJson(page: Page) {
    const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", {name: "Back up now"}).click()
    ]);

    expect(download.suggestedFilename()).toBe("backup.json");
    const path = await download.path();
    if (!path) throw new Error("download produced no local path");
    return JSON.parse(readFileSync(path, "utf-8"));
}

async function createEmptyRecipe(page: Page, name: string): Promise<string> {
    await page.goto("/recipes");
    await page.getByRole("tab", {name: "My Recipes"}).click();
    await page.getByRole("button", {name: "Create"}).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Recipe name/).fill(name);
    await dialog.getByLabel(/Template/).selectOption("Empty");
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(page).toHaveURL(/\/recipe\/(.+)\/edit/);
    const match = page.url().match(/\/recipe\/([^/]+)\/edit/);
    if (!match) throw new Error("recipe id not found in URL after creation");
    return match[1];
}

// BACKUP-EXPORT-01: a "Back up now" action is present at /backup — what SETTINGS-04's citation in
// settings.spec.ts stops short of proving (it only shows the menu reaches this screen).
test("Back up now action is present at /backup", async ({page}) => {
    await page.goto("/backup");
    await expect(page.getByRole("button", {name: "Back up now"})).toBeVisible();
});

// BACKUP-EXPORT-03/05: with nothing brewed or planned, "Back up now" still works and downloads an
// empty backup rather than being unavailable.
test("backing up an empty store downloads an empty backup.json", async ({page}) => {
    await page.goto("/backup");
    const contents = await backUpNowAndReadJson(page);

    expect(contents.batches).toEqual([]);
    expect(contents.recipes).toEqual([]);
});

// BACKUP-EXPORT-04: a backup contains every batch and recipe currently stored.
test("backing up a populated store downloads every batch and recipe", async ({page}) => {
    const batchId = await seedBatch(page, {name: "E2E Backup Batch", goto: "/recipes"});
    const recipeId = await createEmptyRecipe(page, "E2E Backup Recipe");

    await page.goto("/backup");
    const contents = await backUpNowAndReadJson(page);

    expect(contents.batches.some((b: {id: string, name: string}) => b.id === batchId && b.name === "E2E Backup Batch")).toBe(true);
    expect(contents.recipes.some((r: {id: string, name: string}) => r.id === recipeId && r.name === "E2E Backup Recipe")).toBe(true);
});

// #1310/#1311: a share sheet that accepts the file (canShare true) but then refuses it for a
// reason other than the brewer cancelling still yields a download, rather than leaving the
// brewer with only an error.
test("a non-cancelled share refusal still downloads the file", async ({page}) => {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "canShare", {value: () => true, configurable: true});
        Object.defineProperty(navigator, "share", {
            value: () => Promise.reject(new Error("share failed for some other reason")),
            configurable: true
        });
    });
    await page.goto("/backup");

    const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", {name: "Back up now"}).click()
    ]);
    expect(download.suggestedFilename()).toBe("backup.json");
    await expect(page.getByText(FAILED_MESSAGE)).not.toBeVisible();
});

// #1310/#1311: a share the brewer cancelled (AbortError) is a changed mind, not a failed
// handoff — no download, and no error message telling the brewer something went wrong.
test("a cancelled share neither downloads nor shows a failure message", async ({page}) => {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "canShare", {value: () => true, configurable: true});
        Object.defineProperty(navigator, "share", {
            value: () => {
                const abort = new Error("cancelled");
                abort.name = "AbortError";
                return Promise.reject(abort);
            },
            configurable: true
        });
    });
    await page.goto("/backup");

    let downloadFired = false;
    page.once("download", () => { downloadFired = true; });
    await page.getByRole("button", {name: "Back up now"}).click();
    await page.waitForTimeout(1000);

    expect(downloadFired).toBe(false);
    await expect(page.getByText(FAILED_MESSAGE)).not.toBeVisible();
});

// BACKUP-RESTORE-01: the same screen offers a control for picking a file to restore.
test("a labelled file-picker control accepts a backup file", async ({page}) => {
    await page.goto("/backup");

    const input = page.getByLabel(RESTORE_LABEL);
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("accept", ".json,application/json");
});

// BACKUP-RESTORE-02: restoring a file replaces the brewer's batches and recipes with what the
// file contains.
test("restoring a file replaces existing batches and recipes with the file's contents", async ({page}) => {
    await seedBatch(page, {name: "E2E Old Batch", goto: "/recipes"});
    await createEmptyRecipe(page, "E2E Old Recipe");

    await page.goto("/backup");
    await restoreFile(page, {
        batches: [minimalBatch("e2e-restored-batch", "E2E Restored Batch")],
        recipes: [minimalRecipe("e2e-restored-recipe", "E2E Restored Recipe")]
    });
    await expect(page.getByText(RESTORED_MESSAGE)).toBeVisible();

    await page.goto("/batches");
    await expect(page.getByRole("listitem").filter({hasText: "E2E Restored Batch"})).toBeVisible();
    await expect(page.getByRole("listitem").filter({hasText: "E2E Old Batch"})).toHaveCount(0);

    await page.goto("/recipes");
    await page.getByRole("tab", {name: "My Recipes"}).click();
    await expect(page.getByRole("listitem").filter({hasText: "E2E Restored Recipe"})).toBeVisible();
    await expect(page.getByRole("listitem").filter({hasText: "E2E Old Recipe"})).toHaveCount(0);
});

// BACKUP-RESTORE-03: a file naming only one kind restores just that kind, leaving the other kind
// exactly as it was — checked in both directions.
test("a one-kind backup file leaves the other kind untouched", async ({page}) => {
    await seedBatch(page, {name: "E2E Kept Batch", goto: "/recipes"});
    await createEmptyRecipe(page, "E2E Old Recipe");

    await page.goto("/backup");
    await restoreFile(page, {recipes: [minimalRecipe("e2e-recipes-only", "E2E Recipes-Only Restore")]});
    await expect(page.getByText(RESTORED_MESSAGE)).toBeVisible();

    await page.goto("/batches");
    await expect(page.getByRole("listitem").filter({hasText: "E2E Kept Batch"})).toBeVisible();

    await page.goto("/recipes");
    await page.getByRole("tab", {name: "My Recipes"}).click();
    await expect(page.getByRole("listitem").filter({hasText: "E2E Recipes-Only Restore"})).toBeVisible();
    await expect(page.getByRole("listitem").filter({hasText: "E2E Old Recipe"})).toHaveCount(0);

    await page.goto("/backup");
    await restoreFile(page, {batches: [minimalBatch("e2e-batches-only", "E2E Batches-Only Restore")]});
    await expect(page.getByText(RESTORED_MESSAGE)).toBeVisible();

    await page.goto("/batches");
    await expect(page.getByRole("listitem").filter({hasText: "E2E Batches-Only Restore"})).toBeVisible();
    await expect(page.getByRole("listitem").filter({hasText: "E2E Kept Batch"})).toHaveCount(0);

    await page.goto("/recipes");
    await page.getByRole("tab", {name: "My Recipes"}).click();
    await expect(page.getByRole("listitem").filter({hasText: "E2E Recipes-Only Restore"})).toBeVisible();
});

// BACKUP-RESTORE-04: a record the app can't yet make sense of lands on the update-problems page
// instead of stopping the rest of the file from restoring.
test("a batch record with no update path restores the rest and lands at /migrations/failed", async ({page}) => {
    await page.goto("/backup");
    await restoreFile(page, {
        batches: [
            minimalBatch("e2e-restore-good", "E2E Restore Good Batch", 1),
            minimalBatch("e2e-restore-bad", "E2E Restore Bad Batch", 2)
        ]
    });
    await expect(page.getByText(RESTORED_MESSAGE)).toBeVisible();

    await page.goto("/batches");
    await expect(page.getByRole("listitem").filter({hasText: "E2E Restore Good Batch"})).toBeVisible();
    await expect(page.getByRole("listitem").filter({hasText: "E2E Restore Bad Batch"})).toHaveCount(0);

    await page.goto("/migrations/failed");
    const failedRow = page.getByRole("listitem").filter({hasText: "e2e-restore-bad"});
    await expect(failedRow).toBeVisible();
    await expect(failedRow.getByText("batches · e2e-restore-bad")).toBeVisible();
    await expect(failedRow.getByText("No update path exists for this record yet.")).toBeVisible();
});

// UNREADABLE_BACKUP: a file readBackup can't parse shows a dedicated message and restores
// nothing — checked up front, before any store is purged.
test("an unreadable file is rejected and restores nothing", async ({page}) => {
    await seedBatch(page, {name: "E2E Untouched Batch", goto: "/backup"});

    await page.getByLabel(RESTORE_LABEL).setInputFiles({
        name: "not-a-backup.json",
        mimeType: "application/json",
        buffer: Buffer.from("this is not json")
    });
    await expect(page.getByText(UNREADABLE_MESSAGE)).toBeVisible();

    await page.goto("/batches");
    await expect(page.getByRole("listitem").filter({hasText: "E2E Untouched Batch"})).toBeVisible();
});
