import {expect, Page, test} from "@playwright/test";

// mirrors batches.spec.ts's brewBatchFromKbRecipe — gives purge something
// real to wipe
async function brewBatchFromKbRecipe(page: Page, batchName: string) {
    await page.goto("/kb/recipe/anchor-steam-beer-clone");
    await page.getByRole("button", {name: "Brew"}).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Batch name/).fill(batchName);
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(page).toHaveURL(/\/batch\//);
}

test("/?purge=true redirects home and leaves no batches behind", async ({page}) => {
    await brewBatchFromKbRecipe(page, "E2E Purge Batch");

    await page.goto("/?purge=true");
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/batches");
    await expect(page.getByText("E2E Purge Batch")).not.toBeVisible();
});
