import { expect, test } from "@playwright/test";

const RECIPE_PATH = "/kb/recipe/anchor-steam-beer-clone";

test("Overview is the default active tab and shows recipe content", async ({ page }) => {
    await page.goto(RECIPE_PATH);
    await expect(page.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Northern Brewer")).toBeVisible();
    await expect(page.getByText("German Pils")).toBeVisible();
    await expect(page.getByText("Yeast Nutrients")).toBeVisible();
    await expect(page.getByText("Irish Moss")).toBeVisible();
});

test("Batches tab activates on click", async ({ page }) => {
    await page.goto(RECIPE_PATH);
    await page.getByRole("tab", { name: "Batches" }).click();
    await expect(page.getByRole("tab", { name: "Batches" })).toHaveAttribute("aria-selected", "true");
});

test("Brew action opens the batch-name modal, which can be cancelled", async ({ page }) => {
    await page.goto(RECIPE_PATH);
    await expect(page.getByRole("button", { name: "Brew" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();

    await page.getByRole("button", { name: "Brew" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Batch name:")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Confirm" })).toBeVisible();

    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toBeHidden();
});
