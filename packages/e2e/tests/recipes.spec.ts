import { expect, test } from "@playwright/test";
import { activeTabName } from "./helpers";

test("recipes page defaults to the All tab, listing the kb catalog", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByRole("tab", { name: "All" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Starred" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "My Recipes" })).toBeVisible();
    await expect(await activeTabName(page)).toBe("All");
    await expect(page.getByText("Anchor Steam Beer Clone")).toBeVisible();
});

test("My Recipes tab activates and shows the Create action with an empty list", async ({ page }) => {
    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    await expect(await activeTabName(page)).toBe("My Recipes");
    await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
    await expect(page.getByText("Anchor Steam Beer Clone")).not.toBeVisible();
});

test("Create action opens the recipe-create modal, which closes on Close", async ({ page }) => {
    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    await page.getByRole("button", { name: "Create" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Create Recipe" })).toBeVisible();

    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).not.toBeVisible();
});
