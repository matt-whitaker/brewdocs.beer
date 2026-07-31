import { expect, Page, test } from "@playwright/test";
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

/**
 * The two create paths are told apart by `__type` in `actions/createRecipe.ts`: a
 * `kbRecipeTemplate` seeds a default recipe with the template's brewable, anything
 * else goes through `kbRecipeToRecipe`. Routing a *template* down the KbRecipe path
 * produces a recipe with no `batchSize`/`targets`, and the Details panel — the edit
 * screen's default tab — reads `data.batchSize.value` and throws. So simply landing
 * on a rendered edit screen is the assertion that the branch was chosen correctly;
 * the equipment check then proves the template's brewable actually came through.
 */
async function createRecipeFromTemplate(page: Page, name: string, template: string) {
    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    await page.getByRole("button", { name: "Create" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Recipe name/).fill(name);
    await dialog.getByLabel(/Template/).selectOption(template);
    await dialog.getByRole("button", { name: "Confirm" }).click();

    await expect(page).toHaveURL(/\/recipe\/.+\/edit/);
}

test("creating from a template applies its equipment and keeps the recipe defaults", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Kettle Sour", "kettle-sour");

    // Details rendered (didn't throw), so the template took the defaultRecipe path
    await expect(page.getByRole("heading", { name: "E2E Kettle Sour" })).toBeVisible();
    await expect(page.getByText("Batch Size")).toBeVisible();

    // ...and carries the template's own kit, which an empty brewable has none of.
    // The first combobox is the mash section's first equipment row (rows render
    // ahead of the section's add-row).
    await page.getByRole("tab", { name: "Equipment", exact: true }).click();
    await expect(page.getByRole("combobox").first()).toHaveValue("Mash Tun - 10gal");
});

test("boil phase shows each stored equipment item, even names outside the app catalog", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Kettle Sour Boil", "kettle-sour");

    await page.getByRole("tab", { name: "Equipment", exact: true }).click();

    const boilSection = page.locator(".data-grid").filter({ has: page.getByRole("button", { name: "2. Boil" }) });
    const boilCombobox = boilSection.getByRole("combobox");
    await expect(boilCombobox.nth(0)).toHaveValue("Boil Kettle - 15gal");
    await expect(boilCombobox.nth(1)).toHaveValue("pH Meter");
    await expect(boilCombobox.nth(2)).toHaveValue("Souring Vessel Lid / Cover");
});

test("creating an empty recipe brings no template equipment", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Empty Recipe", "Empty");

    await expect(page.getByRole("heading", { name: "E2E Empty Recipe" })).toBeVisible();

    // one add-row combobox per phase and no equipment rows at all
    await page.getByRole("tab", { name: "Equipment", exact: true }).click();
    await expect(page.getByRole("combobox")).toHaveCount(3);
});
