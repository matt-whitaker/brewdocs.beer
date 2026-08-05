import {expect, Locator, Page, test} from "@playwright/test";

/**
 * Persistence + sibling-panel-clobbering coverage for the recipe editor.
 *
 * The editor's four panels (Details, Ingredients, Equipment, Phases) all save
 * through `patchRecipe`, a read-modify-write against the freshest stored recipe
 * — specifically so one panel's edit can't clobber another's. That merge reads
 * the store fresh on every call but nothing proved the two orderings are both
 * safe, and a clobber looks identical on screen to a save that worked (saves
 * are fire-and-forget, and text fields debounce 350ms), so every test here is
 * edit -> reload -> assert. The clobber tests deliberately don't let the first
 * field's debounce settle before switching panels and editing the second, since
 * a settled first edit never exercises the race the sibling-panel merge exists
 * to guard against.
 */

async function createRecipeFromTemplate(page: Page, name: string, template: string) {
    await page.goto("/recipes");
    await page.getByRole("tab", {name: "My Recipes"}).click();
    await page.getByRole("button", {name: "Create"}).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/Recipe name/).fill(name);
    await dialog.getByLabel(/Template/).selectOption(template);
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(page).toHaveURL(/\/recipe\/.+\/edit/);
}

async function settleSave(page: Page) {
    await page.waitForTimeout(1000);
}

// "Estimated IBU" (Details panel's Targets subsection) is a read-only computed
// value with no accessible name of its own — its value cell is a plain <div>,
// not a labelled input. Locate the row structurally instead, the same
// workaround batch-summary.spec.ts's vitalsRow uses for the Vitals grid.
function estimatedIbuRow(page: Page): Locator {
    return page.locator(".data-grid").locator("div.grid").filter({hasText: "Estimated IBU"});
}

async function editRecipeFromKbTemplate(page: Page, kbRecipePath: string) {
    await page.goto(kbRecipePath);
    await page.getByRole("button", {name: "Edit"}).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", {name: "Confirm"}).click();

    await expect(page).toHaveURL(/\/recipe\/.+\/edit/);
}

test("Details fields persist across a reload", async ({page}) => {
    await createRecipeFromTemplate(page, "E2E Details Persist", "Empty");

    await page.getByLabel("Brewer").fill("E2E Brewer");
    await page.getByLabel("Type").fill("IPA");
    await page.getByLabel("Description").fill("A test recipe for the editor.");

    // batch size reformats on blur — a bare typed number keeps the field's
    // previous unit rather than the typed string surviving verbatim
    const batchSize = page.getByLabel("Batch Size");
    await batchSize.fill("10");
    await batchSize.blur();

    const og = page.getByLabel("OG");
    await og.fill("1.050");
    await og.blur();

    await settleSave(page);
    await page.reload();

    await expect(page.getByLabel("Brewer")).toHaveValue("E2E Brewer");
    await expect(page.getByLabel("Type")).toHaveValue("IPA");
    await expect(page.getByLabel("Description")).toHaveValue("A test recipe for the editor.");
    await expect(page.getByLabel("Batch Size")).toHaveValue(/10gal/);
    await expect(page.getByLabel("OG")).toHaveValue(/1\.050/);
});

test("reopening an existing recipe via the list shows its stored values", async ({page}) => {
    await createRecipeFromTemplate(page, "E2E Reopen Recipe", "Empty");

    await page.getByLabel("Brewer").fill("E2E Reopen Brewer");
    await settleSave(page);

    await page.goto("/recipes");
    await page.getByRole("tab", {name: "My Recipes"}).click();
    const row = page.getByRole("listitem").filter({hasText: "E2E Reopen Recipe"});
    await row.getByRole("heading", {name: "E2E Reopen Recipe"}).click();

    await expect(page).toHaveURL(/\/recipe\/[^/]+$/);
    await page.getByRole("button", {name: "Edit"}).click();
    await expect(page).toHaveURL(/\/recipe\/.+\/edit/);

    await expect(page.getByRole("heading", {name: "E2E Reopen Recipe"})).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveValue("E2E Reopen Recipe");
    await expect(page.getByLabel("Brewer")).toHaveValue("E2E Reopen Brewer");
});

test("a Details edit and an Ingredients edit in the same session both survive — Details first", async ({page}) => {
    await createRecipeFromTemplate(page, "E2E Clobber Details First", "Empty");

    // Details is the default tab — start its debounce, then switch away before
    // it has any chance to settle
    await page.getByLabel("Brewer").fill("E2E Clobber Brewer 1");

    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await page.getByLabel("Ingredient for 2. Boil").selectOption("hop:Cascade");
    await page.getByRole("button", {name: "Add ingredient to 2. Boil"}).click();
    // the new row's own weight edit debounces too, so start it right away
    await page.getByLabel("Cascade weight").fill("1.5");

    await settleSave(page);
    await page.reload();

    // the last-active tab (Ingredients) is what the query-param-backed
    // PanelSwitcher restores on reload — only the active panel is mounted,
    // so Details has to be reselected before its fields exist to assert on
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await expect(page.getByLabel("Cascade weight")).toHaveValue(/1\.5/);
    await page.getByRole("tab", {name: "Details", exact: true}).click();
    await expect(page.getByLabel("Brewer")).toHaveValue("E2E Clobber Brewer 1");
});

test("a Details edit and an Ingredients edit in the same session both survive — Ingredients first", async ({page}) => {
    await createRecipeFromTemplate(page, "E2E Clobber Ingredients First", "Empty");

    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await page.getByLabel("Ingredient for 2. Boil").selectOption("hop:Cascade");
    await page.getByRole("button", {name: "Add ingredient to 2. Boil"}).click();
    await page.getByLabel("Cascade weight").fill("1.5");

    await page.getByRole("tab", {name: "Details", exact: true}).click();
    await page.getByLabel("Brewer").fill("E2E Clobber Brewer 2");

    await settleSave(page);
    await page.reload();

    await expect(page.getByLabel("Brewer")).toHaveValue("E2E Clobber Brewer 2");
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await expect(page.getByLabel("Cascade weight")).toHaveValue(/1\.5/);
});

test("adds an ingredient, equipment, and a phase from the recipe side, and all persist across a reload", async ({page}) => {
    await createRecipeFromTemplate(page, "E2E Brewable Persist", "Empty");

    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await page.getByLabel("Ingredient for 2. Boil").selectOption("hop:Cascade");
    await page.getByRole("button", {name: "Add ingredient to 2. Boil"}).click();

    await page.getByRole("tab", {name: "Equipment", exact: true}).click();
    const mashEquipment = page.locator(".data-grid").filter({has: page.getByRole("button", {name: "Add equipment to 1. Mash"})});
    await mashEquipment.getByRole("combobox").selectOption("Mash Tun - 10gal");
    await mashEquipment.getByRole("button", {name: "Add equipment to 1. Mash"}).click();

    await page.getByRole("tab", {name: "Phases", exact: true}).click();
    await page.getByLabel("Phase type to add").selectOption("conditioning");
    await page.getByRole("button", {name: "Add phase"}).click();

    await settleSave(page);
    await page.reload();

    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await expect(page.getByLabel("Cascade weight")).toBeVisible();

    await page.getByRole("tab", {name: "Equipment", exact: true}).click();
    await expect(mashEquipment.getByRole("combobox").first()).toHaveValue("Mash Tun - 10gal");

    await page.getByRole("tab", {name: "Phases", exact: true}).click();
    await expect(page.getByText("4. Conditioning")).toBeVisible();
});

test("Estimated IBU shows 0 for a freshly-created recipe with no hop assignments", async ({page}) => {
    await createRecipeFromTemplate(page, "E2E Estimated IBU Empty", "Empty");

    await expect(estimatedIbuRow(page)).toContainText("0");
});

test("Estimated IBU live-recomputes when a hop's weight changes on the Ingredients panel", async ({page}) => {
    // anchor-steam-beer-clone (packages/kb/data/recipes/anchor-steam-beer-clone.json)
    // carries three Northern Brewer additions — a known, non-zero hop bill.
    await editRecipeFromKbTemplate(page, "/kb/recipe/anchor-steam-beer-clone");

    const row = estimatedIbuRow(page);
    await expect(row).not.toContainText("0");
    const initialText = await row.textContent();

    // Details' and Ingredients' drafts are sibling useJsonEdit instances over
    // the same stored recipe — this only reflects the edit via a debounced
    // save + resync, not shared in-memory state, so it exercises that round trip.
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    const weight = page.getByLabel("Northern Brewer weight").first();
    await weight.fill("5.0");
    await weight.blur();

    await settleSave(page);

    await page.getByRole("tab", {name: "Details", exact: true}).click();
    await expect(estimatedIbuRow(page)).not.toHaveText(initialText ?? "");
});
