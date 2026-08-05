import {expect, Locator, Page, test} from "@playwright/test";

// A fresh context has no batches, so this drives the same Brew flow as
// batch-detail.spec.ts to reach the Summary tab's Vitals grid.
async function brewBatchFromKbRecipe(page: Page, batchName: string) {
    await page.goto("/kb/recipe/anchor-steam-beer-clone");
    await page.getByRole("button", {name: "Brew"}).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Batch name/).fill(batchName);
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(page).toHaveURL(/\/batch\//);
}

// Vitals' SRM decoration (SrmTag) is `aria-hidden` with no text content, so it
// has no accessible name or role to query — locate it structurally instead: the
// named DataGrid ("Target"/"Actuals") that has the "SRM" row's own grid cell.
function srmRow(page: Page, column: string): Locator {
    return page.locator(".data-grid").filter({hasText: column}).locator("div.grid").filter({hasText: "SRM"});
}

test("shows an SRM colour swatch beside the number in both Target and Actuals", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Vitals Batch");
    await page.getByRole("tab", {name: "Summary", exact: true}).click();

    // anchor-steam-beer-clone targets srm "9"; a fresh batch's actuals default to "0"
    const target = srmRow(page, "Target");
    await expect(target).toContainText("9");
    await expect(target.locator("span.rounded-full")).toBeVisible();

    const actuals = srmRow(page, "Actuals");
    await expect(actuals).toContainText("0");
    await expect(actuals.locator("span.rounded-full")).toBeVisible();
});

// same structural locator as srmRow, generalised to any Vitals measurement label
function vitalsRow(page: Page, column: string, label: string): Locator {
    return page.locator(".data-grid").filter({hasText: column}).locator("div.grid").filter({hasText: label});
}

test("shows the recipe's target vitals, a fresh batch's zeroed actuals, and the batch's organics", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Summary Vitals Batch");
    await page.getByRole("tab", {name: "Summary", exact: true}).click();

    // anchor-steam-beer-clone's own targets (packages/kb/data/recipes/anchor-steam-beer-clone.json)
    await expect(vitalsRow(page, "Target", "ABV")).toContainText("4.7%");
    await expect(vitalsRow(page, "Target", "IBU")).toContainText("35");
    await expect(vitalsRow(page, "Target", "O.G.")).toContainText("1.05°P");
    await expect(vitalsRow(page, "Target", "F.G.")).toContainText("1.014°P");

    // defaultBatch's actuals, unset on a freshly-brewed batch
    await expect(vitalsRow(page, "Actuals", "ABV")).toContainText("0.0%");
    await expect(vitalsRow(page, "Actuals", "IBU")).toContainText("0");
    await expect(vitalsRow(page, "Actuals", "O.G.")).toContainText("0.00°P");
    await expect(vitalsRow(page, "Actuals", "F.G.")).toContainText("0.00°P");

    await expect(page.getByText("German Pils")).toBeVisible();
    await expect(page.getByText("Northern Brewer")).toBeVisible();
    await expect(page.getByText("Wyeast 2112")).toBeVisible();
    await expect(page.getByText("Yeast Nutrients")).toBeVisible();
    await expect(page.getByText("Irish Moss")).toBeVisible();
});

// mirrors batch-edit.spec.ts's own copy — this file drives the Brewing tab
// only to set up Actuals before reading them back on Summary
async function openSchedulePhase(page: Page, phase: string) {
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();
    await page.getByRole("tab", {name: phase, exact: true}).click();
    await expect(page.getByRole("tab", {name: phase, exact: true})).toHaveAttribute("aria-selected", "true");
}

// see batch-edit.spec.ts for why this is a fixed wait, not a flake patch: the
// date field's save is debounced, so reading it back races the write
async function settleSave(page: Page) {
    await page.waitForTimeout(1000);
}

async function addGravityReading(page: Page, phase: string, platoValue: string, date: string) {
    await openSchedulePhase(page, phase);
    await page.getByLabel("Gravity value to add").fill(platoValue);
    await page.getByRole("button", {name: "Add reading"}).click();
    await page.getByRole("button", {name: "Show Reading details"}).click();
    await page.getByLabel("Reading date").fill(date);
    await settleSave(page);
}

// ASBC Plato→SG approximation and the ABV estimate, independently reimplemented
// from packages/core/src/gravity.ts so this assertion can't silently drift if
// that formula ever changes without the test noticing.
function platoToSpecificGravity(plato: number): number {
    return 1 + (plato / (258.6 - ((plato / 258.2) * 227.1)));
}

function expectedAbv(ogPlato: number, fgPlato: number): string {
    const abv = (platoToSpecificGravity(ogPlato) - platoToSpecificGravity(fgPlato)) * 131.25;
    return `${abv.toFixed(1)}%`;
}

test("computes Actuals O.G./F.G./ABV from two dated gravity readings, ordered by date rather than entry order", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Actuals ABV Batch");

    // entered first but dated later — this is the F.G.
    await addGravityReading(page, "3. Ferment", "2.5", "2026-02-20");
    // entered second but dated earlier — this is the O.G.; if the derivation
    // ever picked by entry/array order instead of date, this would come out
    // backwards despite being the more natural mash-then-ferment order
    await addGravityReading(page, "1. Mash", "12.5", "2026-02-10");

    await page.getByRole("tab", {name: "Summary", exact: true}).click();

    await expect(vitalsRow(page, "Actuals", "O.G.")).toContainText("12.5°P");
    await expect(vitalsRow(page, "Actuals", "F.G.")).toContainText("2.5°P");
    await expect(vitalsRow(page, "Actuals", "ABV")).toContainText(expectedAbv(12.5, 2.5));
});

test("a single dated gravity reading shows equal Actuals O.G./F.G. and 0.0% ABV", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Actuals Single Reading Batch");

    await addGravityReading(page, "1. Mash", "12.5", "2026-02-10");

    await page.getByRole("tab", {name: "Summary", exact: true}).click();

    await expect(vitalsRow(page, "Actuals", "O.G.")).toContainText("12.5°P");
    await expect(vitalsRow(page, "Actuals", "F.G.")).toContainText("12.5°P");
    await expect(vitalsRow(page, "Actuals", "ABV")).toContainText("0.0%");
});
