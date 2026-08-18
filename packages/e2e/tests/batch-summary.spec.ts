import {expect, Locator, Page, test} from "@playwright/test";
import {seedBatch} from "./seedBatch";
import {settleSave} from "./settleSave";

// Vitals' SRM decoration (SrmTag) is `aria-hidden` with no text content, so it
// has no accessible name or role to query — locate it structurally instead: the
// named DataGrid ("Target"/"Actuals") that has the "SRM" row's own grid cell.
function srmRow(page: Page, column: string): Locator {
    return page.locator(".data-grid").filter({hasText: column}).locator("div.grid").filter({hasText: "SRM"});
}

test("shows an SRM colour swatch beside the number in both Target and Actuals", async ({page}) => {
    await seedBatch(page, {name: "E2E Vitals Batch"});
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
    await seedBatch(page, {name: "E2E Summary Vitals Batch"});
    await page.getByRole("tab", {name: "Summary", exact: true}).click();

    // anchor-steam-beer-clone's own targets (packages/kb/data/recipes/anchor-steam-beer-clone.json)
    await expect(vitalsRow(page, "Target", "ABV")).toContainText("4.7%");
    await expect(vitalsRow(page, "Target", "IBU")).toContainText("35");
    await expect(vitalsRow(page, "Target", "O.G.")).toContainText("1.05°P");
    await expect(vitalsRow(page, "Target", "F.G.")).toContainText("1.014°P");

    // defaultBatch's actuals, unset on a freshly-brewed batch. IBU is deliberately
    // absent here — it is the one actual that is derived rather than zeroed, and it
    // has its own test below.
    await expect(vitalsRow(page, "Actuals", "ABV")).toContainText("0.0%");
    await expect(vitalsRow(page, "Actuals", "O.G.")).toContainText("0.00°P");
    await expect(vitalsRow(page, "Actuals", "F.G.")).toContainText("0.00°P");

    await expect(page.getByText("German Pils")).toBeVisible();
    await expect(page.getByText("Northern Brewer")).toBeVisible();
    await expect(page.getByText("Wyeast 2112")).toBeVisible();
    await expect(page.getByText("Yeast Nutrients")).toBeVisible();
    await expect(page.getByText("Irish Moss")).toBeVisible();
});

// IBU is the one actual a brewer never measures, so Summary derives it from the
// batch's own hop bill instead of leaving it at defaultBatch's "0". A freshly
// brewed batch has no gravity reading, which also makes this the fallback case:
// the estimate uses the recipe's target OG.
//
// anchor-steam-beer-clone's three Northern Brewer additions over its 5gal batch
// at 1.05 OG come to 37 by Tinseth, against a hand-authored target of 35.
//
// ⚠️ Anchored rather than `toContainText("37")`, which also passes on 137 and 371.
// An IBU wrong by an order of magnitude is the failure most worth catching here,
// and a substring match cannot see it.
test("Summary derives a non-zero Actuals IBU from the batch's own hop bill", async ({page}) => {
    await seedBatch(page, {name: "E2E Summary IBU Batch"});
    await page.getByRole("tab", {name: "Summary", exact: true}).click();

    await expect(vitalsRow(page, "Actuals", "IBU")).toHaveText(/^IBU\s*37$/);
});

// mirrors batch-edit.spec.ts's own copy — this file drives the Brewing tab
// only to set up Actuals before reading them back on Summary
async function openSchedulePhase(page: Page, phase: string) {
    await page.getByRole("tab", {name: "Brewing", exact: true}).click();
    await page.getByRole("tab", {name: phase, exact: true}).click();
    await expect(page.getByRole("tab", {name: phase, exact: true})).toHaveAttribute("aria-selected", "true");
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
    await seedBatch(page, {name: "E2E Actuals ABV Batch"});

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
    await seedBatch(page, {name: "E2E Actuals Single Reading Batch"});

    await addGravityReading(page, "1. Mash", "12.5", "2026-02-10");

    await page.getByRole("tab", {name: "Summary", exact: true}).click();

    await expect(vitalsRow(page, "Actuals", "O.G.")).toContainText("12.5°P");
    await expect(vitalsRow(page, "Actuals", "F.G.")).toContainText("12.5°P");
    await expect(vitalsRow(page, "Actuals", "ABV")).toContainText("0.0%");
});

async function addUndatedGravityReading(page: Page, phase: string, platoValue: string) {
    await openSchedulePhase(page, phase);
    await page.getByLabel("Gravity value to add").fill(platoValue);
    await page.getByRole("button", {name: "Add reading"}).click();
    await settleSave(page);
}

test("an undated gravity reading sorts after a dated one, becoming F.G. regardless of entry order", async ({page}) => {
    await seedBatch(page, {name: "E2E Actuals Undated Reading Batch"});

    // entered first but never dated — must still sort last (F.G.), not first
    await addUndatedGravityReading(page, "3. Ferment", "8.5");
    // entered second but dated — must still sort first (O.G.)
    await addGravityReading(page, "1. Mash", "12.5", "2026-02-10");

    await page.getByRole("tab", {name: "Summary", exact: true}).click();

    await expect(vitalsRow(page, "Actuals", "O.G.")).toContainText("12.5°P");
    await expect(vitalsRow(page, "Actuals", "F.G.")).toContainText("8.5°P");
});

async function addEmptyGravityReading(page: Page, phase: string, label: string) {
    await openSchedulePhase(page, phase);
    await page.getByLabel("Gravity name to add").fill(label);
    await page.getByRole("button", {name: "Add reading"}).click();
}

test("a gravity reading left without a value, even after being typed then cleared, is excluded from Actuals", async ({page}) => {
    await seedBatch(page, {name: "E2E Actuals Empty Reading Batch"});

    // no value on add -> no tracker entry at all yet; typing a value then
    // clearing it writes a tracker entry with a present but empty
    // reading.value, per reading.tsx's onChangeReading -- this must still be
    // excluded, not render blank
    await addEmptyGravityReading(page, "1. Mash", "Empty Check");
    await page.getByLabel("Empty Check reading").fill("12");
    await page.getByLabel("Empty Check reading").fill("");
    await settleSave(page);

    await addGravityReading(page, "3. Ferment", "12.5", "2026-02-10");

    await page.getByRole("tab", {name: "Summary", exact: true}).click();

    await expect(vitalsRow(page, "Actuals", "O.G.")).toContainText("12.5°P");
    await expect(vitalsRow(page, "Actuals", "F.G.")).toContainText("12.5°P");
});
