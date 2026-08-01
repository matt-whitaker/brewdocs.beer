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
