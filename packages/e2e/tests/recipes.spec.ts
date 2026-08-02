import { expect, Locator, Page, test } from "@playwright/test";

test("recipes page defaults to the All tab, listing the kb catalog", async ({ page }) => {
    await page.goto("/recipes");
    await expect(page.getByRole("tab", { name: "All" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Starred" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "My Recipes" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Anchor Steam Beer Clone")).toBeVisible();
});

test("My Recipes tab activates and shows the Create action with an empty list", async ({ page }) => {
    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    await expect(page.getByRole("tab", { name: "My Recipes" })).toHaveAttribute("aria-selected", "true");
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

test("kb recipes show no delete affordance", async ({ page }) => {
    await page.goto("/recipes");

    const row = page.getByRole("listitem").filter({ hasText: "Anchor Steam Beer Clone" });
    await expect(row).toBeVisible();
    await expect(row.getByRole("button")).toHaveCount(0);
});

// delete is fire-and-forget (ConfirmDeleteButton's onConfirm isn't awaited),
// so a reload needs the same bounded wait batch-edit.spec.ts's settleSave uses
// for a debounced save — here for the delete's own storage write + invalidation.
async function settleSave(page: Page) {
    await page.waitForTimeout(1000);
}

test("deleting a user recipe removes it from the list and it stays gone after reload", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Delete Recipe", "Empty");

    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    const row = page.getByRole("listitem").filter({ hasText: "E2E Delete Recipe" });
    await expect(row).toBeVisible();

    await row.getByRole("button").click();
    // opening the confirm modal must not have triggered the row's own Link
    await expect(page).not.toHaveURL(/\/recipe\//);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Delete E2E Delete Recipe?" })).toBeVisible();

    await dialog.getByRole("button", { name: "Confirm" }).click();
    await expect(row).not.toBeVisible();

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", { name: "My Recipes" }).click();
    await expect(page.getByText("E2E Delete Recipe")).not.toBeVisible();
});

test("a user recipe's detail page is reached from the list and renders its stored values", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Overview Recipe", "Empty");
    await page.getByLabel("Brewer").fill("E2E Overview Brewer");
    await settleSave(page);

    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    const row = page.getByRole("listitem").filter({ hasText: "E2E Overview Recipe" });
    await row.getByRole("heading", { name: "E2E Overview Recipe" }).click();

    await expect(page).toHaveURL(/\/recipe\/[^/]+$/);
    await expect(page.getByRole("heading", { name: "E2E Overview Recipe" })).toBeVisible();
    await expect(page.getByText("By E2E Overview Brewer")).toBeVisible();
    await expect(page.getByText("ABV 0.0% | IBUs 0 | O.G. 0.00°P | F.G. 0.00°P")).toBeVisible();

    await expect(page.getByRole("button", { name: "Brew" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
});

// recipe names are also echoed into the (normally hidden) delete-confirm
// dialog's heading, so a bare getByText/getByRole("heading") is ambiguous —
// scope to the list row, as the delete tests above already do
function recipeRow(page: Page, name: string): Locator {
    return page.getByRole("listitem").filter({ hasText: name });
}

test("search filters the All tab to matching recipes and clearing restores the full list", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Search All Tab", "Empty");

    await page.goto("/recipes");
    await expect(recipeRow(page, "Anchor Steam Beer Clone")).toBeVisible();
    await expect(recipeRow(page, "E2E Search All Tab")).toBeVisible();

    const search = page.getByLabel("Search recipes");
    await search.fill("Anchor");
    await expect(recipeRow(page, "Anchor Steam Beer Clone")).toBeVisible();
    await expect(recipeRow(page, "E2E Search All Tab")).not.toBeVisible();

    await search.fill("");
    await expect(recipeRow(page, "Anchor Steam Beer Clone")).toBeVisible();
    await expect(recipeRow(page, "E2E Search All Tab")).toBeVisible();
});

test("search filters the My Recipes tab to matching recipes and clearing restores the full list", async ({ page }) => {
    await createRecipeFromTemplate(page, "E2E Search Mine Alpha", "Empty");
    await createRecipeFromTemplate(page, "E2E Search Mine Beta", "Empty");

    await page.goto("/recipes");
    await page.getByRole("tab", { name: "My Recipes" }).click();
    await expect(recipeRow(page, "E2E Search Mine Alpha")).toBeVisible();
    await expect(recipeRow(page, "E2E Search Mine Beta")).toBeVisible();

    const search = page.getByLabel("Search recipes");
    await search.fill("Alpha");
    await expect(recipeRow(page, "E2E Search Mine Alpha")).toBeVisible();
    await expect(recipeRow(page, "E2E Search Mine Beta")).not.toBeVisible();

    await search.fill("");
    await expect(recipeRow(page, "E2E Search Mine Alpha")).toBeVisible();
    await expect(recipeRow(page, "E2E Search Mine Beta")).toBeVisible();
});
