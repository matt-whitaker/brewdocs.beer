import {expect, Page, test} from "@playwright/test";
import {seedBatch} from "./seedBatch";
import {settleSave} from "./settleSave";

async function openShopping(page: Page) {
    await page.getByRole("tab", {name: "Shopping", exact: true}).click();
    await expect(page.getByRole("tab", {name: "Shopping", exact: true})).toHaveAttribute("aria-selected", "true");
}

async function openIngredients(page: Page) {
    await page.getByRole("tab", {name: "Planning", exact: true}).click();
    await page.getByRole("tab", {name: "Ingredients", exact: true}).click();
}

function purchasedCheckbox(page: Page, name: string) {
    return page.getByLabel(new RegExp(`^${name}(?: - .*)?$`));
}

test("keeps a shopping item's cost and purchased state after a reload", async ({page}) => {
    await seedBatch(page, {name: "E2E Shopping Persist Batch"});
    await openShopping(page);

    const purchased = purchasedCheckbox(page, "Crystal Malt 40L");
    const cost = page.getByLabel("Crystal Malt 40L cost");

    await expect(purchased).not.toBeChecked();
    await purchased.check();
    await cost.fill("12.50");
    await cost.blur();

    await settleSave(page);
    await page.reload();
    await openShopping(page);

    await expect(purchasedCheckbox(page, "Crystal Malt 40L")).toBeChecked();
    await expect(page.getByLabel("Crystal Malt 40L cost")).toHaveValue(/12\.50/);
});

test("keeps cost and purchased after a Planning edit rebuilds the shopping list", async ({page}) => {
    await seedBatch(page, {name: "E2E Shopping Rebuild Batch"});
    await openShopping(page);

    await purchasedCheckbox(page, "Crystal Malt 40L").check();
    await settleSave(page);
    await page.getByLabel("Crystal Malt 40L cost").fill("8.00");
    await page.getByLabel("Crystal Malt 40L cost").blur();
    await settleSave(page);

    await openIngredients(page);
    const weight = page.getByLabel("Crystal Malt 40L weight");
    await weight.fill("2.0");
    await weight.blur();
    await settleSave(page);

    await page.reload();
    await openShopping(page);

    await expect(purchasedCheckbox(page, "Crystal Malt 40L")).toBeChecked();
    await expect(page.getByLabel("Crystal Malt 40L cost")).toHaveValue(/8\.00/);
});

test("removing an ingredient in Planning drops its shopping row without disturbing the others", async ({page}) => {
    await seedBatch(page, {name: "E2E Shopping Removal Batch"});
    await openShopping(page);

    await purchasedCheckbox(page, "Crystal Malt 40L").check();
    await settleSave(page);
    await page.getByLabel("Crystal Malt 40L cost").fill("8.00");
    await page.getByLabel("Crystal Malt 40L cost").blur();
    await settleSave(page);

    await purchasedCheckbox(page, "Special Robust").check();
    await settleSave(page);
    await page.getByLabel("Special Robust cost").fill("3.25");
    await page.getByLabel("Special Robust cost").blur();
    await settleSave(page);

    await openIngredients(page);
    await page.getByRole("button", {name: "Remove Special Robust"}).click();
    await settleSave(page);

    await page.reload();
    await openShopping(page);

    await expect(purchasedCheckbox(page, "Special Robust")).toHaveCount(0);
    await expect(purchasedCheckbox(page, "Crystal Malt 40L")).toBeChecked();
    await expect(page.getByLabel("Crystal Malt 40L cost")).toHaveValue(/8\.00/);
});

test("a freeform additive that collides with an existing row's name keeps that row's cost and purchased state", async ({page}) => {
    await seedBatch(page, {name: "E2E Shopping Collision Batch"});
    await openShopping(page);

    await page.getByLabel("Irish Moss", {exact: true}).check();
    await settleSave(page);
    await page.getByLabel("Irish Moss cost").fill("5.00");
    await page.getByLabel("Irish Moss cost").blur();
    await settleSave(page);

    await openIngredients(page);
    await page.getByLabel("Additive for 2. Boil").fill("Irish Moss");
    await page.getByRole("button", {name: "Add additive to 2. Boil"}).click();
    await settleSave(page);

    await page.reload();
    await openShopping(page);

    await expect(page.getByLabel("Irish Moss", {exact: true})).toHaveCount(1);
    await expect(page.getByLabel("Irish Moss", {exact: true})).toBeChecked();
    await expect(page.getByLabel("Irish Moss cost")).toHaveValue(/5\.00/);
});
