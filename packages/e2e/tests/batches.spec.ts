import { expect, Page, test } from "@playwright/test";

const TABS = ["Ready", "Brewing", "Fermenting", "Complete"];

test("shows all four status tabs with Ready active by default", async ({ page }) => {
    await page.goto("/batches");

    for (const name of TABS) {
        await expect(page.getByRole("tab", { name })).toBeVisible();
    }
    await expect(page.getByRole("tab", { name: "Ready" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".breadcrumbs").getByText("Batches")).toBeVisible();
});

// a fresh context has no batches, so every tab's panel is an empty list —
// there's no dedicated "no batches" message, just zero rows
test("each tab shows its empty state on a fresh context", async ({ page }) => {
    await page.goto("/batches");

    for (const name of TABS) {
        await page.getByRole("tab", { name }).click();
        await expect(page.getByRole("tab", { name })).toHaveAttribute("aria-selected", "true");
        await expect(page.getByRole("tabpanel").locator("li")).toHaveCount(0);
    }
});

test("clicking a tab moves aria-selected off the previously active tab", async ({ page }) => {
    await page.goto("/batches");
    await expect(page.getByRole("tab", { name: "Ready" })).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: "Brewing" }).click();
    await expect(page.getByRole("tab", { name: "Brewing" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "Ready" })).toHaveAttribute("aria-selected", "false");
});

// a fresh context has no batches, so a delete test brews its own first
// (mirrors batch-edit.spec.ts's brewBatchFromKbRecipe)
async function brewBatchFromKbRecipe(page: Page, batchName: string) {
    await page.goto("/kb/recipe/anchor-steam-beer-clone");
    await page.getByRole("button", { name: "Brew" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Batch name/).fill(batchName);
    await dialog.getByRole("button", { name: "Confirm" }).click();

    await expect(page).toHaveURL(/\/batch\//);
}

// delete is fire-and-forget (ConfirmDeleteButton's onConfirm isn't awaited),
// so a reload needs the same bounded wait batch-edit.spec.ts's settleSave uses
// for a debounced save — here for the delete's own storage write + invalidation.
async function settleSave(page: Page) {
    await page.waitForTimeout(1000);
}

test("deletes a batch after confirmation, and it stays gone after reload", async ({ page }) => {
    await brewBatchFromKbRecipe(page, "E2E Delete Batch");

    // a freshly-brewed batch is Statuses.PREP, which lands on the default Ready tab
    await page.goto("/batches");
    const row = page.getByRole("listitem").filter({ hasText: "E2E Delete Batch" });
    await expect(row).toBeVisible();

    await row.getByRole("button").click();
    // opening the confirm modal must not have triggered the row's own Link
    await expect(page).not.toHaveURL(/\/batch\//);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Delete E2E Delete Batch?" })).toBeVisible();

    await dialog.getByRole("button", { name: "Confirm" }).click();
    await expect(row).not.toBeVisible();

    await settleSave(page);
    await page.reload();
    await expect(page.getByText("E2E Delete Batch")).not.toBeVisible();
});

test("every batch row shows a delete affordance", async ({ page }) => {
    await brewBatchFromKbRecipe(page, "E2E Row One");
    await brewBatchFromKbRecipe(page, "E2E Row Two");

    await page.goto("/batches");
    await expect(page.getByRole("listitem").filter({ hasText: "E2E Row One" }).getByRole("button")).toHaveCount(1);
    await expect(page.getByRole("listitem").filter({ hasText: "E2E Row Two" }).getByRole("button")).toHaveCount(1);
});
