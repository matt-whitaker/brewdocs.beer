import {expect, Locator, Page, test} from "@playwright/test";
import {settleSave} from "./settleSave";

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

    await page.getByLabel("Brewer").fill("E2E Clobber Brewer 1");

    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await page.getByLabel("Hops for 2. Boil").selectOption("Cascade");
    await page.getByRole("button", {name: "Add hop to 2. Boil"}).click();

    await page.getByLabel("Cascade weight").fill("1.5");

    await settleSave(page);
    await page.reload();

    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await expect(page.getByLabel("Cascade weight")).toHaveValue(/1\.5/);
    await page.getByRole("tab", {name: "Details", exact: true}).click();
    await expect(page.getByLabel("Brewer")).toHaveValue("E2E Clobber Brewer 1");
});

test("a Details edit and an Ingredients edit in the same session both survive — Ingredients first", async ({page}) => {
    await createRecipeFromTemplate(page, "E2E Clobber Ingredients First", "Empty");

    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await page.getByLabel("Hops for 2. Boil").selectOption("Cascade");
    await page.getByRole("button", {name: "Add hop to 2. Boil"}).click();
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
    await page.getByLabel("Hops for 2. Boil").selectOption("Cascade");
    await page.getByRole("button", {name: "Add hop to 2. Boil"}).click();

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

test("Estimated IBU shows an em dash when a hopped recipe has no gravity to compute from", async ({page}) => {
    await editRecipeFromKbTemplate(page, "/kb/recipe/anchor-steam-beer-clone");

    await expect(estimatedIbuRow(page)).not.toContainText("—");

    const og = page.getByLabel("OG", {exact: true});
    await og.fill("");
    await og.blur();

    await expect(estimatedIbuRow(page)).toContainText("—");
});

test("adding an additive to a Boil phase gets a configurable weight alongside its boil time, and both persist independently", async ({page}) => {
    await createRecipeFromTemplate(page, "E2E Additive Weight Boil", "Empty");

    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await page.getByLabel("Additive for 2. Boil").fill("Irish Moss");
    await page.getByRole("button", {name: "Add additive to 2. Boil"}).click();

    const weight = page.getByLabel("Irish Moss weight");
    await expect(weight).toBeVisible();
    await expect(weight).toHaveValue("1.0oz");

    await page.getByRole("button", {name: "Show assignment details"}).click();
    const boil = page.getByLabel("Irish Moss boil");
    await expect(boil).toHaveValue("15min");

    await weight.fill("0.5");
    await weight.blur();
    await boil.fill("10");
    await boil.blur();

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();

    await expect(page.getByLabel("Irish Moss weight")).toHaveValue(/0\.5/);
    await page.getByRole("button", {name: "Show assignment details"}).click();
    await expect(page.getByLabel("Irish Moss boil")).toHaveValue(/10/);
});

test("adding an additive to a Conditioning phase gets a configurable weight and no boil field", async ({page}) => {
    await createRecipeFromTemplate(page, "E2E Additive Weight Conditioning", "Empty");

    await page.getByRole("tab", {name: "Phases", exact: true}).click();
    await page.getByLabel("Phase type to add").selectOption("conditioning");
    await page.getByRole("button", {name: "Add phase"}).click();

    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    await page.getByLabel("Additive for 4. Conditioning").fill("Priming Sugar");
    await page.getByRole("button", {name: "Add additive to 4. Conditioning"}).click();

    const weight = page.getByLabel("Priming Sugar weight");
    await expect(weight).toBeVisible();
    await expect(weight).toHaveValue("1.0oz");

    await expect(page.getByRole("button", {name: "Show assignment details"})).toHaveCount(0);

    await weight.fill("4.5");
    await weight.blur();

    await settleSave(page);
    await page.reload();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();

    await expect(page.getByLabel("Priming Sugar weight")).toHaveValue(/4\.5/);
    await expect(page.getByLabel("Priming Sugar boil")).toHaveCount(0);
    await expect(page.getByRole("button", {name: "Show assignment details"})).toHaveCount(0);
});

test("Estimated IBU live-recomputes when a hop's weight changes on the Ingredients panel", async ({page}) => {
    await editRecipeFromKbTemplate(page, "/kb/recipe/anchor-steam-beer-clone");

    const row = estimatedIbuRow(page);
    await expect(row).not.toContainText("0");
    const initialText = await row.textContent();

    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
    const weight = page.getByLabel("Northern Brewer weight").first();
    await weight.fill("5.0");
    await weight.blur();

    await settleSave(page);

    await page.getByRole("tab", {name: "Details", exact: true}).click();
    await expect(estimatedIbuRow(page)).not.toHaveText(initialText ?? "");
});
